---
title: "MCP 協定：AI 的 USB 接口，讓工具即插即用"
description: "Model Context Protocol 讓 AI 能連接任何工具。了解 MCP 如何運作，以及它為什麼是 OpenClaw 的核心骨架。"
scene: "打破資訊孤島"
difficulty: "中級"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: false
order: 3
tags: ["MCP", "協定", "API", "標準化", "OpenClaw"]
stuckOptions:
  "為什麼需要 MCP": ["現在的 API 方式有什麼問題？", "MCP 是誰制定的？"]
  "MCP 怎麼運作": ["Client 跟 Server 的關係看不懂", "JSON-RPC 是什麼？", "跟 REST API 差在哪？"]
  "在 OpenClaw 中使用": ["怎麼安裝 MCP Server？", "設定檔看不懂"]
  "自己建一個 MCP Server": ["需要會什麼程式語言？", "有沒有模板可以用？"]
  "實際應用": ["MCP 支援哪些工具？", "可以同時連多個 Server 嗎？"]
---

## 一個煩人的問題

你有沒有這樣的經驗：

你想讓 AI 幫你「搜尋 Google Drive 裡的文件 → 整理成摘要 → 發到 Slack」。

理論上很簡單。但實際上：

- Google Drive 的 API → 一套認證、一種格式
- Slack 的 API → 另一套認證、另一種格式
- Notion 的 API → 又一套認證、又一種格式

每個工具都有自己的「方言」。你（或 AI）得學會每一種。

---

## MCP 是什麼？一個比喻就懂

**MCP = AI 工具的 USB 標準。**

還記得 USB 之前的世界嗎？

- 印表機用 LPT 接口
- 滑鼠用 PS/2 接口
- 相機用自己的專用線
- 手機有 Micro USB、Mini USB、Lightning…

USB-C 統一了一切。

**MCP 對 AI 做了一樣的事。** 它定義了一個標準的「溝通方式」，讓 AI 可以用同一種語言跟所有工具對話。

```
以前：AI → 各種不同 API → Google / Slack / Notion / …
現在：AI → MCP 協定 → Google / Slack / Notion / …
```

---

## MCP 的全名和由來

**MCP = Model Context Protocol**（模型上下文協定）

由 Anthropic（Claude 的公司）在 2024 年底提出，現在已被主要 AI 框架採用，包括 OpenClaw。

### 為什麼叫「Context Protocol」？

因為它的核心功能是把**外部工具的資訊（Context）** 用標準化的方式送進 AI 的決策過程。

---

## MCP 的架構：三個角色

```
┌──────────┐     MCP 協定     ┌──────────────┐     實際工具
│          │ ←──────────────→ │              │ ←──────────→  Google Drive
│  MCP     │                  │  MCP Server  │                Slack
│  Client  │                  │  （橋接器）    │                Notion
│ (OpenClaw)│                  │              │                任何 API
└──────────┘                  └──────────────┘
```

| 角色 | 是什麼 | 例子 |
|---|---|---|
| **MCP Client** | 使用工具的那一方 | OpenClaw Agent |
| **MCP Server** | 提供工具能力的橋接器 | google-drive-server, slack-server |
| **Tool** | 實際的功能 | 搜尋檔案、發訊息、讀資料庫 |

### 打個比方

```
你（MCP Client） → 翻譯人員（MCP Server） → 外國客戶（Tool）
```

你只需要跟翻譯說中文（MCP 協定），翻譯會用對方的語言（各種 API）溝通。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：再講白一點——MCP 就像辦公室裡的內線電話系統。不管你要找財務部（Google Drive）還是行銷部（Slack），撥分機號碼就好，不用跑去對方的辦公室學他們的術語。

---

## MCP 怎麼運作？

### 1. 發現（Discovery）

Client 問 Server：「你能做什麼？」

```json
// Client → Server
{ "method": "tools/list" }

// Server → Client
{
  "tools": [
    {
      "name": "search_files",
      "description": "搜尋 Google Drive 中的檔案",
      "inputSchema": {
        "type": "object",
        "properties": {
          "query": { "type": "string", "description": "搜尋關鍵字" }
        }
      }
    },
    {
      "name": "read_file",
      "description": "讀取指定檔案的內容"
    }
  ]
}
```

### 2. 呼叫（Invocation）

Client 知道有什麼工具後，就可以使用：

```json
// Client → Server
{
  "method": "tools/call",
  "params": {
    "name": "search_files",
    "arguments": { "query": "週會筆記" }
  }
}

// Server → Client
{
  "content": [
    {
      "type": "text",
      "text": "找到 3 個檔案：\n1. 2024-02 週會筆記\n2. ..."
    }
  ]
}
```

### 3. AI 決策

Agent 收到結果後，自己決定下一步。這就是 [Agent 的 ReAct 流程](/articles/openclaw-agent)：

```
觀察：找到了 3 個週會筆記
思考：用戶要最新的，選第一個
行動：呼叫 read_file 讀取內容
觀察：取得了內容
思考：整理成摘要
行動：呼叫 LLM 生成摘要
```

---

## 在 OpenClaw 中使用 MCP

### 安裝 MCP Server

OpenClaw 已內建 MCP Client。你只需要啟動對應的 MCP Server。

以 Google Drive 為例：

```bash
# 安裝 Google Drive MCP Server
npm install -g @anthropic/mcp-server-google-drive

# 或用 OpenClaw 內建指令
openclaw mcp install google-drive
```

### 設定連接

在 OpenClaw 的設定檔 `config.yaml` 中：

```yaml
mcp_servers:
  google-drive:
    command: mcp-server-google-drive
    args:
      - --credentials=/path/to/credentials.json
    env:
      GOOGLE_API_KEY: ${GOOGLE_API_KEY}

  slack:
    command: mcp-server-slack
    env:
      SLACK_TOKEN: ${SLACK_TOKEN}

  notion:
    command: mcp-server-notion
    env:
      NOTION_TOKEN: ${NOTION_TOKEN}
```

啟動後，你的 Agent 就能同時操作 Google Drive、Slack 和 Notion。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **不知道怎麼設定 Google API Key？** 看 [Google API Key 申請指南](/articles/google-api-key-guide)。

### 確認連接成功

```bash
# 列出所有已連接的 MCP Server
openclaw mcp list

# 測試特定 Server
openclaw mcp test google-drive
```

---

## 目前有哪些 MCP Server？

生態系快速成長中，以下是截至 2026 年初的主要 Server：

### 生產力工具

| MCP Server | 功能 | 難度 |
|---|---|---|
| Google Drive | 搜尋、讀寫檔案 | ⭐ 簡單 |
| Google Calendar | 行程管理 | ⭐ 簡單 |
| Gmail | 收發郵件 | ⭐⭐ 中等 |
| Notion | 知識庫操作 | ⭐ 簡單 |
| Slack | 發訊迴覆 | ⭐ 簡單 |
| Telegram | 聊天機器人 | ⭐⭐ 中等 |

### 開發工具

| MCP Server | 功能 | 難度 |
|---|---|---|
| GitHub | Repo / Issue / PR 管理 | ⭐⭐ 中等 |
| Database (PostgreSQL) | 資料庫查詢 | ⭐⭐ 中等 |
| Docker | 容器管理 | ⭐⭐⭐ 進階 |
| Kubernetes | 叢集管理 | ⭐⭐⭐ 進階 |

### 資料來源

| MCP Server | 功能 | 難度 |
|---|---|---|
| Web Search | 網路搜尋 | ⭐ 簡單 |
| Web Scraper | 爬取網頁 | ⭐⭐ 中等 |
| RSS | RSS 訂閱 | ⭐ 簡單 |

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> 完整清單可以在 [ClawHub](https://clawhub.dev) 上查看。

---

## 為什麼 MCP 對你很重要？

### 1. 不用學每個工具的 API

以前：你需要讀 Google API 文件 + Slack API 文件 + Notion API 文件…

現在：安裝 MCP Server，開箱即用。

### 2. Agent 自動選擇工具

你不需要指定「先用 Google 搜、再用 Notion 存」。Agent 根據你的目標，自動判斷要用哪個 MCP Server 的哪個工具。

這就是 [Agent 的威力](/articles/openclaw-agent)。

### 3. 換工具不用改流程

今天用 Notion，明天想換 Obsidian？只需要換一個 MCP Server，你的 [Skill](/articles/openclaw-skill) 和 Agent 邏輯完全不用改。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：以前從 Notion 換到 Obsidian 等於搬家——要打包、拆裝、重新整理。有了 MCP，換工具就像換插座面板——線路不用動，只換一個零件就好。

### 4. 安全性內建

MCP 有標準的認證和權限機制：

```yaml
# 限制 Agent 只能讀取，不能寫入
mcp_servers:
  google-drive:
    permissions:
      - search_files: allow
      - read_file: allow
      - write_file: deny   # 禁止寫入
      - delete_file: deny  # 禁止刪除
```

---

## 進階：自己建一個 MCP Server

如果你需要串接內部系統或特殊 API，可以自己寫 MCP Server。

### 最簡範例（Node.js）

```javascript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "my-custom-server",
  version: "1.0.0"
});

// 定義一個工具
server.setRequestHandler("tools/list", async () => ({
  tools: [{
    name: "get_weather",
    description: "查詢指定城市的天氣",
    inputSchema: {
      type: "object",
      properties: {
        city: { type: "string", description: "城市名稱" }
      },
      required: ["city"]
    }
  }]
}));

// 實作工具邏輯
server.setRequestHandler("tools/call", async (request) => {
  if (request.params.name === "get_weather") {
    const city = request.params.arguments.city;
    // 呼叫天氣 API...
    return {
      content: [{ type: "text", text: `${city} 目前 25°C，晴天` }]
    };
  }
});

// 啟動 Server
const transport = new StdioServerTransport();
await server.connect(transport);
```

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> MCP SDK 目前有 **Node.js** 和 **Python** 版本。如果你會寫程式，可以輕鬆擴充。

---

## 常見問題

### MCP 和 OpenAPI（Swagger）有什麼不同？

OpenAPI 是定義 REST API 的規範。MCP 是 AI 專用的工具連接協定。MCP 更高階——它包含了 AI 需要的工具描述、認證流程和結果格式。

### 每個 MCP Server 都免費嗎？

MCP Server 本身大多是開源免費的。但它連接的服務（如 Google API）可能需要 [API Key 和費用](/articles/token-economics)。

### 可以同時連幾個 MCP Server？

沒有限制。OpenClaw 可以同時管理數十個 MCP Server，Agent 會根據任務自動選。

---

## 下一步

了解了 MCP，你可以：

- 🔑 [申請 API Key 串接第一個服務](/articles/google-api-key-guide)
- 🤖 [讓 Agent 自動呼叫 MCP 工具](/articles/openclaw-agent)
- 🧩 [在 Skill 中調用 MCP 工具](/articles/openclaw-skill)
- ⚙️ [設定模型來驅動 MCP 呼叫](/articles/openclaw-model-config)
- 💬 [串接 Telegram 作為 AI 入口](/articles/telegram-integration)
