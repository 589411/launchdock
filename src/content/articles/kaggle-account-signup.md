---
title: "註冊 Kaggle 帳號：用 Google 登入 + 手機驗證，一次搞定"
description: "手把手註冊全球最大的資料科學社群 Kaggle：從首頁點 Register、用 Google 帳號快速登入、到最後的手機簡訊驗證解鎖完整功能。很多 AI/資料分析教學的第一步都需要 Kaggle 帳號，這篇幫你把這關過了。"
contentType: "tutorial"
scene: "環境準備"
difficulty: "入門"
createdAt: "2026-07-18"
verifiedAt: "2026-07-18"
archived: false
order: 1
prerequisites: []
estimatedMinutes: 6
tags: ["Kaggle", "申請", "資料科學"]
stuckOptions:
  "選擇登入方式": ["一定要用 Google 嗎？", "可以用 Email 註冊嗎？", "哪個方式最快？"]
  "手機驗證": ["收不到簡訊驗證碼", "為什麼一定要驗證手機？", "換一個號碼可以嗎？"]
  "登入後不知道做什麼": ["帳號顯示未驗證怎麼辦？", "Datasets／Notebooks 在哪？", "怎麼找免費課程？"]
---

> **一句話**：到 [kaggle.com](https://www.kaggle.com) 點 Register，選「Register with Google」用現成的 Google 帳號登入，最後收一封手機簡訊驗證碼，就完成一個能下載資料集、跑 Notebook 的 Kaggle 帳號了。

**關鍵字**：Kaggle、註冊帳號、Register、Sign in with Google、資料科學、Datasets、Notebooks、手機驗證、Persona、簡訊驗證碼

---

## 為什麼需要 Kaggle 帳號？

Kaggle 是全世界最大的資料科學與機器學習社群——它自稱是「The World's AI Proving Ground」（全世界的 AI 練功場）。上面有超過三千萬人，你可以在這裡：

- **下載現成的資料集**（Datasets）：想練習資料分析，這裡有海量免費資料。
- **在雲端跑 Notebook**：不用自己裝 Python 環境，開瀏覽器就能寫程式、跑模型。
- **參加競賽、上免費課程**：從入門到實戰都有。

LaunchDock 後面不少「拿資料來練 AI」的教學，第一步都是叫你去 Kaggle 抓資料。這篇就先幫你把帳號開好。全程免費，約 5 分鐘。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：Kaggle 就像健身房的公用器材室——器材（資料集）、教練課（免費課程）、比賽（競賽）都齊全，你只要辦一張會員卡（帳號）就能進去用。而且這張卡不用錢。

---

## Step 1：前往 Kaggle 首頁，點 Register

打開瀏覽器進入 [kaggle.com](https://www.kaggle.com)。首頁右上角有 **Sign In**（登入）與黑色的 **Register**（註冊）按鈕。第一次來，點 **Register**。

首頁中間也直接放了兩顆快速註冊鈕：**Register with Google** 和 **Register with Email**。

![Kaggle 首頁，右上角的 Register 按鈕與首頁中央的 Register with Google](/images/articles/kaggle-account-signup/kaggle-homepage.png)

---

## Step 2：選擇登入方式

點下去之後會跳出一張 **「Welcome!」** 卡片，上面有兩個分頁：**Sign In**（已有帳號）和 **Register**（註冊）。下面列出四種方式：

- **Sign in with Google**（推薦，最快）
- **Sign in with Email**
- **Sign in with Facebook**
- **Sign in with Yahoo**

用 Google 最省事——不用再設一組新密碼，點一下就好。這篇就走 Google。

![Kaggle 的登入／註冊卡片，四種登入方式](/images/articles/kaggle-account-signup/kaggle-signin-options.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：「用 Google 登入」就像用悠遊卡進場，不用每個場館都辦一張新卡。你的 Google 帳號當鑰匙，Kaggle 只拿到你的名字和 email，拿不到你的 Google 密碼，安全的。

### 🚨 我想自己設帳號密碼，不想綁 Google？

沒問題，選 **Sign in with Email** 就會走傳統的「填 email、設密碼、收認證信」流程。只是之後每次登入要多記一組密碼。若你本來就有在用 Google，直接綁最省事。

---

## Step 3：用 Google 授權登入

選 Google 之後，會跳到 Google 的帳號選擇畫面，問你要用哪個 Google 帳號繼續。選好帳號後，Google 會顯示一張同意畫面，告訴你 **Kaggle 將取得你的「名稱、個人資料相片」和「email 地址」**——這是正常的，點 **繼續** 授權即可。

授權完成，就會直接進到 Kaggle 的後台首頁，看到 **「Welcome, ...!」** 的歡迎畫面，還有你的 Login Streak（連續登入天數）、各項統計（Datasets、Notebooks、Competitions…）。

![登入後的 Kaggle 首頁，歡迎訊息與帳號統計](/images/articles/kaggle-account-signup/kaggle-welcome-dashboard.png)

---

## Step 4：手機驗證，解鎖完整功能

登入後，Kaggle 常會跳一個提示：**「Your account is unverified」（你的帳號尚未驗證）**，並邀你 **Verify Your Account**。

Kaggle 用手機號碼驗證來擋垃圾帳號和機器人。點下去後，會交給一個叫 **Persona** 的第三方驗證服務：

1. 輸入你的手機號碼（台灣就選 +886）。
2. Persona 會發一封 4 碼簡訊驗證碼給你。
3. 在畫面上四個格子填入收到的 4 位數字，點 **繼續**。

![Persona 手機號碼驗證畫面，輸入 4 位數簡訊驗證碼](/images/articles/kaggle-account-signup/kaggle-phone-verification.png)

驗證通過後，你的 Kaggle 帳號就完整了——可以下載資料集、建立 Notebook、參加競賽。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：手機驗證有點像去圖書館辦借書證要看身分證——不是刁難你，是怕有人辦一堆假帳號來搞破壞。驗一次，之後就暢行無阻。

### 🚨 收不到簡訊驗證碼？

- 確認國碼對不對（台灣手機要選 **+886**，號碼開頭的 0 通常不用再打）。
- 等 1～2 分鐘，有時簡訊會慢一點。
- 還是沒收到，畫面上通常有「重新發送」的選項，點它再試一次。

---

## 完成了！接下來可以做什麼？

現在你有一個可用的 Kaggle 帳號了。建議先：

1. 到 **Datasets** 逛逛，隨便下載一份感興趣的資料（例如銷售、天氣、電影評分）。
2. 開一個 **Notebook**，Kaggle 免費送你雲端運算環境，不用自己裝 Python。
3. 有空的話，**Courses** 裡的免費短課程很適合入門。

之後 LaunchDock 有需要「拿真實資料練 AI／做資料分析」的教學，你就能直接接著走了。

---

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編最後叮嚀**：帳號辦好只是拿到門票，真正好玩的是進場之後。別停在「註冊完」，挑一份資料、開一個 Notebook 動手玩玩看——你會發現資料科學沒有想像中那麼遙遠。
