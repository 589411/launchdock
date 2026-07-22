---
title: "把 Grok 接上 GitHub：一句話讓 AI 幫你建 repo、上傳檔案（免費版實測可用）"
description: "在 grok.com 的「技能與連接器」把 GitHub 連上去，之後你只要打一句「寫一個介紹 CLI 工具的網站，上傳到 github repo」，Grok 就會自己建 repo、寫檔案、推上去。含 GitHub 端授權權限怎麼給才安全，以及 2026-07-21 免費版實測結果。"
contentType: "tutorial"
scene: "整合與自動化"
difficulty: "入門"
createdAt: "2026-07-21"
verifiedAt: "2026-07-21"
archived: false
order: 8
prerequisites: ["github-account-signup"]
estimatedMinutes: 10
tags: ["Grok", "GitHub", "MCP", "整合"]
modules: [M01, M02]
stuckOptions:
  "找不到連接器設定": ["側欄沒有「技能與連接器」", "點進去只看到「技能」分頁", "找不到 GitHub 這張卡"]
  "GitHub 授權那一頁": ["All repositories 跟 Only select 差在哪？", "權限清單看起來很可怕，正常嗎？", "卡在 Confirm access／收不到驗證信"]
  "叫 Grok 動手做事": ["它只回我程式碼、沒有真的上傳", "怎麼確認它真的碰了我的 GitHub？", "可以指定 repo 名稱嗎？"]
  "做完之後": ["網站網址打開是 404", "想收回權限怎麼辦？", "免費版有沒有次數限制？"]
---

> **一句話**：到 [grok.com/connectors](https://grok.com/connectors) 的「連接器」分頁點 GitHub → 按「連結」→ 在 GitHub 頁面選要開放的 repo 範圍並授權 → 回到 Grok 開新對話打一句「寫一個介紹某某的網站，上傳到 github repo」，它就會自己建 repo、寫檔案、推上去。

**關鍵字**：Grok、GitHub、連接器、Connector、MCP、建立 repo、授權、GitHub App、GitHub Pages、免費版

---

## 為什麼要把 AI 接上 GitHub？

你大概有過這個經驗：叫 AI 幫你寫一個網頁，它洋洋灑灑生出一整份 HTML，然後——你要自己複製、貼到編輯器、存檔、開 GitHub、建 repo、上傳檔案、再去 Settings 開 Pages。**AI 出一分力，你出九分力。**

把 GitHub 接上去之後，中間那九分力消失了。你打一句話，它自己開 repo、自己寫檔案、自己推上去，最後回你一個網址。

這篇用的是 2026-07-21 的實測：**Grok 免費版就能跑完整套**，從一句話到 GitHub 上真的多出一個 repo，全程 2 分 14 秒。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：連接器（Connector）就像幫 AI 辦一張你家的門禁卡。沒有卡，它只能站在門口跟你描述房間該怎麼佈置；有了卡，它自己進去把家具搬好。**所以卡要發給誰、能開哪幾間房，你得想清楚**——這也是下面 Step 3 那一頁最重要的原因。

---

## 開始之前，你需要

- 一個 **GitHub 帳號**（還沒有的話，先看[註冊 GitHub 帳號](/articles/github-account-signup/)，五分鐘）
- 一個 **Grok 帳號**（免費即可，用瀏覽器登入 [grok.com](https://grok.com)）

xAI 官方文件寫的是「連接器對所有 Grok 使用者開放」，實測免費帳號確實連得上、也能執行任務。

---

## Step 1：進入「技能與連接器」，切到「連接器」分頁

登入 [grok.com](https://grok.com) 之後，看左側欄——點 **技能與連接器**。

進去之後注意上方有兩個分頁：**技能** 和 **連接器**。預設可能停在「技能」，**你要點的是「連接器」**。切過去就會看到「精選」清單：GitHub、Gmail、Google Calendar、Google Drive、Box、Canva、Notion、Stripe、Vercel。

![Grok 的技能與連接器頁面，切到「連接器」分頁後可以看到 GitHub](/images/articles/grok-connect-github/grok-connectors-page.jpg)

點下 **GitHub** 那張卡。

---

## Step 2：看清楚你要連的是什麼

點下去會跳出一張說明卡，這張卡值得你花 30 秒讀完：

- **它能做什麼**：搜尋 repo 與程式碼、瀏覽檔案樹、管理 repo（branch、release、issue、PR）、看通知，以及**執行像加星號或推送檔案這類動作**。注意最後這句——它不是唯讀的。
- **伺服器 URL**：`https://api.githubcopilot.com/mcp/x/all`。這是 GitHub 官方的遠端 MCP 協定伺服器；換句話說，Grok 是透過 MCP 這個標準接口去操作你的 GitHub，不是 xAI 自己另外做了一套 GitHub 功能。
- **警語**：卡片下方明白寫著「第三方連接器並非由 xAI 建置或維護，授予外部服務存取權限時請小心」。

![Grok 的 GitHub 連接器說明卡，顯示伺服器 URL 與第三方連接器警語](/images/articles/grok-connect-github/grok-github-connector.jpg)

確認要連，就按右上角的 **連結**。

---

## Step 3：在 GitHub 這端決定「給多大的權限」⭐

按下「連結」後會跳到 GitHub 的授權頁：**Install & Authorize Grok (by xAI)**。這一頁是整個流程最重要的地方，別急著按下去。

![GitHub 的 Install & Authorize Grok (by xAI) 頁面，可以選擇開放全部 repo 或只選特定 repo](/images/articles/grok-connect-github/github-install-authorize-grok.jpg)

**for these repositories（要開放哪些 repo）** 有兩個選項：

| 選項 | 意思 | 建議 |
|------|------|------|
| **All repositories** | 你現在跟**未來**所有的 repo 都開放 | 想省事、帳號裡沒有敏感專案時可用 |
| **Only select repositories** | 只開放你手動勾選的 repo | **建議先用這個**，之後要加隨時能改 |

再往下是 **with these permissions（授予的權限）**，它會列出：讀取 metadata，以及**讀寫** Dependabot alerts、actions、administration、code、commit statuses、discussions、issues、pull requests、repository projects、secret scanning alerts、security events、workflows。

看起來很嚇人，但這是合理的——**你就是要它能寫，它才能幫你建 repo、推檔案**。重點不是「能不能寫」，而是「能寫到哪幾個 repo」，那個開關就在上面那格。

### 🚨 常見錯誤：一律選 All repositories

如果你的 GitHub 帳號裡放了工作專案、客戶程式碼、或含設定檔的私有 repo，選 All 等於把整櫃鑰匙一次交出去。**練習階段請選 Only select repositories，勾一個新開的測試 repo 就好。**（要讓它「新建 repo」的話，就照下面實測那樣選 All；等玩熟了再回 GitHub → Settings → Applications 收窄範圍。）

---

## Step 4：通過 GitHub 的二次確認（sudo mode）

授權這種等級的動作，GitHub 會要你再證明一次「真的是你本人」，畫面標題是 **Confirm access**。

按 **Verify via email**，GitHub 會寄一封信給你，點信裡的驗證連結（或輸入驗證碼）就過關了。

![GitHub 的 Confirm access 二次驗證畫面，按 Verify via email 收信驗證](/images/articles/grok-connect-github/github-confirm-access.jpg)

> 這就是 GitHub 說的 sudo mode：通過之後幾個小時內做敏感操作都不用再驗一次。

---

## Step 5：回到 Grok，確認「已連接」

驗證完會自動跳回 Grok。再點一次 GitHub 那張卡，你會看到三個變化：

1. 右上角從「連結」變成 **解除連接**（想收手隨時按這裡）
2. 多了一行 **所有工具已啟用**，下面列出實際可用的工具名稱：`actions_get`、`actions_list`、`actions_run_trigger`、`add_comment_to_pending_review`、`add_issue_comment`、`add_reply_to_pull_request_comment`⋯（點「顯示更多」還有一大串）
3. 伺服器 URL 仍然是那個 GitHub 官方 MCP 位址

![Grok 顯示 GitHub 連接器已連接，所有工具已啟用並列出工具清單](/images/articles/grok-connect-github/grok-github-connected.jpg)

看到這些工具名稱就對了——**這就是 AI 手上實際握有的「動作清單」**，它等一下會從裡面挑工具來用。

---

## Step 6：下指令。真的只要一句話

開一個 **新對話**，輸入你要的東西。實測用的就是這句大白話：

```
寫一個介紹cli工具的網站，上傳到github repo
```

沒有指定框架、沒有指定 repo 名稱、沒有貼任何程式碼。

![在 Grok 新對話輸入「寫一個介紹cli工具的網站，上傳到github repo」](/images/articles/grok-connect-github/grok-prompt-input.jpg)

---

## Step 7：盯住這一行，它代表 AI 真的動手了

送出後，Grok 會先自己規劃（畫面顯示 *Designing the CLI tool website*）、然後開始執行。過程中會冒出這兩行關鍵字：

- **Github Create Repository** ← 這行出現，代表它真的呼叫了 GitHub 的建立 repo 工具
- **寫入檔案 index.html**

![Grok 執行過程中出現 Github Create Repository，代表已成功連結並操作 GitHub](/images/articles/grok-connect-github/grok-create-repository.jpg)

> 這是判斷「AI 到底有沒有真的做事」最實用的一招：**看它有沒有呼叫工具，而不是看它講得多好聽。** 只有文字、沒有工具呼叫，那就只是在跟你描述而已。

---

## Step 8：完成，它會給你網址與後續指引

實測**思考了 2 分 14 秒**後回覆「已完成！🎉」，內容包括：

- **GitHub 儲存庫**連結
- **GitHub Pages 網站**（部署後）的網址
- 一段貼心提醒：如果 Pages 還沒顯示，要去 Repository → **Settings → Pages → Source: Deploy from a branch → main → Save**
- 網站特色說明（全中文、響應式、Hero 區、安裝指令、快速使用範例）
- 「如何修改」的三步驟（clone → 編輯 `index.html` → 推上去 Pages 自動更新）

![Grok 完成後的回覆，附上 GitHub 儲存庫連結、GitHub Pages 網址與修改方式](/images/articles/grok-connect-github/grok-done-summary.jpg)

---

## Step 9：去 GitHub 驗收（這步不要跳過）

**不要相信 AI 說「已完成」，去看實體。** 打開 GitHub，repo 真的在那裡：

- repo 名稱 `cli-tool-website`，標示 **Public**
- 檔案：`README.md`、`index.html`
- **3 Commits**、Languages 顯示 HTML 100%
- README 直接渲染出中文說明（功能、GitHub Pages 網址、本地預覽）

![GitHub 上實際生成的 repo，含 README.md 與 index.html、3 個 commit](/images/articles/grok-connect-github/github-repo-result.jpg)

從一句話到這個畫面，中間你沒有打開過編輯器、沒有下過任何一行 `git` 指令。

---

## 🚨 常見錯誤與排解

### 網站網址點開是 404

repo 建好不等於 Pages 開好。到該 repo 的 **Settings → Pages → Source 選 Deploy from a branch → 分支選 main → Save**，等幾分鐘。詳細流程與各種 build 失敗排錯，看[把靜態網站部署到 GitHub Pages](/articles/deploy-to-github-pages/)。

### 它只回我程式碼，沒有真的上傳

三個地方檢查：① 連接器是不是真的連上（Step 5 有沒有出現「解除連接」）；② 你的指令有沒有明確說「**上傳到 github repo**」——沒講清楚它就只會生程式碼給你看；③ 過程中有沒有出現工具呼叫那一行（Step 7）。

### 想收回權限

兩邊都可以關：Grok 這端點 **解除連接**；GitHub 這端到 **Settings → Applications → Installed GitHub Apps** 找到 Grok，改開放範圍或直接移除。**只在 Grok 端解除，GitHub 上的 App 安裝紀錄還在**，要徹底收回請兩邊都做。

### 免費版會不會有限制？

實測免費帳號可以完成上述整套流程。但免費版本來就有訊息量與速度的限制（畫面右下角常駐的 SuperGrok 升級提示就是在講這件事），密集使用時可能被降速或要求等待。這篇沒有測量免費額度的實際上限。

---

## 下一步做什麼

1. **今天就試一次**：連好之後，開新對話打「寫一個介紹我自己的個人首頁，上傳到 github repo」，五分鐘拿到一個真的網站。
2. **把它變成你的發布管道**：學會 [GitHub Pages 部署](/articles/deploy-to-github-pages/)，之後每個 AI 產出的小工具都能直接變成一個可分享的網址。
3. **對照另一條路**：ChatGPT 也有 GitHub 連接器，但定位不同（偏向追 PR／issue／CI，而不是幫你建 repo）——看[把 ChatGPT 接上 GitHub](/articles/chatgpt-connect-github/)的實測對照。
4. **想懂背後原理**：Grok 是透過 [MCP 協定](/articles/mcp-protocol/)去操作 GitHub 的，理解這層之後，你會發現「AI 接工具」全都是同一套邏輯。
