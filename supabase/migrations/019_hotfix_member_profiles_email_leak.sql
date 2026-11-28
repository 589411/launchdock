-- 019_hotfix_member_profiles_email_leak.sql
-- 已於 2026-11-28 套用到正式庫。內容為緊急修補：
-- 新增管理員讀取規則，並刪除 member_profiles 兩條 USING (true) 的公開讀取政策。
-- 請勿再執行；重跑會因政策已不存在而失敗。
-- 回滾會重新開啟 email 外洩，不得使用。

create or replace function public.is_admin()
returns boolean language sql stable security definer
set search_path = public, pg_temp
as $$ select exists (select 1 from public.member_profiles where user_id = auth.uid() and role = 'admin'); $$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create policy member_profiles_select_admin on public.member_profiles
  for select to authenticated using (public.is_admin());

drop policy member_profiles_select_public on public.member_profiles;
drop policy member_profiles_select_anon on public.member_profiles;
