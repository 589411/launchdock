---
title: "註冊 GitHub 帳號：從首頁到登入後台（含裝置 email 驗證）"
description: "手把手註冊一個 GitHub 帳號：填寫註冊表單、完成 email 裝置驗證、進入 Dashboard，並找到右上角的帳號選單。很多教學的第一步都需要 GitHub 帳號，這篇幫你先把這關過了。"
contentType: "tutorial"
scene: "環境準備"
difficulty: "入門"
createdAt: "2026-06-28"
verifiedAt: "2026-06-28"
archived: false
order: 1
prerequisites: []
estimatedMinutes: 6
tags: ["GitHub", "申請", "整合"]
stuckOptions:
  "填寫註冊表單": ["Username 取了說已被使用", "一定要用 Google 登入嗎？", "密碼有什麼要求？"]
  "裝置 email 驗證": ["收不到驗證碼信", "驗證碼過期了", "信跑到垃圾郵件？"]
  "登入後找不到東西": ["設定（Settings）在哪？", "我的 repository 在哪看？", "怎麼登出？"]
---

> **一句話**：到 [github.com](https://github.com) 點 Sign up，填 email／密碼／使用者名稱，收一封驗證碼信完成裝置驗證，就進到 GitHub 後台了。

**關鍵字**：GitHub、註冊帳號、Sign up、Create your free account、Username、Device verification、裝置驗證、驗證碼、Dashboard、帳號選單、Settings

---

## 為什麼需要 GitHub 帳號？

GitHub 是全世界最多人用的程式碼託管平台。LaunchDock 上很多教學的第一步——部署網站、串接服務、用 `gh` CLI、把專案放上雲端——都需要你先有一個 GitHub 帳號。這篇就是把這個「前置中的前置」一次帶你過完，之後的教學直接接著走。

註冊完全免費，全程約 5 分鐘。

---

## Step 1：前往 GitHub 首頁，點 Sign up

打開瀏覽器進入 [github.com](https://github.com)，首頁右上角有 **Sign in**（登入）與 **Sign up**（註冊）。第一次來，點 **Sign up**。

![GitHub 首頁，右上角的 Sign up 註冊按鈕](/images/articles/github-account-signup/github-homepage.png)

---

## Step 2：填寫註冊表單

進到 **Create your free account** 頁面，依序填：

- **Email**：你常用的信箱（之後要收驗證碼）。
- **Password**：至少 15 字，或 8 字以上但同時含數字與小寫字母。
- **Username**：你的公開帳號名稱，全站唯一，會出現在你的網址 `github.com/你的名字`。
- **Your Country/Region**：選你的所在地（本例 Taiwan）。

也可以直接點 **Continue with Google／Apple** 用現成帳號註冊，省去設密碼。填完點 **Create account**。

![GitHub 註冊表單，含 Email、Password、Username、Country 欄位](/images/articles/github-account-signup/github-signup-form.png)

### 🚨 Username 顯示「已被使用」

GitHub 使用者名稱全球唯一，常見的名字幾乎都被搶光了。加個數字、底線或專案字尾（例如 `yourname-dev`）通常就能過。這個名字之後會出現在你所有 repo 的網址，建議取一個你願意長期用的。

---

## Step 3：完成裝置 email 驗證

為了確認是本人，GitHub 會寄一封含**驗證碼**的信到你剛填的 email。回到信箱把那組碼複製，填進 **Device Verification Code** 欄位，按 **Verify**。

![GitHub 裝置驗證頁，輸入寄到 email 的驗證碼](/images/articles/github-account-signup/github-device-verification.png)

### 🚨 收不到驗證碼信？

1. **先翻垃圾郵件／促銷分頁**：寄件者是 `noreply@github.com`，主旨類似「[GitHub] Please verify your device」。
2. **等 1～2 分鐘**：信件偶爾會延遲。
3. 還是沒有 → 頁面下方有 **Re-send the authentication code**（重寄驗證碼）可點。
4. 驗證碼有**時效**（畫面會寫到期時間），過期就重寄一組新的，別用舊的。

---

## Step 4：進入 GitHub Dashboard

驗證成功後就登入了，會看到你的 **Dashboard（首頁）**：左邊是「Create your first project（建立你的第一個專案）」，中間是動態牆，這就是你之後所有操作的起點。

![登入後的 GitHub Dashboard 首頁](/images/articles/github-account-signup/github-dashboard-home.png)

---

## Step 5：認識右上角的帳號選單

點右上角的**頭像**會展開帳號選單，這裡是你最常回來的地方：

- **Your repositories**：你建立的所有專案。
- **Settings**：帳號設定（改密碼、設定 SSH/Token、開兩步驟驗證都在這）。
- **Sign out**：登出。

![點開右上角頭像後的 GitHub 帳號選單](/images/articles/github-account-signup/github-account-menu.png)

> 💡 之後的教學若要你「到 Settings 設定某項」或「在你的 repository 操作」，入口都從這個選單進。

---

## 重點回顧

- 到 [github.com](https://github.com) 點 **Sign up**，填 email／密碼／**全球唯一的 Username**。
- GitHub 會寄**驗證碼**到信箱，填進 **Device Verification Code** 完成裝置驗證；收不到先翻垃圾信、再用重寄。
- 登入後看到 **Dashboard**，所有操作從這裡開始。
- 右上角**頭像選單**通往 Your repositories 與 Settings，是你最常回去的地方。
