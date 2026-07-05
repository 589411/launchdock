-- 006_security_hardening.sql
-- 2026-07-05 安全加固。
-- 說明：第 1、2 段已於 2026-07-05 透過 Supabase 連線先行套到 production（限流交接期間的
-- 熱修）。此處以冪等寫法完整列出，讓 repo 成為單一真實來源，重跑安全。
-- 第 3、4 段為新增、尚未套用。

-- 1. SECURITY DEFINER view 改為尊重呼叫者 RLS（清 4 個 ERROR 級 lint）。
--    底層 article_reactions / section_reactions 皆有 public SELECT USING(true)，anon 照樣讀得到。
alter view public.v_popular_articles  set (security_invoker = on);
alter view public.v_article_distress  set (security_invoker = on);
alter view public.v_section_distress  set (security_invoker = on);
alter view public.v_distress_trend_7d set (security_invoker = on);

-- 2. 內部函式移出 public REST API（不該被 anon/authenticated 直接 RPC 呼叫）。
--    收回直接 EXECUTE 不影響 trigger 觸發。
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- 3. 為被標記的函式釘住 search_path（清 function_search_path_mutable WARN）。
--    釘為 public 以免破壞未加 schema 前綴的引用；日後若要更嚴，可改為 '' 並全數加前綴。
alter function public.get_event_registration_count(event_id_input uuid) set search_path = public;
alter function public.is_priority_period(event_id_input uuid)           set search_path = public;
alter function public.update_updated_at()                               set search_path = public;
alter function public.get_popular_articles(limit_count integer)         set search_path = public;
alter function public.get_distress_alerts(min_distress_count integer, min_distress_pct numeric) set search_path = public;
alter function public.get_section_distress(target_slug text)            set search_path = public;
alter function public.increment_helpful(answer_id_input uuid, fingerprint_input text) set search_path = public;

-- 4. 唯讀 reaction 函式改 SECURITY INVOKER（只讀已公開的表，行為不變，清 definer lint）。
--    increment_helpful 刻意保留 SECURITY DEFINER：讓 anon 能加計數器而不需直接寫表權限。
alter function public.get_popular_articles(limit_count integer)         security invoker;
alter function public.get_distress_alerts(min_distress_count integer, min_distress_pct numeric) security invoker;
alter function public.get_section_distress(target_slug text)            security invoker;
