---
title: "Google Cloud：建專案、啟用 API、設定 OAuth 同意畫面（給自動化串接用）"
description: "當 Make／n8n 這類工具要用比較敏感的 Google 權限（讀寫 Gmail、Sheets、Drive）時，光靠「Sign in with Google」不夠，你得自己建一個 Google Cloud 專案、啟用對應的 API、並設定 OAuth 同意畫面與用戶端憑證。這篇把這條有點勸退的路徑，一步一步拆給你看。"
contentType: "tutorial"
scene: "整合與自動化"
difficulty: "進階"
createdAt: "2026-07-18"
verifiedAt: "2026-07-18"
archived: false
order: 2
prerequisites: ["make-gmail-sheets-automation"]
estimatedMinutes: 15
tags: ["Google", "API", "設定", "OAuth"]
modules: [M08, M05]
stuckOptions:
  "建立專案": ["專案名稱和專案 ID 差在哪？", "父項資源選什麼？", "已經有一堆專案了，要新建嗎？"]
  "啟用 API": ["搜尋不到 Gmail API", "啟用後還要做什麼？", "為什麼要同時開 Sheets 和 Drive？"]
  "OAuth 同意畫面": ["內部和外部選哪個？", "測試模式是什麼意思？", "網頁應用程式還是電腦版？"]
---

> **一句話**：到 [Google Cloud Console](https://console.cloud.google.com) 建一個新專案 → 在 API 程式庫啟用 Gmail／Sheets／Drive API → 設定 OAuth 同意畫面（選「外部」、填 app 名稱與聯絡信箱）→ 建立一個「網頁應用程式」OAuth 用戶端，拿到 Client ID／Secret，這樣像 Make 這種外部工具才有資格用你的 Google 敏感權限。

**關鍵字**：Google Cloud、GCP、專案、API 程式庫、Gmail API、Sheets API、Drive API、OAuth 同意畫面、OAuth 用戶端、Client ID、Client Secret

---

## 為什麼需要這一步？（先搞懂再動手）

上一篇〈Make 自動化起手式〉裡，我們用 **Sign in with Google** 就把 Gmail 連上了。那對「讀個人 Gmail」通常夠用。

但當你要用的權限比較**敏感**（例如讓自動化「讀取、撰寫、甚至刪除」你的 Gmail），或者你想避免共用 Make 內建連線的各種限制時，Google 會要求：**這個外部應用程式，得用「你自己的 Google Cloud 專案 + OAuth 憑證」來存取。**

換句話說，你要在 Google Cloud 幫這個串接**開一個正式的門牌**，Google 才放行敏感權限。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：Sign in with Google 像用悠遊卡進捷運站——日常夠用。但如果你要進的是「金庫等級」的區域（刪信這種高權限），警衛就會說：「請出示你公司的正式識別證。」建 Google Cloud 專案 + OAuth 用戶端，就是去辦那張正式識別證。手續多一點，但一次辦好就長期有效。

這條路徑步驟不少，但邏輯很清楚，分成三段：**① 建專案 → ② 啟用 API → ③ 設定 OAuth**。

---

## 第一段：建立一個 Google Cloud 專案

### Step 1：新增專案

進 [Google Cloud Console](https://console.cloud.google.com)，用頁面上方的專案選單 → **新增專案**。

- **專案名稱**：取一個你認得的名字（例如 `my-project-make`）。名稱之後可改。
- **專案 ID**：系統依名稱自動產生、**建立後就不能改**，全球唯一。
- **父項資源**：個人用選「無組織」即可。

填好點 **建立**。

![Google Cloud Console 新增專案](/images/articles/google-cloud-oauth-api-setup/gcp-create-project.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：**專案**是一個資料夾，把「這次串接要用到的 API、憑證、帳單」通通裝在一起。之後不同的自動化開不同專案，帳就分得清清楚楚，不會混在一起。

### 🚨 建好專案後，記得「切換」到它

建立成功後，Console 不一定會自動切到新專案。用上方的**專案選擇器**，確認你現在操作的是**剛建的那個專案**——不然你後面啟用的 API 會裝到別的專案去，白做工。

---

## 第二段：啟用需要的 API

一個新專案預設什麼 API 都沒開。你要什麼功能，就去 **API 程式庫** 把對應的 API「啟用」。

### Step 2：在 API 程式庫搜尋

左側選單 → **API 和服務** → **程式庫**。在搜尋框打你要的 API 名稱，例如 **gmail**。

![在 Google Cloud API 程式庫搜尋 gmail](/images/articles/google-cloud-oauth-api-setup/gcp-api-library-search.png)

### Step 3：啟用 Gmail API

點進 **Gmail API** 的產品頁，按 **啟用**。

![Gmail API 產品頁，按啟用](/images/articles/google-cloud-oauth-api-setup/gcp-gmail-api.png)

啟用後會進到 Gmail API 的管理頁，這裡也會提示你「可能需要建立憑證才能呼叫這個 API」——憑證就是第三段要做的 OAuth 用戶端。

![Gmail API 已啟用](/images/articles/google-cloud-oauth-api-setup/gcp-enable-gmail-api.png)

### Step 4：同樣啟用 Google Sheets API 與 Google Drive API

做 Gmail → Sheets 的自動化，你還會用到：

- **Google Sheets API**（讀寫試算表）
- **Google Drive API**（Sheets 檔案存在 Drive 裡，找檔案會用到）

回程式庫，各自搜尋、進產品頁、按 **啟用**。

![啟用 Google Sheets API](/images/articles/google-cloud-oauth-api-setup/gcp-enable-sheets-api.png)

![啟用 Google Drive API](/images/articles/google-cloud-oauth-api-setup/gcp-enable-drive-api.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：啟用 API 就像去總機開通分機——你要打「業務部（Gmail）、財務部（Sheets）、倉庫（Drive）」，就得先一個一個開通，不然電話撥過去是不通的。開通是免費的，用多少才算多少。

---

## 第三段：設定 OAuth 同意畫面與用戶端

這是最後、也是最關鍵的一段：告訴 Google「有一個 app 要代表使用者存取這些 API」。

### Step 5：填 OAuth 應用程式資訊

左側 → **API 和服務** → **OAuth 同意畫面**（新版叫「Google Auth Platform」），開始設定：

- **應用程式名稱**：這個 app 的名字（例如 `make`），使用者授權時會看到。
- **使用者支援電子郵件**：選你的信箱。

![設定 OAuth 應用程式資訊](/images/articles/google-cloud-oauth-api-setup/gcp-oauth-app-info.png)

### Step 6：選「外部」使用者類型

接著問 **目標對象**：

- **內部**：只給你組織（Google Workspace）內的人用。
- **外部**：任何有 Google 帳號的人（含你自己的個人帳號）都能用，但一開始是「測試模式」，只有你加進「測試使用者」清單的人能存取。

個人帳號、串 Make 這種情況，選 **外部**。

![OAuth 選擇外部使用者類型](/images/articles/google-cloud-oauth-api-setup/gcp-oauth-external.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：「測試模式 + 外部」的意思是——這個 app 還沒送 Google 正式審核，所以只有你「點名」加進測試名單的帳號能用。自己一個人用完全夠，不用等審核。要開放給不特定大眾才需要送審。

### Step 7：建立 OAuth 用戶端（選網頁應用程式）

同意畫面設定完，去建 **OAuth 用戶端 ID**。它會問 **應用程式類型**：

- **網頁應用程式（Web application）**：像 Make、Notion 這種在網頁上跑、需要「重新導向 URL」把你導回去的服務 ← 串 Make 選這個。
- **電腦版應用程式**：在你電腦本機跑的程式（localhost）。

![選擇 OAuth 用戶端的應用程式類型](/images/articles/google-cloud-oauth-api-setup/gcp-oauth-client-type.png)

選「網頁應用程式」，幫用戶端取個名字。**已授權的重新導向 URI** 要填 Make 給你的那個回呼網址（例如 `https://www.make.com/oauth/cb/...`，實際網址以 Make 連線設定畫面顯示的為準）。

![設定網頁應用程式 OAuth 用戶端](/images/articles/google-cloud-oauth-api-setup/gcp-oauth-web-client.png)

### Step 8：拿到 Client ID 與 Client Secret

按建立，Google 會給你一組 **Client ID** 和 **Client Secret**（也可以下載成 JSON）。把這兩個值填回 Make 的連線設定，串接就打通了。

![OAuth 用戶端建立完成，取得 Client ID／Secret](/images/articles/google-cloud-oauth-api-setup/gcp-oauth-client-created.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：**Client ID** 是這個 app 的「身分證字號」（可以公開），**Client Secret** 是它的「印章／密碼」（絕對要保密）。就像本文截圖也把 Secret 塗掉了——Secret 外洩，等於別人能冒用你的 app 去要 Google 權限。

### 🚨 設定好卻馬上失敗？可能是還沒生效

Google 有時會提示「設定可能需要 5 分鐘到幾小時才會生效」。剛建好就馬上去串、若遇到錯誤，先等一下再試，不一定是你設錯。

---

## 完成了！回到你的自動化

三段走完，你就有了：**一個 Google Cloud 專案、啟用好的 Gmail／Sheets／Drive API、一組 OAuth 用戶端憑證**。把 Client ID／Secret 填回 Make（或 n8n）的 Google 連線，剛剛卡住的敏感權限就會放行了。

回上一篇〈Make 自動化起手式〉繼續把 Gmail → Sheets 的流程設完，或往下一篇〈在 Make 用 LLM 自動分類 Gmail 信件〉加上 AI。

---

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編最後叮嚀**：這條路手續多，最容易踩的三個坑是——① **建完專案忘了切換**（API 裝到別的專案）；② **重新導向 URI 填錯**（要一字不差貼 Make 給的回呼網址）；③ **Client Secret 外流**（跟 API Key 一樣是機密，別截圖、別上傳）。這三關過了，剩下就順了。
