---
title: "把 ChatGPT 接上 GitHub：連接器怎麼開，以及免費版實測的真實結果"
description: "在 ChatGPT 的「外掛程式」頁面找到 GitHub、安裝並完成授權，全程三分鐘。但連上之後它能做什麼、不能做什麼？2026-07-21 免費版實測：能連、能讀，要它真的動手建 repo 推檔案則沒有成功——這篇把設定步驟與實測結論一次講清楚。"
contentType: "tutorial"
scene: "整合與自動化"
difficulty: "入門"
createdAt: "2026-07-21"
verifiedAt: "2026-07-21"
archived: false
order: 9
prerequisites: ["github-account-signup"]
estimatedMinutes: 8
tags: ["ChatGPT", "GitHub", "整合", "設定"]
modules: [M01]
stuckOptions:
  "找不到外掛程式頁面": ["側欄沒有「外掛程式」", "跟「Codex」有什麼不一樣？", "手機版找得到嗎？"]
  "安裝與授權": ["按了安裝沒反應", "授權彈窗上那三段說明在講什麼？", "為什麼要我做 Google 驗證？"]
  "連上之後能做什麼": ["它可以幫我建 repo 嗎？", "Skills 那四個標籤是什麼？", "要不要付費才有用？"]
  "決定要不要用": ["跟 Grok 的 GitHub 連接器差在哪？", "跟 Codex 差在哪？", "我只想把檔案丟上 GitHub"]
---

> **一句話**：在 [chatgpt.com/plugins](https://chatgpt.com/plugins) 的側欄點「外掛程式」→ 在 Featured 找到 **GitHub** → 點進去按「安裝外掛程式」→ 在「與 GitHub 連線」彈窗按「繼續 GitHub」完成授權。設定很快，但**免費版實測要它真的動手做事會卡住**，能不能用得起來取決於你的方案與你想做的事。

**關鍵字**：ChatGPT、GitHub、外掛程式、連接器、Connector、授權、Skills、Codex、免費版

---

## 先講結論，省你三分鐘

很多人接 GitHub 是想達成這件事：**「我叫 AI 寫個東西，它自己幫我放上 GitHub。」**

2026-07-21 實測的結果是：

- ✅ **ChatGPT 免費版可以完成連接器的安裝與授權**，流程順暢，三分鐘內結束。
- ❌ **但用免費版的模型要它實際執行 GitHub 任務（建 repo、把檔案推上去），並沒有成功跑完。** 想穩定使用需要訂閱方案。
- 📌 從 ChatGPT 自己對這個連接器的描述也看得出定位：它寫的是 **「Triage PRs, issues, CI, and publish flows」**（分流 PR、issue、CI 與發布流程）——**這是給「已經有 repo、要追進度」的人用的，不是給「想從零生一個 repo」的人用的。**

如果你的目標就是「一句話生出一個 repo」，先去看 [把 Grok 接上 GitHub](/articles/grok-connect-github/)——同一天實測，免費版跑完全程。這篇則帶你把 ChatGPT 這條路也設定起來，並看懂它擅長什麼。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：同樣是「接上 GitHub」，兩家想的事情不一樣。Grok 那條像是找了個工讀生，你說一聲他就去把東西搬上架；ChatGPT 這條比較像請了個專案助理，強項是幫你盯著已經在跑的 PR、CI 有沒有紅燈。**先想清楚你要工讀生還是助理，再決定接哪一條。**

---

## 開始之前，你需要

- 一個 **GitHub 帳號**（還沒有的話先看[註冊 GitHub 帳號](/articles/github-account-signup/)）
- 一個 **ChatGPT 帳號**（免費版就能完成本文的設定步驟）

---

## Step 1：在側欄找到「外掛程式」

登入 [chatgpt.com](https://chatgpt.com)，看左側欄。除了「新對話」「資料庫」「專案」之外，有一項 **外掛程式**（有些介面顯示為 Apps／Connectors）。點它。

![ChatGPT 左側欄的「外掛程式」入口](/images/articles/chatgpt-connect-github/chatgpt-plugins-menu.jpg)

進去之後你會看到 **已安裝** 區塊，以及分類清單：Featured、Productivity、Creativity⋯⋯

---

## Step 2：在 Featured 裡找到 GitHub

**Featured** 區塊右欄第一個就是 **GitHub**，副標寫著 *Triage PRs, issues, CI, and publish flows*。

![ChatGPT 外掛程式頁面的 Featured 區塊，右欄第一個是 GitHub](/images/articles/chatgpt-connect-github/chatgpt-plugins-github.jpg)

點卡片本身（不是右邊那個 `+`）進入詳情頁。

---

## Step 3：看懂詳情頁在告訴你什麼

詳情頁把這個連接器的能力寫得很清楚，值得停下來看：

- **官方說明**：用 GitHub 來檢視 repo、審查 pull request、處理回饋、除錯失敗的 Actions checks，並透過「connector-first」的流程準備待審的程式碼變更。
- **應用程式**：GitHub、GitHub Enterprise（兩種）。
- **Skills**（技能）四個：**Review Follow-up**（追審查後續）、**CI Debug**（CI 除錯）、**GitHub**、**Publish Changes**（發布變更）。

![ChatGPT 的 GitHub 連接器詳情頁，顯示應用程式與四個 Skills](/images/articles/chatgpt-connect-github/chatgpt-github-connector.jpg)

**這四個 Skill 名稱就是它的定位聲明**：全部圍繞「一個已經在跑的專案」。裡面沒有任何一個叫「Create Repository」。

確定要裝，按右上角的 **安裝外掛程式**。

---

## Step 4：完成「與 GitHub 連線」授權

按下安裝後會跳出授權彈窗 **與 GitHub 連線**，開發者標示為 **OpenAI**。上面三段說明白話翻譯：

| 彈窗上的說明 | 白話 |
|---|---|
| **總是尊重權限** | ChatGPT 只會用你明確設定的權限，你可以隨時停用或撤銷 |
| **一切都在你的掌握之中** | 你的資料不會被拿去訓練模型；來自 GitHub 的資料只會用在提供你需要的回答 |
| **連接器可能會引入風險** | 連接器會尊重你的權限，但外部網站可能嘗試竊取你的資料——這是在提醒你注意 prompt injection 這類風險 |

彈窗下方還會出現 Google 的提示：建議你在 Google 帳戶或 ChatGPT 帳戶上啟用**多重要素驗證（MFA）**。連接器等於把外部服務的門打開，**這個建議值得照做**。

![ChatGPT 的「與 GitHub 連線」授權彈窗，開發者顯示為 OpenAI](/images/articles/chatgpt-connect-github/chatgpt-github-authorize.jpg)

按下 **繼續 GitHub**，接著在 GitHub 端完成授權（GitHub 會問你要開放哪些 repo、並可能要求 email 二次驗證）。授權完就回到 ChatGPT，連接器出現在「已安裝」。

---

## 🚨 常見錯誤與判斷

### 期待它幫你「從零建 repo」

這是最大的期待落差。這個連接器的設計目標是 **triage 與 review**：讀 repo、追 PR、看 CI 為什麼紅燈、準備待審的變更。**「開一個新 repo 並把檔案推上去」不在它宣傳的能力清單裡**，四個 Skills 也沒有涵蓋。

要這件事的話：走 [Grok 那條](/articles/grok-connect-github/)（免費版實測可以），或改用 ChatGPT 體系裡的 **Codex**（它在側欄是獨立一項，走的是另一套程式代理路線，需要對應的付費方案）。

### 用免費模型硬幹

實測免費版模型執行 GitHub 任務沒有成功跑完。連接器裝得起來 ≠ 任務跑得完——**能不能實際動手，跟你用的模型與方案有關。** 如果你評估後真的需要，這是要付費的功能，先想清楚值不值得。

### 授權時一次開放全部 repo

GitHub 授權頁可以選「全部 repo」或「只選特定 repo」。工作專案、客戶程式碼都在同一個帳號的話，**先只勾一個測試 repo**。要收回：GitHub → Settings → Applications → Installed GitHub Apps。

---

## 那我到底該用哪一條？

| 你想做的事 | 建議走 |
|---|---|
| 一句話生一個網站／小工具並上架 GitHub | **Grok 連接器**（[實測教學](/articles/grok-connect-github/)） |
| 追 PR 進度、看 CI 為什麼失敗、整理 issue | **ChatGPT 的 GitHub 連接器**（本篇） |
| 大量寫程式、改既有專案的程式碼 | **Codex**／專用的程式代理工具，付費方案 |
| 只是想把做好的靜態網站放上線 | 不需要 AI 連接器，直接看 [GitHub Pages 部署](/articles/deploy-to-github-pages/) |

---

## 下一步做什麼

1. **先確認你的需求屬於哪一格**（上面那張表），別為了「連起來很酷」而連——每多一個連接器，就多一份權限暴露。
2. **如果目標是「叫 AI 幫我上架」**：今天就去試 [Grok 接 GitHub](/articles/grok-connect-github/)，免費版十分鐘能跑完一次完整實驗。
3. **如果你已經有在跑的專案**：把 ChatGPT 連上，拿一個真的 PR 問它「這個 PR 改了什麼、有什麼風險」，用結果決定要不要留著。
4. **想懂連接器背後的共通機制**：看 [MCP 協定](/articles/mcp-protocol/)——理解這層，之後任何一家的「接工具」你都不會再迷路。
