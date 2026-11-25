---
title: "AI 關鍵字一次看懂：從 2024 到現在，LLM、Token、Agent、MCP、Skill 各是什麼"
description: "新聞、朋友、廣告都在講這些詞，但沒人跟你說它們是哪個年代冒出來的。這篇不講論文，把兩年來的 AI 關鍵字按演進階段排好，每個詞一句白話加一個生活比喻，並告訴你深入該看哪一篇。"
contentType: "guide"
scene: "認識 OpenClaw"
difficulty: "入門"
createdAt: "2026-11-25"
verifiedAt: "2026-11-25"
archived: false
estimatedMinutes: 15
tags: ["LLM", "Token", "Agent", "MCP", "Skill"]
---

你是不是常在新聞、朋友的對話、或廣告裡聽到「Token」「Agent」「MCP」，點頭點到最後，其實不知道在點什麼？

這不是你的問題。這些詞冒出來的速度，比有人把它們解釋清楚的速度快很多。這篇你不用看懂任何程式碼，只要記住一件事：**AI 這兩年像一個快速長大的員工，每長大一階，大家就為它的新本事發明一個新名詞。** 把名詞放回時間線上，它們就不再是一團亂。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：每個詞都在回答同一個問題——「那個時候的 AI，卡在哪裡？」答案一出來，名詞就記住了。

## 先看一張地圖

![AI 關鍵字的四個階段：會聊天、會想、會查資料與動手、會接任務](/images/articles/ai-keywords-glossary/ai-four-stages.svg)

四個階段，每一階都在補上一階的毛病：

| 階段 | 大約時間 | 那時 AI 的毛病 | 冒出來的關鍵字 |
|------|---------|---------------|---------------|
| 一、會聊天 | 2024 年前後 | 會講，但常亂講、記不住太多 | LLM、Token、API、Prompt、Context Window、幻覺 |
| 二、會想 | 2024 下半到 2025 | 一口氣答，複雜題常出錯 | 推理模型、CoT（思維鏈） |
| 三、會查、會動手 | 2024 到 2025 | 只會說，不會查資料、不會按按鈕 | RAG、Embedding、工具調用、Computer Use、MCP |
| 四、會接任務 | 2025 到現在 | 一次一句話，做不完整件事 | Agent、ReAct、Skill、Loop、Harness、Context Engineering、多代理 |

下面照這四階一個一個講。每個詞只給你一句白話加一個比喻，夠你聽懂新聞；想深入，文末與各段都有連結。

## 第一階段：會聊天的 AI

**LLM（大型語言模型）**
ChatGPT、Claude、Gemini 背後那顆「大腦」。它讀過海量文字，學會的核心本事是「接下來最可能出現哪個字」。
比喻：一位讀過全世界的書、但沒有親身經歷過的博學朋友。想了解各家方案，看 [大型語言模型怎麼選](/articles/llm-guide/)。

**Token**
模型讀進、寫出文字的最小計量單位，大約是一個詞或幾個字。你傳的字越多、它寫得越長，Token 就越多，計費也跟著走。
比喻：電話費，講越久、講越多，帳單就越大。詳見 [Token 經濟學](/articles/token-economics/)。

**API 與 API Key**
API 是程式之間點菜的窗口：你的程式把問題送出去，模型把答案送回來。API Key 則是你拿到窗口時用來證明身份的字串。
比喻：API 是餐廳的點餐窗口，API Key 是你的門禁卡。門禁卡不能外流。詳見 [API Key 申請教學](/articles/ai-api-key-guide/)。

**Prompt（提示詞）**
你輸入 AI 的指令內容。這是你唯一能直接控制的地方。
比喻：點餐單。你寫得越清楚，廚師做得越對。詳見 [Prompt 工程入門](/articles/prompt-engineering/)。

**Context Window（上下文窗口）**
AI 一次能「看見」的範圍，包含你的提問、前面的對話、你貼進去的資料。
比喻：書桌。桌面就這麼大，攤開的紙太多，最前面的那幾張就被推到桌子外面，AI 也就忘了。早期模型一次只能收幾頁，到現在，部分模型能一次收下整本書等級的內容，但桌面再大也有上限。詳見 [AI 技術演進全景圖](/articles/ai-tech-evolution/)。

**幻覺（Hallucination）**
AI 很自信地講出不對的內容，而且語氣跟講對的時候一模一樣。
比喻：很會寫答案的考生，不會的題也能寫得像模像樣。它不是故意說謊，而是它學的是「怎麼寫得像」，不是「先查證過」。這正是後面 RAG 要解決的問題。詳見 [RAG 技術入門](/articles/rag-explained/)。

## 第二階段：會想的 AI

**推理模型（Reasoning Model）**
2024 年 9 月，OpenAI 推出 o1 系列，把「先想一輪再回答」變成模型本身的能力。回答前它會先在內部打草稿，再把結論交給你。
比喻：考試時先在草稿紙上算完再交卷，而不是看到題目就直接寫。代價是比較慢，也比較費 Token。

**CoT（Chain-of-Thought，思維鏈）**
讓 AI 把推理過程一步一步寫出來的做法。早期只要在提示詞裡加一句「請一步步想」，正確率就常常明顯提升。推理模型等於把這件事內建進去了。
比喻：數學題要寫出算式，不能只寫答案。詳見 [AI 推理技術解密](/articles/cot-and-reasoning/)。

## 第三階段：會查資料、會動手的 AI

**RAG（檢索增強生成）**
回答前，先去你指定的資料庫裡找出相關段落，再根據找到的內容作答。
比喻：開卷考，而且先翻到對的那一頁，不是全憑記憶。
**Embedding（向量嵌入）** 是讓電腦能「按意思」搜尋的基礎：把每段文字放到一張語意地圖上，意思相近的點就靠得近。RAG 就是靠它找到該翻的那一頁。詳見 [RAG 技術入門](/articles/rag-explained/)。

**工具調用（Function Calling / Tool Use）**
AI 本身不能上網、不能開檔案、不能按按鈕。但它可以「提出要求」，例如「請幫我查這個天氣」，由你的程式去執行，再把結果交回給它。
比喻：你不會自己開車，但你可以告訴司機要去哪。這是 AI 從「只會說」變成「會做事」的分水嶺。詳見 [工具調用才是真本事](/articles/llm-tool-calling-era/)。

**Computer Use（電腦操作）**
2024 年 10 月，Anthropic 推出讓 Claude 看螢幕、用滑鼠和鍵盤操作電腦的功能，之後也出現了許多能自己操作網頁的瀏覽器。
比喻：請一位助理坐在你的電腦前，幫你點按鈕、填表單。詳見 [AI 會自己操作網頁了](/articles/ai-agent-browsers/)。

**MCP（Model Context Protocol）**
AI 接上外部工具（例如 Notion、Gmail、資料庫）的一套標準規格。2024 年 11 月由 Anthropic 公開。以前每個工具都要各自寫一套接法，有了標準，就像 USB 一樣插上就能用。
比喻：辦公室的內線電話系統，讓不同部門的人能用同一套方式互相傳話。詳見 [MCP 協定](/articles/mcp-protocol/)，挑選 MCP Server 的注意事項見 [MCP Server 該裝哪些](/articles/mcp-servers-picks/)。

## 第四階段：會接任務的 Agent

**Agent（AI 代理）**
不只回答問題，而是拿到一個目標後，自己拆步驟、用工具、看結果、再調整的 AI。2025 年起，你會在各種工具裡遇到它。
比喻：你訓練出來的實習生，照 SOP 做事，遇到狀況會自己判斷。詳見 [OpenClaw 的 Agent 是什麼](/articles/openclaw-agent/)。

**ReAct**
Agent 的一種常見工作方式：想一步、做一步、看結果、再想下一步。
比喻：找東西時邊找邊判斷，「這個抽屜沒有，那就換下一個抽屜」。詳見 [AI 推理技術解密](/articles/cot-and-reasoning/)。

**Loop（迴圈）**
Agent 把大事拆成一輪一輪做完的節奏：做一輪、看結果、再決定下一輪，而不是一問一答。
比喻：整理 200 張收據，一張一張來，而不是一次把整疊丟給實習生。詳見 [Prompt、Context、Loop、Harness 是什麼](/articles/ai-agent-jargon/)。

**Skill（技能）**
把某一類工作的做法寫成可重複使用的說明書加小工具，Agent 需要時才載入。2025 年 10 月，Anthropic 推出 Agent Skills，同年 12 月把它公開成開放標準，之後也有越來越多工具支援。
比喻：實習生學會的一項專長，說一個口令，就做出一整套動作。詳見 [OpenClaw Skill 入門](/articles/openclaw-skill/)、[從 Prompt 到 Skill](/articles/from-prompt-to-skill/)。

**Harness（控制層）**
包在模型外面的那套規則與檢查：設邊界、驗證結果、出錯時回復。
比喻：公司的品管與監工制度。同一顆模型，有沒有好的 Harness，表現可以差很多。詳見 [拆解 AI Agent](/articles/ai-agent-anatomy/)。

**Context Engineering（上下文工程）**
決定「這一次要讓 AI 看到哪些資料」的功夫：什麼該放進桌面、什麼該收起來、什麼順序最好。
比喻：替實習生把該用的文件整理到桌上，而不是把整個檔案櫃都推給他。詳見 [AI 記憶的基礎建設](/articles/ai-agent-memory-guide/)。

**多代理（Multi-Agent）**
好幾個 Agent 分工合作：一個查資料、一個寫初稿、一個負責檢查。
比喻：一組實習生分工做一個專案。詳見 [多代理與蜂群智能](/articles/multi-agent-swarm/)。

## 一張速查表

新聞裡遇到忘了的詞，直接翻回來：

| 關鍵字 | 一句話 | 比喻 |
|--------|--------|------|
| LLM | AI 的大腦 | 讀過很多書的博學朋友 |
| Token | 計量與計費單位 | 電話費 |
| API Key | 使用服務的身份憑證 | 門禁卡 |
| Prompt | 你輸入 AI 的指令內容 | 點餐單 |
| Context Window | 一次能看見的範圍 | 書桌 |
| 幻覺 | 很自信地講錯 | 會寫答案、但沒查證的考生 |
| 推理模型 | 先想一輪再回答 | 先在草稿紙上算完 |
| RAG | 先查資料再回答 | 開卷考，翻到對的那一頁 |
| 工具調用 | AI 提出要做什麼，由程式去做 | 告訴司機要去哪 |
| MCP | AI 接外部工具的標準規格 | 辦公室內線電話 |
| Agent | 會自己拆步驟做事的 AI | 實習生 |
| Skill | 可以重複用的一項專長 | 學會的一個口令動作 |
| Harness | 管住 Agent 的規則與檢查 | 品管與監工制度 |

## 鴨編的碎碎念：名詞為什麼越來越多？

每次 AI 在某個地方卡住，就會有人想出一個辦法補上，然後替這個辦法取個名字。名字多，不代表 AI 變得更複雜，而是每一層的毛病都被拆開命名了。所以你不用全部背下來，記住「每個詞都在補一個毛病」就夠了。

還有一點：同一個詞，不同人可能用成不同意思。例如「Agent」有人指一個會聊天的機器人，有人指會自己跑流程的程式。遇到的時候，直接問對方一句「你說的是哪一種？」，比硬猜有效得多。

## 明天就能做的一件事

打開你常用的 AI 工具，找一下設定頁，看看有沒有「系統提示詞」、「連接器」或「Skill」這類選項。找到一個，點進去看它寫了什麼。你會發現，這些抽象名詞其實就長在你手上的工具裡。

## 🔗 延伸閱讀

- [AI 技術演進全景圖：從 Transformer 到蜂群智能](/articles/ai-tech-evolution/)：想看完整的歷史脈絡
- [Token 經濟學：搞懂 AI 怎麼計費](/articles/token-economics/)：Token 的細節與帳單控制
- [MCP 協定：AI 的 USB 接口](/articles/mcp-protocol/)：MCP 怎麼運作
- [拆解 AI Agent：Skill、工具、Harness 三層](/articles/ai-agent-anatomy/)：Agent 的三層結構
