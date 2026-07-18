---
title: "在 Firebase 註冊 Web App 取得 SDK 設定"
description: "把你的網站註冊成 Firebase 專案下的 Web 應用程式，拿到 firebaseConfig SDK 設定，前端就能連上 Firebase。附截圖，並說明 apiKey 到底算不算機密、之後在哪再看到這段設定。"
contentType: "tutorial"
scene: "整合與自動化"
difficulty: "入門"
createdAt: "2026-06-29"
verifiedAt: "2026-06-29"
archived: false
order: 6
prerequisites: ["firebase-enable-google-login"]
estimatedMinutes: 5
tags: ["Firebase", "OAuth", "設定", "整合"]
stuckOptions:
  "註冊 Web 應用程式": ["</> 網頁圖示在哪？", "App 暱稱可以亂取嗎？", "要不要勾 Firebase Hosting？"]
  "取得 SDK 設定": ["firebaseConfig 裡的 apiKey 算機密嗎？", "之後在哪裡再看到這段設定？", "npm install 哪個套件？"]
---

> **一句話**：在專案裡點 **網頁 `</>`** 把網站註冊成一個 Web App，複製它給你的 `firebaseConfig`，貼進前端程式，你的網站就連上 Firebase 了。

**關鍵字**：Firebase Web App、firebaseConfig、apiKey、SDK、npm install firebase、專案設定

---

## 為什麼要註冊 Web App？

前面建好了專案、開好了登入，但你的網頁還不知道「要連到哪個 Firebase 專案」。**註冊一個 Web App** 就是去拿那段「連線地址」——也就是 `firebaseConfig`。

> 還沒開好登入？先看 [在 Firebase 啟用 Google 登入](/articles/firebase-enable-google-login/)。

---

## Step 1：新增 Web 應用程式

回到**專案設定／專案總覽**，點 **網頁 `</>`** 圖示，把你的網站註冊成這個 Firebase 專案下的一個 Web App。

![在專案中新增 Web 應用程式，點 </> 圖示](/images/articles/firebase-register-web-app/firebase-add-web-app.png)

輸入一個 **App 暱稱**（只給你自己看，隨意取）。要用 Firebase Hosting 才勾下面那個選項，純前端先不用。按 **註冊應用程式**。

![輸入 Web 應用程式暱稱並註冊](/images/articles/firebase-register-web-app/firebase-register-web-app.png)

---

## Step 2：取得 firebaseConfig

註冊完成後，Firebase 會給你一段 **SDK 設定**：先 `npm install firebase`，再複製那段 `firebaseConfig` 物件（含 `apiKey`、`authDomain`、`projectId`、`appId` 等），貼進你的前端程式即完成連線。

![Firebase Web SDK 設定，含 npm install firebase 與 firebaseConfig](/images/articles/firebase-register-web-app/firebase-sdk-config.png)

### 🚨 firebaseConfig 裡的 apiKey 算機密嗎？

**不算傳統意義的機密。** Firebase 的 Web `apiKey` 本來就設計成放在前端、會被使用者看到，它只是用來識別「要連到哪個專案」，不是授權金鑰。真正保護資料的是 **Firestore 安全規則**，不是把這段藏起來。

> ⚠️ 但真正要保密的是 **service account 私鑰、後端用的 Admin SDK 金鑰**——那些絕不能進前端或 git。

### 🚨 之後還能再看到這段設定嗎？

可以。隨時到 **專案設定（Project settings）→ 一般 → 你的應用程式** 就能再次複製 `firebaseConfig`。

---

## 重點回顧

- 註冊 Web App 是為了拿到 **`firebaseConfig`**——前端連上 Firebase 的「地址」。
- 流程：專案總覽 → 點 **`</>`** → 填暱稱 → 註冊 → 複製 `firebaseConfig`。
- `apiKey` **不是機密**，可放前端；要保密的是 service account / Admin SDK 私鑰。
- 設定隨時可在 **專案設定 → 一般** 再拿。

---

> **下一步**：連上之後若讀寫資料跳「Missing or insufficient permissions」，那是規則擋的 → [修 Missing permissions：部署 Firestore 安全規則](/articles/firebase-firestore-rules-deploy/)
