---
title: "修好「Missing or insufficient permissions」：用 Firebase CLI 部署 Firestore 安全規則"
description: "純前端網站接上 Firestore 後，雲端連線測試卻跳「Missing or insufficient permissions」？這是 Firestore 預設規則鎖死所致。本文用 Firebase CLI 一步步部署你的 firestore.rules、在 Console 驗證，並排查授權網域，附完整截圖。"
contentType: "troubleshoot"
scene: "整合與自動化"
difficulty: "中級"
createdAt: "2026-06-29"
verifiedAt: "2026-06-29"
archived: false
order: 7
prerequisites: ["firebase-register-web-app"]
estimatedMinutes: 12
tags: ["Firebase", "Firestore", "部署", "除錯", "整合"]
stuckOptions:
  "為什麼會 Missing permissions": ["我明明登入了還是失敗", "預設規則到底擋了什麼？", "改 Console 裡的規則就好還是要部署？"]
  "安裝與登入 Firebase CLI": ["沒裝過 firebase-tools 怎麼辦？", "npx 跟全域安裝差在哪？", "login 卡在瀏覽器授權"]
  "部署 firestore.rules": ["deploy 指令長怎樣？", "只想部署規則不想動其他", "deploy 後多久生效？"]
  "部署完還是連不上": ["檢查 Authorized domains", "規則寫對了嗎？", "資料到底有沒有寫進去？"]
---

> **一句話**：`Missing or insufficient permissions` 幾乎都是 **Firestore 安全規則**把讀寫擋掉了。寫好 `firestore.rules`，用 `npx firebase-tools deploy --only firestore:rules` 部署上去，就解了。

**關鍵字**：Firestore、安全規則、Security Rules、Missing or insufficient permissions、Firebase CLI、firebase-tools、firebase login、deploy、firestore.rules、Authorized domains、授權網域

---

## 問題：雲端連線測試失敗

你的純前端網站已經接上 Firebase（拿到 `firebaseConfig` 了），但一按「雲端連線測試」就跳紅字：

```
✗ 連線測試失敗
Missing or insufficient permissions.
```

![PWA 頁面的雲端連線測試失敗，顯示 Missing or insufficient permissions](/images/articles/firebase-firestore-rules-deploy/pwa-missing-permissions.png)

> 還沒拿到 SDK 設定的話，先看 [在 Firebase 註冊 Web App 取得 SDK 設定](/articles/firebase-register-web-app/)（整個 Firebase 系列從[建立專案](/articles/firebase-create-project/)開始）。

### 為什麼？因為 Firestore 預設「全部拒絕」

這不是你 code 寫錯，而是 **Firestore 的安全規則（Security Rules）** 預設就把所有讀寫擋掉——這是 Firebase 刻意的安全預設，避免你的資料庫一開就門戶大開。要讓前端能讀寫，你得**部署一份允許特定存取的規則**。

規則可以在 Console 網頁裡直接改，但更可重複、可進版控的做法是把規則寫成專案裡的 `firestore.rules` 檔，用 **Firebase CLI** 部署。

---

## Step 1：安裝 Firebase CLI（firebase-tools）

不用全域安裝，用 `npx` 直接跑即可。在你的專案目錄執行：

```bash
npx firebase-tools --version
```

第一次會問你是否允許下載執行 `npx` 套件，選允許即可。

![終端機詢問是否允許執行 npx firebase-tools](/images/articles/firebase-firestore-rules-deploy/install-firebase-tools-npx.png)

---

## Step 2：登入 Firebase

```bash
npx firebase-tools login
```

這會開啟瀏覽器要你授權（跟 Google 登入一樣）。授權成功後瀏覽器會顯示 **「Firebase CLI Login Successful」**，回終端機就能繼續。

![瀏覽器顯示 Firebase CLI 登入成功](/images/articles/firebase-firestore-rules-deploy/firebase-cli-login-success.png)

### 🚨 背景／非互動環境登不了？

如果你是在 AI agent 或背景程序裡跑（非互動模式），`login` 沒辦法跳出瀏覽器互動。解法是**自己另開一個終端機**手動跑 `npx firebase-tools login` 完成授權，登入狀態會共用，再回原本流程繼續 deploy。

---

## Step 3：部署 Firestore 規則

確定專案裡有寫好的 `firestore.rules`（以及指定專案的 `.firebaserc`）後，只部署規則這一項：

```bash
npx firebase-tools deploy --only firestore:rules
```

`--only firestore:rules` 表示「只動規則，別碰 Hosting／Functions 等其他東西」，最安全。

![終端機執行 firebase-tools deploy --only firestore:rules](/images/articles/firebase-firestore-rules-deploy/deploy-firestore-rules-command.png)

---

## Step 4：在 Console 確認規則已上線

回到 [Firebase Console](https://console.firebase.google.com) → **Firestore Database → 規則（Rules）** 分頁，應該能看到你剛部署的規則內容（`rules_version = '2'` 開頭）。看到這份就代表規則已生效。

![Firebase Console 的 Firestore 規則分頁，顯示已部署的規則](/images/articles/firebase-firestore-rules-deploy/firestore-rules-deployed.png)

> 規則裡常見的寫法是「登入的使用者才能讀寫」或「只有特定 admin email 能寫」。`apiKey` 不是你的防線，**這份規則才是**真正決定誰能碰你資料的關卡。

---

## Step 5：驗證資料真的寫得進去

回網站再按一次「雲端連線測試」，這次應該成功。到 **Firestore Database → 資料庫（Data）** 也能看到對應的 collection／document 被寫進去了。

![Firebase Console 的 Firestore 資料分頁，確認資料已寫入](/images/articles/firebase-firestore-rules-deploy/firestore-data-verified.png)

---

## 🚨 部署完規則還是連不上？檢查授權網域

如果規則沒問題、卻還是失敗（尤其是**登入**相關功能），多半是你的網站網域沒被列進**授權網域**。到 **Authentication → 設定 → 授權網域（Authorized domains）** 確認清單裡有你的網域：

- `localhost`（本機開發用，預設就有）
- `<你的專案>.firebaseapp.com`、`<你的專案>.web.app`（Firebase Hosting 預設網域）
- **你自己的網域**（例如 GitHub Pages 的 `xxx.github.io` 或自訂網域）——這個常常忘記加，加上去才放行。

![Firebase Console 的授權網域設定頁](/images/articles/firebase-firestore-rules-deploy/firebase-authorized-domains.png)

---

## 重點回顧

- `Missing or insufficient permissions` = **Firestore 安全規則**擋住了，不是你 code 壞掉。
- 用 `npx firebase-tools` 免全域安裝；`login` 在背景環境跑不動就**另開終端機**手動登入。
- 部署只動規則：`npx firebase-tools deploy --only firestore:rules`。
- 在 Console 的 **規則** 與 **資料** 分頁雙重確認生效。
- 規則對了還連不上 → 檢查 **Authorized domains** 有沒有加你的網域（最常被忘記）。
- 真正保護資料的是**安全規則**，不是把 `apiKey` 藏起來。

---

> **下一步**：雲端後端搞定了，把網站本身免費上線 → [部署靜態網站／PWA 到 GitHub Pages](/articles/deploy-to-github-pages/)
