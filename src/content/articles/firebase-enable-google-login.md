---
title: "在 Firebase 啟用 Google 登入"
description: "用 Firebase Authentication 替你的網站加上「用 Google 登入」：開啟 Authentication、選 Google 登入方式、設定專案支援 email。附截圖與最常見的支援 email 警告排解。"
contentType: "tutorial"
scene: "整合與自動化"
difficulty: "入門"
createdAt: "2026-06-29"
verifiedAt: "2026-06-29"
archived: false
order: 5
prerequisites: ["firebase-create-project"]
estimatedMinutes: 5
tags: ["Firebase", "Google", "OAuth", "申請", "整合"]
stuckOptions:
  "找不到 Authentication": ["左側選單沒看到", "用搜尋怎麼找？", "第一次進要按什麼？"]
  "啟用 Google 登入": ["Sign-in method 有哪些可選？", "啟用後出現要設支援 email 的警告", "啟用後要做什麼？"]
---

> **一句話**：在 Firebase 專案裡開啟 **Authentication → Google**，設定一個專案支援 email，你的網站就能用「Google 登入」拿到使用者身分，不用自己做帳號系統。

**關鍵字**：Firebase Authentication、Google 登入、Sign-in method、登入方式、專案支援 email、OAuth

---

## 為什麼用 Firebase 的登入？

要「知道使用者是誰」，自己做一套帳號／密碼／OAuth 很麻煩又容易出錯。Firebase Authentication 讓你**一鍵接上 Google 登入**——使用者用現成的 Google 帳號登入，你直接拿到身分，省掉整套帳密系統。

> 還沒有 Firebase 專案？先看 [建立你的第一個 Firebase 專案](/articles/firebase-create-project/)。

---

## Step 1：開啟 Authentication

在 Firebase Console 左上角搜尋框輸入 **`authentication`**，點進 Authentication 產品。

![在 Firebase 左上搜尋 authentication](/images/articles/firebase-enable-google-login/firebase-search-authentication.png)

第一次進來會看到產品介紹頁，點 **「開始使用」（Get started）**。

![Authentication 介紹頁，點開始使用](/images/articles/firebase-enable-google-login/firebase-auth-get-started.png)

---

## Step 2：選擇並啟用 Google 登入

在 **Sign-in method（登入方式）** 列表中，可以看到 Email/密碼、Google、匿名、Apple… 等多種方式。點選 **Google**。

![Authentication 登入方式列表，選擇 Google](/images/articles/firebase-enable-google-login/firebase-enable-google-provider.png)

把右上角的**啟用開關**打開，然後點 **儲存**。

![啟用 Google 登入並儲存](/images/articles/firebase-enable-google-login/firebase-google-enable-save.png)

---

## Step 3：設定專案支援 email

### 🚨 出現「需設定專案支援 email」的警告

啟用 Google 登入時，Firebase 會要你指定一個**專案公開名稱**與**支援 email**——這會顯示在 Google 登入畫面上，讓使用者知道是誰要登入。從下拉選單選一個你的 Google email 即可，沒設定的話會卡在這個警告。

![設定專案公開名稱與支援 email](/images/articles/firebase-enable-google-login/firebase-support-email.png)

---

## 重點回顧

- Firebase Authentication 讓你不用自己做帳密系統，**一鍵接 Google 登入**。
- 路徑：搜尋 **Authentication → Get started → Sign-in method → Google → 啟用 → 儲存**。
- 啟用 Google 登入**一定要設專案支援 email**，否則卡在警告。

---

> **下一步**：登入開好了，接著把你的網站註冊成 Web App、拿到連線用的 SDK 設定 → [在 Firebase 註冊 Web App 取得 SDK 設定](/articles/firebase-register-web-app/)
