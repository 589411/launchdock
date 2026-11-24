---
title: "讓 AI 幫你操作網頁：Claude、ChatGPT、Gemini 的 Chrome 插件怎麼裝、怎麼設權限（附雲端電腦新玩法）"
description: "想讓 AI 幫你讀網頁、點按鈕、填表單，第一步是在 Chrome 裝好它的插件。這篇一次教你 Claude in Chrome、ChatGPT 擴充功能、Gemini in Chrome 三家怎麼裝、哪個方案能用、權限怎麼設才安全，最後再帶你看下一站：各家 AI 自己的雲端電腦和雲端瀏覽器。"
contentType: "tutorial"
scene: "整合與自動化"
difficulty: "入門"
createdAt: "2026-11-24"
verifiedAt: "2026-11-24"
archived: false
order: 1
prerequisites: ["ai-agent-browsers"]
estimatedMinutes: 14
tags: ["Agent", "Anthropic", "OpenAI", "Google", "Chrome", "安全"]
stuckOptions:
  "Claude in Chrome": ["免費方案能用嗎？", "Edge／Brave 可以裝嗎？", "權限模式要選哪個？"]
  "ChatGPT 插件": ["Chat 和 Work 差在哪？", "@Chrome 是什麼？", "商店裡好多個 ChatGPT，哪個才是官方？"]
  "Gemini in Chrome": ["我找不到 Ask Gemini 按鈕", "台灣可以用自動瀏覽嗎？", "公司帳號為什麼不能用？"]
  "雲端電腦": ["插件跟雲端瀏覽器差在哪？", "雲端瀏覽器怎麼登入我的帳號？"]
---

> **一句話**：讓 AI 幫你「看網頁＋動手點」，現在最簡單的入口就是在 Chrome 裝它的插件。**Claude in Chrome** 要付費方案、只支援 Chrome；**ChatGPT** 擴充功能所有方案都能裝，分「Chat 讀分頁」和「Work 動手做」；**Gemini in Chrome** 內建在 Chrome 裡不用裝，但台灣目前只能用聊天、摘要，**自動瀏覽（auto browse）還沒開放**。裝好後最重要的一步是**權限設定**——先從「每一步都問我」開始。

**關鍵字**：Claude in Chrome、ChatGPT Chrome 擴充功能、ChatGPT Work、Gemini in Chrome、auto browse、AI 操作網頁、Computer Use、雲端瀏覽器、Cowork、Tasks in Gemini、Gemini Spark

---

## 為什麼 AI 需要一個「Chrome 插件」？

你可能已經很習慣把網頁內容複製、貼進 ChatGPT，再把它的回答複製回去。這樣可以用，但 AI 永遠只看得到**你貼給它的那一小段**，也沒辦法替你按下任何一個按鈕。

插件做的事，就是**把 AI 請進你的瀏覽器**：

| 沒有插件 | 有插件 |
|---------|-------|
| 你複製網頁內容貼給 AI | AI 直接讀你開著的分頁 |
| AI 告訴你「去點右上角那個按鈕」 | AI 自己移動游標點下去 |
| 填表單要你一格一格打 | AI 照你給的資料幫你填 |

這種「AI 自己操作畫面」的能力叫 **Computer Use**。概念在〈[AI 會自己操作網頁了](/articles/ai-agent-browsers/)〉講過，這篇只做一件事：**把三家的插件裝起來、權限設對**。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：插件就像你把一位助理請到你的座位旁邊，**用你的電腦、用你已經登入的帳號**幫你做事。很方便，但也代表它碰得到你的 Gmail、你的網銀分頁。所以這篇花最多篇幅的不是安裝，而是「權限怎麼設」。

---

## 開始前：確認這三件事

1. **用的是 Google Chrome 桌面版**（Mac 或 Windows）。手機版的插件玩法不一樣，這篇不談。
2. **Chrome 已更新到最新版**：右上角 ⋮ → 說明 → 關於 Google Chrome。
3. **先準備一個「練習用」的 Chrome 設定檔**（強烈建議）：右上角大頭貼 → 新增 → 用一個不重要的 Gmail 登入。第一次讓 AI 動手，就在這個設定檔裡試，**不要直接在有網銀、公司信箱的設定檔裡練**。

先看三家的總表，再往下挑你要裝的那一家：

| | Claude in Chrome | ChatGPT 擴充功能 | Gemini in Chrome |
|---|---|---|---|
| 要不要另外裝 | 要，Chrome 線上應用程式商店 | 要，Chrome 線上應用程式商店 | 不用，Chrome 內建 |
| 免費方案能用嗎 | ❌ 要 Pro／Max／Ultra／Team／Enterprise | ✅ 擴充功能所有方案都能裝 | ✅ 聊天、摘要可用 |
| 能不能自己點網頁 | ✅ | ✅（Work 模式） | 台灣目前 ❌（auto browse 僅限美國，且需 Google AI Ultra／Pro／Plus） |
| 支援的瀏覽器 | 只有 Chrome | Chrome、Edge、Brave、Opera、Vivaldi | 只有 Chrome |

> 📅 以上是 2026-11-24 查證的狀態。這三家更新非常快，方案限制尤其常變，裝之前以各家官方頁面為準。

---

## 一、Claude in Chrome（Anthropic）

### 誰能用

Claude 的**付費方案**：Pro、Max、Ultra、Team、Enterprise。免費方案不能用。官方明講**只支援 Google Chrome**，Edge、Brave 這些同樣是 Chromium 核心的瀏覽器也不支援，手機也不行。

### Step 1：從商店安裝

1. 用 Chrome 打開 Chrome 線上應用程式商店，搜尋「Claude」。
2. **確認開發者是 Anthropic**（商店裡有很多名字很像的第三方插件）。
3. 點「加到 Chrome」。

<!-- @img: claude-chrome-webstore | Chrome 線上應用程式商店的 Claude 插件頁面，開發者為 Anthropic -->

### Step 2：登入並釘選

1. 裝好後用你的 Claude 帳號登入。
2. 點網址列右邊的**拼圖圖示**，在「Claude」旁邊按**圖釘**，把它固定在工具列上，之後點一下就能打開側邊欄。
3. 照提示授予它要求的權限。

<!-- @img: claude-chrome-pin | 點拼圖圖示後，把 Claude 釘選到工具列 -->

> 💡 **它要的權限為什麼那麼多？** 官方說明裡每一項都有用途：`debugger` 讓 Claude 能點擊、打字、截圖；`scripting` 讓它讀網頁文字；`tabs` 讓它開關分頁（它會把自己開的分頁**另外分組**，不會跟你的混在一起）；`downloads` 讓它能下載檔案。看起來很嚇人，是因為「替你操作瀏覽器」本來就需要這麼多。

### Step 3：選權限模式（最重要）

在側邊欄的輸入框旁邊有一個下拉選單，可以選三種模式：

| 模式 | 它會怎麼做 | 適合誰 |
|------|-----------|-------|
| **手動核准**（Manually approve） | 每一個動作都先問你「允許／拒絕」 | **新手、第一次用，從這個開始** |
| **自動核准**（Automatically approve） | Claude 自己審查每個動作、擋掉不安全的，必要時才停下來問你（預設值） | 用熟了、做的是低風險任務 |
| **跳過所有核准**（Skip all approvals） | 完全不停、也沒有自動檢查 | ⛔ 不建議一般人用 |

<!-- @img: claude-chrome-permission-mode | Claude in Chrome 側邊欄輸入框旁的權限模式下拉選單 -->

遇到需要額外許可的網站時，會跳出「需要新權限」的提示，有三個選項：**只允許這一次**、**一律允許這個網站上的動作**、**拒絕**。你核准過哪些網站，可以到插件設定的 Permissions 頁面查看、收回。

**不管你選哪個模式**，下面這些事 Claude 一定會先問你：輸入可能敏感的資料、授權登入、永久刪除（清空垃圾桶、刪信）、修改權限設定。而**購物付款、建立帳號、處理信用卡或證件資料、照網頁或信件裡的指示行事**，官方是直接禁止的。

### Step 4：第一個任務

打開一個你想整理的網頁（例如一篇長文），在側邊欄輸入：

```
幫我用 5 點整理這一頁的重點，每點不超過 20 字
```

先從「只讀不動手」的任務開始。順手的話，可以把好用的指令存成**捷徑**，之後在輸入框打 `/` 就叫得出來；側邊欄的**時鐘圖示**還能把捷徑設成定時執行。

> 💡 **有在用 Claude 桌面版或 Claude Code？** 桌面版可以到 設定 → Customize → Connectors，找到 Claude in Chrome 按 Configure 打開，讓桌面版的 Claude 也能操作你的 Chrome。這個連接器**每個對話預設是關的**，要用的那個對話再打開就好。

---

## 二、ChatGPT 擴充功能（OpenAI）

### 誰能用

OpenAI 的官方擴充功能**所有 ChatGPT 方案都能安裝**。它在 2026 年 10 月改版後分成兩種模式：

| 模式 | 在做什麼 |
|------|---------|
| **Chat** | 讀你開著的分頁回答問題，例如一次比較三個分頁的商品 |
| **Work** | 真的動手：在分頁裡填表單、送訊息、下載檔案、幫你把分頁分組 |

除了 Chrome，也支援 Edge、Brave、Opera、Vivaldi（Opera 沒有側邊聊天）。

> ⚠️ **免費方案能不能用 Work 動手做**，目前各家報導說法不一致，鴨編查不到 OpenAI 官方的明確說法，不硬寫。裝好後看你的介面有沒有 Work 選項就知道。（另外，OpenAI 獨立的 ChatGPT Atlas 瀏覽器已停用：官方 [release notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes) 在 2026-07-09 宣布，並寫明 2026-08-09 停止運作；[幫助中心](https://help.openai.com/en/articles/20001371-chatgpt-atlas-retirement)現在寫 has been retired。請改用這個擴充功能或 ChatGPT 桌面版，詳見〈[AI 會自己操作網頁了](/articles/ai-agent-browsers/)〉的更正說明。）

### Step 1：從商店安裝

1. 在 Chrome 線上應用程式商店搜尋「ChatGPT」。
2. ⚠️ **這一步最容易裝錯**：搜尋結果有一大堆「ChatGPT Sidebar」「XX for ChatGPT」都是**第三方**做的。認明**開發者是 OpenAI** 再按「加到 Chrome」。
3. 安裝時 Chrome 會列出它要的權限（讀取和變更網站資料等），看完再按「新增擴充功能」。

<!-- @img: chatgpt-chrome-webstore | Chrome 線上應用程式商店的 ChatGPT 擴充功能頁面，開發者為 OpenAI -->

### Step 2：登入、打開側邊聊天

1. 裝好後登入你的 ChatGPT 帳號，建議一樣釘選到工具列。
2. 在任何網頁點工具列上的 ChatGPT 圖示，就會在旁邊打開**側邊聊天**，可以直接問「這一頁在講什麼」，或選取一段文字問它。

<!-- @img: chatgpt-chrome-sidechat | ChatGPT 側邊聊天開在網頁旁邊 -->

### Step 3：用 @Chrome 指定分頁

在 chatgpt.com 的對話框打 **`@Chrome`**，或從 **+** 選單挑一個分頁，就能讓 ChatGPT 讀那個分頁、或在那個分頁裡做事。第一次會跳出存取許可，**先看清楚它要動的是哪個帳號、哪個網站**再允許。

<!-- @img: chatgpt-at-chrome | 在 ChatGPT 對話框輸入 @Chrome 選擇要操作的分頁 -->

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編提醒**：Work 模式用的是**你瀏覽器裡已經登入的帳號**——你的 Gmail、LinkedIn、公司後台都在它手邊。資安圈最擔心的是「**提示注入**」：網頁或信件裡藏一段寫給 AI 看的指令，騙它去做你沒要的事。練習期就用前面準備的練習用設定檔，重要的分頁別開著。

---

## 三、Gemini in Chrome（Google）

### 誰能用

Gemini in Chrome **內建在 Chrome 裡，不用另外裝插件**。Google 官方列的條件：

- 用 **Mac、Windows 或 Chromebook Plus**，Chrome 是最新版
- **已登入 Chrome**（無痕模式不能用）
- 在支援的地區、符合年齡：**台灣在名單上，但要 18 歲以上**
- 公司或學校的 Google 帳號，要**管理員開放**才能用

### Step 1：找到 Ask Gemini 按鈕

條件符合的話，Chrome 視窗**最上方**會出現 **Ask Gemini（詢問 Gemini）** 按鈕，點下去就會在旁邊打開 Gemini。

<!-- @img: gemini-in-chrome-button | Chrome 視窗上方的 Ask Gemini 按鈕與打開的 Gemini 面板 -->

如果找不到：先確認 Chrome 是最新版、你有登入 Chrome、不是在無痕視窗。Google 也明講這個功能「目前還沒開放給所有使用者」，可能要再等一下。

### Step 2：先用它讀網頁

台灣目前能用的是「讀」的那一層：摘要網頁或 YouTube 影片、在長頁面裡找答案、比較評論、查 Google 日曆空檔。好用的指令可以存成 **Skills** 重複使用。

### 那「自動瀏覽」呢？

Gemini 會自己點網頁的功能叫 **auto browse（自動瀏覽）**，可以幫你填購物車、訂位。依 2026-11-24 的 [Google 官方說明](https://support.google.com/gemini/answer/16821166?hl=en)，條件是：18 歲以上、人在美國、裝置語言設為英文、使用**個人** Google 帳號，並且有 **Google AI Ultra、Pro 或 Plus**。功能仍在逐步開放，不是人人都看得到。**台灣目前不在開放地區**，就算你付費訂閱也一樣——想要 Google 這邊可在背景跑的「動手做」，請看下面的 Tasks in Gemini。

---

## 插件只是一個階段：下一站是 AI 自己的雲端電腦

裝完插件，你會發現一個尷尬的地方：**AI 在用你的電腦**。它做事的時候你的電腦要開著、Chrome 要開著，筆電一闔上就停了；而且它碰得到你所有登入中的帳號。

所以 2026 年各家都往下一步走了：**給 AI 一台它自己的電腦**，跑在雲端。

![AI 操作網頁的三個階段：複製貼上、Chrome 插件、雲端電腦](/images/articles/chrome-ai-extensions/three-stages.svg)

| | Chrome 插件 | 雲端電腦／雲端瀏覽器 |
|---|---|---|
| 在哪裡跑 | 你的電腦、你的 Chrome | AI 公司的雲端機器 |
| 電腦闔上會怎樣 | 停下來 | 繼續做 |
| 用誰的登入 | 你瀏覽器裡已登入的帳號 | 要另外登入（獨立環境，碰不到你的分頁、密碼） |
| 最大優點 | 不用重新登入，看得到你看到的東西 | 跟你的電腦隔開、可以丟著讓它跑 |
| 最大缺點 | 碰得到你所有帳號 | 有些網站會擋機器人，要你接手最後一步 |

### 三家的雲端版現況

- **ChatGPT：Work 的雲端瀏覽器（Cloud browser）**。在 ChatGPT 網頁或手機開一個 Work 任務，它會視需要開一個**遠端電腦上的瀏覽器**去做事，你不用手動選。要登入網站時它會停下來，讓你在一個**模型看不到的安全表單**輸入帳密，卡住時可以從手機或電腦**接手**。設定 → Cloud browser 可以選網站存取方式（Always ask／Auto approve／Always allow，最後一個官方不建議）。依 [OpenAI 官方說明](https://help.openai.com/en/articles/20001280-using-cloud-browser-in-chatgpt)，**付費方案才有，Free 和 Go 沒有**，實際開放仍可能視地區與工作區設定而定。
- **Claude：Cowork**。Cowork 可以在網頁、桌面、手機上用，從手機開的任務會**在雲端繼續跑，筆電闔上也不停**。它在側邊面板有一個**內建瀏覽器**，跟你自己的瀏覽器、登入、分頁是分開的。依 [Anthropic 官方說明](https://support.claude.com/en/articles/15520349-use-claude-cowork-on-web-desktop-and-mobile)，Pro、Max、Ultra、Team、Enterprise 都有（官方提醒 Cowork 比一般聊天更快用完額度）。
- **Gemini：Tasks in Gemini**（先前文章與媒體常稱 Gemini Spark）。Google 的 24 小時代理，需要時會開一個**遠端瀏覽器**，筆電闔上它也能繼續做。依 2026-11-24 的 [Google 官方說明](https://support.google.com/gemini/answer/17094507?hl=en)：需 18 歲以上、使用**個人** Google 帳號（公司或學校帳號目前不行）。在美國、加拿大、印度、日本、韓國、澳洲，目前**不必另外訂閱**也能用；在其他已開放 Gemini App 的地區，需 **Google AI Pro 或 Ultra**，但**歐洲經濟區、英國、瑞士、奈及利亞除外**。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的判斷**：兩種不是誰取代誰。**要用你已登入的系統（公司後台、你的 Gmail）、而且你人在電腦前** → 用插件；**可以丟著讓它跑、碰的是公開網站或你願意另外登入的服務** → 用雲端版。新手建議反過來想：**先從雲端版開始**，因為它跟你的真實帳號是隔開的，出錯的代價比較小。

---

## 🚨 常見卡關

### 🚨 Claude 插件裝了卻說不能用

多半是方案問題：**免費方案不支援**。另外確認你用的是 Chrome 本體，不是 Edge、Brave 或 Arc。Team／Enterprise 的話，可能是管理員還沒開，或你要用的網站被管理員加進封鎖清單。

### 🚨 裝到假的 ChatGPT 插件

商店裡「ChatGPT」開頭的插件超多。打開插件頁面看**開發者欄位是不是 OpenAI**；不是就移除（右上角拼圖 → 管理擴充功能 → 移除）。

### 🚨 找不到 Ask Gemini 按鈕

依序檢查：Chrome 最新版 → 有登入 Chrome → 不是無痕視窗 → 帳號是 18 歲以上的個人帳號（公司帳號要管理員開）。都沒問題還是沒有，就是還沒輪到你，先用 gemini.google.com 網頁版。

### 🚨 AI 做到一半停下來問我

這是**正常的、是好事**。輸入密碼、付款、刪除、授權這類動作，三家都設計成要你本人確認或接手。**不要為了省事把密碼直接貼進聊天框**，ChatGPT 官方也明講不要這樣做。

---

## 下一步：明天就能做的一件事

1. 建一個**練習用的 Chrome 設定檔**，登入一個不重要的 Gmail。
2. 依你手上的方案裝一家：有 Claude 付費方案就裝 Claude in Chrome、只有 ChatGPT 免費版就裝 ChatGPT 擴充功能、什麼都沒有就先試 Gemini in Chrome。
3. 權限選「**每一步都問我**」，丟一個只讀的任務：「幫我把這三個分頁的商品規格整理成一張表」。
4. 用順了，再試一次雲端版（ChatGPT Work、Claude Cowork 或 Tasks in Gemini），感受「電腦闔上它還在做」是什麼感覺。

想先搞懂 AI 瀏覽器有哪些選擇，回頭看〈[AI 會自己操作網頁了](/articles/ai-agent-browsers/)〉；想知道 AI 怎麼接上更多外部工具，接著讀〈[MCP Server 該裝哪些？](/articles/mcp-servers-picks/)〉。
