-- 020_public_member_badges.sql
-- 已於 2026-11-28 套用到正式庫。
-- 提供不含 email 的公開徽章讀取來源（user_id、display_name、avatar_url、role）。
-- 用 RPC 而非 view：呼叫端必須提供 user_id 清單，匿名無法一次列出整份名冊。
-- security definer、固定 search_path、陣列上限 200，只 grant 給 anon / authenticated。

create or replace function public.get_member_badges(p_user_ids uuid[])
returns table (user_id uuid, display_name text, avatar_url text, role text)
language sql stable security definer
set search_path = public, pg_temp
as $$
  select m.user_id, m.display_name, m.avatar_url, m.role
  from public.member_profiles m
  where m.user_id = any (p_user_ids[1:200]);
$$;

revoke all on function public.get_member_badges(uuid[]) from public;
grant execute on function public.get_member_badges(uuid[]) to anon, authenticated;

-- Rollback:
--   drop function public.get_member_badges(uuid[]);
