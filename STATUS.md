# STATUS — launchdock

> 單一真相。每次離開前更新（全域憲法收尾鐵律）。
**最後更新：** 2026-07-21（反向截圖產線：Grok／ChatGPT 連 GitHub 兩篇中英雙版 + 13 張遮罩圖，分支 `article/connect-github-20260721` 本地 commit、**未 push**，等 Joseph 過目）
**整體狀態：** 🟢 進行中（2026-07-18 另修 Search Console 122 頁未索引：trailing-slash+canonical 全站修正已上線，見 docs/seo-indexing-fix.md）

## 一句話現況
旗艦教學站（Astro，47 篇文章）。07-05 大整理：內容制度正本上線（EDITORIAL + 兩個任務範本 +
四角色產線）、LLM 接入層（llms.txt + 全站 .md 端點）、8 張概念缺圖以 SVG 補齊、
圖庫 94MB→70MB、講義線打通（modules → handout）。全部改動已本地 build 驗證通過、尚未 commit。

## 下一個具體動作 ⭐
**2026-07-21 AI 連 GitHub 兩篇：本地 commit 完成、等 Joseph 過目遮罩圖後 push**——分支 `article/connect-github-20260721`（commit 7615b9f，**未 push**）。兩篇中英雙版：① `grok-connect-github`（Grok 免費版**實測可用**：一句話「寫一個介紹cli工具的網站，上傳到github repo」→ 2m14s → GitHub 上真的多出 repo `cli-tool-website` 含 README+index.html，重點教 GitHub App 授權範圍 All vs Only select、sudo mode、怎麼收回；9 張圖）② `chatgpt-connect-github`（外掛程式→GitHub→安裝→「與 GitHub 連線」授權；**誠實寫出免費版模型無法完成實際 GitHub 任務、需訂閱**，並指出該 connector 定位是 PR/issue/CI triage，四個 Skills 裡沒有 Create Repository；4 張圖）。兩篇互相導流＋接 `deploy-to-github-pages`／`mcp-protocol`／`github-account-signup`。圖 13 張全部本機遮罩（腳本 OCR 漏抓多處，靠手動實心黑框補：Grok 左下 email、ChatGPT 側欄私人對話標題、Grok 回覆內的 GitHub Pages 網址），兩輪視覺覆核＋最終 scan 13/13 clean。concepts.yaml 加 Grok／連接器，registry 68 篇/55 概念，build 綠。查證：xAI 官方文件「連接器對所有 Grok 使用者開放」；OpenAI help 頁 403 取不到 → 方案限制一律寫成「實測」不寫成官方政策。→ **待 Joseph 決定：GitHub handle 目前一併遮掉了，若認為公開帳號可露出，說一聲我重跑不含該 token 的版本（圖會清爽很多）。**

**（前一段）2026-07-20 github-account-signup 併入「用 Google 一鍵註冊」：本地 commit 完成、等 Joseph 點頭 push**——把新桌面截圖的「Continue with Google」OAuth 路徑併入既有 github-account-signup（中英雙版），重構成「共用起點 → 方式 A Google 一鍵（推薦）→ 方式 B 填表 → 共用裝置驗證/Dashboard/選單」；並補上往 deploy-to-github-pages 的正向連結（deploy 早已反向連回來，雙向連結完成）。新增 4 張圖（google-search / continue-with-google / account-chooser / oauth-consent，轉 JPEG 220-308K）；其中 account-chooser、oauth-consent 含真實 email＋人名，已用 `redact-screenshots.py --mask-text` 遮罩（OCR 預設漏抓、靠人工 token 補）＋**瀏覽器逐圖視覺覆核**＋最終 scan 9/9 clean。build 綠。**尚未 push**（遵循 PII 圖片先 review 再上傳的慣例，避免重演 email 外流事故）。→ Joseph 過目遮罩圖後說一聲即 push。

**（前一段）2026-07-18 反向截圖 8 篇新文章：等 Joseph 逐篇 review → 決定是否 push 上線**——本次用桌面累積的 167 張截圖，全量 triage 後分主題產出 8 篇中英雙版（共 16 檔）＋58 張本機遮罩後乾淨圖，全部在分支 `article/screenshot-batch-20260718` 上 commit（**未 push**，遵循「反向截圖文章先 review 再上傳」慣例）。8 篇：① `kaggle-account-signup`（註冊 Kaggle）② `looker-studio-csv-analysis`（Looker Studio 上傳 CSV）③ `openrouter-free-llm-api-key`（OpenRouter 拿免費 LLM key）④ `make-gmail-sheets-automation`（Make 起手：Gmail→Sheets）⑤ `google-cloud-oauth-api-setup`（GCP 建專案/啟用 API/OAuth）⑥ `make-llm-email-auto-tagging`（Make 串 LLM 自動分類信件）⑦ `ollama-cloud-api-key`（Ollama 雲端 key 當備援）⑧ `ai-agents-build-line-booking-system`（碎碎念：三個 AI 分工做 LINE 預約系統）。遮罩經 redact 腳本 + 手動黑框 + **兩輪獨立 AI 視覺稽核**（批次1抓到 Kaggle 名字馬賽克太淺 + Make 頭像縮寫，已補實心黑框重驗 clean）。**已於 2026-07-18 合併 main（merge ad5ea92）+ push，launchdock.app 8 篇正式上線並驗證 HTTP 200；分支 `article/screenshot-batch-20260718` 可刪。** 若日後回頭優化：可考慮補每篇 modules 掛講義線、或把 Make 系列做成 series。concepts.yaml 已加 Make/Google Cloud/Kaggle/Looker Studio 4 概念、`npm run registry` 已重生（66 篇/53 概念）。原圖仍在 `~/Desktop`（未刪，gitignore 的 `_staging` 有 raw/clean 備份）。

**（前一段）2026-07-10 LINE 會員 Phase 1b：LINE 登入接 channel（等 Joseph 建 channel，之後再做）**——Phase 1a（不需 channel 的部分）已完成：① 文章「分享到 LINE」按鈕（`ShareToLine.astro`，純 LINE it! URL，零 API/零配額，塞 `ArticleLayout` → 47 篇自動有）**已 commit c858921 + push + CF Pages 部署，production 實測確認上線**；② migration 008（`member_profiles.email` 改可空 + `handle_new_user` 容忍 LINE 無 email 用戶）**已寫、尚未套 production**（跟 cpc_* 共用庫，套庫待 Joseph gate）。**下一步（需 Joseph）**：① 決定 LINE Login channel 掛哪個帳號（要跟未來 OA 同 provider）→ 建 channel 拿 Channel ID/Secret；② Supabase Dashboard 開 Custom OIDC `custom:line`（issuer access.line.me、email_optional）；③ 套 migration 008；④ 前端 AuthButton/EventCard/AuthProvider/AdminGuard 四處加「用 LINE 登入」（Google 並存）；⑤ 瀏覽器實測登入→建 profile→報名。Phase 2（OA webhook 自動回覆課程，避開 200 push/月 上限）見 BACKLOG。

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
- 2026-07-19 導流量測（來源端追蹤，不依賴子站分析）：查出 lab/masters 都無分析工具→改在主站量。① migration `009_create_outbound_clicks`（新增 outbound_clicks 表，anon-insert RLS，同 004 pattern，**已套 production** lxudxtpfenotkpgmhomq）；② `OutboundTracker.astro`（BaseLayout 全站，一個委派 click listener 記 {target,placement,fingerprint,referrer,path} 進 Supabase，靠 isSupabaseConfigured 閘門，本機無 env 會被 tree-shake 成 no-op＝正常）；③ 8 個入口連結掛 `data-track-outbound`/`data-placement`（home-card/header/header-mobile/footer）；④ `/admin/traffic` 導流儀表板（TrafficDashboard.tsx，總點擊/→Lab/→Masters/近7天＋各位置成效表＋最有效徽章）。**已用 5 筆 seed row 對 production 實測儀表板正確、再刪除**。全部 push main。
- 2026-07-19 生態系導流閉環（含常駐入口）：① 首頁 `index.astro` 加「學完，拿去用」入口區塊（Lab／Masters 兩張卡）；② Header 加「🧰 工具」hover 下拉（純 CSS 無 JS）＋ mobile menu 內嵌連結；③ Footer 加 實驗室／大師團 連結；i18n 補 `nav.tools*` 中英 key；順手把 desktop nav 收成 gap-4＋whitespace-nowrap 讓 7 個項目在筆電單行不折。全部 build 綠 + 瀏覽器實測（文章頁確認全站生效）+ push main。同日兩子站也各加「← 回藍鴨主站」連結（masters-hub、launchdock-lab，已 push）。→ 主站↔子站雙向流量閉環完成。可選再加：卡片/連結掛 UTM 參數以量測導流。
- 2026-07-18 SEO 未索引修正（commit 9e3296b，已上 production 實測）：根因＝全站內部連結/hreflang/nav 無斜線→Cloudflare 308→Google 判「重新導向」(85)；文章頁無 canonical→重複(12)。修：astro.config trailingSlash:'always'、BaseLayout 自我 canonical+hreflang 斜線、remark 概念外掛/registry/102 篇內文/Header/各元件連結全補斜線。dist 無斜線連結=0、sitemap 143 全斜線。後續：Joseph 到 SC 按「驗證修正」+要求索引。完整紀錄與 checklist：docs/seo-indexing-fix.md。
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
