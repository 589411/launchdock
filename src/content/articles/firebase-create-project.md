---
title: "建立你的第一個 Firebase 專案"
description: "純前端網站想加雲端登入或資料同步？第一步是在 Firebase Console 建立一個專案。本文從歡迎頁到專案總覽帶你走完，並解釋 Firebase 能替沒有後端的你做什麼。"
contentType: "tutorial"
scene: "整合與自動化"
difficulty: "入門"
createdAt: "2026-06-29"
verifiedAt: "2026-06-29"
archived: false
order: 4
prerequisites: []
estimatedMinutes: 5
tags: ["Firebase", "Google", "申請", "整合"]
stuckOptions:
  "建立 Firebase 專案": ["一定要開 Google Analytics 嗎？", "專案名稱可以改嗎？", "Firebase 跟 Google Cloud 是同一個嗎？"]
  "進不了專案總覽": ["卡在建立中轉圈圈", "建好後要去哪？", "可以建幾個專案？"]
---

> **一句話**：到 [Firebase Console](https://console.firebase.google.com) 用 Google 帳號登入，點「建立 Firebase 專案」、取個名字、一路繼續，就有一個專案了。這是後面所有雲端功能的起點。

**關鍵字**：Firebase、Firebase Console、建立專案、Google Analytics、專案總覽、後端即服務、BaaS

---

## Firebase 能替「沒有後端」的你做什麼

如果你的網站是**純前端**（只有 HTML/JS，沒有自己的伺服器），卻想要使用者登入、跨裝置同步、存一點雲端資料，自己架後端太重了。Firebase 把後端那塊外包掉：

| 你想做的事 | 自己架後端 | 用 Firebase |
|---|---|---|
| 使用者登入 | 自己寫帳號、存密碼、做 OAuth | **Authentication** 一鍵接 Google 等登入 |
| 存／同步資料 | 自己架資料庫、寫 API | **Firestore** 前端直接讀寫、即時同步 |
| 維運 | 自己顧伺服器 | 全託管、免維護 |

而用這些服務的共同第一步，就是**先有一個 Firebase 專案**。

---

## 前置準備

1. 一個 **Google 帳號**（建議先開啟兩步驟驗證）。
2. 一個你要加上雲端功能的**網站專案**（本例為課程預約系統 `line-booking-course`）。

---

## Step 1：建立專案

登入 [Firebase Console](https://console.firebase.google.com)，在歡迎頁點 **「請設定 Firebase 專案」**（Create a Firebase project）。

![Firebase 歡迎頁，點「請設定 Firebase 專案」卡片](/images/articles/firebase-create-project/firebase-welcome-create-project.png)

輸入**專案名稱**（本例 `line-booking-course`）。名稱只是給你自己辨識，Firebase 會在底下自動產生一組全球唯一的專案 ID。

![輸入 Firebase 專案名稱](/images/articles/firebase-create-project/firebase-name-project.png)

### 🚨 一定要開 Google Analytics 嗎？

不用。接下來會問你要不要啟用 **Google Analytics**，個人小專案可以直接關掉、一路按「繼續／建立專案」；之後想開再開也行，不影響登入與資料庫功能。

---

## Step 2：進入專案總覽

建立完成後會進到**專案總覽**頁。左側是所有 Firebase 產品（Authentication、Firestore、Hosting…），中間可以新增應用程式。這頁就是你之後的控制中心。

![Firebase 專案總覽頁](/images/articles/firebase-create-project/firebase-project-overview.png)

---

## 重點回顧

- Firebase 替純前端外包「登入、資料庫、維運」。
- 用任何 Firebase 服務的第一步都是**建立一個專案**。
- Google Analytics 可開可關，不影響核心功能。
- 建好後進到**專案總覽**，那是你的控制中心。

---

> **下一步**：專案有了，接著開啟登入功能 → [在 Firebase 啟用 Google 登入](/articles/firebase-enable-google-login)
