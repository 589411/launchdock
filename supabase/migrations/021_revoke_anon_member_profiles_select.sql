-- 021_revoke_anon_member_profiles_select.sql
-- 已於 2026-11-28 套用到正式庫。
-- 收回 anon 對 member_profiles 的整表 SELECT，只保留 user_id、role 兩欄，
-- 供其他資料表 admin policy 子查詢使用。email 與 display_name 對 anon 不可讀。

revoke select on public.member_profiles from anon;
grant select (user_id, role) on public.member_profiles to anon;

-- Rollback:
--   grant select on public.member_profiles to anon;
