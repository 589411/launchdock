---
title: "三個 AI 分工，做出一個能上線的 LINE 預約系統：鴨編的協作實錄"
description: "與其問「哪個 AI 最強」，不如讓它們分工：用 Claude 出開發計劃、用 Antigravity CLI（Gemini agent）實際把程式碼跑出來、再用 Claude Opus 抓漏洞迭代。這篇是鴨編用這套「AI 分工法」做出一個真實 LINE 課程預約 PWA 的實錄，講的是心法，不是逐步教學。"
contentType: "guide"
scene: "鴨編的碎碎念"
difficulty: "中級"
createdAt: "2026-07-18"
verifiedAt: "2026-07-18"
archived: false
order: 1
prerequisites: []
estimatedMinutes: 9
tags: ["Agent", "自動化", "Google"]
modules: [M01]
stuckOptions:
  "AI 分工的觀念": ["為什麼不用一個 AI 做到底？", "計劃、執行、審查誰做誰？", "這跟 vibe coding 差在哪？"]
  "工具怎麼配": ["Antigravity CLI 是什麼？", "為什麼還要另一個 AI 審查？", "模型要怎麼選？"]
---

> **一句話**：這篇不是逐步教學，是心法。鴨編用「**Claude 出計劃 → Antigravity CLI（Gemini agent）動手做 → Claude Opus 抓漏洞**」的三段分工，做出一個真的能用的 LINE 課程預約 PWA。重點不是哪個 AI 最強，而是**讓不同的 AI 各司其職**。

**關鍵字**：AI 分工、AI Agent、Antigravity CLI、Gemini、Claude、開發計劃、程式碼審查、vibe coding、LINE 預約系統

---

## 一個常見的誤區：想找「最強的那一個 AI」

很多人用 AI 寫程式，會執著在一個問題上：「到底 Claude 強還是 Gemini 強？我該用哪一個？」

鴨編後來想通了——這題**問錯了**。就像你不會問「鎚子和螺絲起子哪個比較強」，你會問「這顆螺絲該用哪個工具」。做一個專案的過程有好幾種**不同性質**的工作，適合的 AI 也不一樣。

於是鴨編做了個實驗：不選邊站，**讓三種 AI 分工**，一起做出一個真的要給人用的東西——一個 **LINE 課程預約系統**（舞蹈與瑜珈教室用的預約 PWA）。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：一個人開餐廳，你不會要求同一個人又當主廚、又當採購、又當食安稽查——會累死，而且每樣都做不精。AI 也一樣。與其找一個「全能但樣樣普通」的，不如三個「各有專長」的分工，成品反而更穩。

---

## 分工法：計劃、執行、審查，三個角色

鴨編這次的流程，拆成三個角色（旁邊就是鴨編當時貼在牆上的自我提醒）：

1. **用 Claude 生成開發計劃**——先不要急著寫程式。先讓一個擅長「想清楚」的 AI，把「要做什麼、分幾個階段、每階段驗收什麼」寫成一份計劃書。
2. **用 Antigravity CLI（Gemini agent）實際跑一遍**——拿著計劃書，讓一個能「動手」的終端機 AI agent 真的去建檔案、寫程式、跑指令。
3. **用 Claude Opus 檢查程式碼、找漏洞**——東西做出來後，換一個「眼力好、龜毛」的 AI 回頭審查，抓 bug、抓安全漏洞，再把發現餵回去優化計劃。

![用 Claude 審查 agent 產出的程式碼，列出按嚴重度排序的漏洞](/images/articles/ai-agents-build-line-booking-system/claude-code-audit.png)

上面這張，就是第 3 步——Claude Opus 把 Antigravity 產出的程式碼掃過一遍，列出一張「按嚴重度排序的坑」：哪裡把密鑰放錯地方、哪裡有 race condition、哪裡資料會過時…這些正是「一個 AF 自己寫、自己說『done』」時最容易漏掉的。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：叫寫程式的人自己檢查自己的程式，就像叫學生自己改自己的考卷——他看不到自己的盲點。換一個「沒有感情包袱」的 AI 來挑毛病，才挑得出來。這就是為什麼要用**不同**的 AI 做執行和審查。

---

## 執行者：Antigravity CLI 是什麼？

**Antigravity CLI**（指令 `agy`）是一個跑在終端機裡的 AI agent，背後可切換 Gemini、Claude 等模型。你給它一句話，它會自己讀你的專案、擬計劃、建檔案、跑指令——是「動手派」的代表。

鴨編給它的第一句話很簡單：

> 參考 repo 內的設定，一步一步帶著我打造 LINE 會員預約課程的平台。

![在終端機用 Antigravity CLI 下第一個指令](/images/articles/ai-agents-build-line-booking-system/antigravity-cli-prompt.png)

它接到後，不是馬上亂寫，而是先**探索工作區**——去讀專案裡的設計文件、Firestore 資料模型、安全規則，搞懂全局再動手。

![Antigravity CLI 先讀專案文件了解全局](/images/articles/ai-agents-build-line-booking-system/antigravity-agent-reading.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：好的 AI agent 跟好的實習生一樣——不會一進門就亂做，會先把公司的 SOP、既有的專案摸清楚，才開始動手。這也是為什麼「先給它一份好計劃」這麼重要：計劃就是它的 SOP。

---

## 那到底該選哪個模型？答案是「看任務」

過程中鴨編也糾結過：Antigravity 裡能切 Gemini 3.5 Flash、也能切 Claude Sonnet——分類、寫程式這種活，誰比較行？

於是鴨編乾脆**問 AI 自己**，讓它列出客觀比較（純寫程式、agentic 工具操作、速度成本各項數據）。結論很務實：**看任務挑**——要快要便宜的大量瑣事，用 Flash 這種快又省的；要精準的複雜推理，用 Sonnet／Opus 這種強的。

![讓 AI 客觀比較不同模型在各任務的強項](/images/articles/ai-agents-build-line-booking-system/model-comparison.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：模型就像不同的飼料——給龍蝦吃好料（強模型）牠就聰明但貴，吃泡麵（快模型）反應快又便宜但精細活做不好。重點不是永遠吃最貴的，是**這一餐要幹嘛，就配那一餐的料**。

---

## 成果：一個真的能開、能離線用的 PWA

三段分工跑完，成品是一個 **LINE 課程預約系統** PWA——部署在 GitHub Pages 上，用 Firebase 當後端。

![GitHub Pages 部署成功](/images/articles/ai-agents-build-line-booking-system/github-pages-deployed.png)

打開它，是一個可以「加入主畫面」當 App 用、連 PWA 離線快取都做好的預約頁。這不是玩具 demo，是走完「部署、登入、資料庫規則、LINE 登入」整套的東西。

![做出來的 LINE 課程預約系統 PWA 首頁](/images/articles/ai-agents-build-line-booking-system/line-booking-pwa.png)

> 想知道每一塊「怎麼做」的逐步教學？拆開來 LaunchDock 都有：註冊 GitHub、建 Firebase 專案、啟用 Google 登入、部署 Firestore 安全規則、建 LINE Login channel 與 LIFF——這篇談的是「怎麼把它們用 AI 串起來」的心法。

---

## 這跟「vibe coding」差在哪？

你可能聽過 **vibe coding**——憑感覺叫 AI 一直寫、一直改。它很快，但常常「跑得動就好」，底下藏一堆坑。

鴨編這套分工法，其實是給 vibe coding 加了兩道**護欄**：

- **前面加「計劃」**：先想清楚再動手，不是邊寫邊亂。
- **後面加「審查」**：做完換一個 AI 抓漏洞，不是「跑得動就當成功」。

多這兩道，速度沒慢多少，但成品從「能動的 demo」變成「敢給人用的東西」。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：一個人用 AI 最危險的一句話是「它說做好了」。AI 很會講「done」，但它跟你一樣有盲點。解法不是不信任 AI，是**讓另一個 AI 來查它**——三個臭皮匠（分工的 AI）勝過一個諸葛亮（單一全能 AI），在寫程式這件事上，特別成立。

---

## 鴨編的三句總結

1. **別問「哪個 AI 最強」，問「這段工作該用哪個 AI」**——計劃、執行、審查是三種活。
2. **執行和審查一定要換不同的 AI**——自己改自己的考卷，看不到盲點。
3. **模型看任務配**——瑣事用快又省的，難題用強的，不用永遠吃最貴的料。

---

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編最後叮嚀**：你不需要很多帳號、很貴的訂閱才能玩這套。核心是那個**心法**——計劃、執行、審查分開，執行完換人審。哪天你也要用 AI 做一個「真的要給人用」的東西，記得別讓同一個 AI 從頭包到尾。分工，才穩。
