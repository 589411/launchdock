# 反向工作流程：從截圖反推教學文章

> 既有截圖 → 反推出一篇符合 LaunchDock 統一風格的文章。
> 與正向流程（先寫文章帶 `@img` → 再截圖配對，見 `article-workflow-guide.md`）相反。

---

## 🔴 為什麼這件事必須在 Claude Code 做，不能在 cowork 做

1. **遮蔽是本機工具**：機敏資訊遮蔽靠 `auto-capture`（macOS Vision OCR，本機 Python），雲端的 cowork 跑不了。
2. **順序問題**：一旦把**未遮蔽**的原始截圖上傳到雲端，機敏資訊在那一刻就已外流——遮蔽再好也來不及。**遮蔽必須在圖片離開機器之前、於本機完成。**
3. **風格一致性免費**：Claude Code 進 repo 自動讀 `CLAUDE.md`、`article-registry.json`、`concepts.yaml`，cowork 得手動貼且仍跑不了 `npm run registry`。

---

## ⚠️ 自動遮蔽的已知盲點（必讀）

`auto-capture` 預設 regex 只抓：**信用卡 / API key（OpenAI/Anthropic/Google/AWS/GitHub）/ email / 通用 secret**。

**它「抓不到」**：用戶名、主機名、`/Users/...` 路徑、終端機提示字元（如 `joseph@MacBook`）、瀏覽器登入的個人名稱、人臉。

➡️ 所以一定要做 **AI 視覺第二輪**：人眼掃過每張圖，把上述個資用 `--mask-text` 指定 token，由 OCR 定位後整行馬賽克。

---

## 完整流程

### Step 0：環境（一次性）

```bash
git clone https://github.com/589411/auto-capture.git ~/Documents/github/auto-capture
cd ~/Documents/github/auto-capture
python3 -m venv .venv && .venv/bin/pip install -e .
```

`scripts/redact-screenshots.py` 會在偵測不到套件時自動切換到這個 venv，所以平常用系統 `python3` 跑即可。

### Step 1：暫存原圖（先別進 `public/`）

把要用的截圖複製到 `~/Desktop/captures/_staging/<slug>/`，依操作順序命名 `01-raw.png`、`02-raw.png`…（`_staging` 與 `*-raw.png` 都不該被 commit）。

### Step 2：先掃描看哪裡有個資

```bash
python3 scripts/redact-screenshots.py ~/Desktop/captures/_staging/<slug> --scan --suffix
```

讓 Claude Code 逐張看圖，列出**自動工具抓不到**的個資 token（用戶名、主機名等）。

### Step 3：兩輪遮蔽

```bash
# 預設 patterns + 人工 token，產出 NN-clean.png
python3 scripts/redact-screenshots.py ~/Desktop/captures/_staging/<slug> \
    --suffix --mask-text joseph --mask-text MacBook
```

`--mask-text` 可重複，大小寫不拘；任何 OCR 文字行含該 token 就整行馬賽克。

### Step 4：上架前最終掃描（必須 0 命中）

```bash
python3 scripts/redact-screenshots.py ~/Desktop/captures/_staging/<slug> --scan --mask-text joseph
```

顯示「✅ 全部 clean」才能繼續。

### Step 5：複製乾淨圖進 `public/`

用**語意化 kebab-case 檔名**（對應文章 @img 標記）：

```bash
DEST=public/images/articles/<slug>
mkdir -p "$DEST"
cp ~/Desktop/captures/_staging/<slug>/01-clean.png "$DEST/<描述性檔名>.png"
# …其餘類推
```

### Step 6：反推文章（套統一風格）

依 `CLAUDE.md` + `article-registry.json` + `concepts.yaml`：

- 動筆前讀 registry，沿用既有概念用語、別重複解釋
- 同步產出**中英文兩版**（`src/content/articles/<slug>.md`、`src/content/articles/en/<slug>.md`），scene/difficulty 用對應語言 key
- 完整 frontmatter；風格：繁中口語但專業、用「你」、步驟編號、常見錯誤用 `### 🚨`
- 圖片直接寫成已配對語法 `![alt](/images/articles/<slug>/<檔名>.png)`

### Step 7：新概念登錄

若引入 `concepts.yaml` 沒有的新名詞 → 補上，再跑：

```bash
npm run registry
```

---

## 與正向流程的對照

| | 正向（既有） | 反向（本文） |
|---|---|---|
| 起點 | 先寫文章帶 `@img` 佔位 | 先有截圖 |
| 圖片 | 照標記去截圖、再配對 | 反推文字去對應既有圖 |
| 遮蔽 | 同樣必做 | 同樣必做（且更關鍵，個資已存在圖中） |
| 工具 | `scripts/add-image.sh` | `scripts/redact-screenshots.py` + 手動配對 |

---

**首次實作產物**：`deploy-line-bot-cloudflare-workers`（中英文版）。
**相關**：`article-workflow-guide.md`、`llm-article-prompt.md`、`image-workflow.md`、`CLAUDE.md`。

**Last updated:** 2026-06-18
