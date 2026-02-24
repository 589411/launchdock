---
title: "Google API Key 申請完整指南：OpenClaw 串接 Google Drive / Gmail 必讀"
description: "一步步教你申請 Google Cloud API Key，解決 OpenClaw 串接 Google 服務時最常卡關的那一步。"
scene: "安裝與設定"
difficulty: "入門"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
discussionUrl: "https://github.com/589411/launchdock/discussions"
order: 1
tags: ["OpenClaw", "Google API", "Google Drive", "Gmail", "設定"]
stuckOptions:
  "進入 Google Cloud Console": ["找不到 Google Cloud Console 入口", "登入後畫面跟文章不一樣"]
  "建立新專案": ["不知道專案名稱該取什麼", "找不到「建立專案」按鈕"]
  "啟用需要的 API": ["不確定該啟用哪些 API", "搜尋 API 名稱找不到"]
  "OAuth 同意畫面": ["OAuth 同意畫面設定很複雜", "不知道「測試使用者」該填什麼", "审核要等很久嗎？"]
  "建立憑證": ["不知道該選 API Key 還是 OAuth Client", "Client ID 和 Client Secret 傻傻分不清", "重導 URI 該填什麼？"]
  "OpenClaw 中設定": ["找不到 OpenClaw 設定頁面", "貼上 Key 後沒有反應"]
  "驗證是否成功": ["測試失敗但不知道哪裡出錯", "顯示權限不足的錯誤"]
---

## 為什麼你會看到這篇？

你想用 OpenClaw 串接 Google Drive 或 Gmail，但在設定 API Key 的步驟卡住了。

這很正常。Google Cloud Console 的介面對非技術背景的人來說非常不友善，而且很多教學影片會跳過這個步驟，或者只是快速帶過。

這篇文章會帶你一步步完成，包括**最常見的 5 個錯誤**。

---

## 你需要準備什麼

- 一個 Google 帳號（你平常用的 Gmail 就行）
- 大約 15-20 分鐘的時間
- OpenClaw 已安裝完成（如果還沒安裝，先看 [安裝指南](/articles/install-openclaw)）

---

## 步驟一：進入 Google Cloud Console

1. 打開瀏覽器，前往 [console.cloud.google.com](https://console.cloud.google.com)
2. 用你的 Google 帳號登入
3. 如果是第一次使用，會看到「同意服務條款」的畫面，勾選後按「同意並繼續」

> 💡 **小提醒**：如果你有多個 Google 帳號，確認你用的是正確的那個。右上角的頭像可以切換帳號。

---

## 步驟二：建立新專案

1. 點擊頂部的專案選擇器（可能顯示「My First Project」或「選取專案」）
2. 點擊「新增專案」
3. 專案名稱輸入：`openclaw-integration`（或任何你喜歡的名字）
4. 點擊「建立」
5. 等待幾秒鐘，專案建立完成後會自動切換

### 🚨 常見錯誤 #1：沒有切換到新專案

建立完專案後，頂部的專案名稱可能**沒有自動切換**。請手動點擊專案選擇器，確認你在 `openclaw-integration` 專案底下。

---

## 步驟三：啟用需要的 API

根據你要串接的服務，你需要啟用不同的 API：

### 串接 Google Drive

1. 在左側選單找到「API 與服務」→「程式庫」
2. 搜尋 `Google Drive API`
3. 點進去後按「啟用」

### 串接 Gmail

1. 同上，搜尋 `Gmail API`
2. 點進去後按「啟用」

> 💡 **兩個都要用？** 兩個都啟用就好，不衝突。

### 🚨 常見錯誤 #2：啟用了錯誤的 API

Google 有很多名字很像的 API。確認你啟用的是：
- ✅ `Google Drive API`（不是 Google Drive Activity API）
- ✅ `Gmail API`（不是 Google Workspace 其他的 API）

---

## 步驟四：建立 OAuth 同意畫面

這一步是很多人覺得最困惑的，但其實只要照著做就好。

1. 在左側選單找到「API 與服務」→ 「OAuth 同意畫面」
2. 選擇「外部」（External），點擊「建立」
3. 填寫以下資訊：
   - **應用程式名稱**：`OpenClaw`（隨你取）
   - **使用者支援電子郵件**：選你的 Gmail
   - **開發人員聯絡資訊**：填你的 Gmail
4. 其他欄位可以不填，點「儲存並繼續」
5. 在「範圍」頁面，直接點「儲存並繼續」
6. 在「測試使用者」頁面：
   - 點「新增使用者」
   - 輸入**你自己的 Gmail 地址**
   - 點「儲存並繼續」
7. 回到摘要頁面，確認後完成

### 🚨 常見錯誤 #3：忘記加測試使用者

如果你沒有把自己的 email 加到測試使用者，後面會得到 `403 access_denied` 的錯誤。**一定要加！**

---

## 步驟五：建立憑證（API Key + OAuth Client）

### 建立 OAuth Client ID

1. 在左側選單「API 與服務」→「憑證」
2. 點「建立憑證」→「OAuth 用戶端 ID」
3. 應用程式類型選「電腦版應用程式」（Desktop app）
4. 名稱隨意，點「建立」
5. 會出現一個對話框顯示：
   - **用戶端 ID**
   - **用戶端密鑰**
6. **把這兩個都複製下來！** 點「下載 JSON」更好，會下載一個 `credentials.json` 檔案

### 🚨 常見錯誤 #4：選錯應用程式類型

如果你選了「網頁應用程式」而不是「電腦版應用程式」，OpenClaw 在本地端會無法正確完成 OAuth 流程。

---

## 步驟六：在 OpenClaw 中設定

1. 把下載的 `credentials.json` 放到 OpenClaw 的設定資料夾
2. 在 OpenClaw 的設定檔中加入：

```json
{
  "google": {
    "credentials_path": "./credentials.json",
    "scopes": [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/gmail.readonly"
    ]
  }
}
```

3. 重啟 OpenClaw
4. 第一次使用時會跳出瀏覽器要你授權——按「允許」就好

### 🚨 常見錯誤 #5：scope 權限太大或太小

- `drive.readonly` = 只能讀取 Google Drive 檔案（安全）
- `drive` = 可以讀寫刪除所有檔案（風險較高）
- 建議從 `readonly` 開始，確認可以用了再擴大權限

---

## 完成！驗證是否成功

在 OpenClaw 中試試這個指令：

```
列出我 Google Drive 中最近 5 個修改的檔案
```

如果看到檔案列表，恭喜你 🚀 **發射成功！**

如果還是有問題，常見的除錯步驟：

1. 確認 `credentials.json` 路徑正確
2. 確認 API 有啟用（步驟三）
3. 確認測試使用者有加自己（步驟四）
4. 確認應用程式類型是「電腦版」（步驟五）
5. 試試刪除 `token.json` 重新授權

---

## 下一步

API Key 設定好了，接下來：

- 💰 [搞懂 Token 計費，不被帳單嚇到](/articles/token-economics)
- ⚙️ [設定模型切換策略，省錢又穩定](/articles/openclaw-model-config)
- 🧩 [寫你的第一個 Skill](/articles/openclaw-skill)
- 💬 [學 Prompt 技巧讓 AI 回答更好](/articles/prompt-engineering)

---

## 還是卡住了？

點擊下方的「😵 卡關了」按鈕讓我們知道，或直接到 [首頁討論區](/#discussion) 發問，附上錯誤訊息，我們一起解決！
