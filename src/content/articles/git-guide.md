---
title: "Git 是什麼？零基礎版本控制教學：讓 CLI 工具替你下指令，推上 GitHub 兩台電腦同步"
description: "不用背指令也能開始用 Git。這篇先把觀念講清楚：Git 跟雲端硬碟差在哪、Git 跟 GitHub 差在哪、檔案怎麼從「工作區」一路走到 GitHub。然後帶你用 CLI 工具（含 Claude Code 這類 AI 指令列助手）從零建立第一個版控專案、推上 GitHub、在第二台電腦接著做。附 AI 時代的三條紅線與六個常見錯誤。"
contentType: "guide"
scene: "環境準備"
difficulty: "入門"
createdAt: "2026-09-02"
verifiedAt: "2026-09-02"
archived: false
order: 2
prerequisites: ["cli-guide", "github-account-signup"]
estimatedMinutes: 15
tags: ["Git", "GitHub", "設定", "整合", "安裝"]
modules: ["M02"]
stuckOptions:
  "Git 是什麼": ["我有雲端硬碟了，還需要 Git 嗎？", "Git 跟 GitHub 是同一個東西嗎？", "我不寫程式，也用得到嗎？"]
  "四個地方": ["為什麼要多一個暫存區？", "commit 跟 push 差在哪？", "commit 完但還沒 push，別台看得到嗎？"]
  "動手建立版控": ["git init 之後要做什麼？", "gh 指令說找不到／沒登入", "push 的時候一直要我輸入密碼"]
  "讓 AI 下指令": ["我可以完全不看指令嗎？", "AI 會不會把我的東西刪掉？", "commit 訊息可以叫 AI 寫嗎？"]
  "兩台電腦同步": ["push 被拒絕怎麼辦？", "衝突（conflict）出現了怎麼讀？", "我忘記先 pull 了，來得及嗎？"]
---

> **一句話**：Git 是幫你的專案「存檔點」的工具，存在你自己電腦上；GitHub 是把這些存檔點放一份到雲端、讓另一台電腦也拿得到。2026 年你幾乎不用背指令——CLI 工具會替你下——但你必須看得懂它做了什麼，因為現在把事情做壞的速度也變快了 100 倍。

**關鍵字**：Git、版本控制、Git 教學、Git 是什麼、git init、git add、git commit、git push、git pull、git status、GitHub、gh CLI、Claude Code、clone、rebase、衝突 conflict、.gitignore、.env 外洩

---

## 為什麼 2026 年學 Git，重點跟五年前不一樣

五年前教 Git，重點是「背指令」。現在你打開終端機，跟 [Claude Code](/articles/cli-guide/) 這類 AI 指令列助手說一句「幫我把這次的修改存起來」，它就把 `git add`、`git commit`、`git push` 全下完了。指令這關，AI 幫你過了。

但同時，另一件事變嚴重了：

**AI 一次改 12 個檔案，只要 20 秒。**

以前你手動改東西，改壞了按 Cmd+Z 還救得回來——因為你一次只改一個地方。現在你說「幫我把登入流程改成用 Google」，它同時動了 8 個檔案、刪了 2 個、新增了 3 個。跑起來壞了，你想回到「20 秒前那個還能跑的版本」：

- Cmd+Z 救不回來（跨檔案、跨終端機，編輯器的復原堆疊管不到）
- 雲端硬碟救不回來（它已經同步了「壞掉的版本」上去）
- 叫 AI 改回來？它也只是再猜一次，猜出來的不會跟原本一模一樣

**這就是為什麼「觀念」比五年前更重要，而不是更不重要。** 指令可以外包，判斷不行——「該回到哪一個存檔點」「這次要存的是哪幾個改動」「這行指令會不會把東西弄不見」，這三件事只有你能決定。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：想像你請了一個手速超快的助理，他可以在 20 秒內重新裝潢你整個房間。你需要的不是學會怎麼搬沙發，而是**在他動手前先拍一張照**。Git 就是那台自動拍照的相機。

---

## 先講清楚：Git 到底在解決什麼問題

你一定看過這種資料夾：

```text
提案.docx
提案_修改版.docx
提案_修改版2.docx
提案_final.docx
提案_final_真的最後.docx
提案_final_真的最後_改老闆意見.docx
```

這就是「土法煉鋼版的版本控制」。它會失敗，不是因為醜，而是因為三件事你做不到：

1. **回不去**：三天後你想回到「加老闆意見之前」那一版——是哪一個檔？
2. **看不出差在哪**：`final` 跟 `final_真的最後` 到底差什麼？只能兩個視窗並排用眼睛找。
3. **兩個人／兩台電腦一起動就爆炸**：你改 `final`，同事改 `final_真的最後`，然後呢？

Git 就是把這三件事自動化：**每次存檔點都留著、每次差異都算得出來、兩邊的改動能合起來。**

### 跟雲端硬碟差在哪？（最多人搞混的一題）

雲端硬碟（Google Drive、iCloud、Dropbox）做的是**同步**：讓每台裝置看到「現在這一刻」的同一份檔案。Git 做的是**歷史**：留下你主動宣告的每一個存檔點。

![雲端硬碟只保留現在這一刻，Git 保留一連串可以跳回去的存檔點](/images/articles/git-guide/save-points-vs-cloud-drive.svg)

關鍵差別在「**主動宣告**」四個字。雲端硬碟是你一存檔它就同步，包含你打錯的那一秒；Git 是**你說「這個狀態值得記下來」它才記**——所以你的歷史裡每一格都是有意義的，不是雜訊。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：雲端硬碟像監視器，一直錄但你不會想回去看；Git 像遊戲存檔點，是你打完一關、覺得「這裡安全」才按下去的。差別不在技術，在**誰決定什麼時候值得記一筆**。

---

## Git ≠ GitHub（第二多人搞混的一題）

| | Git | GitHub |
|---|---|---|
| 是什麼 | 裝在你電腦上的一支程式 | 一個網站／雲端服務 |
| 在哪 | 你的硬碟裡（`.git` 資料夾） | 別人的伺服器上 |
| 沒網路 | 照常用，存檔、回溯都不受影響 | 完全用不了 |
| 誰做的 | Linux 之父 Linus Torvalds，2005 年 | 一家公司（現屬微軟） |
| 花錢嗎 | 免費、開源 | 個人使用免費 |
| 它負責 | 記錄歷史 | 存放一份拷貝＋協作介面 |

**用得到的比喻**：Git 是你家裡的相簿，GitHub 是你把相簿備份一份放在雲端相片服務。相簿在你家就完整可用；放雲端是為了「換一台裝置也拿得到」跟「給別人看」。

同類服務還有 GitLab、Bitbucket——**都是放 Git 倉庫的地方**，換一家不影響你會的 Git 指令。所以這篇教的東西不會綁死在 GitHub 上。

---

## 四個地方，三個指令（唯一需要記的觀念）

這是整篇最值得你花三分鐘的地方。Git 的所有困惑，八成來自「不知道東西現在在哪一格」。

![檔案從工作區、暫存區、本地倉庫到遠端倉庫的四個位置與對應指令](/images/articles/git-guide/git-four-places.svg)

| 位置 | 白話 | 進去的指令 |
|---|---|---|
| ① 工作區 | 你正在編輯的那些檔案，資料夾裡看得到的 | （你直接改）|
| ② 暫存區 | 「這次存檔要包含哪幾個改動」的挑揀台 | `git add` |
| ③ 本地倉庫 | 存檔點正式成立，從此回得去 | `git commit` |
| ④ 遠端倉庫 | GitHub 上的同一份拷貝，別台電腦拿得到 | `git push` |

三個地方在你電腦裡（①②③），**沒網路一樣能做完**。只有第 ④ 格需要網路。

### 為什麼要多一個「暫存區」？看起來很多餘

新手最常問這題。答案在 AI 時代特別有感：

你叫 AI 修一個 bug，它順手也調整了設定檔、格式化了三個檔案。現在你想存檔——但你只想把「修好的 bug」記成一筆，設定檔那個改動你還沒想清楚要不要留。

暫存區就是這個用途：**你挑哪些改動進這次存檔點，剩下的留在工作區繼續放著。**

```bash
git add src/login.js          # 只挑這一個檔進暫存區
git commit -m "fix: 修好登入按鈕沒反應"
# 其他改動還原封不動在工作區，下次再處理
```

如果你圖快，`git add .` 是「把全部改動一次丟進去」——很方便，但那正是「不小心把 `.env` 金鑰 commit 進去」的頭號原因（後面 🚨 那段會講）。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：暫存區是你的守門員。AI 一次改 12 個檔案時，這一格決定的是「這 12 個裡面，哪幾個算同一件事」。守門員不站好，你的歷史就會變成 12 件事混成一筆，之後要回退時你會恨自己。

---

## 一個 commit 應該多大？

規則只有一句：**一個 commit ＝ 一句話講得完的一件事。**

- 「修好登入按鈕沒反應」✅ 一件事
- 「改了登入、順便換首頁配色、還升級了三個套件」❌ 三件事，該切三個 commit

為什麼要切開？因為 commit 是你的**回退顆粒度**。三件事混一筆，之後發現配色要退回去，你只能連登入修正一起退掉。

commit 訊息的常見寫法（前綴不是規定，但整個業界都在用，AI 也認得）：

```text
feat: 新增電子報訂閱表單
fix: 修好登入按鈕在 Safari 沒反應
docs: 補上安裝步驟的截圖
chore: 升級 astro 到 5.x
```

**這一段可以整段外包給 AI。** 叫它「看一下 `git diff`，幫我依照這個格式寫 commit 訊息」，它寫得比多數人好——因為它真的把 diff 逐行讀完了。你只要負責決定「這些改動是不是同一件事」。

---

## 分支：先知道 `main` 是什麼就好

分支（branch）是「同一個專案的平行時空」。你在分支上亂改，主線完全不受影響，滿意了再合併回去。

**但如果你是一個人、剛開始用：全部在 `main` 上做就好。** 過早學分支只會讓你在該存檔的時候卡住。你現在只要知道三件事：

- `main` 是預設的主線名字（舊教學可能寫 `master`，同一個東西的舊名）
- 你目前在哪條線上：`git branch --show-current`
- 哪天要開分支：`git switch -c 新分支名`，回主線 `git switch main`

等到你開始「同時做兩件會互相打架的事」，或者開始跟人協作，再回頭學分支，那時你會秒懂它在幹嘛。

---

## 動手：從完全陌生到能版控（全程 CLI）

前置：你需要一個終端機（不熟的話先看 [CLI 入門指南](/articles/cli-guide/)）跟一個 [GitHub 帳號](/articles/github-account-signup/)。

### Step 0：確認 Git 在不在，並自我介紹

```bash
git --version
# git version 2.49.0   ← 有版本號就是裝好了
```

macOS 通常內建（沒有的話它會跳出來問你要不要裝開發者工具，按確定即可）；Windows 到 [git-scm.com](https://git-scm.com) 下載安裝，或用 [WSL](/articles/windows-wsl-guide/) 環境。

接著讓 Git 知道你是誰——**每個存檔點都會蓋上這個名字**：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的信箱"
git config --global init.defaultBranch main
```

> 🚨 **這個 email 會跟著每一筆 commit 公開在 GitHub 上。** 不想公開私人信箱的話，去 GitHub 的 **Settings → Emails**，勾選保護信箱的選項，那一頁會直接顯示一組給你用的 `@users.noreply.github.com` 位址，把上面那行的 email 換成它。

### Step 1：先寫 `.gitignore`，再開始版控

順序刻意這樣安排。`.gitignore` 是一份「這些檔案永遠不要進 Git」的清單，**在第一次 commit 之前就寫好，比事後補救便宜一百倍**（原因見下方 🚨 第一條）。

```bash
cd ~/你的專案資料夾
git init                      # 這個資料夾從此被 Git 管理（會生出一個 .git 資料夾）
```

建立 `.gitignore`，最少要有這幾行：

```text
# 機密：絕對不能進版控
.env
.env.*
*.key
*.pem
credentials.json
service-account*.json

# 相依套件：太肥，而且可以重裝
node_modules/
venv/
__pycache__/

# 系統雜物
.DS_Store
Thumbs.db
```

不知道你的專案該忽略什麼？這題直接問 AI 最快：「這是一個 Next.js 專案，幫我產一份 `.gitignore`」。

### Step 2：你的第一個存檔點

```bash
git status                    # 先看：現在有哪些檔案還沒被管
git add .                     # 全部丟進暫存區（第一次可以，因為 .gitignore 已經寫好了）
git status                    # 再看一次：確認 .env 沒有出現在清單裡 ← 這步不要跳過
git commit -m "chore: 專案初始版本"
```

`git status` 出現 `nothing to commit, working tree clean`，代表**這一刻的狀態已經完整記下來了**。從現在起，不管後面怎麼被改爛，你都回得來。

### Step 3：推上 GitHub（不用開瀏覽器）

一般教學到這裡會叫你切去瀏覽器點「New repository」。用 [GitHub CLI](/articles/dev-cli-tools-mac/)（`gh`）一行就好：

```bash
gh auth login                 # 只有第一次需要，照著問答按即可
gh repo create --source=. --private --push
```

這行的意思是：拿**目前這個資料夾**（`--source=.`）在 GitHub 上建一個**私人**倉庫（`--private`），建好之後**直接把本地的 commit 推上去**（`--push`）。要公開就把 `--private` 換成 `--public`。

沒裝 `gh` 的話，就在 GitHub 網站建一個空 repo，它會給你這幾行：

```bash
git remote add origin https://github.com/你的帳號/你的repo.git
git branch -M main
git push -u origin main
```

`-u` 只需要下一次，它記住了「這條線對應遠端的哪裡」，之後你打 `git push` 就夠了。

### Step 4：第二台電腦接手

異地同步的整個重點就在這裡。到另一台電腦上：

```bash
gh repo clone 你的帳號/你的repo      # 或 git clone https://github.com/...
cd 你的repo
```

`clone` 會把**完整的歷史**抓下來——不只是最新的檔案，是每一個存檔點。所以在這台電腦上，你一樣回得去任何一版，即使斷網。

從此以後，你每天的循環就是這三步：

```bash
git pull --rebase             # ① 開工第一件事，把另一台的進度拉下來
# ...做事（自己改，或叫 AI 改）...
git add . && git commit -m "feat: 今天做的事"   # ② 存檔
git push                      # ③ 推上去，讓另一台拿得到
```

**② 可以整段交給 AI，① 和 ③ 建議養成自己打的肌肉記憶**——尤其是 ①，理由下一節就講。

---

## 讓 CLI 工具替你下指令：怎麼用，跟三條紅線

### 好的委派長這樣

這些話直接對 Claude Code 這類 AI 指令列助手講就行：

```text
「先跑 git status 給我看，現在有哪些改動還沒存。」
「看一下 git diff，幫我把這次的改動寫成一到三個 commit，
  每個 commit 只包含同一件事，訊息用 fix:／feat: 這種前綴。」
「我要回到昨天下午那個還能跑的版本，先用 git log --oneline 找出來給我看，
  先不要動任何東西。」
「這個檔案的第 40 行是什麼時候改的？誰改的？」
```

注意共通點：**先看、再動**。「先跑給我看，先不要動任何東西」這句話，是你在 AI 時代最值錢的一句咒語。

### 你必須自己看得懂的四個回報

指令可以不背，**回報一定要看得懂**，不然你等於閉著眼睛簽名：

| 你看到 | 意思 |
|---|---|
| `nothing to commit, working tree clean` | 全部存好了，這一刻是安全的 |
| `Changes not staged for commit` | 有改動還在工作區（①），還沒進暫存區 |
| `Your branch is ahead of 'origin/main' by 3 commits` | 你有 3 個存檔點還沒 push，另一台看不到 |
| `Your branch and 'origin/main' have diverged` | ⚠️ 分岔了，兩邊各自往前走過，見下一節 |

### 🔴 三條紅線：這三個動作不准 AI 自己按

這三個指令的共通點是**會讓還沒存檔的東西永久消失**，而 Git 的「回得去」保護不到它們（因為它們消滅的正是「還沒被記錄」的那部分）：

| 指令 | 它會做什麼 | 你該怎麼防 |
|---|---|---|
| `git reset --hard` | 把所有未存檔的改動直接抹掉 | 動之前先 `git status`，確認沒有你要的東西 |
| `git push --force` | 用你這台的歷史覆蓋掉遠端的 | 協作時等於刪掉別人的進度，除非你完全知道在幹嘛，否則不要 |
| `git checkout -- 檔名`／`git restore 檔名` | 把這個檔案的修改丟掉，回到上一個存檔點 | 確認你真的不要這些改動 |

給 AI 助手的標準指示：**「這三個指令你要下之前，先停下來問我。」** 多數 CLI 工具本來就會在破壞性操作前問你一次——你的工作是**真的看清楚再按確認**，而不是習慣性按 y。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：AI 下指令的速度是你的 100 倍，這句話包含「做錯事的速度也是 100 倍」。所以真正的防護不是「不用 AI」，是**讓每件事都有存檔點**——只要你 commit 得夠勤，AI 最壞也只能毀掉你最近 20 分鐘的工作。commit 的頻率，就是你的安全氣囊大小。

---

## 異地同步的唯一鐵律：開工前先 pull

一台筆電、一台桌機，或公司一台家裡一台——只要你有兩台電腦碰同一個專案，就會遇到**分岔**。

![沒先 pull 就開工會造成兩邊各自往前走，push 被拒絕](/images/articles/git-guide/two-machines-diverge.svg)

分岔的成因永遠是同一個：**你在一份「落後的拷貝」上開始工作。** 桌機停在週一的版本，你週三在它上面改東西，但筆電週二已經推了新東西上去——現在遠端不知道該聽誰的。

```bash
git pull --rebase     # 開工第一件事，永遠是這行
```

`--rebase` 的意思是「把我的改動接到最新進度的後面」，讓歷史保持一條直線，比預設的合併方式乾淨得多。想省事就設成預設值：

```bash
git config --global pull.rebase true
```

> 💡 **這個坑我們真的踩過**：某台機器累積了 6 個沒 push 的 commit，另一台完全不知情繼續做，撞上時光收拾就花掉大半個小時。從那之後規則就兩條——**開工先 pull、收工立刻 push**。沒推的 commit 等於不存在。

### push 被拒絕怎麼辦

```text
! [rejected]  main -> main (fetch first)
error: failed to push some refs to 'https://github.com/...'
```

這不是壞事，這是 Git 在**保護你**：遠端有你沒有的東西，如果讓你推上去就會蓋掉。標準解法：

```bash
git pull --rebase     # 先把遠端的拉下來、接在你的下面
git push              # 再推
```

### 衝突（conflict）不是災難

如果兩邊改到**同一個檔案的同一行**，Git 沒辦法自己決定，會停下來在檔案裡插入這種標記：

```text
<<<<<<< HEAD
這是你這台電腦的版本
=======
這是遠端（另一台）的版本
>>>>>>> origin/main
```

讀法很單純：**上半段是你的、下半段是別人的**，你要決定留哪個（或兩個都留、手動合成一句）。決定完把 `<<<<<<<`、`=======`、`>>>>>>>` 這三行標記刪掉，然後：

```bash
git add 那個檔案
git rebase --continue        # 如果你是用 pull --rebase 進來的
```

**這段很適合交給 AI**，但指示要給清楚：「這個檔案有衝突，上半段是我在筆電改的、下半段是桌機的，我要保留上半段的邏輯但把下半段新增的那個欄位加進來。」——**你負責決定要什麼，它負責動手改。** 不要只丟一句「幫我解衝突」就走開，它會替你猜，而它猜錯的時候你不會發現。

---

## 🚨 常見錯誤

### 🚨 1. 把 `.env`／API 金鑰 commit 進去（最貴的一個）

這是本站踩過真實代價的坑：**把檔案從專案裡刪掉，不等於把它從 Git 歷史裡刪掉。** commit 過的東西會永遠留在歷史裡，任何人 clone 你的 repo 都翻得到。

如果是 public repo，而且已經 `push` 出去了，**請直接當作那把金鑰已經外洩**：

1. 立刻去那個服務（OpenAI、Google Cloud、[OpenRouter](/articles/openrouter-free-llm-api-key/)…）把該金鑰**作廢／重新產生**——這是唯一真正的解法
2. 然後才處理 repo（把它加進 `.gitignore`、`git rm --cached .env`）
3. 「改寫 git 歷史」只是潔癖，做了也擋不住已經被抓走的那份

**預防成本 = 在第一次 commit 前寫好 `.gitignore` 的 30 秒。** 這就是為什麼 Step 1 是先寫忽略清單。

### 🚨 2. 一次 commit 幾百個檔案

`git status` 跑出滿滿一頁，多半是 `node_modules/` 或 `venv/` 這類套件資料夾沒被忽略。它們可以隨時重裝，不該進版控（會讓 repo 肥好幾百 MB）。補進 `.gitignore`，已經被追蹤的用：

```bash
git rm -r --cached node_modules
git commit -m "chore: 停止追蹤 node_modules"
```

`--cached` 的意思是「只從 Git 移除，硬碟上的檔案不動」。

### 🚨 3. `push` 一直要求輸入密碼，或說認證失敗

GitHub 早已不接受用帳號密碼從指令列推送。兩個解法：

- **最簡單**：裝 `gh` 之後 `gh auth login`，它會順便把 Git 的認證一起設好
- 或改用 SSH 金鑰，或改用[個人存取權杖（PAT）](/articles/github-developer-settings-tokens/)當密碼

### 🚨 4. AI 幫你跑了 `git reset --hard`，東西不見了

如果那些改動**曾經 commit 過**，你救得回來：

```bash
git reflog                    # 列出你這個 repo 做過的每一步（包含被丟掉的）
git reset --hard <那一行的代碼>
```

`reflog` 是 Git 的黑盒子，很多人到最需要的那天才知道它存在。但**如果那些改動從來沒 commit 過，就真的沒了**——這正是「commit 要勤」的理由。

### 🚨 5. 兩台電腦互推，歷史打結

見上一節。預防只有一句：**開工先 `git pull --rebase`，收工立刻 `git push`。**

### 🚨 6. 在錯的資料夾 `git init`

不小心在家目錄 `~` 下 `git init`，Git 會試圖管理你整台電腦的檔案。發現的話（`git status` 跑出一堆莫名其妙的東西），確認位置沒錯後刪掉那個 `.git` 資料夾即可：`rm -rf ~/.git`——**刪之前務必確認路徑，這是破壞性操作。**

---

## 一句話總結

> **Git 是你的存檔點，GitHub 是那份存檔的異地備份。指令可以外包給 CLI 工具，但「什麼時候該存」「這次要存哪些」「這行會不會弄不見東西」這三個判斷，永遠是你的。**

第一件明天就能做的事：找一個你手上正在弄的資料夾，跑完 Step 0 到 Step 3。十分鐘，你就有了第一個回得去的存檔點。

---

## Git 常見問題

### Git 和 GitHub 差在哪？

Git 是裝在你電腦上的版本控制程式，沒網路也能用；GitHub 是一個網站，負責存放你的 Git 倉庫的一份拷貝，並提供協作介面。你可以只用 Git 不用 GitHub（純本機版控），但不能只用 GitHub 不用 Git。

### 我不會寫程式，需要學 Git 嗎？

看你有沒有「一份會一直改、改壞了想回去」的東西。寫文件、經營 Obsidian 筆記庫、維護一份設定檔、跟 AI 一起寫文案——這些都適用。Git 管的是純文字檔（`.md`、`.txt`、`.csv`、程式碼）最順手；Word、PDF、影片這類二進位檔案它也能存，但看不出「差在哪一行」，好處會少一半。

### 有 AI 幫我下指令，我還需要懂 Git 嗎？

需要，但需要的部分變了。你不用背 `git rebase -i` 的參數，但你必須看得懂 `git status` 說了什麼、知道 `git reset --hard` 會讓東西永久消失、能判斷「這些改動該切成一個還是三個 commit」。**指令是可以外包的，判斷不行。**

### `git pull` 和 `git fetch` 差在哪？

`fetch` 是「只把遠端的最新狀況抓下來看，不動我的檔案」；`pull` 是「抓下來並且直接套用到我的工作區」。`pull` ≈ `fetch` + 合併。日常用 `pull --rebase` 就好；想先偷看別人做了什麼再決定，用 `fetch`。

### commit 了但還沒 push，另一台電腦看得到嗎？

看不到。commit 只到「本地倉庫」（第 ③ 格），存在你這台電腦的 `.git` 資料夾裡。要讓另一台拿得到，一定要 `push` 到遠端（第 ④ 格）。這也是分岔最常見的來源——**沒推的 commit，對世界來說等於不存在。**

### 不小心刪掉檔案，怎麼救？

如果那個檔案曾經被 commit 過：`git restore 檔名` 就把它拉回上一個存檔點的樣子。如果整包都想回到某個存檔點，先 `git log --oneline` 找出那一版的代碼再處理——這種時候把代碼貼給 AI 助手、請它「先解釋要下哪一行、為什麼，先不要執行」，比自己憑印象打安全得多。

---

## 延伸閱讀

- 💻 [CLI 是什麼？10 分鐘上手命令列](/articles/cli-guide/) — 終端機還不熟的話，先從這裡開始
- 🐙 [註冊 GitHub 帳號](/articles/github-account-signup/) — 還沒有帳號的話，五分鐘搞定
- 🛠️ [Mac 開發者必備 CLI 工具安裝](/articles/dev-cli-tools-mac/) — 包含這篇用到的 GitHub CLI（`gh`）
- 🚀 [把靜態網站部署到 GitHub Pages](/articles/deploy-to-github-pages/) — 學會 push 之後的下一步：讓它自動上線
- 🔑 [GitHub 個人存取權杖（PAT）設定](/articles/github-developer-settings-tokens/) — 認證卡關時的另一條路
