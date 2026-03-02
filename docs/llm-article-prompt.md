# LLM 文章生成 Prompt 指引

> 在使用 LLM 生成 LaunchDock 教學文章時，將此文件內容作為 system prompt 或上下文提供給 LLM。

---

## 當你生成教學文章時，請遵守以下圖片標記規則：

### @img 標記規則

在文章中每個**讀者可能需要看到螢幕截圖才能繼續操作**的位置，插入一行圖片佔位標記。

**格式**：
```
<!-- @img: 描述性檔名 | alt 說明文字 -->
```

**規則**：
1. `描述性檔名` 使用 kebab-case 英文（例如 `zeabur-signup`、`create-project-button`）
2. `alt 說明文字` 使用中文，簡述截圖應該呈現的內容
3. 標記放在對應操作步驟的**正下方**（緊接在步驟描述之後）
4. 標記是 HTML 註解，不會在網頁上顯示
5. 每個標記獨立一行，前後各空一行

### 什麼時候需要放 @img 標記

**必須放的情況**：
- UI 操作步驟：「點擊 XX 按鈕」「在 XX 頁面找到 YY」
- 表單填寫：需要填入特定值的畫面
- 設定頁面：需要修改配置的介面
- 錯誤畫面：展示常見錯誤的截圖
- 完成畫面：確認操作成功的結果

**不需要放的情況**：
- 純文字說明、概念解釋
- 命令列輸出（用 code block 即可）
- 外部網站首頁（用超連結就好）

### 範例

```markdown
#### Step 1：註冊帳號

1. 前往 zeabur.com
2. 點擊右上角「Sign Up」
3. 選擇用 GitHub 帳號登入

<!-- @img: zeabur-signup | Zeabur 註冊頁面，GitHub 登入按鈕位置 -->

#### Step 2：建立新專案

1. 登入後點擊「Create Project」
2. 區域選擇「Asia - Taiwan」
3. 名稱輸入 `my-openclaw`

<!-- @img: create-project | 建立專案畫面，顯示區域和名稱欄位 -->

### 🚨 常見錯誤：沒有切換到對的專案

頂部專案名稱沒有自動切換時，手動點擊選擇器。

<!-- @img: switch-project-error | 專案選擇器未切換的畫面 -->
```

### GIF 標記

如果某個操作是多步驟的連續動作，適合用 GIF 而非靜態截圖，使用：

```
<!-- @img: skill-create-demo.gif | 建立 Skill 的完整操作流程（3 步驟） -->
```

檔名加上 `.gif` 後綴，作者在 Phase 2 就知道這裡需要錄 GIF 而非截圖。

---

## 專有名詞與概念連結

本站有一套概念自動連結系統。寫文章時請遵守以下規則，確保概念之間的正確串接。

### 概念來源

所有已定義的概念存放在 `src/data/concepts.yaml`，每筆概念包含：
- `displayName`：正式中文名稱
- `aliases`：同義詞／英文縮寫（用於自動連結比對）
- `shortDesc`：一句話說明
- `canonicalArticle`：主要解釋該概念的文章 slug
- `relatedArticles`：有提到該概念的其他文章

自動產生的概念索引：`docs/article-registry.json`（執行 `npm run registry` 取得最新版）。

### 寫作守則

1. **用語一致**：使用 `concepts.yaml` 中的 `displayName` 或 `aliases` 寫法。例如「大型語言模型（LLM）」不要寫成「大語言模型」。
2. **首次出現時帶全名**：在文章中第一次提到概念時，寫全名加縮寫，如「大型語言模型（LLM）」；之後可只用縮寫 `LLM`。
3. **不需手動加連結**：Remark 插件會自動將已知概念的首次出現轉為超連結指向 `canonicalArticle`。你只需正常寫文字即可。
4. **自身概念不會連結**：如果你在寫 `llm-guide.md`，文中的「LLM」不會被連結（避免自連）。
5. **新概念要登錄**：如果文章引入了 `concepts.yaml` 中不存在的新名詞，請在文章完成後提醒更新 `concepts.yaml` 並重跑 `npm run registry`。

### 概念快速查表

撰寫新文章前，先參考 `docs/article-registry.json` 了解：
- 哪些概念已有 canonical 文章（不需重複解釋，讀者可點連結）
- 哪些概念尚無 canonical 文章（可以在新文章中全面說明並登錄為 canonical）
- 各文章定義了哪些概念、引用了哪些概念（避免遺漏關聯）

### 新增概念範例

如果你在新文章中定義了一個新概念「Fine-tuning（微調）」，完成文章後需要：

```yaml
# 加入 src/data/concepts.yaml
fine-tuning:
  displayName: "微調（Fine-tuning）"
  aliases: ["Fine-tuning", "微調", "fine-tune"]
  shortDesc: "用特定資料進一步訓練已有的模型，使其更適合特定任務"
  canonicalArticle: "your-new-article-slug"
  relatedArticles: ["llm-guide", "token-economics"]
```

然後執行 `npm run registry` 更新索引。
