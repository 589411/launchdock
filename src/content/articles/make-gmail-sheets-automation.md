---
title: "Make 自動化起手式：把 Gmail 新信自動存進 Google Sheets"
description: "用 Make（原 Integromat）零程式碼串起你的第一條自動化：Gmail 一收到新信，就自動把寄件者、主旨、內容寫成 Google 試算表的一列。這篇從挑選現成範本、授權 Google 連線、設定觸發與寫入模組，帶你把「Gmail → Sheets」跑起來——這也是之後加上 AI 自動分類的地基。"
contentType: "tutorial"
scene: "整合與自動化"
difficulty: "中級"
createdAt: "2026-07-18"
verifiedAt: "2026-07-18"
archived: false
order: 1
prerequisites: []
estimatedMinutes: 12
tags: ["Make", "自動化", "整合", "Gmail"]
stuckOptions:
  "挑選範本": ["找不到 Gmail to Sheets 範本", "範本要付費嗎？", "eu1／eu2 網址不一樣正常嗎？"]
  "授權 Google 連線": ["Sign in with Google 卡住", "它要很多 Gmail 權限，安全嗎？", "連線一直 Creating a connection"]
  "設定寫入試算表": ["Spreadsheet 找不到我的檔案", "欄位對應要怎麼填？", "Table contains headers 是什麼？"]
---

> **一句話**：在 [make.com](https://www.make.com) 用現成的「Save a Gmail email to Google Sheets」範本，授權你的 Google 帳號、設定 Gmail「Watch emails」觸發器、再把 Gmail 的欄位對應到 Google Sheets 的「Add a Row」，一條「新信自動存表」的自動化就跑起來了。

**關鍵字**：Make、Integromat、自動化、scenario、Gmail、Google Sheets、Watch emails、Add a Row、connection、模組、欄位對應

---

## Make 是什麼？跟寫程式差在哪？

**Make**（前身叫 Integromat）是一個**視覺化的自動化平台**：你不用寫程式，用「一個模組接一個模組」的方式，把不同服務串起來自動跑。一條這樣的流程叫一個 **scenario（情境）**。

這篇要做的第一條 scenario 很實用：**Gmail 每收到一封新信 → 自動把它的寄件者、主旨、內容整理成 Google 試算表的一列**。之後你就有一份「所有進信的清單」，還能接著加統計、加 AI 分類。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：Make 就像家裡的自動化開關組合——「一偵測到有人進門（Gmail 新信），就自動開燈（寫進 Sheets）」。你只要把「感應器」和「電器」用線接起來，剩下的它自己跑。而這條「線」，你用滑鼠拖就好，不用寫程式。

---

## Step 1：從現成範本開始（不要從零蓋）

登入 Make 後，左側選單點 **Templates（範本）**。範本是別人做好的 scenario，你直接套用、改幾個設定就能用，比從白紙開始快多了。

在範本庫搜尋 **Gmail** 或 **Sheets**，找到像 **「Save a Gmail email to Google Sheets as a new row」** 這種範本。

![Make 範本庫，眾多現成自動化範本](/images/articles/make-gmail-sheets-automation/make-templates-gallery.png)

點進範本，你會看到它預先畫好的流程圖：**Gmail「Watch Emails」→ Google Sheets「Add a Row」** 兩個模組。點 **「Start guided setup」（開始引導設定）** 或 **Create new scenario from template**。

![Gmail → Google Sheets 範本，兩個模組的流程](/images/articles/make-gmail-sheets-automation/make-gmail-sheets-template.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：從範本開始就像買半成品家具——框架都組好了，你只要鎖上自己的螺絲（填你的 Gmail、你的試算表）。何必自己從一塊木頭開始刨？

### 🚨 網址是 eu1／eu2／us1 開頭，正常嗎？

正常。Make 依你的帳號所在區域，網址開頭會不一樣（`eu1.make.com`、`eu2.make.com`…）。跟著你自己帳號的網址走就好，不用管教學截圖裡是哪一個。

---

## Step 2：設定 Gmail 觸發器「Watch emails」

流程的第一個模組是 **Gmail「Watch emails」**——它是**觸發器（Trigger）**，負責「盯著」你的信箱，一有符合條件的新信就啟動整條流程。

點這個模組，它會問你 **「Choose where to start」（從哪個時間點開始處理）**，選 **From now on（從現在起）** 最單純——只處理之後進來的新信，不會把你信箱幾千封舊信全撈進來。

![Gmail Watch emails 觸發器，選擇從現在起處理](/images/articles/make-gmail-sheets-automation/make-gmail-watch-emails.png)

---

## Step 3：授權 Google 連線（Sign in with Google）

第一次用 Gmail 模組，Make 會要你建立一個到 Google 的 **connection（連線）**：

1. 幫連線取個名字（預設像 "My Google connection"）。
2. 點 **Sign in with Google**。
3. 在跳出的 Google 視窗選你的帳號、看過權限說明後同意。

![建立 Google 連線，點 Sign in with Google](/images/articles/make-gmail-sheets-automation/make-create-google-connection.png)

授權時 Google 會列出 Make 要的權限（例如「讀取、撰寫 Gmail」）——這是自動化讀信、寫信必要的權限，確認是官方 Make 應用後同意即可。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：授權 Gmail 權限有點嚇人，但想想——你要請一個助理幫你「看信、分類、記帳」，總得給他開信箱的鑰匙吧？重點是確認這個助理是你信任的（官方 Make），而且鑰匙隨時能收回（Google 帳號 → 安全性 → 第三方存取，隨時可撤銷）。

### 🚨 連線一直卡在「Creating a connection...」？

- 確認 Google 視窗有跳出來（有時被瀏覽器擋成彈窗）。
- 若你的 Gmail 是個人帳號、且要用到比較敏感的權限，Google 可能會要求更嚴格的驗證——這時就需要自己建一個 Google Cloud 專案 + OAuth 用戶端。那是進階路徑，另見文章〈Google Cloud：建專案、啟用 API、設定 OAuth 同意畫面〉。

---

## Step 4：設定 Google Sheets 寫入模組「Add a Row」

第二個模組 **Google Sheets「Add a Row」** 負責把資料寫成試算表的一列。點它，填：

- **Connection**：用剛剛建好的 Google 連線。
- **Search Method**：`Search by path`（用路徑找檔案）。
- **Drive / Spreadsheet Name / Sheet Name**：選你要寫入的雲端硬碟、試算表檔案、工作表（例如 `工作表1`）。
- **Table contains headers**：`Yes`（你的試算表第一列是欄位標題）。

![Google Sheets Add a Row 模組設定](/images/articles/make-gmail-sheets-automation/make-sheets-add-row.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：先在 Google 試算表開一個檔案、第一列打好欄位標題（例如 `日期`、`寄件者`、`主旨`、`內容`），Make 才知道要往哪幾欄塞資料。**先備好表，再回來設模組**，順很多。

---

## Step 5：把 Gmail 欄位對應到試算表欄位

這是最關鍵、也最好玩的一步——**欄位對應（mapping）**。

在 Add a Row 模組的 **「Values in columns」** 區，點某一欄的輸入框，Make 會跳出一個下拉面板，列出上一個 Gmail 模組能輸出的所有資料：**Subject（主旨）、From（寄件者）、Date（日期）、Full text（內文）、Snippet（摘要）…**。你要哪個資料進哪一欄，就點它——它會變成一個帶顏色的「標籤」塞進去。

![把 Gmail 的輸出欄位對應到 Sheets 的欄位](/images/articles/make-gmail-sheets-automation/make-field-mapping.png)

例如：把 Gmail 的 **Subject** 拖到試算表的「主旨」欄、**From** 拖到「寄件者」欄、**Full text** 拖到「內容」欄。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：欄位對應就像接水管——上游（Gmail）流出「主旨、寄件者、內文」這些水，你要決定每一股水接到下游（Sheets）的哪個水龍頭。接對了，資料就會乖乖流到對的格子裡。

---

## Step 6：完成！看看你的第一條 scenario

兩個模組都設好後，畫布上就是一條完整的流程：**Gmail「Watch emails」→ Google Sheets「Add a Row」**。

底部有 **「Run once」** 可以手動跑一次測試（先寄一封測試信給自己，再按 Run once，看試算表有沒有多一列）。確認沒問題後，把左下角的排程打開（例如「Every 15 minutes」），這條自動化就會自己持續跑了。

![完成的 Gmail → Sheets scenario 流程總覽](/images/articles/make-gmail-sheets-automation/make-scenario-overview.png)

---

## 接下來：讓 AI 幫你自動分類

現在你有一條「新信自動存表」的流程了。但如果信很多，光是存下來還不夠——你會想知道**每封信是客服？業務？還是垃圾信？**

這正是加一個 AI 模組的時機：在 Gmail 和 Sheets 中間，插一個 LLM，讓它讀信、自動貼分類標籤，再一起寫進試算表。作法見下一篇：〈在 Make 用 LLM 自動分類 Gmail 信件〉。而 AI 模組需要的金鑰，見〈OpenRouter 註冊教學〉。

---

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編最後叮嚀**：第一條自動化最容易卡在兩個地方——① **Google 連線授權**（個人帳號遇到嚴格驗證，就得走 GCP OAuth 那條路）；② **欄位對應沒接對**（跑出來的表格空空的）。先用 Run once 手動測，確認一列資料正確落地，再開排程。別一次就開自動、然後跑一堆錯的。
