---
title: "在 Make 用 LLM 自動分類 Gmail 信件：加一個 AI 模組就搞定"
description: "把上一篇的「Gmail → Google Sheets」自動化再進化：在中間插一個 OpenRouter 的 LLM 模組，讓 AI 讀每封信、自動貼上「客服／業務／垃圾信／緊急通知」標籤，再連同分類一起寫進試算表。這篇教你串 OpenRouter 連線、選免費模型、寫一個好用的分類 prompt。"
contentType: "tutorial"
scene: "整合與自動化"
difficulty: "中級"
createdAt: "2026-07-18"
verifiedAt: "2026-07-18"
archived: false
order: 3
prerequisites: ["make-gmail-sheets-automation", "openrouter-free-llm-api-key"]
estimatedMinutes: 14
tags: ["Make", "LLM", "自動化", "OpenRouter"]
stuckOptions:
  "加入 OpenRouter 模組": ["搜尋不到 OpenRouter", "要選哪個 action？", "OAuth 連線怎麼建？"]
  "選模型與寫 prompt": ["哪個模型免費？", "System 和 User 訊息差在哪？", "為什麼 AI 回傳一堆廢話？"]
  "把分類寫進 Sheets": ["分類結果對應到哪一欄？", "AI 回傳的格式怎麼取？", "跑出來的標籤是空的"]
---

> **一句話**：在上一篇的 Gmail → Sheets 流程中間，插一個 **OpenRouter「Create a Chat Completion」** 模組：用 OAuth 建好 OpenRouter 連線、選一個免費模型、寫一段「只回傳分類標籤」的 System prompt、把 Gmail 的主旨＋內文接成 User 訊息，最後把 AI 回傳的標籤對應到 Google Sheets 的分類欄——一條會自動分類的信件流水線就完成了。

**關鍵字**：Make、LLM、自動分類、OpenRouter、Create a Chat Completion、System prompt、User message、免費模型、Gmail、Google Sheets

---

## 我們要做什麼？（先看全貌）

上一篇〈Make 自動化起手式〉做出的流程是：**Gmail 新信 → 寫進 Google Sheets**。

這篇要在中間**塞一個 AI**，變成：

**Gmail 新信 → 🤖 OpenRouter LLM 讀信、判斷分類 → 連同分類寫進 Google Sheets**

這樣你的試算表不只有「誰寄了什麼」，還多一欄「這是客服？業務？垃圾信？緊急通知？」——信一多，這一欄能幫你秒速分流。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：這就像在信件輸送帶上加了一個「AI 分揀員」。信件經過他面前，他瞄一眼就貼上標籤——客服的往左、業務的往右、垃圾的丟掉。你要做的，只是教會這個分揀員「怎麼分類、標籤只能有哪幾種」。

**動手前你需要**：① 已完成上一篇的 Gmail → Sheets 流程；② 一把 OpenRouter API Key（見〈OpenRouter 註冊教學〉）。

---

## Step 1：在 Gmail 和 Sheets 中間加 OpenRouter 模組

在 scenario 編輯器裡，點 Gmail 模組後面的「＋」加一個新模組，在 app 搜尋框打 **openrouter**，選 **OpenRouter ✓ Verified**。

![在 Make 搜尋並加入 OpenRouter 模組](/images/articles/make-llm-email-auto-tagging/make-add-openrouter.png)

它會列出 OpenRouter 的動作（Actions），選 **「Create a Chat Completion」**（建立一次對話補全——就是「丟一段話給 AI、拿一段回覆」）。

![OpenRouter 模組的 Actions 清單](/images/articles/make-llm-email-auto-tagging/make-openrouter-actions.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：「Chat Completion」就是你平常跟 ChatGPT 對話的那個動作——你講一句、它回一句。差別是這裡由 Make 自動幫你「講」（把信件內容送進去），再拿「回覆」（分類標籤）去用。

---

## Step 2：用 OAuth 建立 OpenRouter 連線

第一次用 OpenRouter 模組，要建一個**連線**。Make 會導你到 OpenRouter 的**授權畫面**，問你要不要讓 make.com 存取你的帳號、建立一把 API key。

![OpenRouter OAuth 授權畫面](/images/articles/make-llm-email-auto-tagging/make-openrouter-oauth.png)

確認網址是 OpenRouter 官方、點 **Authorize** 授權。授權完，Make 的模組裡 **Connection** 欄就會是你剛建好的 OpenRouter 連線。

![OpenRouter 連線建立完成](/images/articles/make-llm-email-auto-tagging/make-openrouter-connection.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：用 OAuth 授權，比手動貼 API Key 更安全——你不用把金鑰複製來貼去（貼錯或外洩的機會就少了），是 OpenRouter 直接發一把給 Make 用。當然，手動貼 Key 也行，看你習慣。

---

## Step 3：選一個免費模型

在模組的 **Model** 欄，可以搜尋 `free` 篩出免費模型。範例選的是 **`Google: Gemma 4 26B A4B (free)`**。

![在 Make 選一個 OpenRouter 免費模型](/images/articles/make-llm-email-auto-tagging/make-select-free-model.png)

旁邊通常有個 **「Enable automatic Fallback?」**（啟用自動備援）選項，設 **Yes**——這樣萬一你選的模型當下不可用，OpenRouter 會自動換一個相近的模型，流程不會斷。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：分類信件這種任務不難，免費模型（像 Gemma）就很夠用，不用一開始就燒錢用最貴的。等你發現免費模型分得不夠準，再升級也不遲。先用免費把流程跑通最划算。

---

## Step 4：寫「分類 prompt」——這是整篇的靈魂

AI 分得準不準，全看你怎麼下指令。在 **Messages** 區，要設兩則訊息：

### 第一則：System（系統指令）— 告訴 AI 它的角色與規則

把 Role 設成 **System**，內容寫清楚三件事：**它是誰、有哪些標籤可選、輸出格式**。範例的 prompt 是這樣寫的：

> 你是一個信件分類助手。請閱讀以下信件的主旨與內文，並嚴格從以下類別中選擇一個最符合的分類標籤：【客服】【業務/採購】【垃圾信】【緊急通知】。注意：請「只」回傳標籤文字（例如：客服），不要包含任何其他解釋或標點符號。

![設定 System 分類 prompt](/images/articles/make-llm-email-auto-tagging/make-classify-prompt.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：這段 prompt 有三個關鍵設計，值得抄——① **限定標籤**（「嚴格從這幾類選」，不讓它自由發揮亂造詞）；② **限定格式**（「只回傳標籤、不要解釋、不要標點」，免得它回你一長串廢話，害你後面取不到乾淨的分類）；③ **給例子**（「例如：客服」）。這三招能讓小模型也乖乖聽話。

### 第二則：User（使用者訊息）— 把真正的信件內容餵進去

再加一則 Role 設成 **User** 的訊息，內容用**欄位對應**接上 Gmail 模組的輸出：把 **Subject（主旨）** 和 **Full text（內文）** 拖進來。

![把 Gmail 主旨與內文接成 User 訊息](/images/articles/make-llm-email-auto-tagging/make-user-message-mapping.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：**System** 是你事先給分揀員的「工作守則」（每封信都一樣）；**User** 是「這一封信的實際內容」（每封都不同）。守則固定、內容變動，AI 就會對每封信套同一套規則做判斷。

### 🚨 AI 回傳一堆廢話、不只給標籤？

八成是 System prompt 沒把「只回傳標籤、不要解釋」講死。把規則寫得更斬釘截鐵（像範例那樣加「請『只』回傳」「不要包含任何其他解釋或標點符號」），並附一個範例輸出，就會收斂很多。

---

## Step 5：把分類結果寫進 Google Sheets

最後回到 **Google Sheets「Add a Row」** 模組。除了原本對應的主旨、寄件者、內文，再多對應一欄「分類」——把它接到上一個 **OpenRouter 模組的輸出**（AI 回傳的那段文字，就是分類標籤）。

![設定 Google Sheets 寫入，含分類欄](/images/articles/make-llm-email-auto-tagging/make-sheets-destination.png)

---

## Step 6：完成！三段式 AI 流水線

現在你的 scenario 是完整的三個模組：

**Gmail「Watch emails」→ OpenRouter「Create a Chat Completion」→ Google Sheets「Add a Row」**

![完成的三模組 AI 分類流水線](/images/articles/make-llm-email-auto-tagging/make-final-pipeline.png)

按 **Run once** 手動測一次（先寄一封測試信），到試算表看看：新的一列裡，是不是連「分類」欄都自動填好了？確認無誤後開排程，這條「AI 自動分類信件」的流水線就會自己 24 小時運轉了。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：你剛剛做的，其實是很多公司花錢買的「智能客服分流」的雛形。原理沒有很玄——就是「觸發 → 給 AI 判斷 → 存結果」三步。學會這個骨架，你可以換成別的任務：自動判斷情緒、自動摘要、自動翻譯…換湯不換藥。

---

## 想更穩？加一個備援供應商

如果這條流程很重要，不能斷，你可以再串一把 **Ollama** 的雲端金鑰當備援（見〈Ollama 雲端 API 金鑰申請〉）——主力 OpenRouter 限流時自動切換，穩定度再上一層。

---

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編最後叮嚀**：這篇最容易卡的不是「串接」，而是「prompt 沒寫好，AI 回傳格式亂七八糟」。記住那三招——**限定標籤、限定格式、給範例**。prompt 寫好了，連免費小模型都能當你的分揀員；prompt 沒寫好，再貴的模型也給你亂貼標籤。
