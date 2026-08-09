---
title: "Google Colab 新手教學：Drive 的 .ipynb 打不開？裝好 Colab 就能按 ▶ 跑程式"
description: "別人分享一個 .ipynb 檔給你，在 Google 雲端硬碟點開卻只看到「無法預覽」和一顆下載鈕？這篇從「連結更多應用程式」裝上 Google Colaboratory 開始，帶你走完授權、用 Colab 開檔、認識一格一格的程式碼、按 ▶ 執行、看懂輸出、拉滑桿改參數、下載結果。全程不用寫一行程式，也不用在自己電腦裝 Python。"
contentType: "tutorial"
scene: "環境準備"
difficulty: "入門"
createdAt: "2026-08-09"
verifiedAt: "2026-08-09"
archived: false
order: 4
prerequisites: []
estimatedMinutes: 12
tags: ["Colab", "Google", "Python", "安裝", "設定"]
modules: [M07, M03]
stuckOptions:
  "無法預覽": ["為什麼 .ipynb 點開只有下載鈕？", "一定要裝東西才能看嗎？", "下載下來能用什麼開？"]
  "安裝 Colaboratory": ["Marketplace 找不到 Colaboratory", "安裝要付費嗎？", "授權會讓對方看到我的檔案嗎？"]
  "執行程式碼": ["出現「並非由 Google 編寫」的警告", "按了 ▶ 沒反應／一直轉", "紅字 NameError 怎麼辦？"]
  "公司帳號": ["公司 Google 帳號打不開 Colab", "要不要改用個人 Gmail？", "管理員鎖住怎麼辦？"]
---

> **一句話**：`.ipynb` 在 Google 雲端硬碟預設打不開，因為你的 Google 帳號還沒裝「Google Colaboratory」這個應用程式——在「無法預覽」畫面點 **選擇開啟工具 → 連結更多應用程式**，到 Workspace Marketplace 搜 **Colaboratory** 按安裝並授權，之後這個檔案就能用 Colab 開，滑鼠移到程式碼左邊按 **▶** 一格一格跑。

**關鍵字**：Google Colab、Colaboratory、.ipynb、無法預覽、連結更多應用程式、Workspace Marketplace、雲端硬碟、Jupyter Notebook、執行階段、全部執行、Run all、並非由 Google 編寫、Python

---

## 什麼是 Google Colab？為什麼 `.ipynb` 需要它

`.ipynb` 是 **Notebook 檔**：一份把「說明文字」和「可以執行的程式碼」交錯放在一起的文件。它不像 PDF 是死的——每一段程式碼旁邊都有一顆播放鈕，你按下去，它就在雲端跑一次，把結果（數字、表格、圖）印在那段程式碼的下方。

**Google Colab**（全名 Google Colaboratory）就是 Google 提供的免費線上執行環境，專門用來開這種檔。它的好處對新手很實際：

- **不用在自己電腦裝 Python**。程式跑在 Google 的機器上，你只要有瀏覽器。
- **不用寫程式也能用**。別人把程式碼寫好給你，你負責按 ▶、看結果、改改參數。
- **免費**，用你現成的 Google 帳號就行。

麻煩只在最開始那一步：Google 雲端硬碟**預設不會**幫你打開 `.ipynb`，得先讓帳號認識 Colab。這篇就是在解決這一步。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：這件事就像手機收到一個 `.psd` 檔——檔案沒壞，是你手機裡沒有能開它的 App。Drive 對 `.ipynb` 的反應一模一樣：先去「商店」把 Colab 裝起來，檔案自己就活了。

---

## Step 1：在雲端硬碟找到那個 `.ipynb`

別人分享檔案給你，通常在 Google 雲端硬碟左側的 **與我共用** 裡（如果是自己上傳的，就在「我的雲端硬碟」）。找到那個 `.ipynb` 檔。

![Google 雲端硬碟「與我共用」資料夾裡的 .ipynb 檔案](/images/articles/google-colab-guide/drive-shared-ipynb.png)

---

## Step 2：點開它，你會先卡在「無法預覽」

雙擊檔案，Drive 會給你一個很讓人洩氣的畫面：正中央寫著 **無法預覽**，底下只有一顆藍色的 **下載** 鈕。

**這不是檔案壞了**，也不用真的去下載。你只是還缺一個能開它的應用程式。

![Google 雲端硬碟顯示「無法預覽」，只有一顆下載按鈕](/images/articles/google-colab-guide/ipynb-cannot-preview.png)

---

## Step 3：選擇開啟工具 → 連結更多應用程式

看畫面**右上角**，有一顆 **選擇開啟工具** 的下拉鈕。點它，選單裡會有兩個選項：

- 在新分頁中開啟
- **連結更多應用程式**  ← 點這個

![點開「選擇開啟工具」下拉選單，選擇「連結更多應用程式」](/images/articles/google-colab-guide/open-with-connect-more-apps.png)

---

## Step 4：在 Workspace Marketplace 搜尋 Colaboratory

會跳出 **Google Workspace Marketplace** 的視窗。在上方搜尋框輸入 `Colaboratory`——其實打個 `c` 它就會跳出建議，第一個就是。

![在 Google Workspace Marketplace 搜尋框輸入 c，下拉建議第一項是 Colaboratory](/images/articles/google-colab-guide/marketplace-search-colaboratory.png)

搜尋結果第一張卡片就是官方的 **Colaboratory**（作者顯示 Colaboratory team，圖示是黃色的 `CO`，評分約 4.7、安裝數 9000 萬以上）。認這張卡片，別點到旁邊那些翻譯工具。

點卡片右下角的 **安裝**。

![Marketplace 搜尋結果中的 Colaboratory 卡片與安裝按鈕](/images/articles/google-colab-guide/colaboratory-install.png)

---

## Step 5：授權安裝

跳出 **可以開始安裝了** 的小視窗，說明「Colaboratory」需要由你授權安裝。點 **繼續**。

![「可以開始安裝了」的授權確認視窗](/images/articles/google-colab-guide/colaboratory-authorize-install.png)

接著是熟悉的 Google 帳號授權頁：**登入「Google Colaboratory」**，列出它會拿到的個人資訊（你的名稱、個人資料照片、電子郵件地址）。確認上面顯示的是你想用的那個帳號，然後點 **繼續**。

![Google 帳號授權頁面，列出 Colaboratory 將取得的個人資訊](/images/articles/google-colab-guide/google-account-consent.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：這裡授權的是「Google 官方的 Colab 服務」，不是分享檔案給你的那個人。他不會因此看到你的 Drive；他只看得到他自己那個檔案。

---

## Step 6：回到 Drive，這次用 Colab 開啟

裝完回到剛剛那個「無法預覽」畫面，你會看到三個地方變了：

1. 多了一顆 **連結更多應用程式…** 旁的選項
2. 下方出現 **已連結的應用程式：Google Colaboratory**
3. **右上角的按鈕變成「使用『Google Colaboratory』開啟」**

點右上角那顆，檔案就會在新分頁用 Colab 開起來。

![Drive 畫面下方出現「已連結的應用程式：Google Colaboratory」，右上角變成「使用 Google Colaboratory 開啟」](/images/articles/google-colab-guide/colab-connected.png)

**這一步只需要做一次。**之後你帳號裡任何 `.ipynb`，雙擊都會直接用 Colab 打開。

---

## Step 7：認識 Colab 畫面——程式碼是「一格一格」的

檔案開起來後，先認三個地方：

- **左側「目錄」**：這份 Notebook 的章節，點一下可以跳著看。
- **中間內容區**：說明文字與程式碼交錯排列。每一塊灰底的程式碼叫一個**儲存格**（cell）。
- **右上角「連線」**：顯示你有沒有連上 Google 的運算機器。按第一次 ▶ 時它會自動連。

**怎麼按 ▶**：把滑鼠移到儲存格**左邊**，會浮出一顆圓形的 ▶，點它就執行這一格。

本文示範的這份檔案是一個「環境自我檢查」的小練習，分成幾個關卡：能不能跑程式、讀不讀得到資料、畫不畫得出圖。你只要從上往下，每一格按一次 ▶。

### 🚨 出現「警告：這個筆記本並非由 Google 編寫」

第一次按 ▶ 幾乎都會跳這個警告，寫著「這個筆記本是由 ⟨某人的 email⟩ 所編寫，可能會要求存取你儲存在 Google 的資料……」。

這是**正常的**。只要檔案是你信任的人給你的，點 **仍要執行**。

Google 只是在提醒你：別人寫的程式碼會在你的帳號權限下跑。所以反過來說——**來源不明的 `.ipynb` 不要隨便按執行**，這個警告是有意義的。

![Colab 跳出「警告：這個筆記本並非由 Google 編寫」，右下角有「仍要執行」](/images/articles/google-colab-guide/warning-not-authored-by-google.png)

---

## Step 8：第一格跑完長什麼樣

按下去之後：

- 左邊的 `[ ]` 會變成 **`[1]`**（代表這是這次連線中第 1 個被執行的格子），下面顯示花了幾秒。
- 出現一個 ✅ 的綠色勾勾。
- **輸出直接印在程式碼下方**——這個例子印出了 Python 與套件版本：`Python 3.12.13 | pandas 2.2.2 | numpy 2.0.2`。
- 右上角從「連線」變成 **RAM／磁碟** 的用量條，代表機器已經在跑了。

第一格通常比較慢（10–30 秒），因為它要先幫你開一台雲端機器。之後就快了。

![第一個儲存格執行成功，下方印出 Python 與 pandas、numpy 版本](/images/articles/google-colab-guide/first-cell-success.png)

繼續往下按，每一格的結果都會長在自己下面。這個例子的第二格讀進四份資料，並印出各自的筆數。

![第二個儲存格執行後，下方印出讀取到的資料筆數](/images/articles/google-colab-guide/cell-output-below-code.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：`[1]`、`[2]` 這些編號不是「第幾格」，是「**第幾個被你按的**」。所以你跳著按，編號就會亂跳——這也是為什麼下面要講「照順序跑」。

---

## Step 9：不用改程式碼，也能改參數（表單滑桿）

Colab 有個對新手非常友善的功能：**表單**。寫程式的人可以把某個數字做成一根滑桿，你直接拉，不用碰程式碼。

這個例子的滑桿叫「你想看幾家店」。拉到 6、按 ▶，下面就畫出前 6 家店的長條圖，並印出「✅ 圖畫得出來，而且滑桿有作用（你選了 6 家店）」。

![拉動「你想看幾家店」滑桿到 6，下方畫出 Top 6 stores 長條圖](/images/articles/google-colab-guide/form-slider-chart.png)

想知道滑桿背後是什麼？點 **顯示程式碼**，就會看到那行帶著 `#@param {type:"slider", min:1, max:6, ...}` 的註解——這就是把變數變成滑桿的魔法。看不懂沒關係，看一眼就好。

![點「顯示程式碼」展開滑桿背後的 #@param 設定](/images/articles/google-colab-guide/show-code-behind-form.png)

**關鍵觀念：改完參數要再按一次 ▶。**滑桿本身不會自動重跑。把它拉到 2、再按 ▶，標題就變成 Top 2，圖也只剩兩根。

![滑桿改成 2 並重新執行後，圖表變成 Top 2 stores](/images/articles/google-colab-guide/slider-changed-chart.png)

---

## Step 10：下載結果檔案時的權限彈窗

如果 Notebook 會產出檔案（名單、報表、圖），跑完那格時瀏覽器左上角可能跳出一個彈窗，問你某個 `colab.googleusercontent.com` 網址「**要求下列權限：下載多個檔案**」。

點 **允許**，檔案才會進你的「下載」資料夾。點了封鎖就什麼都不會出現，很多人會以為程式壞了。

![瀏覽器詢問是否允許「下載多個檔案」的權限彈窗](/images/articles/google-colab-guide/download-multiple-files-permission.png)

---

## 🚨 常見狀況與解法

### 公司帳號打不開 Colab——最容易踩、也最難當場救的一坑

如果你用的是**公司／學校的 Google Workspace 帳號**，管理員有機會把 Colab 這類第三方應用程式整個停用。症狀是 Marketplace 裝不起來、或裝了但開檔還是失敗。

**解法：改用個人 Gmail。**用個人帳號重新開這個檔案（請對方把檔案也分享給你的個人 Gmail），通常就好了。

這件事**最好在你真正需要用它之前先試一次**。等到要交東西的那天才發現帳號被鎖，是來不及處理的——這也是為什麼很多課程會發一份「暖身檔」叫你先跑一遍。

### 紅字 `NameError`：沒照順序跑

Notebook 的格子之間會互相依賴——後面那格要用前面那格算出來的東西。你跳著按，後面就會噴 `NameError: name 'xxx' is not defined`。

**解法**：上方選單 **執行階段 → 全部執行**（Runtime → Run all），從頭跑一次。八成的紅字這樣就解決了。

### 放太久回來，變數都不見了

Colab 的機器閒置一段時間會自動回收。回來時程式碼還在（存在 Drive 裡），但**執行結果和變數都清空了**。

**解法**：一樣是 **執行階段 → 全部執行**。這不是壞掉，是設計如此。

### 我的修改會存到哪？

檔案存在 **Drive**，不在你電腦裡。如果檔案是別人分享給你的，而你只有「檢視」權限，改動就存不回去——Colab 會提示你用 **檔案 → 在雲端硬碟中儲存副本**，存一份自己的來改。

### 找不到「選擇開啟工具」

那顆鈕只在**檔案的預覽畫面**才有。如果你只是在檔案清單裡點一下選取，不會出現。**雙擊**檔案進到「無法預覽」那個畫面，右上角就有了。

---

## 你現在會了什麼

- 讓 Google 帳號認識 Colab（一次性設定），之後任何 `.ipynb` 雙擊即開
- 看懂 Colab 的「一格一格」：按 ▶、看 `[1] [2]` 編號、輸出印在下方
- 「並非由 Google 編寫」的警告是什麼，什麼時候該點「仍要執行」
- 用表單滑桿改參數，並記得**改完要重跑**
- 卡住時的萬用解：**執行階段 → 全部執行**

下一步想自己找資料來練手，可以先去開一個 [Kaggle 帳號](/articles/kaggle-account-signup/)——上面有大量免費資料集，而且同樣能在雲端跑 Notebook。
