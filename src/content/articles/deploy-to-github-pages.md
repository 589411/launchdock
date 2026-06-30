---
title: "把靜態網站／PWA 部署到 GitHub Pages：從建 repo 到自動上線"
description: "把你的純前端網站（HTML/JS、PWA）免費部署到 GitHub Pages：建立 repo、推上程式、在 Settings 開啟 Pages，讓 GitHub Actions 自動 build 並上線。附完整截圖與 build 失敗、網域排錯。"
contentType: "tutorial"
scene: "安裝與部署"
difficulty: "中級"
createdAt: "2026-06-29"
verifiedAt: "2026-06-29"
archived: false
order: 6
prerequisites: []
estimatedMinutes: 12
tags: ["GitHub", "部署", "整合", "設定"]
stuckOptions:
  "建立 repo 並推上程式": ["repo 要設公開還私有？", "git remote / push 指令怎麼下？", "推上去但 repo 是空的？"]
  "開啟 GitHub Pages": ["Settings 裡找不到 Pages", "Source 要選 branch 還是 Actions？", "選哪個分支、哪個資料夾？"]
  "等待自動部署": ["Actions 在哪看？", "build 一直失敗", "顯示部署成功但網址打不開"]
  "網站上線後": ["網址是什麼格式？", "為什麼樣式跑掉／資源 404？", "可以綁自己的網域嗎？"]
---

> **一句話**：把程式推上 GitHub repo → 到 **Settings → Pages** 把 Source 設成你的分支 → GitHub Actions 會自動 build 並把網站掛上線，網址是 `你的帳號.github.io/repo名`。完全免費。

**關鍵字**：GitHub Pages、靜態網站、PWA、部署、deploy、Settings、Pages、Source、Deploy from a branch、GitHub Actions、pages build and deployment、Authorized domains、自訂網域

---

## 為什麼用 GitHub Pages？

如果你的網站是**純前端**（HTML / CSS / JS，沒有後端），GitHub Pages 是最省事的免費上線方式：

- **免費、免伺服器**：GitHub 直接幫你 host 靜態檔。
- **推上去就部署**：之後每次 `git push`，GitHub Actions 自動重新 build 上線。
- **自帶 HTTPS**：`你的帳號.github.io` 預設就有憑證。

很適合 PWA、作品集、教學頁、活動報名頁這類純前端專案。

---

## Step 1：建立 repo 並把程式推上去

在 GitHub 建立一個新的 repo（還沒有 GitHub 帳號的話，先看[註冊 GitHub 帳號](/articles/github-account-signup)）。建立後會看到 **Quick setup** 頁，照著把本機程式推上去：

```bash
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/你的帳號/你的repo.git
git branch -M main
git push -u origin main
```

![GitHub 新 repo 的 Quick setup 頁，含推送指令](/images/articles/deploy-to-github-pages/github-repo-quick-setup.png)

推完重新整理 repo，就會看到你的檔案（`index.html`、`manifest.webmanifest`、圖示等）都上去了。

![推送後 GitHub repo 顯示專案檔案與 README](/images/articles/deploy-to-github-pages/github-repo-files-pushed.png)

---

## Step 2：在 Settings 開啟 GitHub Pages

進入 repo 的 **Settings → Pages**。在 **Build and deployment** 的 **Source** 選 **Deploy from a branch**，分支選 **main**、資料夾選 **/ (root)**，按 **Save**。

![GitHub Pages 設定頁，Source 選 Deploy from a branch、main / root](/images/articles/deploy-to-github-pages/github-pages-source-setting.png)

### 🚨 Source 要選「branch」還是「GitHub Actions」？

- **Deploy from a branch**（最簡單）：適合「程式本身就是可直接 host 的靜態檔」（純 HTML/JS）。選了它，GitHub 會用內建的 `pages build and deployment` 流程自動部署。
- **GitHub Actions**：適合「需要先 build」的專案（例如 Astro、React 要先 `npm run build`），用自訂 workflow 產出靜態檔再部署。

> 本例是直接可 host 的 PWA，所以選 **Deploy from a branch** 最快。

---

## Step 3：等 GitHub Actions 自動部署

按下 Save 後，GitHub 會自動觸發一個部署流程。到 repo 上方的 **Actions** 分頁，可以看到一個 **pages build and deployment** 的 workflow 正在跑。

![GitHub Pages 設定頁指向 Actions 分頁](/images/articles/deploy-to-github-pages/github-pages-building.png)

![GitHub Actions 的 pages build and deployment workflow 列表](/images/articles/deploy-to-github-pages/github-actions-pages-workflow.png)

點進去能看到 **build → report → deploy** 三個階段。三個都打勾、顯示綠色，就代表部署成功了。

![GitHub Actions workflow 詳情，build/deploy 三階段成功](/images/articles/deploy-to-github-pages/github-actions-deploy-success.png)

### 🚨 build 一直失敗？

點進失敗的 workflow，展開紅色的那一步看 log。純 branch 部署很少失敗；若你改用 **GitHub Actions** 模式，最常見是 build 指令或輸出資料夾設錯（例如 Astro 要輸出到 `dist`）。

---

## Step 4：網站上線

部署成功後，你的網站就活在 **`https://你的帳號.github.io/repo名/`**。打開就能看到成品（本例是一個 PWA 課程預約系統，可「加入主畫面」當 App 開）。

![部署上線的 PWA 網站成品](/images/articles/deploy-to-github-pages/github-pages-live-site.png)

### 🚨 網址打得開但樣式跑掉／資源 404？

GitHub Pages 的網址多了一層 `/repo名/` 子路徑。如果你的 HTML 用**絕對路徑**（`/style.css`）載入資源，會 404。改用**相對路徑**（`./style.css`），或在框架設定 `base` 為 `/repo名/`。

### 🚨 想接 Firebase 登入卻失敗？

如果網站要用 Firebase 登入，記得把 `你的帳號.github.io` 加進 Firebase 的 **Authorized domains**，否則登入會被擋（見 [修 Missing permissions：部署 Firestore 規則](/articles/firebase-firestore-rules-deploy)）。

---

## 重點回顧

- GitHub Pages = 純前端網站的**免費、自動部署**上線方式。
- 流程：建 repo → push 程式 → **Settings → Pages** 設 Source → **Actions** 自動 build → 上線。
- 靜態檔直接 host 選 **Deploy from a branch**；要先 build 的框架選 **GitHub Actions**。
- 網址是 `你的帳號.github.io/repo名/`；資源記得用**相對路徑**避免 404。
- 要接 Firebase 登入，別忘了把網域加進 **Authorized domains**。
