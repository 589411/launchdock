---
title: "註冊 GitHub 帳號：用 Google 一鍵註冊，或手動填表（含裝置驗證）"
description: "手把手註冊一個 GitHub 帳號：最快的方式是用你的 Google 帳號一鍵註冊，也可以手動填 email／密碼表單。兩種方式都帶你走完裝置 email 驗證、進到 Dashboard。很多教學的第一步都需要 GitHub 帳號，這篇幫你先把這關過了。"
contentType: "tutorial"
scene: "環境準備"
difficulty: "入門"
createdAt: "2026-06-28"
verifiedAt: "2026-07-20"
archived: false
order: 1
prerequisites: []
estimatedMinutes: 6
tags: ["GitHub", "申請", "整合", "Google"]
stuckOptions:
  "用 Google 一鍵註冊": ["找不到 Continue with Google 按鈕", "選錯 Google 帳戶了", "授權頁要不要按繼續？"]
  "填寫註冊表單": ["Username 取了說已被使用", "一定要用 Google 登入嗎？", "密碼有什麼要求？"]
  "裝置 email 驗證": ["收不到驗證碼信", "驗證碼過期了", "信跑到垃圾郵件？"]
  "登入後找不到東西": ["設定（Settings）在哪？", "我的 repository 在哪看？", "怎麼登出？"]
---

> **一句話**：到 [github.com](https://github.com) 點 Sign up。**最快的方式**是點 **Continue with Google**、用你的 Google 帳號一鍵註冊；或手動填 email／密碼／使用者名稱。兩種方式都會收一封驗證碼信完成裝置驗證，就進到 GitHub 後台了。

**關鍵字**：GitHub、註冊帳號、Sign up、Continue with Google、用 Google 帳號登入、Create your free account、Username、Device verification、裝置驗證、驗證碼、Dashboard、帳號選單、Settings

---

## 為什麼需要 GitHub 帳號？

GitHub 是全世界最多人用的程式碼託管平台。LaunchDock 上很多教學的第一步——部署網站、串接服務、用 `gh` CLI、把專案放上雲端——都需要你先有一個 GitHub 帳號。這篇就是把這個「前置中的前置」一次帶你過完，之後的教學直接接著走。

註冊完全免費，全程約 5 分鐘。

---

## 先到 GitHub 官網（兩種方式都從這開始）

在 Google 搜尋「GitHub」，點**官方**結果 `github.com`。認明網址是 `github.com`，別點到上方標「贊助商」的廣告。

![在 Google 搜尋 GitHub，認明官方 github.com 結果](/images/articles/github-account-signup/google-search-github.jpg)

進到 [github.com](https://github.com) 首頁，右上角有 **Sign in**（登入）與 **Sign up**（註冊）。第一次來，點 **Sign up**。

![GitHub 首頁，右上角的 Sign up 註冊按鈕](/images/articles/github-account-signup/github-homepage.png)

接下來有**兩條路**，挑一個做就好：

- **方式 A（推薦）**：用 **Google 帳號一鍵註冊**——不用另外設密碼，點幾下授權就好。
- **方式 B**：手動填 **email／密碼／使用者名稱**表單。

---

## 方式 A（推薦）：用 Google 帳號一鍵註冊

如果你有 Google（Gmail）帳號，這是最快的路。

### A-1：在註冊頁點「Continue with Google」

GitHub 的註冊頁（**Create your free account**）最上方就有 **Continue with Google**（以及 Continue with Apple）。直接點它，跳過下方那一整排要填的欄位。

![GitHub 註冊頁最上方的 Continue with Google 按鈕](/images/articles/github-account-signup/github-continue-with-google.jpg)

### A-2：選擇你的 Google 帳戶

畫面跳到 Google 的「**選擇帳戶**」，點你要用來註冊 GitHub 的那個 Google 帳號。如果沒看到，點「使用其他帳戶」登入。

![Google 選擇帳戶畫面，繼續使用 GitHub](/images/articles/github-account-signup/google-account-chooser.jpg)

### A-3：授權 GitHub 存取基本資料

Google 會列出「GitHub 將取得你的**名稱、個人資料相片、email**」。這是社群登入的標準授權，確認是 GitHub 沒錯後，點 **繼續**。

![Google 授權頁，GitHub 將存取名稱與 email，點繼續](/images/articles/github-account-signup/google-oauth-consent.jpg)

> 💡 「用 Google 帳號登入」只是把「你是誰」交給 Google 驗證，GitHub 不會拿到你的 Google 密碼。之後你既能用 Google 一鍵登入，也能到 GitHub 設定裡另外設一組密碼。

授權完成後，GitHub 通常還會做一次**裝置 email 驗證**（下一節），驗證完就直接進到 Dashboard——你可以跳過「方式 B」，直接看下面。

---

## 方式 B：手動填 email 表單註冊

不想用 Google？在 **Create your free account** 頁面依序填：

- **Email**：你常用的信箱（之後要收驗證碼）。
- **Password**：至少 15 字，或 8 字以上但同時含數字與小寫字母。
- **Username**：你的公開帳號名稱，全站唯一，會出現在你的網址 `github.com/你的名字`。
- **Your Country/Region**：選你的所在地（本例 Taiwan）。

填完點 **Create account**。

![GitHub 註冊表單，含 Email、Password、Username、Country 欄位](/images/articles/github-account-signup/github-signup-form.png)

### 🚨 Username 顯示「已被使用」

GitHub 使用者名稱全球唯一，常見的名字幾乎都被搶光了。加個數字、底線或專案字尾（例如 `yourname-dev`）通常就能過。這個名字之後會出現在你所有 repo 的網址，建議取一個你願意長期用的。

---

## 完成註冊：裝置 email 驗證（兩種方式都會遇到）

為了確認是本人，GitHub 會寄一封含**驗證碼**的信到你的 email（用 Google 註冊的話就是你那個 Gmail）。回到信箱把那組碼複製，填進 **Device Verification Code** 欄位，按 **Verify**。

![GitHub 裝置驗證頁，輸入寄到 email 的驗證碼](/images/articles/github-account-signup/github-device-verification.png)

### 🚨 收不到驗證碼信？

1. **先翻垃圾郵件／促銷分頁**：寄件者是 `noreply@github.com`，主旨類似「[GitHub] Please verify your device」。
2. **等 1～2 分鐘**：信件偶爾會延遲。
3. 還是沒有 → 頁面下方有 **Re-send the authentication code**（重寄驗證碼）可點。
4. 驗證碼有**時效**（畫面會寫到期時間），過期就重寄一組新的，別用舊的。

---

## 進入 GitHub Dashboard

驗證成功後就登入了，會看到你的 **Dashboard（首頁）**：左邊是「Create your first project（建立你的第一個專案）」，中間是動態牆，這就是你之後所有操作的起點。

![登入後的 GitHub Dashboard 首頁](/images/articles/github-account-signup/github-dashboard-home.png)

---

## 認識右上角的帳號選單

點右上角的**頭像**會展開帳號選單，這裡是你最常回來的地方：

- **Your repositories**：你建立的所有專案。
- **Settings**：帳號設定（改密碼、設定 SSH/Token、開兩步驟驗證都在這）。
- **Sign out**：登出。

![點開右上角頭像後的 GitHub 帳號選單](/images/articles/github-account-signup/github-account-menu.png)

> 💡 之後的教學若要你「到 Settings 設定某項」或「在你的 repository 操作」，入口都從這個選單進。

---

## 重點回顧

- 兩種方式都先到 [github.com](https://github.com) 點 **Sign up**。
- **最快**：點 **Continue with Google** → 選 Google 帳戶 → 授權 **繼續**，一鍵完成、免設密碼。
- 或手動填 email／密碼／**全球唯一的 Username**。
- 兩種方式都會收到**驗證碼**，填進 **Device Verification Code** 完成裝置驗證；收不到先翻垃圾信、再用重寄。
- 登入後看到 **Dashboard**，右上角**頭像選單**通往 Your repositories 與 Settings。

## 下一步：把你的第一個網站掛上線

有了 GitHub 帳號，最有成就感的第一件事就是**免費部署一個自己的網站**。接著看 👉 [把靜態網站／PWA 部署到 GitHub Pages](/articles/deploy-to-github-pages/)，從建 repo 到自動上線，一次走完。
