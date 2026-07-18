---
title: "用 Looker Studio 上傳 CSV 做資料分析：從連接器到資料來源"
description: "Google 免費的 Looker Studio（原 Data Studio，現又叫「數據分析」）可以直接上傳 CSV 檔案變成互動式儀表板。這篇帶你走完最關鍵的第一步：選「上傳 CSV 檔案」連接器、授權 Google Cloud Storage、建立資料集、上傳檔案並確認欄位結構，為之後做圖表打好地基。"
contentType: "tutorial"
scene: "知識與進階"
difficulty: "中級"
createdAt: "2026-07-18"
verifiedAt: "2026-07-18"
archived: false
order: 1
prerequisites: []
estimatedMinutes: 8
tags: ["Looker Studio", "Google", "資料分析", "設定"]
modules: [M07]
stuckOptions:
  "找不到上傳 CSV 的選項": ["連接器列表太多找不到", "為什麼要授權 Google Cloud Storage？", "CSV 有大小限制嗎？"]
  "上傳後欄位怪怪的": ["數字被當成文字", "日期沒被辨識", "有一欄整個空白"]
  "接下來怎麼做圖表": ["按了「連結」之後呢？", "資料來源和報表差在哪？", "可以換資料重新上傳嗎？"]
---

> **一句話**：在 [Looker Studio](https://lookerstudio.google.com)（數據分析）點「建立 → 資料來源」，選「上傳 CSV 檔案」連接器、授權一次 Google Cloud Storage，建立一個資料集、把 CSV 拖進去，確認欄位結構後點「連結」，你的 CSV 就變成可做圖表的資料來源了。

**關鍵字**：Looker Studio、數據分析、Data Studio、上傳 CSV、連接器、資料來源、資料集、Google Cloud Storage、欄位結構、schema

---

## Looker Studio 是什麼？為什麼用它分析 CSV？

**Looker Studio** 是 Google 免費的資料視覺化工具（它有點名字焦慮：早年叫 Data Studio，現在介面上又標成「數據分析」，都是同一個東西）。你可以把資料接進來，用拖拉的方式做出互動式的圖表、儀表板，還能分享給別人看。

它能接很多資料來源（Google 試算表、BigQuery、Google Analytics…），但最單純、最適合新手的，就是**直接上傳一個 CSV 檔案**。手上有一份 Excel/CSV 想快速看出趨勢？這是最短路徑。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：如果 Excel 是你自己在廚房切菜，那 Looker Studio 就是把菜端上桌、擺盤漂亮給客人看的那道工序。同一份資料，Excel 適合你自己算，Looker Studio 適合做成別人一眼看懂的儀表板。

這篇的範例會上傳一份咖啡廳銷售資料（`dirty_cafe_sales.csv`），走完「把 CSV 變成資料來源」這段。做出圖表是下一篇的事，但地基就在這裡。

---

## Step 1：進 Looker Studio 首頁

打開 [lookerstudio.google.com](https://lookerstudio.google.com)，用你的 Google 帳號登入。首頁（現在標題寫「數據分析」）左邊是導覽列：**建立、最近、與我共用、我擁有的項目、範本**…；中間是「開始使用」的三張大卡：**建立報表 / 透過對話分析資料 / 瞭解數據分析**，下面則列出你最近開過的報表和資料來源。

![Looker Studio（數據分析）首頁，左側導覽與最近項目](/images/articles/looker-studio-csv-analysis/looker-home.png)

---

## Step 2：建立一個新的資料來源

點左上角的 **「建立」** 按鈕，選單會展開 **報表 / 對話 / 資料來源 / 多層檢視**。我們要的是 **資料來源**。

![「建立」選單展開，選擇「資料來源」](/images/articles/looker-studio-csv-analysis/looker-connectors.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：**資料來源**是「食材」，**報表**是「做好的菜」。你得先把食材（資料）備好，才能開始炒菜（做圖表）。這篇專心把食材備好。

進到「未命名的資料來源」頁面後，會看到一整排 **Google 連接器（Connectors）**：Looker、Google Analytics、Google Ads、Google 試算表、BigQuery、AppSheet、Microsoft Excel…每一個都是一種資料的接法。

---

## Step 3：選「上傳 CSV 檔案」連接器

在連接器列表裡找到 **「上傳 CSV 檔案」**（開發者標示 Google，說明是「連結至 CSV（逗號分隔值）檔案」）。點它。

![連接器列表中的「上傳 CSV 檔案」](/images/articles/looker-studio-csv-analysis/looker-csv-connector.png)

### 🚨 連接器太多，找不到「上傳 CSV」？

連接器列表預設會先秀 Google 自家的熱門連接器（BigQuery、Analytics…）。上傳 CSV 的圖示排得比較後面，用頁面上方的**搜尋框**打「CSV」最快，或往下捲一點就會看到。

---

## Step 4：授權 Google Cloud Storage（只要一次）

第一次用 CSV 連接器時，Looker Studio 會告訴你：**「數據分析需要將您的資料上傳至 Google Cloud Storage，請提供您的授權」**，並要你點 **授權**。

這是因為你的 CSV 檔案其實會被存到 Google 的雲端儲存空間（每個帳號有 2 GB 免費額度）。點授權後，會跳出 Google 帳號選擇視窗，選你的帳號、同意即可。**這個授權只要做一次**，之後再上傳 CSV 就不會再問了。

![CSV 連接器的授權畫面，要求授權 Google Cloud Storage](/images/articles/looker-studio-csv-analysis/looker-authorize-gcs.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：這一步像是你把行李寄放到置物櫃——Looker Studio 需要一個地方放你的 CSV，那個地方就是 Google Cloud Storage。授權等於給它一把置物櫃的鑰匙，之後它就自己會放好。

---

## Step 5：建立資料集、上傳 CSV

授權完，會看到一個三欄的工作區：**資料集 / 檔案 / 架構**。

1. 先在左邊 **資料集** 欄點 **「+ 建立資料集」**，幫這批資料取個名字（範例取名 `cafe`），點 **Continue**。

   ![建立資料集，命名為 cafe](/images/articles/looker-studio-csv-analysis/looker-create-dataset.png)

2. 接著在中間 **檔案** 欄點 **「+ 新增檔案」**，或直接把 CSV 檔拖進去。單一資料集最大 100 MB。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **換句話說**：**資料集**是一個資料夾，**檔案**是放進去的 CSV。同一個資料集可以放多個結構相同的 CSV，它們會自動合併——像把好幾個月的銷售報表疊在一起看。

---

## Step 6：確認欄位結構，按「連結」

檔案上傳後，右邊 **架構（Schema）** 欄會列出 Looker Studio 自動辨識出來的欄位。以範例的咖啡廳銷售資料為例，它抓到了：Transaction ID、Item、Quantity、Price Per Unit、Total Spent、Payment Method、Location、Transaction Date。

確認欄位沒問題後，點右上角的 **「連結」**，這個 CSV 就正式變成一個可以拿去做報表的資料來源了。

![上傳完成，右側顯示自動辨識的欄位結構](/images/articles/looker-studio-csv-analysis/looker-schema-preview.png)

### 🚨 數字被當成文字、日期沒被辨識？

CSV 沒有型別資訊，Looker Studio 用猜的。若某個金額欄被當成「文字」、或日期沒被認成「日期」，**先別急著做圖**——在資料來源的欄位列表裡，把那一欄的型別手動改成「數字」或「日期」。範例檔名叫 `dirty_cafe_sales`（髒資料）就是在提醒你：真實世界的資料常常需要先清一清、對一對型別，圖才畫得出來。

---

## 完成了！接下來呢？

到這裡，你已經把一個 CSV 變成 Looker Studio 的**資料來源**。下一步就是：

1. 回到 **建立 → 報表**，選這個資料來源。
2. 拉一張表格或長條圖，把欄位（例如 Item、Total Spent）拖上去。
3. Looker Studio 會即時算給你看——哪個品項賣最好、哪個門市營收最高，一目了然。

資料來源是地基，報表是樓房。地基打好了，蓋樓就快了。

---

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編最後叮嚀**：很多人卡在「資料上傳不進去」，其實九成是卡在 Step 4 的 Google Cloud Storage 授權沒點、或 CSV 編碼／欄位有問題。記住這條路徑：建立 → 資料來源 → 上傳 CSV → 授權 → 建資料集 → 上傳 → 連結。走順一次，之後就是反射動作了。
