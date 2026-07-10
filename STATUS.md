# STATUS — launchdock

> 單一真相。每次離開前更新（全域憲法收尾鐵律）。
**最後更新：** 2026-07-10（① 新增 2 篇中英雙版文章 ② 藍鴨小聚上站露出：首頁 hero banner + 原生 events 系統加 external_url 讓報名可導外部表單，7/29 場已在 production 上線並瀏覽器實測過）
**整體狀態：** 🟢 進行中

## 一句話現況
旗艦教學站（Astro，47 篇文章）。07-05 大整理：內容制度正本上線（EDITORIAL + 兩個任務範本 +
四角色產線）、LLM 接入層（llms.txt + 全站 .md 端點）、8 張概念缺圖以 SVG 補齊、
圖庫 94MB→70MB、講義線打通（modules → handout）。全部改動已本地 build 驗證通過、尚未 commit。

## 下一個具體動作 ⭐
**2026-07-10 LINE 會員 Phase 1b：LINE 登入接 channel（等 Joseph 建 channel，之後再做）**——Phase 1a（不需 channel 的部分）已完成：① 文章「分享到 LINE」按鈕（`ShareToLine.astro`，純 LINE it! URL，零 API/零配額，塞 `ArticleLayout` → 47 篇自動有）**已 commit c858921 + push + CF Pages 部署，production 實測確認上線**；② migration 008（`member_profiles.email` 改可空 + `handle_new_user` 容忍 LINE 無 email 用戶）**已寫、尚未套 production**（跟 cpc_* 共用庫，套庫待 Joseph gate）。**下一步（需 Joseph）**：① 決定 LINE Login channel 掛哪個帳號（要跟未來 OA 同 provider）→ 建 channel 拿 Channel ID/Secret；② Supabase Dashboard 開 Custom OIDC `custom:line`（issuer access.line.me、email_optional）；③ 套 migration 008；④ 前端 AuthButton/EventCard/AuthProvider/AdminGuard 四處加「用 LINE 登入」（Google 並存）；⑤ 瀏覽器實測登入→建 profile→報名。Phase 2（OA webhook 自動回覆課程，避開 200 push/月 上限）見 BACKLOG。

**（前一段）2026-07-10 藍鴨小聚已上站露出＋原生 events 支援外部報名（已上 production）**——原本 `/meetup` 是孤兒頁（站上無入口）。已做：① 首頁 hero banner（中英）→ /meetup；② events 表加 `external_url` 欄位（migration 007，已套 production）+ 改 EventCard（有值→報名按鈕導外部表單、隱藏報名人數；無值→維持原生 Google 登入報名）+ AdminEvents 加欄位（你日後可自行增修活動）；③ production 建 7/29 藍鴨小聚（external_url=forms.gle/K9BUvxV6svWUgYVN9、published），`/events` 即將舉辦(1)、前往報名導表單，已瀏覽器實測。**下一步由你挑**：① 對外宣傳 /meetup（LINE/社群）；② `dont-fomo` 的 LINE 短文（cowork outputs/line-post-dont-fomo.md）部署後點開確認 URL 再貼；③ 8/26 正式場改用**原生報名**（建 event 時 external_url 留空即走 Resend 自動信）；④ BACKLOG 其他（47 篇批量掛 modules、ai-agent-browsers 補 2 圖）。

**（背景）活動系統雙軌**：原生 events（Supabase `events` 表 + EventList/EventCard，站上報名或 external_url 導外部）｜`/meetup` 獨立硬編頁（完整 landing，報名走 Google 表單）。7/29 這場兩者並存：hero banner→/meetup（詳頁），/events→原生卡（直接導表單）。
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
- 2026-07-10 LINE 會員 Phase 1a（不需 channel 的部分，已 build 綠 + 瀏覽器實測）：① 新增 `src/components/ShareToLine.astro`——文章一鍵分享到 LINE，用官方 LINE it! share endpoint（純靜態 `<a>`，零 API/零配額/零 channel），塞進 `ArticleLayout.astro` → 中英 47 篇（含未來新增）自動全有、未動任何一篇文章；i18n 加 `article.share.line`/`article.share.hint`。② migration 008 `member_profiles.email` 改可空 + 重寫 `handle_new_user()` 容忍 LINE 無 email 用戶（保留 006 加固），對 Google 用戶零影響——**檔案已寫、尚未套 production**。設計討論（三塊：LINE 登入 / 分享 / 詢問→自動回覆避開 200 push 上限）與分階段見 BACKLOG「藍鴨導入 LINE 會員系統」。
- 2026-07-10 新增商模 roadmap `docs/ROADMAP.md`：「vibe coding 課 × 限時能力包」試營運實驗（月底）。關鍵洞察＝`memory-mcp` 已是 remote read-only MCP，限時能力包架構已存在、只差限時 token；demo 任務源自 `launchdock-lab`、能力包內容源自 `589411/memory`。三個待驗數字：付費轉換/續訂率/任務完成率。細節待辦已進 BACKLOG 規劃區。（純規劃文件，無程式改動）
- 2026-07-10 藍鴨小聚上站露出 + 原生 events 加外部報名能力（已上 production）：發現 `/meetup` 是孤兒頁（首頁/活動頁都無入口，訪客只有拿到網址才點得到）。
  階段一（靜態，commit bf33019）：首頁 hero banner + /events 手動精選卡（中英）→ /meetup。
  階段二（commit b83f905 + 714cbac）：migration 007 加 `events.external_url`；EventCard 有值→報名導外部表單+隱藏報名人數，無值→維持原生 Google 登入報名；AdminEvents 加欄位；production 建 7/29 場（external_url=表單、published）；驗證 /events 即將舉辦(1)+前往報名導表單後，移除階段一手動卡（原生取代）。hero banner 保留。
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
