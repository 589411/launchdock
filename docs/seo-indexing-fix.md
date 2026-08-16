# SEO 未索引修正紀錄：trailing-slash + canonical

> **背景**：2026-07-18 收到 Google Search Console 通知，launchdock.app 有 **122 個網頁「未編入索引」**（資料截至 2026/7/10），分 5 類。本文記錄根因診斷、已套用的修正、驗證方式，以及後續要在 Search Console 手動操作的 checklist。
>
> **修正 commit**：`9e3296b`（fix(seo): 統一 trailing-slash + 自我 canonical）。已 push main、Cloudflare Pages 部署並實測上線。

---

## 一、根因診斷（實測，非猜測）

站台是 **Astro（directory 格式）+ Cloudflare Pages**（不是任何 CMS）。核心病灶只有一個，衍生出多種症狀：

> **全站內部連結都用「無斜線」網址（`/articles/foo`），但站台實際服務的是「有斜線」版（`/articles/foo/`）。**

Cloudflare Pages 對無斜線網址一律 **308 永久轉址**到有斜線版。而網站到處都吐無斜線網址：

- Header 導覽列（每頁都有）
- 文章卡 / 熱門文章 / 相關文章 / 搜尋結果
- **概念自動連結外掛**（`remark-concept-links`，每頁內文都生）
- `article-registry.json`（延伸閱讀卡讀它）
- **102 篇文章內文手寫的 `/articles/…` 連結**
- **hreflang 自己也吐無斜線**：首頁 `hreflang=en` 指向 `/en`（會 308）
- `/meetup` 的 canonical 硬編成 `/meetup`（無斜線，會 308）

→ Google 每爬一個內部連結就吃一次 308 → 判「頁面會重新導向」。**這是自傷。**

另一個獨立問題：**文章頁完全沒有 `<link rel="canonical">`**，導致 `?scene=xxx` 參數頁、中英版本被判為重複而無主版本。

### Search Console 5 類 ↔ 根因對照

| SC 分類 | 數量 | 根因 | 狀態 |
|---|---|---|---|
| 網頁會重新導向 | 85 | 內部連結／hreflang／nav 全無斜線 → 吃 308 | ✅ 已修 |
| 重複，未選取標準網頁 | 12 | 文章頁沒有 canonical；`?scene=` 參數頁無主版本 | ✅ 已修 |
| 找不到網頁 (404) | 1 | `/cdn-cgi/l/email-protection`（Cloudflare 信箱保護，非內容頁） | ⏭ 略過（正常） |
| 已檢索但尚未索引 | 19 | `/meetup` vs `/meetup/` 等斜線不一致造成重複 | ✅ 已修（斜線統一 + canonical） |
| 已找到但尚未索引 | 5 | 內部連結權重不足 | ✅ 改善（連結指向已正確） |

---

## 二、已套用的修正

| 檔案 | 修正 |
|---|---|
| `astro.config.mjs` | 加 `trailingSlash: 'always'` |
| `src/layouts/BaseLayout.astro` | 一律輸出**自我 canonical**（斜線正規化；`?query` 變體自動 dedupe 到乾淨路徑）；修 hreflang `zhPath`/`enPath` 一律帶斜線 |
| `src/i18n/utils.ts` | `getAlternatePath`：首頁語言切換 `/en` → `/en/` |
| `src/components/Header.astro` | nav 連結補 trailing slash |
| `plugins/remark-concept-links.mjs` | 概念連結 `link` 補斜線 |
| `scripts/generate-article-registry.mjs` | registry `link` 欄位補斜線（重生 `article-registry.json`） |
| 各元件（`RelatedArticles`/`ArticleProgressBar`/`PopularArticles`/`SearchModal`/`EventCard`…）與頁面（`index`/`articles`/`meetup`/`quiz`/`en/*`） | 內部 `<a href>` 補斜線 |
| `src/pages/meetup.astro` | 移除無斜線硬編 canonical（改用預設自我 canonical `/meetup/`） |
| 102 篇 `src/content/articles/**/*.md` | 內文手寫 `/articles/…`、`/en/articles/…` 連結全部補斜線（含 `#錨點`） |

### 設計要點（日後維護）

- **內部連結一律帶 trailing slash**：`/articles/<slug>/`、`/en/articles/<slug>/`、`/about/`、`/meetup/`… 新增連結請照此。
- **canonical 由 BaseLayout 自動產生**（自我參照、斜線正規化），一般頁面**不需**手動傳 `canonicalUrl`；只有要指向「別的網址」時才傳。
- **hreflang** 由 BaseLayout 自動算，zh/en 互指、皆帶斜線。

---

## 三、驗證

```
npm run build   # 148 頁綠
# dist 內無斜線內部連結 = 0
grep -rhoE 'href="/(en/)?articles/[a-z0-9-]+"' dist/ | wc -l   # → 0
# sitemap 143 網址全帶斜線
# 正式站實測：
curl -s https://launchdock.app/articles/rag-explained/ | grep canonical
#   → <link rel="canonical" href="https://launchdock.app/articles/rag-explained/">
curl -s https://launchdock.app/ | grep 'hreflang="en"'
#   → href="https://launchdock.app/en/"   （已帶斜線）
```

---

## 四、Search Console 後續操作 checklist（技術已修好，換 Google 端）

技術面 1 週後才會反映到 SC。請依序：

1. **（可選）重新提交 sitemap**：Sitemap → 確認 `https://launchdock.app/sitemap-index.xml` 在清單。想催可移除再重加。
2. **對每一類按「驗證修正」**：頁面索引報表 → 點進「網頁會重新導向」「重複，使用者未選取標準網頁」等 → 右上「**驗證修正 (Validate Fix)**」。Google 會背景重爬、逐步解除。
3. **抽代表網址用「網址檢查」**：貼 `https://launchdock.app/articles/rag-explained/` → 「測試線上網址」→ 確認「Google 選擇的標準網址」＝該網址 → 按「**要求建立索引**」催收錄重點頁。
4. **耐心等**：重新導向／重複兩類通常 **1–2 週**開始好轉；「已檢索／已找到未索引」較慢，跟整站權重走。
5. **404 那筆不用管**：`/cdn-cgi/l/email-protection` 是 Cloudflare 產生的，非內容頁。

---

---

## 五、2026-08-16：「遭到 noindex 標記排除」＝**刻意的，不用修**

**通知內容**：Search Console 說「有部分網頁未編入索引，新原因：遭到『noindex』標記排除」。

**查證結果（實測，非推測）**：受影響網頁只有 **1 筆** ——

| 網址 | 首次偵測 | 上次檢索 |
|---|---|---|
| `https://sunlit.launchdock.app/` | 2026/8/8 | 2026/8/6 |

那是 `~/github/sunlit-site`（GitHub Pages 提供）——「日晴生活」**虛構教學站**，
給「用 LLM 做資料分析」課程當教具。該站 README 明寫「全站頁面皆標記 `noindex, nofollow`」，
線上 HTML 實測也確認 `<meta name="robots" content="noindex, nofollow">`。
**是我們自己加的，Google 只是照做並回報。**

會出現在 launchdock.app 的報表，是因為 GSC property 是**網域層級**（`sc-domain:launchdock.app`），
**所有子網域都算進來**（`sunlit.` / `lab.` / `daily-bread.` …）。

**結論：不用做任何事。**

- ⛔ **不要**改成用 `robots.txt` Disallow 擋 —— 那會讓 Google 爬不到、也就**看不到 noindex**，
  反而可能靠外部反向連結被收錄（正是本站文章 `ai-share-link-not-private` 寫的坑）。
- 假店家／假評論／假交易被收進搜尋結果才是真問題，noindex 是正解。
- GSC 這類「網站自己的意圖」原因**沒有忽略鈕**，之後每次重爬還是會列著。看到就跳過。

**主站是乾淨的**：launchdock.app 原始碼與線上頁面（含用 Googlebot UA 實測）
**沒有任何 noindex meta，也沒有 `X-Robots-Tag` header**；`lab.` / `daily-bread.` 子網域同樣乾淨。

### 順帶記錄：當天 GSC 頁面索引總覽（資料截至 2026/8/3）

已建立索引 **165**／未建立索引 **153**，7 個原因：

| 原因 | 來源 | 網頁數 |
|---|---|---|
| 頁面會重新導向 | 網站 | **114** |
| 替代頁面（有適當的標準標記） | 網站 | 12 |
| 這是重複網頁；使用者未選取標準網頁 | 網站 | 4 |
| 遭到「noindex」標記排除 | 網站 | 1 ← 本次通知，刻意 |
| 找不到網頁 (404) | 網站 | 1（`/cdn-cgi/l/email-protection`，正常） |
| 已檢索 - 目前尚未建立索引 | Google | 16 |
| 已找到 - 目前尚未建立索引 | Google | 5（驗證**通過**） |

➡️ 「頁面會重新導向」114 筆的追查見下方 **§六**（結論：正常殘影，不用修）。

---

---

## 六、2026-08-17：「頁面會重新導向」114 筆＝**修好之後的正常殘影，不要按驗證修正**

**先講結論**：113 筆裡 **105 筆是修好之後的正常殘影（不用修）、8 筆是七月漏修的真 bug（已於
2026-08-17 修掉，commit `142ac22`）**。原本 §四 checklist 第 2 步寫的「對每一類按驗證修正」，
**對這一類仍是錯的建議**（詳見下方「按鈕準則」），已在此更正。

### 按鈕準則（判斷任何一桶要不要按「驗證修正」）

「驗證修正」**不改變任何東西**——它不是加速索引、不是提交請求，只是「重爬樣本 + 幫你追蹤狀態」
的計時器。所以唯一的判準是：**你有沒有真的改過線上的東西？** 沒改就別按，按了只會多一筆
「驗證失敗」的噪音。（本桶即使修掉那 8 筆，105 筆舊殘影仍會讓驗證失敗 ⇒ **還是別按**。）

### 為什麼「驗證修正」一定失敗

GSC 對「頁面會重新導向」的驗證通過條件＝**那些網址不再轉址**（回 200 或 404）。
但我們**要它們繼續 308 轉址**——這正是七月修正的目的。所以按下去必然回報失敗。
（2026-08-17 該類驗證已被啟動，就讓它失敗，無害。）

### 實測三件事（推翻「sitemap 還在提交會轉址的網址」這個假設）

| 檢查 | 指令 | 結果 |
|---|---|---|
| sitemap 是否列會轉址的網址 | 抓 `sitemap-0.xml` 取全部 `<loc>` | **168 筆全帶 trailing slash，無斜線 0 筆** |
| sitemap 網址是否真的不轉址 | 168 筆逐一打 HTTP | **168 筆全部 200，零轉址** |
| 線上頁面是否還在生產無斜線連結 | 首頁 / `/articles/` / `/en/articles/` / 隨機文章頁抓 `href` | **全部 0 筆** |

```bash
curl -s https://launchdock.app/sitemap-0.xml | grep -oE '<loc>[^<]+</loc>' | sed 's/<[^>]*>//g' > urls.txt
grep -cvE '/$' urls.txt        # → 0（全帶斜線）
xargs -P 12 -I{} sh -c 'printf "%s %s\n" "$(curl -s -o /dev/null -w "%{http_code}" "{}")" "{}"' < urls.txt \
  | grep -v '^200 '            # → 空（零轉址）
```

### 那 114 筆到底是什麼

GSC 範例清單全是 **7/18 修正之前**的**無斜線舊網址**——Google 早就記進它的已知 URL 清單：

| 受影響網址（GSC 列出） | 實測 |
|---|---|
| `/articles/ai-tech-evolution` | 308 → `/articles/ai-tech-evolution/`（200、在 sitemap、已收錄） |
| `/articles/token-economics` | 308 → `/articles/token-economics/`（同上） |
| `/en/articles?scene=core` | 308 → `/en/articles/?scene=core` |

**「頁面會重新導向」在這裡描述的是我們想要的終態**：舊網址 308 到新網址，新網址被收錄。
要讓這個數字歸零只有兩條路，都比現況爛——① 拆掉轉址讓舊網址 404；② 兩種網址都回 200（重複內容）。

### ⚠️ 更正：源頭沒有完全斷——七月漏修了「query 型」連結

初次判讀說「源頭已斷」是**錯的**，因為當時只 grep 了頁面上的 `<a href="/path">`，
**正則不匹配帶 `?` 的字串**，等於預先排除了唯一還在流血的那一類。實際上有兩處還在線上生產無斜線網址：

| 檔案 | 產出 | 影響範圍 |
|---|---|---|
| `src/i18n/utils.ts` `articlesPath()` | 回傳 `/articles`（無斜線），被 `ArticleLayout.astro:65` 麵包屑用 | **每一篇文章頁**（177 頁） |
| `src/pages/index.astro:206` | 硬編 `/articles?scene=…` | 首頁 SceneCard |

⇒ `/articles?scene=X` → 308 → `/articles/?scene=X`。因為它在每篇文章頁都有，
**Google 每爬一篇文章就重新發現一次**，這也解釋了為何趨勢線到 8/7 還在爬升。

**✅ 已修**（2026-08-17，commit `142ac22`）：改 `articlesPath()` 本身（只有一個消費端，
且站規是「內部連結一律帶斜線」）＋ index.astro 那行。驗證：build 177 頁綠、
dist 無斜線 `?scene=` 連結 **157 → 0**、**全站任何形式的無斜線內部連結 0 種 / 0 個**、sitemap 168 筆仍全帶斜線。

### 可證偽測試：那 105 筆路徑型殘影確實是封閉集合

「上次檢索日期」驗不出這件事（Google 對 308 會持續回訪，所以最後檢索日一定新；GSC 也不給「發現日期」）。
**利的測試是**：7/18 之後才建立的 slug，有沒有以無斜線形式進入名單。

```
7/18 後新增的 10 個 slug（chatgpt-connect-github / grok-connect-github / workflow-{docdiff,inbox,
reconcile,report} / ai-share-link-not-private / set-system-prompt / voice-input-ai-context /
google-colab-guide）
→ 在 113 筆名單中命中 0 筆
```

⇒ 路徑型的 105 筆是**封閉的舊集合**，不再成長。剩下的殘留來源是外部反向連結指向無斜線版，
那不歸我們管，308 已正確處理。

**不要期待它「自然掉」**：Google 對已知的 308 會持續回訪很久（以年計），數字常常就卡著不動。
正確心態不是等它掉，是**把這個數字永久除名，不再拿它當健康指標**。

### 順帶：那 16 筆「已檢索 - 目前尚未建立索引」其實也大半是同一批雜訊

撈到 14 筆可辨識（GSC 記 16，分頁 harvest 可能漏 2）：

| 類型 | 筆數 |
|---|---|
| `/articles?scene=…` 與 `/articles/?scene=…`（分面網址，兩種形式都在） | **10** |
| `/articles/rag-explained`、`/about`（無斜線舊殘影） | 2 |
| **真正的內容頁**：`/articles/workflow-reconcile/`、`/en/articles/ollama-openclaw/` | **2** |

⇒ 真正屬於「內容品質／檢索預算」訊號的**只有 2 頁**。`?scene=` 分面網址才是跨桶的最大單一雜訊源
（重新導向 8 + 已檢索未索引 10）。它**不會造成重複內容**——實測 `/articles/?scene=基礎使用` 的
canonical 正確指回 `https://launchdock.app/articles/`——但它在吃檢索預算。

### 更正 §四 checklist

- 第 2 步「對每一類按驗證修正」：**「頁面會重新導向」這一類不要按**（按了必失敗）。
  其餘類別（重複／未選取標準網頁）才適用。
- 第 5 步「404 那筆不用管」仍然成立。
- 再加一條：**「遭到 noindex 標記排除」也不要按**（見 §五，那是刻意的）。

---

### 更正 §四 checklist（彙整）

| 桶 | 按驗證？ | 為什麼 |
|---|---|---|
| 頁面會重新導向 | ⛔ 不要 | 通過條件＝網址不再轉址，與我們的意圖相反；即使修掉 8 筆 query 型，105 筆殘影仍會讓它失敗 |
| 替代頁面（有適當標準標記） | ⛔ 不要 | 這是正確行為不是錯誤——canonical 指到別頁、Google 照做了，與 308 同性質的殘影 |
| 這是重複網頁；使用者未選取標準網頁 | ⚠️ 不要，但要查 | 唯一可能是真 bug 的：這 4 頁沒宣告 canonical、Google 自己挑了一個。先看是哪 4 個、補 canonical，**改完再按** |
| 遭到「noindex」標記排除 | ⛔ 不要 | 是我們自己下的（見 §五），永遠會在那 |
| 找不到網頁 (404) | ⛔ 不要 | 唯一那筆是 `/about/` 上被 Cloudflare Email Obfuscation 改寫的 mailto，非內容頁 |
| 已檢索 - 尚未建立索引 | ⛔ 不能也不該 | 來源是「Google 系統」，是品質／預算判斷，沒有「修正」可驗證 |
| 已找到 - 尚未建立索引 | ✅ 已通過 | 無事 |

**那 4 筆已查完 → 見 §七**（結論：canonical 沒問題，是 7/18 前的舊資料；但查的過程撞到一個活的真 bug）。

---

---

## 七、2026-08-17：那 4 筆「未選取標準網頁」沒問題，但撈到全站 soft-404

### 7-1　4 筆「這是重複網頁；使用者未選取標準網頁」＝ 7/18 前的舊資料

| 網址 | 上次檢索 | 現在的 canonical |
|---|---|---|
| `/en/articles/?scene=advanced` | 2026/6/20 | ✅ `https://launchdock.app/en/articles/` |
| `/en/articles/?scene=env-setup` | 2026/6/5 | ✅ 同上 |
| `/en/articles/?scene=integration` | 2026/5/31 | ✅ 同上 |
| `/en/articles/gemini-api-setup` | 2026/7/12 | ✅ `https://launchdock.app/` |

**四筆的最後檢索日全部早於 7/18 的 canonical 修正**，當時那些頁面確實沒宣告 canonical
→ Google 只能自己挑 → 落進這桶。現在四筆都有正確 canonical。趨勢線也對得上：
這桶在 7/12 前後從 **12 掉到 4**。⇒ **沒有東西可修，一樣不要按驗證。**

### 7-2　🔴 但 `/en/articles/gemini-api-setup` 這個 slug 根本不存在——而它回 200

真正的 slug 是 `gemini-gas-ordering-system`。追下去發現**全站 soft-404**：

```bash
curl -o /dev/null -w "%{http_code}" https://launchdock.app/zzz-nonexistent/                 # → 200
curl -o /dev/null -w "%{http_code}" https://launchdock.app/articles/totally-fake-slug-123/  # → 200
curl -o /dev/null -w "%{http_code}" https://launchdock.app/en/articles/gemini-api-setup     # → 200
# 而且內容是首頁：<title>首頁 | 藍鴨 LaunchDock…</title>
```

**病因**：repo 裡沒有任何 404 頁——`src/pages/404.astro` 不存在、`dist/404.html` 不存在、
也沒有 `_redirects`。Cloudflare Pages 找不到檔案又沒有 `404.html`，就退回送 `index.html` 並回 200。

**後果**（這桶跟前面那些不一樣，是**開放**的、會持續長大）：

1. 打錯字的網址、外部的壞連結，全都變成「**首頁的複製品**」——很可能就是
   「替代頁面（有適當的標準標記）」12 筆的來源（那些頁的 canonical 是首頁烘進去的 `/`）。
2. **任何壞連結監控都失效**（全部回 200），CLAUDE.md 內容 loop 裡「來自監控：壞連結」那條等於白跑。
3. Google 永遠不會知道該把死網址剔除。

### 7-3　✅ 已修（commit `2dd4da8`）

| 檔案 | 作用 |
|---|---|
| `src/pages/404.astro` | 中文 404，三個出口：回首頁／看所有教學／回報壞連結 |
| `src/pages/en/404.astro` | 英文 404（`lang="en"`） |
| `scripts/emit-en-404.mjs` + `package.json` `build` | 見下方「坑」 |

**坑：Astro 只對「根目錄」的 `404.astro` 特別輸出成 `dist/404.html`。**
巢狀的 `src/pages/en/404.astro` 走一般 directory 格式 → `dist/en/404/index.html`。
但 Cloudflare Pages 找 404 處理器時是**往上找最近的 `404.html`**，所以 `/en/*` 吃不到英文版。
⇒ 加一支 post-build 腳本複製成 `dist/en/404.html`，並串進 `npm run build`
（刻意做成找不到來源就印 warning 走人，不讓改頁面結構時連帶炸掉部署）。

**驗證**：build 179 頁綠；`dist/404.html`（`lang="zh-TW"`）與 `dist/en/404.html`（`lang="en"`）都在；
兩頁都不在 sitemap（仍 168 筆）；全站無斜線內部連結仍 0 種 / 0 個。

### 7-4　那 12 筆「替代頁面（有適當的標準標記）」＝ 6 正常 + 6 soft-404 產物

查完了，切得很乾淨——**假設證實，而且比預期強：整整一半是 soft-404 造出來的**。

**A 組（6 筆）正常，永遠會在這桶**——`?scene=` 篩選頁，canonical 全部正確指回列表頁。
這正是「替代頁面（有適當標準標記）」該有的樣子，**是 dedupe 生效的證據，不是錯誤**。

| 網址 | 上次檢索 | canonical（實測） |
|---|---|---|
| `/en/articles/?scene=core` / `basics` / `intro` | 8/9、8/8、8/8 | `/en/articles/` |
| `/articles/?scene=環境準備` / `鴨編的碎碎念` / `知識與進階` | 8/3 | `/articles/` |

**B 組（6 筆）全部是不存在的頁面**——以前一律回 200 + 首頁 HTML、canonical 烘的是 `/`
⇒ Google 完全合理地判成「首頁的替代頁面」：

| 網址 | 為什麼不存在 | 修正前 | 修正後（實測） |
|---|---|---|---|
| `/articles/gemini-api-setup`（＋帶斜線版） | 真正的 slug 是 `gemini-gas-ordering-system` | 200 + 首頁 | **404** |
| `/articles/ollama-openclaw`（＋帶斜線版） | 只有英文版 | 200 + 首頁 | **404** |
| `/en/workflows/inbox/` | 沒有英文版 | 200 + 首頁 | **404** |
| `/en/meetup/` | 沒有英文版 | 200 + 首頁 | **404** |

➡️ **可證偽的驗收點**：重爬後這桶預期 **12 → 6**，B 組那 6 筆改列到「找不到網頁 (404)」。

### 7-5　補洞：`/en/404/` 自己會回 200（修 404 時引進的）

Astro 把巢狀的 `en/404.astro` 當一般頁面輸出成 `dist/en/404/index.html`
⇒ `https://launchdock.app/en/404/` 實際回 **200**；而每個 `/en/*` 的 404 回應又用 canonical
指向它 ⇒ 等於造了一個**可被索引的「Page not found」頁**。

**已修**（commit `9665e2e`）：`BaseLayout` 加 `noindex` prop（additive、預設 `false`，其他頁行為不變）。
開啟時輸出 `<meta name="robots" content="noindex, follow">`，**並且不輸出 canonical/hreflang**——
不該被索引的頁沒道理提名自己當任何人的標準網頁。

線上實測（部署後）：

| 網址 | 狀態 | robots | canonical | hreflang |
|---|---|---|---|---|
| `/en/404/` | 200 | `noindex, follow` | 無 | 無 |
| `/zzz-fake/` | **404** | `noindex, follow` | 無 | 無 |
| `/en/zzz-fake/` | **404** | `noindex, follow` | 無 | 無 |
| `/`、`/articles/token-economics/`、`/en/articles/hermes-agent/`、`/en/articles/?scene=core` | 200 | 無 | ✅ 有 | ✅ 有 |

> **日後維護**：任何不該進索引的頁（404、純功能頁）都用 `<BaseLayout noindex …>`，
> 不要手寫 meta，也不要只靠 robots.txt（擋掉爬取＝Google 看不到 noindex，見 §五）。

---

**Last updated:** 2026-08-17
