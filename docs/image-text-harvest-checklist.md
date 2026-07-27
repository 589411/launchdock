# 藍鴨 · 截圖文字化 SEO 清單（image → text harvest）

> 目的：把「只存在於截圖裡的錯誤碼/指令」轉成內文文字，讓 Google 索引得到。
> 排名靠文字，不靠圖；截圖裡的紅字對搜尋引擎是隱形的。
> 建立：2026-07-23。資料來源：public/images/articles 全庫盤點。

**標記**：🔴 終端機/錯誤，有指令或紅字要轉文字（優先）｜🟡 GUI/主控台，抽查有無錯誤對話框或 key 字串｜⚪ 純 GUI 操作圖 / 向量圖，不用動
**進度**：`[ ]` 未處理　`[x]` 已轉文字

盤點總計：24 篇文章、約 200 張圖。🔴 約 45 張是主要戰場。

---

## 🔴 第一優先：對得上 GsC 錯誤搜尋（已 OCR 2 張，示範）

- [x] `ollama-openclaw/openclaw-cmd-not-found.png` → 實際內容：`$ ollama openclaw` / `Error: unknown command "openclaw" for "ollama"`（注意：檔名寫 cmd-not-found，畫面其實是 unknown command）
- [x] `firebase-firestore-rules-deploy/pwa-missing-permissions.png` → `連線測試失敗` / `Missing or insufficient permissions.`

---

## 🔴 ollama-openclaw/（Mac 主線，終端機截圖最多）

- [ ] 🔴 `install-openclaw-terminal.png`
- [ ] 🔴 `ollama-launch-terminal.png`
- [ ] 🔴 `ollama-launch-openclaw.png`
- [ ] 🔴 `ollama-version-check.png`
- [ ] 🔴 `ollama-pull-model.png`
- [ ] 🔴 `ollama-test-chat.png`
- [ ] 🔴 `openclaw-install-prompt.png`
- [ ] 🔴 `openclaw-install-process.png`
- [ ] 🔴 `openclaw-installing.png`
- [ ] 🔴 `openclaw-install-done.png`
- [ ] 🔴 `openclaw-install-success.png`
- [ ] 🔴 `openclaw-launch-retry.png`（retry 通常代表前一步報錯 → 很可能有紅字）
- [ ] 🔴 `openclaw-launched.png`
- [ ] 🔴 `openclaw-first-hello.png`
- [ ] 🔴 `openclaw-first-chat.png`
- [ ] 🔴 `openclaw-ollama-first-chat.png`
- [ ] 🔴 `openclaw-ready.png`
- [ ] 🟡 `macos-security-allow.png`（macOS 安全性對話框，可能有「無法打開」字串）
- [ ] 🟡 `openclaw-open-security.png`
- [ ] 🟡 `ollama-download-mac.png`／`ollama-downloaded.png`／`ollama-setup-mac.png`／`ollama-login.png`／`ollama-settings-tokens.png`（GUI）
- [ ] 🟡 `openclaw-agent-init.png`／`openclaw-chat-detail.png`／`openclaw-chat-more.png`／`openclaw-chat-reply.png`／`openclaw-chat-request.png`／`openclaw-config-overview.png`／`openclaw-lobster-name.png`
- [ ] ⚪ `happy-bros.webp`（裝飾圖）
- [ ] ⚪ `026/029/030/031/032/033/034/036/037/038/039/040/043/044/045/046/047/048.png`（編號舊圖，多與上面具名圖重複，逐一比對後多半可略）

## 🔴 ollama-openclaw-windows/（Windows / WSL，permission denied 熱區）

- [ ] 🔴 `wsl-install-command.png`
- [ ] 🔴 `wsl-install-reboot.png`
- [ ] 🔴 `wsl-ubuntu-setup.png`
- [ ] 🔴 `windows-powershell-admin.png`
- [ ] 🔴 `node-version-check.png`
- [ ] 🔴 `nvm-install-command.png`
- [ ] 🔴 `openclaw-npm-install.png`
- [ ] 🔴 `openclaw-version-check.png`
- [ ] 🔴 `openclaw-ready-windows.png`
- [ ] 🔴 `openclaw-model-select-windows.png`
- [ ] 🔴 `openclaw-first-chat-windows.png`
- [ ] 🔴 `ollama-launch-openclaw-windows.png`
- [ ] 🔴 `ollama-auth-prompt.png`
- [ ] 🔴 `ollama-auth-success.png`
- [ ] 🟡 `node22-install.png`（安裝精靈 GUI）
- [ ] 🟡 `ollama-login-browser.png`（瀏覽器 GUI）

## 🔴 firebase-firestore-rules-deploy/

- [ ] 🔴 `deploy-firestore-rules-command.png`（部署指令）
- [ ] 🔴 `install-firebase-tools-npx.png`（npx 安裝輸出）
- [ ] 🔴 `firebase-cli-login-success.png`（CLI 登入輸出）
- [ ] 🔴 `firestore-rules-deployed.png`（部署成功輸出，可能含 rules 錯誤/警告）
- [ ] 🟡 `firebase-authorized-domains.png`／`firestore-data-verified.png`（GUI）

## 🔴 ai-agents-build-line-booking-system/

- [ ] 🔴 `antigravity-cli-prompt.png`（Antigravity CLI 終端）
- [ ] 🔴 `antigravity-agent-reading.png`（agent 執行畫面）
- [ ] 🔴 `claude-code-audit.png`（Claude Code 終端，可能含指令/輸出）
- [ ] 🟡 `github-pages-deployed.png`／`line-booking-pwa.png`／`model-comparison.png`（GUI/圖表）

## 🟡 deploy-to-github-pages/（git 指令可能藏在這）

- [ ] 🟡 `github-repo-quick-setup.png`（GitHub「quick setup」通常列 git remote/push 指令 → 值得看）
- [ ] 🟡 `github-actions-deploy-success.png`／`github-actions-pages-workflow.png`／`github-pages-building.png`／`github-pages-live-site.png`／`github-pages-source-setting.png`／`github-repo-files-pushed.png`（GUI）

---

## 🟡 抽查區：GUI/主控台截圖（通常跳過，但看有無錯誤對話框 / API key 字串）

- [ ] `firebase-register-web-app/firebase-sdk-config.png`（很可能含 firebaseConfig 程式碼 → 值得轉文字）
- [ ] `ai-api-key-guide/`　003–053（約 29 張）— OpenAI/Anthropic/Google API key 主控台，抽查有無 key 格式或地區錯誤
- [ ] `google-api-key-guide/`　001–043（約 33 張，含 3 張 gif）— Google Cloud 主控台
- [ ] `google-cloud-oauth-api-setup/`　gcp-*（11 張）— OAuth 設定主控台
- [ ] `ollama-cloud-api-key/`　ollama-*（6 張）— Ollama 雲端 key 頁
- [ ] `openrouter-free-llm-api-key/`　openrouter-*（8 張）— OpenRouter 頁
- [ ] `github-developer-settings-tokens/`（4 張）— GitHub 設定頁
- [ ] `github-account-signup/`（9 張）— GitHub 註冊 GUI
- [ ] `create-line-login-liff-app/`（6 張）— LINE Developers 主控台
- [ ] `firebase-create-project/`（3 張）、`firebase-enable-google-login/`（5 張）— Firebase 主控台
- [ ] `make-gmail-sheets-automation/`（7 張）、`make-llm-email-auto-tagging/`（9 張）— Make.com GUI
- [ ] `looker-studio-csv-analysis/`（7 張）— Looker Studio GUI
- [ ] `grok-connect-github/`（9 張）、`chatgpt-connect-github/`（4 張）— 瀏覽器 GUI
- [ ] `kaggle-account-signup/`（4 張）— Kaggle GUI

---

## ⚪ 不用動

- `which-ai-tool-for-you/`　5 張 SVG（向量圖，文字本來就可被索引）
- `ai-agent-memory-guide/`　4 張 SVG（同上）
- `icons/`、`logo.png`、`favicon*`、`dock_head_s.png`（介面素材）

---

## 做法（每張 🔴 的標準動作）

1. 打開圖，把裡面的**指令 + 錯誤/輸出**一字不差抄成 code block，放進該圖對應的段落旁。
2. 圖片的 alt 補上同一句（無障礙加分）。
3. 若那段錯誤 GSC 有人在搜（例：unknown command、missing or insufficient permissions、permission denied）→ 考慮獨立成一篇 troubleshoot 頁（套 `docs/troubleshoot-template.md`）。
