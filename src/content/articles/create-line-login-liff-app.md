---
title: "建立 LINE Login Channel 並新增 LIFF App：把你的網頁變成 LINE 內開的小程式"
description: "在 LINE Developers 主控台建立一個 LINE Login channel，再到 LIFF 分頁新增 LIFF App，取得 LIFF ID 與 LIFF URL。手把手 6 步驟附截圖，並解釋 LIFF 能做什麼、適合哪些情境，以及最容易卡關的地方。"
contentType: "tutorial"
scene: "整合與自動化"
difficulty: "中級"
createdAt: "2026-06-28"
verifiedAt: "2026-06-28"
archived: false
order: 3
prerequisites: []
estimatedMinutes: 12
tags: ["LINE", "LIFF", "OAuth", "申請", "整合"]
stuckOptions:
  "LIFF 是什麼": ["LIFF 跟一般網頁差在哪？", "做 LIFF 一定要會寫程式嗎？", "LIFF 跟 LINE Bot 是同一件事嗎？"]
  "選擇頻道類型": ["為什麼不是選 Messaging API？", "LINE MINI App 跟 LIFF 差在哪？", "同一個 Provider 可以建幾個 channel？"]
  "填寫 LIFF App 設定": ["Endpoint URL 一定要 HTTPS 嗎？", "Size 要選哪個？", "Scopes 要勾哪些？"]
  "取得 LIFF ID / LIFF URL": ["LIFF ID 跟 LIFF URL 差在哪？", "LIFF URL 點了打不開", "LIFF ID 寫在程式哪裡？"]
---

> **一句話**：在 LINE Developers 建一個「LINE Login」channel，再到 LIFF 分頁新增 LIFF App，拿到 **LIFF ID** 與 **LIFF URL**，你的網頁就能包成「在 LINE 裡直接開啟」的小程式。

**關鍵字**：LINE Developers、LINE Login、LIFF、LIFF App、LIFF ID、LIFF URL、Endpoint URL、Scopes、openid、profile、Provider、Channel、Create a new channel、Full size、預約頁、報名頁、會員頁

---

## 什麼是 LIFF？它能幫你做什麼？

**LIFF（LINE Front-end Framework）** 是 LINE 提供的前端框架，讓你把「自己的網頁」包成可以**在 LINE App 內直接開啟**的小程式。使用者不用跳出 LINE、不用另外註冊登入——點一個連結，你的網頁就在 LINE 裡開起來，而且能直接拿到使用者的 LINE 身分。

和一般網頁相比，LIFF 多了三件做不到的事：

| 能力 | 一般網頁 | LIFF 網頁 |
|---|---|---|
| 在 LINE 內無縫開啟 | ❌ 會跳出外部瀏覽器 | ✅ 直接在 LINE 內開 |
| 取得使用者身分 | 要自己做一套登入 | ✅ 透過 LINE Login 一鍵拿到 |
| 分享 / 傳訊給好友 | ❌ | ✅ `shareTargetPicker` |

### 適合哪些情境？

LIFF 最常見的用途，都是「需要知道**這是誰**」的網頁：

- **預約 / 報名頁**：使用者點進來直接帶出他的 LINE 名稱，不用再填一次基本資料。
- **會員 / 點數頁**：用 LINE 身分當會員識別，省掉帳號密碼。
- **問卷 / 表單**：在 LINE 內填寫，填完還能一鍵分享給好友。
- **電商商品頁**：在 LINE 裡瀏覽、下單、回到聊天室收通知。

> 💡 LIFF 解決的是「身分」與「無縫體驗」。如果你要做的是「帳號會自己回訊息」的機器人（例如用 Cloudflare Workers 當後端接 Messaging API），那是另一條路，兩者可以併用。

要用 LIFF，你需要先有一個 LIFF App，而 **LIFF App 必須掛在一個 LINE Login channel 底下**。以下 6 步就是把這個 channel 與 LIFF App 建起來。

---

## 前置準備

1. 一個 **LINE 帳號**，並登入 [LINE Developers](https://developers.line.biz/)。
2. 一個已建立的 **Provider**（本例為 `aivision`）。Provider 就是「你的開發者身分／組織」，底下可以掛多個 channel。
3. 一個你想包進 LIFF 的網頁網址（**必須是 HTTPS**）。開發階段先用暫時的 HTTPS 網址也行，之後再回來改。

---

## Step 1：在 Provider 頁新增頻道

進入你的 Provider（本例 `aivision`）的 **Channels** 分頁，點左上那張「**Create a new channel**」（＋）卡片。

![LINE Developers Provider 的 Channels 頁，左上角的 Create a new channel 卡片](/images/articles/create-line-login-liff-app/line-dev-provider-channels.png)

> 同一個 Provider 底下可以同時有多個 channel（Messaging API、LINE Login 等），彼此獨立、互不影響。

---

## Step 2：頻道類型選「LINE Login」

跳出 **Create a new channel** 視窗，會看到四種類型：LINE Login、Messaging API、Blockchain Service、LINE MINI App。**選「LINE Login」**。

![Create a new channel 視窗，四種頻道類型中選擇 LINE Login](/images/articles/create-line-login-liff-app/create-channel-select-line-login.png)

### 🚨 為什麼不是選 Messaging API？

很多人直覺會點 **Messaging API**（那是做「會回訊息的機器人」用的）。但 **LIFF 是隨 LINE Login channel 一起提供的**——你要做「在 LINE 內開的網頁」，正確入口是 **LINE Login**。選錯類型的話，進去根本找不到 LIFF 分頁。

（`LINE MINI App` 是 LINE 審核過、體驗更深整合的版本，門檻較高；一般自己的網頁先用 LIFF 就好。）

---

## Step 3：進入頻道，切到 LIFF 分頁

建立完成後進入頻道（本例 `booking-course`，類型 LINE Login，狀態 Developing）。上方分頁列有 **Basic settings｜LINE Login｜LIFF｜Roles**，點 **LIFF**。

![booking-course 頻道的 Basic settings 頁，上方分頁列指向 LIFF 分頁](/images/articles/create-line-login-liff-app/channel-basic-settings-liff-tab.png)

> Basic settings 裡的 **Channel ID** 與服務地區（本例 Taiwan）就在這頁。Channel ID 屬於需要保密的識別碼，**截圖發佈前務必遮蔽**（本文所有截圖都已遮蔽處理）。

---

## Step 4：新增 LIFF App

首次進入 LIFF 分頁會看到「This channel doesn't have any LIFF apps yet」，並有一段 LIFF 的官方說明。點綠色 **Add** 按鈕開始新增。

![LIFF 分頁，顯示尚無 LIFF App 與綠色 Add 按鈕](/images/articles/create-line-login-liff-app/liff-tab-add-button.png)

> 一個 channel 底下可以建立**多個 LIFF App**，例如「預約頁」「會員頁」各掛一個。

---

## Step 5：填寫 LIFF App 設定

表單所有欄位皆為必填：

- **LIFF app name**：App 顯示名稱（本例 `booking-course`，不可空白、勿用特殊字元、上限 256 字）。
- **Size**：選 **Full**（全螢幕）。另有 Tall、Compact，差別只在開啟時佔畫面的高度。
- **Endpoint URL**：你的網頁網址，**必須是 HTTPS**，不可帶 URL fragment（`#...`），上限 1000 字。
- **Scopes**：勾選 **openid** 與 **profile**（取得使用者的登入身分與基本資料）。`chat_message.write` 視需求才開。

填完送出。

![Add a LIFF app 表單，Size 選 Full、Scopes 勾選 openid 與 profile](/images/articles/create-line-login-liff-app/add-liff-app-form.png)

### 🚨 最常卡關：Endpoint URL 一定要 HTTPS

`http://` 或本機 `localhost` 都**不會過**。開發階段如果還沒有正式網域，可以先用暫時的 HTTPS 網址（例如 Cloudflare Pages、Vercel、ngrok 給的網址）頂著，上線前再回來這頁改掉。

### 🚨 勾了 chat_message.write 會怎樣？

勾選 `chat_message.write`（讓 LIFF 能代發訊息）後，**瀏覽器最小化功能會被停用**。沒有要用這個功能就別勾，維持 openid + profile 最單純。

---

## Step 6：取得 LIFF ID 與 LIFF URL

建立成功後回到 LIFF 清單，會看到剛建立的 App，欄位包含 **LIFF app name｜LIFF ID｜LIFF URL｜Size**。這兩個值就是你要的產物：

![LIFF App 清單，顯示 LIFF app name、LIFF ID、LIFF URL、Size 欄位](/images/articles/create-line-login-liff-app/liff-app-created-id-url.png)

- **LIFF ID**：寫在前端程式裡初始化用：`liff.init({ liffId: "你的 LIFF ID" })`。
- **LIFF URL**：格式固定為 `https://liff.line.me/<LIFF ID>`。**分享這個連結**，使用者點了就會在 LINE 內開啟你的網頁。
- 清單上的 `shareTargetPicker` 開關，要用 LIFF 的「分享給好友」功能時才打開。

### 🚨 LIFF ID 跟 LIFF URL 差在哪？常搞混

- **LIFF ID** 是「程式內部用」的識別碼，給 `liff.init()`。
- **LIFF URL** 是「給人點的連結」，本質就是 `https://liff.line.me/` 接上 LIFF ID。
- 你**不會**把 LIFF ID 直接傳給使用者，使用者拿到的永遠是 LIFF URL。

---

## 重點回顧

- LIFF 讓你的網頁能**在 LINE 內無縫開啟**並**直接取得使用者身分**，適合預約、報名、會員、問卷等情境。
- LIFF App **必須掛在 LINE Login channel** 底下（不是 Messaging API）。
- 一個 channel 可建立多個 LIFF App。
- Endpoint URL **必須 HTTPS**，`localhost` 不行。
- 最常用的 Scopes 是 **openid + profile**。
- 真正要記下來的產物是 **LIFF ID**（程式用）與 **LIFF URL**（分享用）。
