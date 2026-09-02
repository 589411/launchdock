# BACKLOG — launchdock 內容待辦

> 這是內容 loop 的記憶（loop 規則見 CLAUDE.md「內容 Loop 鐵律」）。
> 規則：每次內容工作**開場先讀這裡挑一件**、**收尾把新發現寫回這裡**。
> 監控（壞連結/缺圖/回饋）往「來自監控」區寫；你或 AI 的點子往「來自規劃」區寫。

## 🔥 進行中
- [x] [i18n] **英文頁面的概念 tooltip 已改成英文**（2026-09-02）：`concepts.yaml` 全部 60 個概念補上 `shortDescEn`，
      `remark-concept-links` 在英文文章用 `shortDescEn`（沒填才退回中文）。順手修掉兩個一起浮出來的問題：
      ① **tooltip 寬度**：定位父層是很窄的 inline `<a>`，`max-width:280px` 對它無效 → tooltip 被擠成一行兩個字
         （中文因為字密看不太出來，英文一換上去就露餡）。加 `width: max-content` 解決，中英都變好看。
      ② 🔴 **parser 吃掉中文名概念（既有真 bug，已修）**：三份簡易 YAML parser 的鍵名 regex 是 `^([A-Za-z]...`，
         只認英文字母開頭 → `系統提示詞`／`分享連結不等於私密連結`／`語音輸入補上下文` 三個概念**整個消失**，
         而且它們的欄位會往上覆蓋前一個概念——`Prompt Engineering` 的 displayName/canonical 實際上被換成了
         「語音輸入補上下文」→`voice-input-ai-context`。改成 `^([^\s#]...` 後三個概念復活：
         `set-system-prompt` 現在有 **10 篇**自動連結（之前是 0），`prompt-engineering` 恢復 2 篇。
         修了三處：`plugins/remark-concept-links.mjs`、`scripts/generate-article-registry.mjs`、`src/components/RelatedArticles.astro`。
- [ ] [內容] **新文章 `git-guide`「Git 是什麼？零基礎版本控制教學」中英雙版已寫好，build 綠（181 頁），尚未 commit——等 Joseph 人工 gate**（EDITORIAL §7：AI 不得代替 Joseph 發佈）。
      角度＝**2026 版**：不教背指令（CLI agent 會下），教「AI 一次改 12 個檔案、Cmd+Z 救不回來」為什麼讓觀念比五年前更重要；
      四個地方（工作區/暫存區/本地倉庫/遠端）→ 用 `gh repo create --source=. --private --push` 一行上 GitHub → 兩台電腦同步。
      **零缺圖債**：三張概念圖全部手寫 SVG（`save-points-vs-cloud-drive` / `git-four-places` / `two-machines-diverge`），
      已在瀏覽器逐張看過無文字溢出；全篇 0 個 `@img`（因為走 CLI，不需要 UI 截圖）。
      **站上真實素材入文**：① 兩台機器累積 6 個沒推的 commit 撞上（全域憲法那條坑）② `.env`／金鑰進 git 歷史＝去平台作廢才是唯一解（2026-07-23 事故）。
      **剩待辦**：① Joseph review 後 commit＋push；② ~4 週後看 GSC「git 教學／git 是什麼」長尾有沒有進來（這是站上第一篇吃 Git 字的文章）。
- [x] [概念] **`Git` 與 `GitHub` 兩個概念都已加進 `src/data/concepts.yaml`**（2026-09-02，Joseph 拍板加 GitHub）。
      清快取重 build 後的真實命中：**Git 8 篇**（cli-guide／deploy-openclaw-cloud／dev-cli-tools-mac／firebase-firestore-rules-deploy／media-guide 及對應英文版；錨文字＝「Git」「版控」）、
      **GitHub 25 篇**（錨文字全部是「GitHub」，無誤連）。
      ⚠️ **先前寫「Git 對既有文章零渲染變更」是錯的**——那是量到 Astro content 舊快取，見下方那條坑。
- [ ] [功能] **課堂即時投票 class poll（2026-08-08 已實作＋migration 016 已上 production，尚未 push、講師端沒人看過）**。用途＝日晴生活零售 AI 課 8/12（Day 3）、8/14（Day 4）：跑完 Colab 出現一個數字 → 問全班「這個數字在你那行是多少？」→ 投影分布 → 挑極端值邀請分享。做法：`/admin/poll-live/` 建場次（**與 AI 能力測驗共用 `quiz_sessions`**，同一組代碼同一個 QR）→ 點題出題 → 學員開 `launchdock.app/poll/?code=XXXXXX` 點選項。**學員端刻意不輪詢**（即時是投影給全班看的，講師喊「請重新整理」即可，省 75 萬次請求）。八題題號 Q3–Q10 已印在學員講義上，`npm run poll:check` 逐字對撞，改題庫必跑。⛔ 講師端**故意沒有「結束收件」鈕**（poll 整堂課都在收件，誤按一次全班掛），那顆鈕只在 quiz-live。
✅ **2026-08-09 依 Joseph 手機實測回饋改版**（`66f43c7`）：學員端**一次只看得到一題**並標明所屬課程段落（原本八題一次列完像問卷，走馬看花一路投完就把整堂課的互動點用光）；講師端加「⏸ 停下來討論」（只改畫面不動場次 status，按下去不會有人送出失敗）；業態擴到 14 個含傳產／製造，「其他」可自己打字。
**剩待辦**：① **講師端畫面真人實測（唯一沒被任何人看過的部分，需 Google 登入，AI 代不了）**——重點看投影模式的字級；② 手機實機投一次（Joseph 已投過一次，改版後尚未再投）；③ production 測試場次 `DEMO12` 看完要刪；④ 8/12 建議 Google 表單並行保險，8/14 再全押；⑤ 選配：把八題以外的通用場景（每場講座暖場）收成長期資產，BACKLOG 原本那條「AI 能力測驗後續：講座/課程暖場」定位剛好對上；⑥ 選配：晚到的學員補不了前面的題（現行設計取捨），若之後覺得需要，可加「已經問過的」摺疊區。
- [ ] [功能] **班級測驗（quiz 團體班模式）2026-08-03 已實作＋DB 已上 production，尚未真人實測**。用途＝上課前 3 分鐘快速掌握本班程度（線上＋實體同一條連結），當場決定今天講哪一階。做法：`/admin/quiz-live` 建場次拿 6 碼代碼 → 學員開 `launchdock.app/quiz/?code=XXXXXX` → 後台每 5 秒更新「本班平均程度 / 最多人卡在 / 程度分佈 / 四項解鎖率 / 逐題分佈（可摺疊）」。全匿名（只存瀏覽器隨機 token，無姓名 email）；anon 只能交卷不能讀，場次代碼不可列舉（`resolve_quiz_session` SECURITY DEFINER）。✅ **課前/課後成效對照已完成（2026-08-04，migration 015）**：單一場次雙階段，後台一鍵切換，phase 由 DB trigger 決定不信前端。✅ **QR code 已內建（2026-08-05）**：Joseph 改變先前「手動轉、不加依賴」的決定，改為加 `qrcode` 依賴自動產生。後台投影區左代碼／右 QR，QR 已帶 `?code=`，實體班掃了直接進作答頁；點一下可放大投影。動態 import＝獨立 chunk（25.8KB），公開頁不受影響。
**剩待辦**：① 講師後台畫面真人實測（需 Google 登入，學員端已全部實測過）；② production 測試場次 DEMO01 看完要清；③ 選配：加 3–5 題有正解的觀念題（現有 12 題是自評無對錯，只看得出「卡在哪一階」，看不出「哪個觀念錯」）。
- [ ] [活動] **8/26 藍鴨小聚（階②「把專屬提示詞存起來」）**——**2026-07-30 Joseph 說先下架（日期可能有變數），event 設回 draft**（標題/主題/Meet 連結 `meet.google.com/qqg-zvio-mks`/原生報名/2hr 都留著，要復活改 published 即可）。首頁 hero banner 已從 8/26 改指 `/tools/prompt-builder/`。原生報名 RLS 已實測可用。**確認信（Resend）管線已建好**（函式部署+改內容帶 Meet 連結、pg_net、event_registrations INSERT webhook migration 011/012，計數 RPC 013 修好），**唯一卡點＝Resend key 與 verified 網域不同帳號**：現有 key 打 `apcs.launchdock.app`（子網域、9 個月前另個帳號驗的）回 403 未驗證 → 需 Joseph 讓「API key 與 verified 網域同一 Resend 帳號」（或在 key 所屬帳號驗網域）。復活活動時：確認 Resend 帳號一致 → 測試帳號報名收信 → 改 published + banner 改回。
- [ ] [營運・每月] **每月藍鴨小聚都要更新 `events.meet_link`**（新 Google Meet 房間）。確認信與 EventCard 都讀這欄；建活動必填。詳見 memory `meetup-monthly-meet-link`。
- [ ] [大功能] **藍鴨組合器：會員登入＋提示詞儲存**（已合 main 2026-07-29，devplan=`prompt-builder-auth-devplan.md`）。**改用既有 Supabase 登入、不導 Firebase**。M1（`saved_prompts` 表 + RLS + 20 則上限，已套 production 並實測）、M2–M4（`/tools/prompt-builder/` 移植頁 + 儲存/CRUD island）+ 站上入口（Header 工具下拉、prompt-engineering 文章 CTA）已上線。**剩待辦**：① 瀏覽器實測（登入→存→重整→跨使用者擋讀，需 env+Google 帳號）；② Q2 職業卡是否會員限定、Q3 登入是否勾電子報（Joseph 決）；③ **英文版工具**（需翻 PAIN/ROLE/PREF/TUNE 內容 + 生 `/en/tools/prompt-builder/`）；④ 導流 CTA 現指 `prompt-engineering`，main 上已有 `set-system-prompt` 文章，可再補一條 CTA 過去。

### 2026-07-22 對帳自動化工作流（分支 feat/workflow-reconcile，未 push）
- [ ] [內容] `workflow-reconcile` 中英雙版 `modules: []` 未接講義線 → 從 `launchdock-lab/data/modules.yaml` 挑對的 M0x 填入 — handout
- [ ] [內容] 「自動化工作流」目前只是 tag（自由字串，零 schema 變更）。若這條線長到 3+ 篇，考慮升級成 `scene` enum（改 content.config.ts + i18n + articles/index scene 表）— 內容架構
- [ ] [i18n] 英文版文章連的是中文介面的 `/workflows/reconcile/`（文中已註明）。要做英文互動頁需把 wizard 340 行文案 i18n 化 + 開 `/en/workflows/reconcile/` — i18n
- [ ] [內容] 這條若成系列，下一條工作流題目待定（候選：表單→CRM 自動貼、發票/收據擷取）— 內容規劃

## 📡 來自監控（系統自動產生，新項目補在最上）

### 2026-07-05 大整理 session（cowork 全面掃描 + 動工）
- [x] [安全] Supabase 安全加固 07-05 完成(migration 006 已上 production + commit):4 個 SECURITY DEFINER view
      → security_invoker、`handle_new_user`/`rls_auto_enable` 收回 anon EXECUTE、7 函式釘 search_path、3 唯讀函式轉
      SECURITY INVOKER;8 張 cpc_* revoke anon/authenticated(補進 new-cpc repo 001)。ERROR 級 lint 全清 — supabase
- [ ] [安全] 剩兩項(低優先):① Auth 洩漏密碼保護未開 → **只能 Joseph 手動**(Dashboard→Authentication→Leaked Password Protection);
      ② cpc_* 暫寄同一 Supabase 共用 anon key,根本解是搬獨立 schema/project — supabase
- [ ] [內容] 5 張表 INSERT `WITH CHECK (true)`(匿名回饋設計使然,防濫用靠 rate limit)+ `increment_helpful` 保留 DEFINER — 皆 by-design,advisor WARN 可接受 — supabase
- [ ] [基建] feedback-monitor.sh 缺 .env 仍停擺(同 06-29,唯一卡「真實回饋驅動內容」的點)— feedback-monitor
- [ ] [效能] 剩 ~37 張 500KB–1.8MB 的 PNG(寬已 ≤1800):可再上 WebP/AVIF 或 Astro Image,屬錦上添花 — images
- [ ] [內容] 47 篇文章批量掛 `modules` 標籤(已示範 3 篇:M01/M04/M05),掛完講義線才有肉 — handout
- [x] [缺圖] 8 張概念圖已以 SVG 補齊(ai-agent-memory-guide ×4、which-ai-tool-for-you ×4),缺圖債 91→83,
      其餘為真實 UI 截圖(其中 ~35 張需 Windows 機)— @img


### 2026-06-29 每週掃描（與 06-22 比對：圖庫零變動，環境問題一解一未解）
- [ ] [基建] feedback-monitor.sh 仍無法執行：.env 不存在、缺 Supabase 設定 — 讀者回饋監控持續停擺，這是唯一阻擋「用真實回饋驅動內容」的卡點 — feedback-monitor
- [x] [基建] `.git/index.lock` 本週掃描已不存在 → 06-22 那筆鎖檔問題視為解除（保留紀錄）— git status
- [ ] [收尾] BACKLOG.md 自 06-22 起一直處於未提交狀態（git 顯示 `M BACKLOG.md`，內含整個 06-22 監控段）— 提醒 Joseph 決定是否 commit loop 記憶 — git status
- [註] [缺圖] 本週 @img 缺口總數 91 張，與 06-22 完全相同（各 slug 數字未變），無新增/減少；無新文章、無未追蹤的內容檔（src/、public/、.md）需收尾 — @img

### 2026-06-22 每週掃描（中英共用圖庫，補齊 zh 91 個缺口會同步解掉 en 90 個）
- [ ] [基建] `.git/index.lock` 殘留鎖檔，可能擋住 git 操作 — 確認無 git 程序後手動刪除 — git status
- [ ] [基建] feedback-monitor.sh 無法執行：缺 Supabase 環境變數（SUPABASE_URL/SERVICE_KEY）— 讀者回饋監控目前停擺，待設定 .env — feedback-monitor
- [ ] [缺圖] ai-agent-memory-guide：缺 4 張概念圖（層次對比/形成流程/多代理共享/benchmark）— 全為可生成圖解，零環境依賴 — @img
- [ ] [缺圖] which-ai-tool-for-you：缺 4 張（五層地圖、Layer4 路線圖、Gemini×Workspace、風險評估表）— 多為可生成圖解 — @img
- [ ] [缺圖] docker-n8n-mac：缺 3 張 Mac 截圖（下載頁/選單鯨魚圖示/n8n 初始畫面）— Joseph 本機可拍 — @img
- [ ] [缺圖] install-openclaw-windows：缺 1 張（systeminfo 確認 Hyper-V）— 需 Windows 機 — @img
- [ ] [缺圖] openclaw-first-skill：缺 5 張 — @img
- [ ] [缺圖] gemini-gas-ordering-system：缺 7 張 — @img
- [ ] [缺圖] google-api-key-guide：缺 8 張（圖庫已有 34 檔，這 8 個 id 尚未拍）— @img
- [ ] [缺圖] windows-wsl-guide：缺 9 張（需 Windows）— @img
- [ ] [缺圖] docker-n8n-windows：缺 10 張（需 Windows）— @img
- [ ] [缺圖] openclaw-first-run：缺 12 張 — @img
- [ ] [缺圖] hermes-agent：缺 12 張 — @img
- [ ] [缺圖] hermes-agent-windows：缺 12 張（需 Windows）— @img
- [ ] [缺圖] ollama-openclaw-windows：缺 4 張（圖庫已有 16 檔，這 4 個 id 尚未拍，需 Windows）— @img

## 💡 來自規劃（你或 AI 提議的新內容）
- [ ] [i18n] **英文文章頁還有三塊是中文**（2026-09-02 做 tooltip 時看到的，都不是新問題）：
      ① 文章 meta 寫死中文「📝 建立：2026年9月2日 / ✅ 最後驗證」；② 卡關回饋條整條中文；
      ③ 底部「📖 延伸閱讀」——`RelatedArticles.astro` 永遠讀中文 collection、連 `/articles/`，
      所以英文讀者會看到五張中文卡片。③ 影響最大（是版面內容不是 hover），修法＝元件加 `lang` prop、
      英文時讀 `articlesEn` 並連 `/en/articles/`，標題與難度/分鐘字串走 `src/i18n/ui.ts` — i18n
- [x] [i18n] ~~**英文文章的概念連結會連到中文 canonical，而且會自連自己**~~ → **2026-09-02 已修**（`plugins/remark-concept-links.mjs`）：
      currentSlug 改成剝掉 `en/` 前綴（英文版不再自連），並加 `linkFor()`——英文版優先連 `/en/articles/<canonical>/`，
      該 canonical 沒有英文版時才退回中文版。清快取重 build 驗過：**英文自連 0 篇**，英文概念連結已指向 `/en/`。
      原始問題描述：。`plugins/remark-concept-links.mjs` 抓 currentSlug 用
      `articles/(.+?)\.md`，英文版路徑取出來是 `en/git-guide` ≠ canonical `git-guide` → 判定不是自己 → 連過去。
      **這是既有全站行為**（`en/ai-agent-anatomy` 早就把 Harness 連到 `/articles/ai-agent-anatomy/`），不是這次造成的。
      修法很小：currentSlug 去掉 `en/` 前綴；順帶可讓英文版連到 `/en/articles/<canonical>/`（若該篇有英文版）— i18n
- [x] [SEO] ~~**改 `cli-guide` 標題後半段**~~ → **2026-08-10 已改（中英雙版，`33943e7`）**，下一步＝~08-24 單看該頁 CTR。原始分析：（2026-08-10 驗收結論，見 `docs/seo-after-2026-08-10.md`）。
      它一頁吃全站 12% 曝光（4,136）但 CTR 只 0.7%、排名 7.6＝**人到門口沒進來**。
      現行後半「命令列介面（Command-Line Interface）白話完整介紹」＝同義詞重複＋自我描述；
      對照贏家 caffeinate（CTR 6.3%）的後半是「讓 Mac 不睡、AI Agent 整夜不斷線（含怎麼停止）」＝場景＋收穫。
      建議：`CLI 是什麼？從零看懂命令列：跟 GUI／終端機／Shell 差在哪（附 10 個必學指令）`。
      改完 ~08-24 單看它 CTR。次要對象：`dev-cli-tools-mac`(478/2.9%)、`en/grok-connect-github`(521/3.3%) — SEO
- [ ] [SEO] **`api key`／`google api key` 決定不投資**（排名 25.7／45.2＝第 3~5 頁，改標題無效），
      改攻已驗證有效的長尾（`ollama cloud api key` 已 2 點擊／122 曝光／排名 8.6）。若哪天要拉這兩個字，
      需要的是內容深度＋內鏈，不是文案 — SEO
- [x] [SEO] ~~GSC「搜尋外觀」確認 FAQ／schema 有無見效~~ → **2026-08-10 Joseph 手動確認：完全無資料（零豐富結果）**。
      但 schema 驗證通過（線上首頁 `@type=FAQPage`、8 題結構完整），最可能是 Google 只給政府／醫療 FAQ 版位。
      **決策：停止投資 FAQ rich result**，FAQ 價值改押「給 AI 搜尋／LLM 讀」（同 `llms.txt` 方向）。詳見報告第 5 節 — SEO
- [ ] [SEO・選配] 用 GSC**網址審查**查首頁，看「已偵測到的項目」有無「常見問題」——列出＝Google 解析成功
      只是不給版位（政策說成立）；沒列出＝才是技術問題。純粹是把上一條的結論釘死，不影響決策 — SEO
- [ ] [內容] **`line-oa-translation-bot`：23 張圖已遮好躺在 staging，但文章從沒寫**（2026-08-09 清桌面時對照發現）。
      `~/Desktop/captures/_staging/line-oa-translation-bot/`（01–23-clean.png），repo 內除了
      `docs/reverse-article-from-screenshots.md` 完全沒有這個 slug。這是「有圖缺文」——跟 BACKLOG 其他
      「缺圖債」剛好相反，寫起來成本最低（遮罩這關已經過了）。順帶：`deploy-line-bot-cloudflare-workers`
      也有 6 張 clean 但站上查不到該篇（SOP 文件說它是首次實作產物，可能在別 repo 或後來沒留），要確認一下。
      **內容夠成篇**（2026-08-09 抽看 01/09/17/23）：LINE OA「藍鴨2號-中英泰文翻譯」→ 擴充功能 → 啟用
      Messaging API（選服務提供者）→ Make.com 模板 `Send automated replies to messages using ChatGPT and Line`
      → LINE Developers 設 webhook → **Verify 噴 `The webhook returned an HTTP status code other than 200.(302 Found)`**
      ——最後這張是現成的 troubleshoot 素材（錯誤字串可逐字寫進 code block 吃 SEO）。
      ⚠️ **但這批 `-clean.png` 不能直接用，要再遮一輪**（抽 4 張就有 2 張漏）：
      ① `23-clean.png` 網址列 `developers.line.biz/console/channel/2010305157/messaging-api` 的 **channel ID 明文未遮**，
      且 Webhook URL `https://script.google.com/macros/s/AKfycbyQtqEG…ec` **GAS 部署 ID 前段明文**（後段才馬賽克
      ——正是 solutions.md 記的「OCR 對長亂數整段抓不到」）；② `09-clean.png` 的服務提供者清單列出
      **十個 provider 名稱**（含疑似客戶與教會專案），屬商業資訊，公開前要 Joseph 判斷哪些能露 — 內容規劃
- [ ] [內容] **給 `google-colab-guide` 配一份可下載的乾淨範例 notebook**（Joseph 2026-08-09 提）。
      ⛔ **不能直接放課程版 `00_Hello.ipynb`**——它讀 `sunlit.launchdock.app/data` 四支 CSV、含通關碼 md5 邏輯、寫著班名；
      放檔案比放截圖更嚴重（可執行程式碼＋明文 URL，且進 public repo 就永久刪不掉）。
      做法：**另寫一份通用版**（資料用 numpy 自行生成，保留「能不能跑／讀資料／畫圖／滑桿」四段結構），
      放 `public/files/hello-colab.ipynb` → 文章給下載連結。**這樣流程剛好閉環**：讀者下載 → 上傳自己 Drive →
      雙擊 → 看到「無法預覽」→ 照文章做。⚠️ 不要用 Google Drive 公開分享（連結會露出擁有者帳號，
      正是這次遮掉的東西；且一鍵開 Colab 會跳過文章要教的那一關）。選配：再加 GitHub +
      `colab.research.google.com/github/...` badge 當「懶人一鍵開」的補充路徑 — 內容規劃
- [ ] [概念] **決定要不要把「Colab／Google Colaboratory」加進 `src/data/concepts.yaml`**（canonical 指 `google-colab-guide`）。
      加了以後全站提到 Colab 會自動連過來；因為會動到既有文章的渲染，2026-08-09 那次沒替 Joseph 決定 — concepts
- [ ] [內容・支線] 桌面那批 Colab 截圖裡，**「暖身四關說明頁」與「通關碼」兩張沒用進通用文章**（課程味太重）。
      若之後要做「課程課前作業指引」（給 8/12、8/14 學員），**原圖已於 2026-08-09 依 Joseph 指示清掉**
      （含班名與通關碼，留在桌面反而是曝險）——notebook 本身還在 Drive，要做的話重新截兩張即可。
      Joseph 2026-08-09 選了通用定位，此為支線 — 內容規劃
- [ ] [商模] **vibe coding 課 × 限時能力包**試營運實驗 → 正本在 `docs/ROADMAP.md`（2026-07-10 訂）。關鍵洞察：`memory-mcp` 已是 remote read-only MCP，限時能力包架構已存在、只差限時 token 授權層。待辦鉤子：① memory-mcp 加限時 token ② 從 launchdock-lab 選 2–3 個「保證會贏」demo 任務 ③ 查 LINE OA 推播方案 ④ 文章「分享到 LINE」按鈕 ⑤ 關閉存取當下的訂閱 off-ramp。月底試營運驗三個數字（付費轉換/續訂率/任務完成率）。demo 任務課程腳本已選定 → `docs/vibe-coding-demo-tasks.md`。**首選 SME 主菜＝`589411/line-booking-course`（LINE 會員預約系統，L0–L8 閘門課＋安裝包＋答案版 fallback），第一場只做 L3 LIFF 認人查堂數**；備選核心 A sdd 規格書、核心 B-備選 bible-atlas 單頁網站。**下一步：預建 LINE channel/LIFF＋demo Firebase → 普通模型 dry-run 驗 H3**。
- [ ] [大功能] **藍鴨導入 LINE 會員系統**（Joseph 2026-07-10 提）。**2026-07-10 討論定案的三塊設計**（Joseph 拍板）：① **LINE 登入**（降門檻、合台灣習慣）；② **文章一鍵分享到 LINE**；③ **課程通知走「使用者詢問→自動回覆」而非主動推播**——因為免費 OA 主動推播是 200 則/月、且算「人數×則數」（100 好友 broadcast 一次吃 100 則），名單一長就爆；改用 **reply message（免費、無上限，但只能回應用戶當下訊息、有 replyToken 時間窗、做不到排程主動推）**。主動提醒（開課前）省著用 push、只推已報名者。
  **Phase 1a 已完成（2026-07-10，不需 channel，build 綠+瀏覽器實測）**：① `ShareToLine.astro`（LINE it! share URL，塞 ArticleLayout→47 篇自動有）已上；② migration 008（email 可空 + handle_new_user 容忍無 email）**已寫、未套 production**。
  **Phase 1b（需 Joseph 給 channel）**：① 決定 LINE Login channel 掛哪帳號（跟未來 OA 同 provider）→ 建 channel 拿 id/secret；② Supabase 開 Custom OIDC `custom:line`（複用 `589411/lovestrings` 分支 `feat/line-login-remove-lovable`：signInWithOAuth + issuer access.line.me + email_optional）；③ 套 migration 008；④ 前端 AuthButton/EventCard/AuthProvider/AdminGuard 四處加「用 LINE 登入」（Google 並存）；⑤ 實測。
  **Phase 2（需 Messaging API channel + OA）**：webhook worker（複用 `idea-capture/worker` 驗簽骨架 + `new-cpc` 雙 channel 機密 + skill `line-daily-push`）→ 關鍵字自動回覆課程（先靜態關鍵字，可再讀 Supabase `events`，再考慮 `llm-proxy-worker`）。⚠️ **LINE Login channel 與 Messaging API channel 是兩個 channel、各有 secret**（`new-cpc` 已解坑），要放同一 provider 才好對 userId。
  **Phase 3（選配）**：開課前主動提醒用 push，省著用那 200 配額。
  **關鍵關聯**：這是 external_url 退場所指「正式模式」的最終形態——三件事（LINE 會員 / 8/26 正式報名 / external_url 退場）同一決策。
- [ ] [技術債] `events.external_url`（Google 表單外部報名）是**過渡機制**。等正式模式（站上原生報名＋Resend 自動信）在真實場次驗證穩定後，讓 external_url 退場、全部走原生，避免使用者「先填表單、後轉原生」的二次轉換。退場＝新活動一律留空 external_url（程式分支保留無妨）。⚠️ 與「LINE 會員導入」相關：若登入改走 LINE Login、報名走 LINE，退場的目標形態會變，兩者一起想 — 2026-07-10 Joseph 提
- [ ] [功能] AI 能力測驗後續：用途定位＝講座/課程暖場 + 體驗課評估。✅ **存 Supabase + 講師後台看學員分佈已完成（2026-08-03，見「進行中」）**。
      仍可考慮 → 結果分享圖卡(OG)、依結果 email 推薦清單
- [ ] [缺圖] `ai-agent-browsers` 待補 2 張截圖：comet-browser、chatgpt-atlas（中英共用）
- [ ] 寫一篇關於loop 的短文，現在最紅的loop 其實是定時觸發，hook,等綜合體，可以調用現有的agent, skill ,mcp 等自動完成任務 — 來自 LINE 2026-06-19 21:11 ✍️ → src/content/articles/_drafts/idea-20260619-7cfa7c.md
- [ ] （範例）為 lab demo `gas-line-push` 寫一篇對應教學文
- [ ] （範例）盤點 46 篇文章中截圖過舊、需重拍的

## ✅ 最近完成（保留最近 5 筆，舊的刪）
- 2026-08-09 **新文章 `google-colab-guide`「Google Colab 新手教學」中英雙版**（尚未 commit，等 Joseph review 遮罩圖）：
  從桌面 20 張截圖反推，照 `docs/reverse-article-from-screenshots.md`（複用 hit）。15 張圖本機遮罩＋人眼覆核，
  build 綠、`--validate` 15/15。定位經 Joseph 拍板＝通用 Colab 教學（不強調課程），`sunlit.launchdock.app/data` 依指示遮掉。
  主打痛點「Drive 的 .ipynb 無法預覽」＋「公司 Workspace 帳號被鎖 Colab」。詳見 STATUS「下一個具體動作」。
- 2026-07-10 藍鴨小聚上站露出 + 原生 events 加 `external_url`（報名可導外部表單）：首頁 hero banner（中英）+ migration 007 + EventCard/AdminEvents 改；production 建 7/29 場並瀏覽器實測，已上線
- 2026-07-10 `dont-fomo-ai-tools`（中英）：測驗「工具力」橋接文，接 quiz.ts levels[3] 首位。掛 M01、build 綠、瀏覽器實測結果頁首位命中，已 commit+push
- 2026-07-10 `caffeinate-keep-mac-awake`（中英）：防 Mac 休眠斷線 troubleshoot 文，登錄 caffeinate 概念。掛 M01、build 綠、概念連結實測生效，已 commit+push
- 2026-06-27 「AI 能力測驗」功能：行為自評 12 題 → 缺口導向結果 + 雷達圖 + 推薦文章（中英），已驗證（待 commit）
- 2026-06-27 「AI Computer Use 瀏覽器選擇清單（Comet/Atlas…）」鴨編碎碎念文（中英）+ 登錄 Computer Use 概念 — 待補 2 張截圖
- 2026-06-19 「Cloudflare Workers 當 LINE Bot 後端」教學文（中英）

---
### 每項建議格式
`- [ ] [類型] 一句話描述 — 來源/Issue編號`
類型：`新文` / `更新` / `壞連結` / `缺圖` / `回饋`
