-- ============================================================
-- 008_line_login_no_email
-- 目的：讓 LINE 登入（Supabase Custom OIDC `custom:line`）可用。
-- LINE 使用者很可能沒有 email（LINE 不強制、且需授權才給），
-- 但 member_profiles.email 原本是 NOT NULL，且 handle_new_user()
-- 直接塞 NEW.email → LINE 新用戶註冊時觸發器會爆。
--
-- 本 migration（可安全套用、對現有 Google 用戶零影響）：
--   1. email 改為可空（NULL）。UNIQUE(email) 保留 —— Postgres 視多個
--      NULL 為相異，故多位無 email 的 LINE 用戶不衝突。
--   2. 重寫 handle_new_user()：email 為 NULL 時不再爆，display_name
--      逐層 fallback（LINE 的 name/picture claim 也吃得到），保留
--      006 的 SECURITY DEFINER + search_path 加固。
-- 相容性：Google 用戶行為完全不變（email 仍照舊寫入）。
-- ============================================================

-- 1. email 可空（移除 NOT NULL）。UNIQUE 與 CHECK(length) 保留。
alter table public.member_profiles
  alter column email drop not null;

-- 2. 重寫觸發器函式，容忍無 email 的 LINE 用戶。
--    CREATE OR REPLACE 會覆寫整個定義，故 SECURITY DEFINER 與
--    search_path 必須在此重新指定（保留 006 的加固）。
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.member_profiles (user_id, display_name, avatar_url, email)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'LaunchDock 夥伴'
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    ),
    new.email  -- 可能為 NULL（LINE 無 email 用戶）；欄位已可空
  );
  return new;
end;
$$;

-- 3. 重申 006 的權限收回（CREATE OR REPLACE 理論上保留既有授權，
--    此處明寫以防萬一）。觸發器以 definer 身分執行，不需 public 有權。
revoke execute on function public.handle_new_user() from public, anon, authenticated;
