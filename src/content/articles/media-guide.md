---
title: "文章媒體使用指南：圖片、GIF、影片的插入方法"
description: "如何在 LaunchDock 文章中高效插入截圖、動態 GIF 和 YouTube 影片，讓教學生動易懂。"
scene: "編輯指南"
difficulty: "入門"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: true
archivedReason: "內部編輯指南，不對讀者公開"
discussionUrl: "https://github.com/589411/launchdock/discussions"
order: 99
tags: ["LaunchDock", "編輯指南", "圖片", "GIF", "影片"]
stuckOptions:
  "圖床方案": ["圖片該放 GitHub 還是 CDN？", "免費圖床有流量限制嗎？"]
  "圖片": ["圖片太大怎麼壓縮？", "Markdown 圖片路徑寫錯了"]
  "GIF 動畫": ["GIF 檔案太大超過限制", "要用什麼工具錄 GIF？"]
  "影片": ["YouTube 嵌入碼怎麼取得？", "影片比例變形了"]
---

## 為什麼需要圖片和影片？

純文字教學最大的問題是——當讀者看到「點擊右上角的設定按鈕」時，他不確定你說的是哪一個。

加上截圖、GIF 動畫或操作影片，學習效率可以提升 3-5 倍。

---

## 圖床方案：圖片放哪裡？

### 方案一：專案內 public 資料夾（推薦）

圖片直接放在專案的 `public/images/articles/` 目錄下：

```
public/
└── images/
    └── articles/
        ├── deploy-cloud/
        │   ├── zeabur-signup.png
        │   ├── zeabur-deploy.gif
        │   └── zeabur-dashboard.png
        ├── skill/
        │   ├── skill-editor.png
        │   └── skill-run-demo.gif
        ├── agent/
        │   └── agent-loop.png
        └── soul/
            └── memory-diagram.png
```

**優點**：
- 版本控制跟著 Git
- 不會壞連結（不依賴外部服務）
- 本地開發時也能看到圖片

**缺點**：
- 大檔案會讓 repo 變大（建議單張圖 < 500KB）

**Markdown 引用方式**：

```markdown
![Zeabur 註冊頁面截圖](/images/articles/deploy-cloud/zeabur-signup.png)
```

### 方案二：GitHub Issue 圖床（快速）

最簡單的免費方案：

1. 到任意 GitHub repo 開一個 Issue
2. 把圖片**拖拉**到 Issue 的文字框
3. GitHub 會自動上傳並產生 URL
4. 複製 URL 貼到 Markdown 中
5. Issue 不需要送出（可以取消）

```markdown
![截圖說明](https://github.com/user-attachments/assets/xxxxxxxx.png)
```

**優點**：免費、無限量、CDN 加速
**缺點**：依賴 GitHub 服務

### 方案三：Cloudflare R2 / AWS S3（正式環境）

適合大量圖片或需要 CDN 加速的場景：

```bash
# 使用 Cloudflare R2（免費 10GB / 月）
# 搭配 rclone 上傳
rclone copy ./screenshots r2:launchdock-images/articles/
```

**優點**：專業、快速、可自訂網域
**缺點**：需要額外設定

### 推薦策略

| 場景 | 推薦方案 |
|---|---|
| 前期開發、文章少 | 方案一（public 資料夾）|
| 快速貼截圖 | 方案二（GitHub Issue）|
| 正式上線、大量圖片 | 方案三（Cloudflare R2）|

---

## 圖片：靜態截圖

### 截圖工具推薦

| 工具 | platform | 特色 |
|---|---|---|
| **CleanShot X** | macOS | 最推薦，支援標註、馬賽克 |
| **Shottr** | macOS | 免費、輕量 |
| **ShareX** | Windows | 功能最全 |
| **Flameshot** | Linux | 開源免費 |

### 截圖最佳實踐

1. **裁剪到重點區域**：不要截全螢幕，只截相關的部分
2. **加上標註**：用箭頭或框線指出重點位置
3. **統一尺寸**：建議寬度 800-1200px
4. **壓縮**：使用 [TinyPNG](https://tinypng.com) 壓縮，目標 < 300KB

### Markdown 語法

```markdown
<!-- 基本圖片 -->
![Zeabur 部署流程截圖](/images/articles/deploy-cloud/zeabur-deploy.png)

<!-- 帶說明文字的圖片（使用 HTML figure） -->
<figure>
  <img src="/images/articles/deploy-cloud/zeabur-deploy.png" alt="Zeabur 部署流程截圖" />
  <figcaption>圖：Zeabur 部署流程，點擊 Deploy 按鈕即可開始</figcaption>
</figure>

<!-- 控制圖片大小 -->
<img src="/images/articles/deploy-cloud/zeabur-logo.png" alt="Zeabur Logo" width="200" />
```

---

## GIF 動畫：操作步驟示範

GIF 非常適合展示「多步驟操作」，讀者一看就懂。

### GIF 錄製工具

| 工具 | 平台 | 特色 |
|---|---|---|
| **CleanShot X** | macOS | 錄製 + 轉 GIF 一氣呵成 |
| **Kap** | macOS | 開源免費，操作簡單 |
| **LICEcap** | macOS/Win | 超輕量，直接錄成 GIF |
| **ScreenToGif** | Windows | 內建編輯器 |
| **Peek** | Linux | 簡單快速 |

### GIF 最佳實踐

1. **控制時長**：3-10 秒最佳，超過 10 秒考慮用影片
2. **降低幀率**：15fps 就夠了（不需要 30fps）
3. **壓縮**：使用 [ezgif.com](https://ezgif.com/optimize) 壓縮
4. **目標大小**：< 2MB（超過 5MB 載入太慢）
5. **加上游標高亮**：讓讀者看到滑鼠在哪

### Markdown 語法

```markdown
<!-- GIF 和圖片一樣用 img 語法 -->
![Skill 建立操作步驟](/images/articles/skill/skill-create-demo.gif)

<!-- 帶說明的 GIF -->
<figure>
  <img src="/images/articles/skill/skill-create-demo.gif" alt="建立第一個 Skill 的操作步驟" />
  <figcaption>動畫：建立第一個 Skill 只需要 3 個步驟</figcaption>
</figure>
```

---

## 影片：YouTube / 外部影片

適合較長的操作示範或概念解說（> 30 秒）。

### YouTube 嵌入

```markdown
<!-- 在 Markdown 中使用 HTML 嵌入 YouTube -->
<div class="video-wrapper">
  <iframe 
    src="https://www.youtube.com/embed/VIDEO_ID" 
    title="影片標題"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
  </iframe>
</div>
```

把 `VIDEO_ID` 換成 YouTube 影片 ID（網址 `v=` 後面的那串）。

### 本地影片（MP4）

如果是自錄的短影片：

```markdown
<video controls width="100%">
  <source src="/videos/articles/skill-demo.mp4" type="video/mp4" />
  你的瀏覽器不支援影片播放。
</video>
```

> ⚠️ 本地影片檔案不建議放在 Git repo 中（太大）。建議上傳到 YouTube 或 Cloudflare Stream。

### Loom 嵌入

適合快速錄製操作影片：

```markdown
<div class="video-wrapper">
  <iframe 
    src="https://www.loom.com/embed/VIDEO_ID" 
    title="操作示範"
    allowfullscreen>
  </iframe>
</div>
```

---

## 高效編輯工作流

### 推薦的寫作流程

```
1. 先用純文字寫完整篇文章
2. 標記需要截圖的位置（用 HTML 註解）
3. 一次性錄製所有截圖和 GIF
4. 壓縮所有圖片
5. 放入對應資料夾，替換 placeholder
```

### 快速截圖標記法

在寫文章時，用 HTML 註解標記需要截圖的位置：

```markdown
這一步你需要點擊右上角的「Settings」按鈕。

<!-- 📸 截圖：Settings 按鈕位置，標註右上角 -->

然後在設定頁面填入你的 API Key。

<!-- 📸 截圖：API Key 輸入框 -->
<!-- 🎬 GIF：填寫 API Key 並按 Save 的操作過程 -->
```

等文章結構確定後，再一次性把所有截圖補上。這樣效率最高。

### VS Code 推薦套件

- **Paste Image**：`Ctrl/Cmd + Alt + V` 直接把剪貼簿截圖貼入 Markdown
- **Markdown Preview Enhanced**：即時預覽含圖片的 Markdown
- **Image Preview**：hover 圖片路徑時顯示預覽

---

## 命名規範

```
public/images/articles/
└── {article-slug}/
    ├── {step-number}-{description}.png    # 截圖
    ├── {step-number}-{description}.gif    # GIF
    └── cover.png                          # 文章封面（可選）

範例：
└── deploy-cloud/
    ├── 01-zeabur-signup.png
    ├── 02-create-project.png
    ├── 03-deploy-service.gif
    ├── 04-set-env-vars.png
    └── 05-generate-domain.png
```

重點：
- 用數字前綴保持順序
- 用英文、kebab-case 命名
- 描述要夠明確

---

## 圖片壓縮速查表

| 類型 | 目標大小 | 推薦工具 |
|---|---|---|
| 截圖 PNG | < 300KB | TinyPNG |
| GIF (3-10秒) | < 2MB | ezgif.com |
| 封面圖 | < 200KB | Squoosh.app |
| 影片縮圖 | < 100KB | TinyPNG |

---

## 小結

| 媒體類型 | 適合場景 | 語法 |
|---|---|---|
| 靜態截圖 | UI 位置說明 | `![alt](/images/...)` |
| GIF 動畫 | 多步驟操作示範 | `![alt](/images/....gif)` |
| YouTube 影片 | 長篇教學 (>30秒) | `<div class="video-wrapper"><iframe>` |
| 本地影片 | 短操作示範 | `<video>` |

記住：**先寫完文字，再補圖片。** 這是最有效率的做法。
