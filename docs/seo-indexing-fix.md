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

**先講結論**：這不是待修 bug，**該做的事是什麼都不做**。原本 §四 checklist 第 2 步寫的
「對每一類按驗證修正」，**對這一類是錯的建議**，已在此更正。

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

**源頭已經斷了**（線上頁面不再產生無斜線連結），Google 會逐漸停止回頭爬那些舊網址，
數字自然衰減，**以月計**。剩下的殘留來源是外部反向連結指向無斜線版，那不歸我們管，308 已正確處理。

### 更正 §四 checklist

- 第 2 步「對每一類按驗證修正」：**「頁面會重新導向」這一類不要按**（按了必失敗）。
  其餘類別（重複／未選取標準網頁）才適用。
- 第 5 步「404 那筆不用管」仍然成立。
- 再加一條：**「遭到 noindex 標記排除」也不要按**（見 §五，那是刻意的）。

---

**Last updated:** 2026-08-17
