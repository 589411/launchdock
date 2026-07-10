# BACKLOG — launchdock 內容待辦

> 這是內容 loop 的記憶（loop 規則見 CLAUDE.md「內容 Loop 鐵律」）。
> 規則：每次內容工作**開場先讀這裡挑一件**、**收尾把新發現寫回這裡**。
> 監控（壞連結/缺圖/回饋）往「來自監控」區寫；你或 AI 的點子往「來自規劃」區寫。

## 🔥 進行中
_（空——2026-07-10 兩篇新文已收尾 commit+push，見下方最近完成。開場可從「來自監控／規劃」挑一件。）_

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
- [ ] [商模] **vibe coding 課 × 限時能力包**試營運實驗 → 正本在 `docs/ROADMAP.md`（2026-07-10 訂）。關鍵洞察：`memory-mcp` 已是 remote read-only MCP，限時能力包架構已存在、只差限時 token 授權層。待辦鉤子：① memory-mcp 加限時 token ② 從 launchdock-lab 選 2–3 個「保證會贏」demo 任務 ③ 查 LINE OA 推播方案 ④ 文章「分享到 LINE」按鈕 ⑤ 關閉存取當下的訂閱 off-ramp。月底試營運驗三個數字（付費轉換/續訂率/任務完成率）。demo 任務課程腳本已選定 → `docs/vibe-coding-demo-tasks.md`。**首選 SME 主菜＝`589411/line-booking-course`（LINE 會員預約系統，L0–L8 閘門課＋安裝包＋答案版 fallback），第一場只做 L3 LIFF 認人查堂數**；備選核心 A sdd 規格書、核心 B-備選 bible-atlas 單頁網站。**下一步：預建 LINE channel/LIFF＋demo Firebase → 普通模型 dry-run 驗 H3**。
- [ ] [大功能] **藍鴨導入 LINE 會員系統**（Joseph 2026-07-10 提）。**2026-07-10 討論定案的三塊設計**（Joseph 拍板）：① **LINE 登入**（降門檻、合台灣習慣）；② **文章一鍵分享到 LINE**；③ **課程通知走「使用者詢問→自動回覆」而非主動推播**——因為免費 OA 主動推播是 200 則/月、且算「人數×則數」（100 好友 broadcast 一次吃 100 則），名單一長就爆；改用 **reply message（免費、無上限，但只能回應用戶當下訊息、有 replyToken 時間窗、做不到排程主動推）**。主動提醒（開課前）省著用 push、只推已報名者。
  **Phase 1a 已完成（2026-07-10，不需 channel，build 綠+瀏覽器實測）**：① `ShareToLine.astro`（LINE it! share URL，塞 ArticleLayout→47 篇自動有）已上；② migration 008（email 可空 + handle_new_user 容忍無 email）**已寫、未套 production**。
  **Phase 1b（需 Joseph 給 channel）**：① 決定 LINE Login channel 掛哪帳號（跟未來 OA 同 provider）→ 建 channel 拿 id/secret；② Supabase 開 Custom OIDC `custom:line`（複用 `589411/lovestrings` 分支 `feat/line-login-remove-lovable`：signInWithOAuth + issuer access.line.me + email_optional）；③ 套 migration 008；④ 前端 AuthButton/EventCard/AuthProvider/AdminGuard 四處加「用 LINE 登入」（Google 並存）；⑤ 實測。
  **Phase 2（需 Messaging API channel + OA）**：webhook worker（複用 `idea-capture/worker` 驗簽骨架 + `new-cpc` 雙 channel 機密 + skill `line-daily-push`）→ 關鍵字自動回覆課程（先靜態關鍵字，可再讀 Supabase `events`，再考慮 `llm-proxy-worker`）。⚠️ **LINE Login channel 與 Messaging API channel 是兩個 channel、各有 secret**（`new-cpc` 已解坑），要放同一 provider 才好對 userId。
  **Phase 3（選配）**：開課前主動提醒用 push，省著用那 200 配額。
  **關鍵關聯**：這是 external_url 退場所指「正式模式」的最終形態——三件事（LINE 會員 / 8/26 正式報名 / external_url 退場）同一決策。
- [ ] [技術債] `events.external_url`（Google 表單外部報名）是**過渡機制**。等正式模式（站上原生報名＋Resend 自動信）在真實場次驗證穩定後，讓 external_url 退場、全部走原生，避免使用者「先填表單、後轉原生」的二次轉換。退場＝新活動一律留空 external_url（程式分支保留無妨）。⚠️ 與「LINE 會員導入」相關：若登入改走 LINE Login、報名走 LINE，退場的目標形態會變，兩者一起想 — 2026-07-10 Joseph 提
- [ ] [功能] AI 能力測驗後續：用途定位＝講座/課程暖場 + 體驗課評估。可考慮 → 結果分享圖卡(OG)、
      存 Supabase 做分析、講師後台看學員分佈、依結果 email 推薦清單
- [ ] [缺圖] `ai-agent-browsers` 待補 2 張截圖：comet-browser、chatgpt-atlas（中英共用）
- [ ] 寫一篇關於loop 的短文，現在最紅的loop 其實是定時觸發，hook,等綜合體，可以調用現有的agent, skill ,mcp 等自動完成任務 — 來自 LINE 2026-06-19 21:11 ✍️ → src/content/articles/_drafts/idea-20260619-7cfa7c.md
- [ ] （範例）為 lab demo `gas-line-push` 寫一篇對應教學文
- [ ] （範例）盤點 46 篇文章中截圖過舊、需重拍的

## ✅ 最近完成（保留最近 5 筆，舊的刪）
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
