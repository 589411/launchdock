---
title: "MCP Server 該裝哪些？2026 年 12 個有公信力的精選，加三條不會被下毒的安全鐵律"
description: "登錄站上有 12 萬個 MCP Server，但 43% 有命令注入漏洞。鴨編給你三層濾網、12 個官方維護的精選，以及在 Claude Desktop／Claude Code 接上第一個 MCP 的最短路徑。"
contentType: "guide"
scene: "核心功能"
difficulty: "入門"
createdAt: "2026-09-19"
verifiedAt: "2026-09-19"
archived: false
order: 6
prerequisites: ["mcp-protocol"]
estimatedMinutes: 12
modules: [M01, M05]
tags: ["MCP", "Agent", "Anthropic", "設定", "整合"]
stuckOptions:
  "為什麼不能亂裝": ["Tool Poisoning 到底是什麼？", "我只是接個 Notion，真的會出事嗎？"]
  "三層濾網": ["Remote 跟本機版怎麼分辨？", "官方目錄在哪裡看？", "社群做的就一定不能用嗎？"]
  "精選清單": ["為什麼沒有 Zapier／n8n？", "Context7 是什麼、我不寫程式用得到嗎？", "為什麼舊文章寫的 GitHub Server 找不到了？"]
  "實際接上": ["Claude Desktop 的連接器在哪裡？", "claude mcp add 加了之後換個資料夾就不見", "OpenClaw 怎麼接？"]
  "安全鐵律": ["什麼叫「同一個 agent 不要同時接外部內容和敏感工具」？", "怎麼知道某個 Server 有沒有問題？"]
---

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 上一篇[《MCP 協定：AI 的 USB 接口》](/articles/mcp-protocol/)講完「AI 的 USB 接口」之後，最常收到的問題是：**「那我該插哪幾條線？」** 這篇就回答這個。先講結論：目前登錄站上有超過 12 萬個 MCP Server，你只需要其中十來個；而且**挑錯一個，AI 可能會替別人把你的資料寄出去**。

---

## 先看一個真的發生過的事

2026 年 4 月，一組研究人員做了一個實驗：他們在 GitHub 的 Pull Request **標題**裡塞了一段看起來像正常文字、實際上是指令的內容。接著，接了 GitHub 工具的 AI 助理（Claude Code、Gemini CLI、GitHub Copilot 都中招）在讀 PR 的時候，把那段文字當成「使用者的指示」照做——**把專案的機密金鑰撈出來、貼在 PR 留言區公開**。

沒有人駭進電腦。AI 只是「讀到了一段字，然後照做」。

這種攻擊有個正式名稱，OWASP 已經把它收錄為獨立條目：**Tool Poisoning（工具下毒）**。原理一句話：

> MCP Server 回傳給 AI 的東西——工具說明、查詢結果、網頁內容——AI 全部當成「可信的上下文」。壞人只要能控制其中一段文字，就能對你的 AI 下指令。

2026 年幾份大規模掃描的數字更難看：在 2,600 多個 MCP 實作裡，**43% 有命令注入漏洞**；另一份掃 1,800 個 Server，**66% 至少有一項安全發現**。

所以「MCP Server 該裝哪些」不是選購題，是**安全題**。好消息是：只要照下面三層濾網走，你會自動避開九成以上的坑。

---

## 三層濾網：五秒鐘判斷一個 MCP Server 能不能用

![12 萬個 MCP Server 經過三層濾網——誰維護、怎麼連、在不在目錄——剩下十來個](/images/articles/mcp-servers-picks/trust-filter.svg)

### 濾網 1：誰維護？

問自己一句話：**「出事了找誰？」**

| 等級 | 例子 | 判斷 |
|---|---|---|
| 廠商官方自己做的 | GitHub、Notion、Slack、Stripe 官方 MCP | ✅ 首選。廠商自己的名聲押在上面 |
| MCP 專案的參考實作 | Filesystem、Fetch、Memory、Sequential Thinking | ✅ 開源、最透明，是所有人抄作業的範本 |
| 有公司在背後的社群專案 | Context7（Upstash）、Playwright MCP（Microsoft） | ✅ 可用，看一下是哪家公司 |
| 個人維護、幾百顆星 | 大多數登錄站上的東西 | ⚠️ 先當作「執行陌生人的程式」看待 |

### 濾網 2：怎麼連？Remote 還是本機？

這是新手最容易忽略、但差最多的一點。

![Remote MCP 在廠商伺服器跑、用 OAuth 授權；本機 MCP 裝在你電腦、拿你的權限跑](/images/articles/mcp-servers-picks/remote-vs-local.svg)

- **Remote（遠端託管）**：Server 跑在廠商的機器上，你的電腦只有 AI 客戶端。授權方式像「用 Google 帳號登入」（OAuth），可以隨時撤銷，而且 AI 拿到的權限**只限於那個服務**。
- **本機（stdio）**：你用 `npx` 或 `pip` 把 Server 裝在自己電腦上跑。它拿的是**你的帳號權限**——你能刪的檔案它都能刪。

判斷口訣：**先找 Remote 版；沒有 Remote 版、又非得碰本機資源（檔案、瀏覽器），才裝本機版。**

### 濾網 3：在不在有審查的目錄？

目前有兩個地方是「有人看過才上架」的：

1. **Claude 連接器目錄**（claude.com/connectors，或 Claude 設定頁的 Connectors）：Anthropic 會掃描政策合規，部分還經過人工驗證。截至 2026 年 2 月已超過 50 個。
2. **官方 MCP Registry**（registry.modelcontextprotocol.io）：MCP 專案自己的登錄站，Server 要以廠商身分認證才能用自家網域發佈。

不在這兩個地方的，不代表壞，但你要自己多做一層功課。

---

## 精選 12 個：分四類，每個都過了三層濾網

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 名單以 2026-09-19 查證為準。MCP 生態變很快——例如上一篇提到的 GitHub、Slack、PostgreSQL 那批 Anthropic 早期參考實作，**現在都已封存**，改由各廠商自己維護官方版。舊教學裡的安裝指令很多已經不能用了。

### A. MCP 專案官方參考實作（開源、免費、最透明）

| Server | 做什麼 | 連法 | 適合誰 |
|---|---|---|---|
| **Filesystem** | 讓 AI 讀寫你指定資料夾裡的檔案，可限制範圍 | 本機 | 想讓 AI 整理本機文件的人 |
| **Fetch** | 抓網頁、轉成 AI 好讀的格式 | 本機 | 要 AI 讀網路文章／文件的人 |
| **Memory** | 知識圖譜型的長期記憶 | 本機 | 想讓 AI 記住跨對話的事（延伸閱讀：[《AI 記憶的基礎建設缺失》](/articles/ai-agent-memory-guide/)） |
| **Sequential Thinking** | 讓 AI 把複雜問題拆成步驟想 | 本機 | 全球流量前三，處理需要多步推理的任務 |

這四個都在 `modelcontextprotocol/servers` 這個 repo 裡（同一個 repo 還有 Git 與 Time 兩個，比較工具性）。

### B. 開發與自動化（廠商官方）

| Server | 做什麼 | 連法 | 備註 |
|---|---|---|---|
| **GitHub** | 讀 repo、開 issue、審 PR、看 Actions | Remote：`https://api.githubcopilot.com/mcp/` | GitHub 官方，OAuth。Anthropic 文件的示範首選 |
| **Context7** | 把「當下版本」的套件文件塞進 AI 的上下文，解「AI 用過時 API 寫出幻覺程式碼」 | Remote：`https://mcp.context7.com/mcp` | Upstash 維護，全球流量第一。免費，API key 選填（有 key 額度較高） |
| **Playwright** | 讓 AI 操作瀏覽器：開頁、點按鈕、填表、截圖 | 本機：`npx @playwright/mcp@latest` | Microsoft 官方。用無障礙樹而非截圖辨識，穩定又省 Token。加 `--isolated` 可不留登入狀態 |

### C. 生產力（一般讀者最會用到）

| Server | 做什麼 | 連法 |
|---|---|---|
| **Notion** | 搜尋、讀寫你的 Notion 頁面與資料庫 | Remote：`https://mcp.notion.com/mcp`，也在 Claude 連接器目錄 |
| **Slack** | 讀頻道、發訊息、搜尋對話 | Remote：`https://mcp.slack.com/mcp`，也在連接器目錄 |
| **Google（Gmail／Calendar／Drive）** | 收發信、排行程、找檔案 | Anthropic 託管的連接器，Claude 設定頁一鍵開 |

### D. 資料與商務（有寫入權限，當「高風險示範」看）

| Server | 做什麼 | 連法 | 安全提醒 |
|---|---|---|---|
| **Supabase** | 查表、跑 SQL、看 log | Remote：`https://mcp.supabase.com/mcp` | 官方文件自己就建議：**限定單一專案、開唯讀模式**、非必要別接正式環境 |
| **Stripe** | 查帳單、客戶、建付款連結 | Remote：`https://mcp.stripe.com` | 碰得到錢。只在需要時開、用完關 |

**刻意沒列的**：Zapier／Make／n8n 這類「一個 MCP 接幾千個 App」的自動化平台——不是不好，是它們本身就是一整篇的主題，而且權限範圍太大，不適合當第一批；還有 Desktop Commander 這類「讓 AI 直接跑終端機指令」的社群工具——很紅，但等你熟悉了再說。

---

## 實際接上：三個客戶端各給最短路徑

### Claude Desktop／claude.ai：一鍵連接器（最推薦新手）

1. 打開 Claude，左下角你的帳號選單 → **Settings**（設定）→ **Connectors**（連接器）
2. 點「Browse connectors」，找到 Notion（或 Gmail），點 **Connect**

<!-- @img: claude-connectors-browse | Claude 設定頁的 Connectors 分頁，顯示可用連接器清單 -->

3. 跳出 Notion 的 OAuth 授權頁 → 選擇要開放哪些頁面 → 允許

<!-- @img: notion-oauth-authorize | Notion 的授權畫面，可勾選開放給 Claude 的頁面 -->

4. 回到對話，問一句「幫我找 Notion 裡上週的會議記錄」。第一次呼叫工具時 Claude 會再問你一次要不要允許。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 整個過程你不會看到任何指令列、也不用裝任何東西——這就是 Remote + OAuth 的價值。

### Claude Code：一行指令

```bash
# Remote 版（推薦）：加 GitHub 官方 MCP，跨所有專案可用
claude mcp add -s user --transport http github https://api.githubcopilot.com/mcp/

# 本機版範例：Playwright
claude mcp add -s user playwright -- npx @playwright/mcp@latest

# 確認
claude mcp list
```

看到 `✔ Connected` 就是接上了。Remote 版第一次用時，在 Claude Code 裡輸入 `/mcp` 會引導你完成 OAuth 登入。

### 🚨 常見錯誤：加了之後換個資料夾就不見

`claude mcp add` **預設 scope 是 `local`**，設定只綁在你執行指令的那個資料夾。換目錄開 Claude Code 就看不到了。要跨專案使用一律加 `-s user`（上面的範例已加）。

### OpenClaw

OpenClaw 內建 MCP Client，設定檔寫法見[《MCP 協定：AI 的 USB 接口》](/articles/mcp-protocol/)的「在 OpenClaw 中使用 MCP」段落。原則一樣：能用 Remote URL 就別在主機上裝本機版——尤其如果你的 OpenClaw 是照[《雲端部署 OpenClaw》](/articles/deploy-openclaw-cloud/)放在雲端主機上，本機版 Server 等於讓 AI 拿到那台主機的權限。

---

## 三條安全鐵律（OWASP 給一般使用者的版本）

接上之後，這三條比選哪個 Server 更重要：

### 1. 只接你查得出「誰維護」的 Server

用前面三層濾網。看到登錄站上一個「超好用、幾千顆星」但作者不明的 Server，先當成「陌生人給的 USB 隨身碟」。

### 2. 敏感動作一定要「跳出 AI」確認

刪檔、寄信、付款、改資料庫——這些動作**不能讓 AI 自己決定**，一定要有一個在 AI 對話之外的確認步驟（Claude 每次呼叫新工具都會問你一次，**不要為了省事點「一律允許」**）。Supabase 的唯讀模式、Playwright 的 `--isolated`，都是同一個精神。

### 3. 同一個 Agent，不要同時接「會讀外部內容的工具」和「敏感內部工具」

這是最反直覺、也最重要的一條。回到開頭的 GitHub 事件：出事的條件是「AI 能讀陌生人寫的 PR 標題」**加上**「AI 同時能碰機密金鑰」。兩個分開都沒事，湊在一起就是漏洞。

實務做法：讀網頁、讀 PR、讀信件的 Agent，不要同時給它 Filesystem 寫入權限或 Stripe。真的需要兩邊，就分成兩個對話、兩個 Agent。

---

## 明天就能做的一件事

打開 Claude 的 Connectors，**只接一個**你每天在用的服務（Notion 或 Gmail 二選一），然後問它一個你本來要自己翻半天的問題。感受一下「AI 真的碰到了你的資料」是什麼體驗——然後再回來看鐵律第三條，想一想你剛剛給了它什麼。

想知道這條 USB 線背後的原理，回頭看[《MCP 協定：AI 的 USB 接口》](/articles/mcp-protocol/)；想知道 AI 拿到工具之後怎麼決定用哪個，看[《拆解 AI Agent：Skill、工具、Harness 三層》](/articles/ai-agent-anatomy/)。

---

## 資料來源（2026-09-19 查證）

- [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)——參考實作現況與封存清單
- [Claude Code：Connect to tools via MCP](https://code.claude.com/docs/en/mcp)——官方示範的 Remote Server URL 與安全警語
- [OWASP：MCP Tool Poisoning](https://community.owasp.org/attacks/MCP_Tool_Poisoning)
- [Practical DevSecOps：MCP Security Statistics 2026](https://www.practical-devsecops.com/mcp-security-statistics-2026-report/)——43%／66% 數字出處
- [Supabase MCP 文件](https://supabase.com/docs/guides/getting-started/mcp)、[Context7](https://github.com/upstash/context7)、[Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [mcp.directory Top 10](https://mcp.directory/blog/top-10-most-popular-mcp-servers)、[mcpmanager.ai 50 Most Popular](https://mcpmanager.ai/blog/most-popular-mcp-servers/)——流量排名參考
