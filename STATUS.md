# STATUS — launchdock

> 單一真相。每次離開前更新（全域憲法收尾鐵律）。
**最後更新：** 2026-07-10（新增 2 篇中英雙版：caffeinate 教學 + dont-fomo-ai-tools 測驗橋接文；均掛 M01、build 綠、瀏覽器實測過，已 commit+push）
**整體狀態：** 🟢 進行中

## 一句話現況
旗艦教學站（Astro，47 篇文章）。07-05 大整理：內容制度正本上線（EDITORIAL + 兩個任務範本 +
四角色產線）、LLM 接入層（llms.txt + 全站 .md 端點）、8 張概念缺圖以 SVG 補齊、
圖庫 94MB→70MB、講義線打通（modules → handout）。全部改動已本地 build 驗證通過、尚未 commit。

## 下一個具體動作 ⭐
**2026-07-10 兩篇新文已收尾（caffeinate + dont-fomo-ai-tools）**——都掛 `modules: [M01]`、`npm run registry`（58 篇/49 概念）、`npm run build` exit 0、瀏覽器實測（測驗結果頁工具力缺口首位命中 dont-fomo、概念自動連結生效），已 commit+push。**下一步由你挑**：① `dont-fomo` 附帶的 LINE 課程群組短文（cowork outputs/line-post-dont-fomo.md）部署後點開確認 URL 再貼群組；② 開始對外宣傳 /meetup；③ 從 BACKLOG「來自監控／規劃」挑下一件（如 47 篇批量掛 modules、ai-agent-browsers 補 2 圖）。

**（前一件，仍有效）藍鴨小聚 /meetup 已可對外分享**——報名表單（forms.gle/K9BUvxV6svWUgYVN9，launchdockapp 帳號建）已接上 FORM_URL、build 過、已 commit+push。
下一步由 Joseph 決定：①開始對外宣傳 /meetup（LINE/社群）②開場前當天查證免費層還在（GitHub Models／OpenRouter／Gemini）③8/26 正式場改用站上原生 events + Resend 自動信、主持帳號收回 launchdockapp。
較早待辦不變：AI 能力測驗已驗證待 commit；`ai-agent-browsers` 待補 2 張截圖。

## 怎麼驗證這一步成功
`npm install && npm run build` 過（07-05 已在乾淨環境驗證 exit 0）、
`dist/llms.txt`、`dist/articles/<slug>.md` 存在、文章頁概念圖正常顯示。

## 卡點 / 待你決定
- 本次改動的 commit 授權（見上）。
- lab 三筆 REPLACE 條目的實際連結（只有你有），見 launchdock-lab/STATUS.md。
- feedback-monitor.sh 需要 `.env`（SUPABASE_URL + SERVICE_KEY）——回饋 loop 停擺的唯一原因。
- ✅ Supabase 安全加固（migration 006）已於 07-05 套到 production 並 commit：4 個 SECURITY DEFINER
  view 轉 security_invoker、`handle_new_user`/`rls_auto_enable` 收回 anon EXECUTE、7 函式釘 search_path、
  3 唯讀函式轉 SECURITY INVOKER。ERROR 級 lint 全清。**唯一剩手動**：Dashboard → Authentication 開啟
  Leaked Password Protection（HaveIBeenPwned）。`increment_helpful` 刻意保留 DEFINER（給 anon 加計數器）。
- ⚠️ cpc_* 是別專案暫寄同一 Supabase：已 revoke anon/authenticated（new-cpc repo 001 補版控）。
  根本解是搬進獨立 schema / 獨立 project——只要還共用 anon key 風險就掛著（尚未動）。

## 進度脈絡（新的在上）
- 2026-07-10 新碎碎念/橋接文 `dont-fomo-ai-tools`（中英）：接測驗「工具力」缺口的推薦文（已進 quiz.ts levels[3] 首位）。
  論點＝「AI 自動調用工具正變成跨廠牌內建基本盤，所以別 FOMO、該練判斷不是追型號」，綁 Joseph 昨天課堂預言 + 2026-07-09 OpenAI 更新當證據。
  查證：GPT-5.6 Sol/Terra/Luna 7/9 上線、ChatGPT+Codex 併桌面 App（含 Free）、ChatGPT Work 跨 App agent（多家點名衝 Claude Cowork）皆已多方證實；max/ultra 檔位、500萬/100萬 統計、Claude Code 匯入、Sites 等未能獨立證實 → 刻意未寫進文。
  附帶產出 LINE 課程群組短文（cowork outputs/line-post-dont-fomo.md，URL 待部署）。**未 build、未 commit、待 gate**。
- 2026-07-10 新踩坑文 `caffeinate-keep-mac-awake`（中英）：Agent 跑很久／掛著接訊息時 Mac 休眠→斷線，用 caffeinate 解。
  contentType: troubleshoot、scene 基礎使用、零 @img（全 CLI 走 code block）。查證：caffeinate -dimsu 五 flag（ss64/Apple）、OpenClaw（Steinberger，前身 Warelay/Moltbot）、Hermes（Nous Research，2026-02）。
  concepts.yaml 新增 caffeinate、registry 已重跑。**未 build（沙箱缺 rollup-linux）、未 commit、待 gate**。
- 2026-07-08 新增活動頁 `src/pages/meetup.astro`（`/meetup`）：藍鴨小聚「鴨聚·Assemble！」7/29 試營運場（系統提示詞主題）。
  用 BaseLayout+Tailwind token+複用 .hero-section，含四階梯路線圖 + 導流三篇文章（Soul/from-prompt-to-skill/新文）。
  build 過、瀏覽器實測渲染正常。**✅ 2026-07-08 FORM_URL 已接上**（forms.gle/K9BUvxV6svWUgYVN9），已 build 驗證 + commit + push，/meetup 可對外分享。
  報名/發信結論：試營運走 Google 表單+固定 Meet link+確認頁回信（省工、免登入）；站上原生 events 有 send-registration-confirmation(Resend) 自動信，留 8 月正式場再接。
  表單細節：launchdockapp 帳號建、系統提示詞主題、4 題（稱呼/AI程度/最想學/最卡關）、收 email（作答者手動輸入）、提交後確認頁附 Meet link（ays-gqvd-zcx，7/29 20:00–22:00）。
  帳號分工：Meet 房間用 tranngoclan51873（有 Gemini/Google One，撐 2hr/100人，純幕後）、對外品牌全走 launchdockapp、個人 589411 不碰。當天需登入 tranngoclan 主持。
  題目定案：單場＝「系統提示詞」；「從小白到指揮官」當整個階梯的 slogan（非單場題目）。
- 2026-07-05（晚）新碎碎念文：`openclaw-hermes-or-claude-max`（中英）——「初學者選 OpenClaw/Hermes？先分清學 vs 幹活」。
  框架：開源拿來學、付費助理拿來幹活（化解站的 OpenClaw 定位張力）。build 過、registry 已更新、Joseph gate 通過已 commit
- 2026-07-05（晚）DB 安全加固 006 上 production（見卡點區）
- 2026-07-05 內容制度正本：docs/EDITORIAL.md + templates/（observation-to-article、pitfall-to-article、concept-svg）；
  文章 schema 加 `modules` 欄位；`npm run handout M0x` 抽組講義；CLAUDE.md 掛薄索引
- 2026-07-05 LLM 接入層：/llms.txt、/llms-full.txt、每篇 /articles/<slug>.md（中英）
- 2026-07-05 補 8 張概念圖 SVG（ai-agent-memory-guide ×4、which-ai-tool-for-you ×4，皆 AI 生成，無機敏資訊）
- 2026-07-05 圖庫瘦身：73 張 >500KB 的 4K retina PNG 縮至寬 1800（94MB→70MB，git 可還原）
- 2026-07-05 清理：docs/ 13 個一次性討論稿歸檔 docs/archive/、修 dev-harness 斷鏈引用、harness prompt 草稿歸檔
- 2026-06-27 「AI 能力測驗」功能已驗證未 commit
- 2026-06-27 「AI 代理瀏覽器」文（截圖待補 2 張）
- 2026-06-19 導入內容 loop（BACKLOG.md + 每週一排程監控）

## 已知坑
- 任何圖片插入後**必須**跑機敏掃描（見 CLAUDE.md 安全規則）。生成的 SVG 概念圖除外（無真實資料）。
- sitemap 靠 build 自動產；llms/.md 端點不會進 sitemap（已驗證）。
- React island 互動驗證要用 `npm run preview`，**不要用 `npm run dev`**（React19+Vite dev-only 的
  `jsxDEV is not a function` 問題，preview 用 production React 正常）。
- 概念圖規格（顏色/字體/底卡）正本在 `docs/templates/concept-svg.md`，不要即興發揮。
