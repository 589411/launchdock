---
title: "系統提示詞怎麼設？ChatGPT、Claude、Gemini、Grok「給 AI 的指令」一次教會你"
description: "別再每次打開 AI 都重講一遍自己是誰。系統提示詞（自訂指令）設定一次、之後每次對話自動生效。這篇手把手帶你在 ChatGPT、Claude、Gemini、Grok 四大 AI 裡各設好一次，附一段可直接複製的新手模板。"
contentType: "tutorial"
scene: "基礎使用"
difficulty: "入門"
createdAt: "2026-07-27"
verifiedAt: "2026-07-27"
archived: false
order: 2
prerequisites: []
estimatedMinutes: 9
tags: ["Prompt", "設定", "OpenAI", "Anthropic", "Google"]
stuckOptions:
  "什麼是系統提示詞": ["跟每次打字問問題有什麼不一樣？", "設了會被記多久？"]
  "ChatGPT 怎麼設": ["找不到「自訂指令」在哪", "免費版能設嗎？"]
  "Claude 怎麼設": ["Instructions for Claude 是空的", "設定選單在哪裡"]
  "Gemini 怎麼設": ["「給 Gemini 的指令」按不到", "跟 Gem 有什麼不同？"]
  "Grok 怎麼設": ["Customize 的那些預設要選哪個？", "自訂跟預設能一起用嗎？"]
  "該寫什麼進去": ["寫太多會不會反效果？", "可以放我的個資嗎？"]
---

## 你是不是每次都在跟 AI 重講一遍？

打開 ChatGPT，先交代一次：「請用繁體中文、講重點、別給我一堆開場白」。
換到 Claude，再講一遍。明天開新對話，又從頭講一遍。

這件事有解，而且只要做一次。它叫**系統提示詞**（system prompt），在消費者版的 AI 裡通常叫「**自訂指令**」或「**給 AI 的指令**」——名字不一樣，做的事一模一樣：

> 一段你**寫一次、之後每次對話都自動生效**的常駐設定，讓 AI 一開口就知道你是誰、要什麼。

打個比方：一般對話像每次見面都要重新自我介紹；系統提示詞則是把你的名片**存進 AI 的通訊錄**，之後它每次都記得。這就是從「會用 AI 聊天」通往「讓 AI 真的懂你」的第一步，也是 [7/29 藍鴨小聚](/meetup/) 現場要帶大家親手寫的那一段。

這篇會帶你在四個最多人用的 AI 裡，各找到那個欄位、各設好一次。四家的入口不同，但你會發現**都是同一件事**。文末附一段可以直接複製的新手模板。

---

## ChatGPT：個人化 → 自訂指令

1. 點左下角你的頭像，選單裡點「**個人化**」。

![ChatGPT 左下角頭像選單，個人化選項](/images/articles/set-system-prompt/chatgpt-menu-personalization.jpg)

2. 在個人化面板往下拉，找到「**自訂指令**」欄位（描述是「其他行為、風格以及語調的喜好設定」），把你的常駐指令填進去。

![ChatGPT 個人化面板中的自訂指令欄位](/images/articles/set-system-prompt/chatgpt-custom-instructions.jpg)

填完就生效，之後每個新對話都會自動帶入。免費版也能設。

---

## Claude：Settings → Instructions for Claude

1. 點左下角頭像 →「**Settings**」→ 停在「**General**」分頁。
2. 在 Profile 下方找到「**Instructions for Claude**」（下面小字寫著它會在所有對話與 Cowork 中生效），把指令填進去。

![Claude 設定頁的 Instructions for Claude 欄位](/images/articles/set-system-prompt/claude-instructions.jpg)

Claude 的介面目前是英文，但欄位裡你**用中文寫完全沒問題**。

---

## Gemini：個人化智慧服務 → 給 Gemini 的指令

Gemini 的入口藏得比較深，跟著三步走：

1. 點左下角的**齒輪（設定）**，選單裡點「**個人化智慧服務**」。

![Gemini 設定選單中的個人化智慧服務](/images/articles/set-system-prompt/gemini-menu-personalization.jpg)

2. 在頁面最下面找到「**給 Gemini 的指令**」，點進去。

![個人化智慧服務頁面的「給 Gemini 的指令」入口](/images/articles/set-system-prompt/gemini-instructions-entry.jpg)

3. 點「**新增**」，在跳出的「你希望 Gemini 記住哪些資訊？」框裡填上指令，按提交。

![Gemini 給指令的輸入框](/images/articles/set-system-prompt/gemini-instruction-input.jpg)

> 🐤 別跟「**Gem**」搞混：Gem 是「為某個特定任務打包的小助手」（類似 GPTs），要一個一個開；這裡的「給 Gemini 的指令」則是**全域生效**、對所有對話都算數。這篇先設全域的就好。

---

## Grok：設定 → Customize

1. 點左下角頭像 →「**設定**」。

![Grok 左下角選單中的設定](/images/articles/set-system-prompt/grok-menu-settings.jpg)

2. 左側切到「**Customize**」。Grok 這裡給了幾個現成的**預設**：自訂、精簡、正式、導師、全面。

![Grok 設定的 Customize 分頁](/images/articles/set-system-prompt/grok-customize.jpg)

3. 想自己寫，就留在「**自訂**」分頁把指令打進去；懶得寫，也可以直接選一個預設（例如「全面」會讓它回答得更完整、多角度）。兩者可以擇一。

![Grok Customize 選了預設後帶出的內容](/images/articles/set-system-prompt/grok-customize-filled.jpg)

---

## 那到底該寫什麼？先抄這段模板

系統提示詞不用寫得很文青，把「你每次都要重複交代 AI 的那幾件事」寫下來就對了。這是一段給完全新手的起手模板，複製後把 `___` 換成你自己的：

```
【關於我】
- 我是 ___（你的身分／職業），主要用 AI 來 ___（你最常做的事）。
- 請一律用繁體中文（台灣用語）回答。

【回答方式】
- 先給結論，再說原因；重點用條列，不要長篇大論。
- 講白話，少用術語；非用不可時，順手用一句話解釋。
- 不確定的事就直說「不確定」，不要硬編。

【語氣】
- 像一個講重點的朋友，不用客套的開場白和結尾。
```

四家的欄位都吃這段。設完之後，開個新對話問它一句話，感受一下差別——這就是「設定一次，之後都懂你」的體感。

想更進一步把回答品質再往上拉（角色設定、給範例、要它一步步想），可以接著讀 [Prompt 工程](/articles/prompt-engineering/)。

### 🚨 常見錯誤

- **把「一次性任務」寫進去**：系統提示詞是放**每次都成立**的偏好（語言、語氣、身分）。「幫我改這封信」這種一次性的需求，直接在對話裡講就好，別塞進常駐設定。
- **寫成長篇小作文**：太長反而稀釋重點。先寫 5～8 行，之後用起來覺得少了什麼再補。
- **放進機密資料**：這段設定會**存在該 AI 服務的伺服器上**。密碼、金鑰、身分證字號、公司未公開資訊都不要寫進去。
- **以為每家要重學**：四家名字不同（自訂指令／Instructions／給 Gemini 的指令／Customize），但**本質是同一件事**。認得「這是那個常駐指令的欄位」，到哪個工具都找得到。

---

## 這只是第一步

設好系統提示詞，是「讓 AI 個人化」的第①階。往上還有：把常用指令存成模板（自訂指令、Projects、GPTs）、讓 AI 自己動手跑自動化，最後是養一隻幫你打工的 [AI Agent](/articles/why-openclaw/)——到那一層，OpenClaw 用 [Soul（人設）](/articles/openclaw-soul/) 幫 AI 立一個有記憶、會成長的人設，就是系統提示詞的「進化版」。

整條路怎麼走，[7/29 的免費線上工作坊](/meetup/)會攤開來講。這一篇，先把你的第一段系統提示詞設好。
