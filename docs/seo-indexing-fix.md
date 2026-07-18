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

**Last updated:** 2026-07-18
