---
title: "Windows 安裝 Docker + n8n 避坑完全指南"
description: "專為 Windows 新手設計的 Docker + WSL2 + n8n 安裝教學，整理了最常見的五大踩坑點與修復 SOP，包含公司電腦資安限制的處理方式。"
contentType: "tutorial"
scene: "安裝與部署"
difficulty: "入門"
createdAt: "2026-05-30"
verifiedAt: "2026-05-30"
archived: false
order: 10
prerequisites: []
estimatedMinutes: 20
tags: ["Docker", "n8n", "Windows", "WSL", "安裝", "除錯"]
stuckOptions:
  "安裝 Docker Desktop": ["安裝時要不要勾 WSL 2？", "安裝後電腦需要重啟嗎？"]
  "WSL2 權限被拒": ["PowerShell 找不到 wsl 指令", "nano 編輯器怎麼用？", "wsl --shutdown 之後 Docker 還是壞的"]
  "Volume 掛載失敗": ["n8n 啟動後瀏覽器打不開", "重啟容器後資料不見了"]
  "公司電腦連不上": ["localhost:5678 一直轉圈", "Docker pull 失敗或卡住", "需要跟 IT 申請什麼？"]
  "Port 衝突": ["指令跑完沒有任何輸出", "怎麼知道哪個程式佔用了 Port？"]
---

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **這篇文章的由來**：一次 Docker Desktop 更新後，WSL2 權限直接爆炸，花了不少時間才搞定。把這些坑整理成一份 SOP，讓你不用重蹈覆轍。

> 📌 **Mac 使用者請移駕**：這篇是 Windows 專版。Mac 版本簡單很多，請看：[Mac 安裝 Docker + n8n 完整指南](/articles/docker-n8n-mac)

---

## 🛠️ 先搞懂三個工具的關係

在 Windows 上跑 Docker 有一條奇妙的工具鏈，搞清楚它們的關係，出問題時才知道從哪裡下手：

| 工具 | 角色 | 比喻 |
|------|------|------|
| **[WSL2](/articles/windows-wsl-guide)**（Windows Subsystem for Linux） | Windows 裡面的 Linux 虛擬環境 | 公寓裡隔出來的小套房 |
| **Docker Desktop** | 管理容器的圖形介面，但實際引擎跑在 WSL2 裡 | 套房的房東（你住在 Windows 這層） |
| **n8n** | 跑在 Docker 容器內的自動化工具 | 套房裡的住客 |

<!-- @img: docker-architecture-diagram | Windows Docker 架構示意圖 -->

---

## 💡 核心概念速懂：Image 與 Container

很多新手裝好後還是搞不清楚指令在做什麼，先把這兩個概念記起來：

- **Image（映像檔）**＝ 食譜，唯讀、靜態，只下載一次
- **Container（容器）**＝ 依照食譜做出的菜，是活生生跑在記憶體裡的實體

用同一個 n8n Image，你可以同時跑多個獨立的 Container，只要確保這三個參數不衝突：

| 參數 | 說明 | 衝突後果 |
|------|------|----------|
| `Port` | 對外的通訊埠 | 兩個容器不能搶同一個 Host Port |
| `Volume` | 資料存放位置 | 指到同一個資料夾會互相覆蓋 |
| `Container 名稱` | 識別用的 ID | 不能重名 |

---

## 🚀 標準安裝步驟

### Step 1：安裝 Docker Desktop

1. 前往 [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/) 下載
2. 安裝時選 **Use WSL 2 instead of Hyper-V**（這是預設選項，保持勾選）
3. 安裝完成後重新開機

<!-- @img: docker-desktop-install-wsl2-option | Docker Desktop 安裝時選擇 WSL2 選項 -->

### Step 2：啟動第一個 n8n

開啟 PowerShell，建立一個乾淨的資料夾存放 n8n 資料。

> 💡 **C 碟還是 D 碟？** Windows 早期使用者常因 C 碟空間不足導致開機異常，建議將 Docker 資料放在 D 碟或其他容量充裕的硬碟。若你的電腦有 D 碟，優先選 D 碟。

```powershell
# 有 D 碟：推薦放這裡
mkdir D:\n8n_data

# 只有 C 碟：放根目錄，遠離使用者資料夾
mkdir C:\n8n_data
```

然後執行以下指令啟動 n8n（路徑對應你剛才建立的資料夾）：

```powershell
# 使用 D 碟（推薦）
docker run -d --name n8n -p 5678:5678 -v "D:\n8n_data:/home/node/.n8n" docker.n8n.io/n8nio/n8n

# 使用 C 碟
docker run -d --name n8n -p 5678:5678 -v "C:\n8n_data:/home/node/.n8n" docker.n8n.io/n8nio/n8n
```

<!-- @img: powershell-docker-run-n8n | PowerShell 執行 docker run 啟動 n8n -->

等幾秒後，打開瀏覽器前往 `http://localhost:5678`，看到 n8n 設定畫面就成功了！

<!-- @img: n8n-first-run-browser | 瀏覽器開啟 n8n 初始設定畫面 -->

---

## 🚨 五大踩坑點與修復 SOP

### 坑點一：WSL2 權限被拒（Docker 更新後最常見）

**症狀**：Docker Desktop 啟動失敗，出現類似以下訊息：

```
CreateProcessCommon:818: execvpe(/mnt/wsl/docker-desktop/docker-desktop-user-distro) failed: Permission denied
```

**原因**：Docker Desktop 更新後，在 Windows 與 WSL2 Ubuntu 的交界處需要部署掛載代理程式。如果 Ubuntu 的自動掛載沒有開啟 `metadata` 權限，Linux 會拒絕執行，噴出 Permission denied。

**修復步驟**：

1. 以**系統管理員身份**開啟 PowerShell
2. 輸入以下指令穿透進 Ubuntu 開啟設定檔：

```powershell
wsl -d Ubuntu-24.04 -u root nano /etc/wsl.conf
```

<!-- @img: powershell-wsl-nano-wslconf | PowerShell 執行 wsl nano 開啟設定檔 -->

> 若你的 Linux 版本不同（例如 Ubuntu-22.04），請改成對應的名稱。輸入 `wsl -l -v` 可查看你安裝了哪些版本。如果還沒有安裝 WSL，請先看：[WSL 完整教學](/articles/windows-wsl-guide)。

3. 畫面會進入 nano 文字編輯器。原本的內容應該長這樣：

```ini
[boot]
systemd=true
```

<!-- @img: nano-editor-wslconf-original | nano 編輯器顯示原始 wsl.conf 內容 -->

4. 用方向鍵移到最下方，在 `systemd=true` 下方**新增**以下內容：

```ini
[boot]
systemd=true

[automount]
enabled = true
options = "metadata,uid=1000,gid=1000,umask=22,fmask=11"
```

5. 存檔並退出：
   - 按 `Ctrl + O` → 按 `Enter` 確認存檔
   - 按 `Ctrl + X` 退出編輯器

<!-- @img: nano-editor-wslconf-updated | nano 編輯器儲存後的 wsl.conf 完整內容 -->

6. 回到 PowerShell，執行以下指令讓設定生效：

```powershell
wsl --shutdown
```

7. 重新開啟 Docker Desktop，問題解決。

> 🚨 **如果上面步驟無效**，可以試試在 Docker Desktop 設定裡手動重設 WSL 整合：Settings → Resources → WSL Integration → 把 Ubuntu-24.04 的開關關掉再打開，點擊 **Apply & restart**。

---

### 坑點二：斜線打錯 + 路徑含空格（Volume 掛載失敗）

**症狀**：n8n 啟動看似正常，但重啟後工作流全部不見；或是直接啟動失敗。

**原因**：
- Windows 路徑用反斜線 `\`，Docker 容器（Linux 環境）用正斜線 `/`，兩者混用就壞了
- Windows 使用者名稱含空格（例如 `C:\Users\John Doe`），Docker 指令會在空格處斷掉

**正確寫法**：

```powershell
# ✅ 正確：用雙引號包住整個 Volume 路徑
docker run -d --name n8n -p 5678:5678 -v "C:\n8n_data:/home/node/.n8n" docker.n8n.io/n8nio/n8n

# ❌ 錯誤示範：沒有雙引號，路徑含空格就會壞掉
docker run -d --name n8n -p 5678:5678 -v C:\Users\John Doe\n8n:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

**三個秘訣**：
1. `-v` 的整個路徑用 `""` 包住
2. 優先把資料夾建在 **D 碟**（如 `D:\n8n_data`）；若只有 C 碟，也請放根目錄（如 `C:\n8n_data`），避開有空格的使用者資料夾（`C:\Users\名字`）
3. 容器內路徑（冒號後面）永遠用正斜線 `/`

> ⚠️ **C 碟空間警告**：n8n 的工作流資料、執行記錄會持續累積。C 碟本就是 Windows 系統碟，空間有限，放在 D 碟能避免幾個月後突然開機失敗的窘境。

---

### 坑點三：公司電腦資安限制（最隱形的連線殺手）

**症狀**：Docker 看起來跑得好好的，但瀏覽器開 `http://localhost:5678` 永遠轉圈；或是 `docker pull` 卡住下不來。

**原因**：公司電腦通常受以下限制管控：

| 限制類型 | 具體影響 |
|----------|----------|
| 企業防火牆 / GPO | 封鎖非標準 Port（如 5678），切斷 Windows 與 WSL2 之間的本地迴路連線 |
| 資安軟體（Zscaler、Trend Micro、GlobalProtect VPN） | 攔截 SSL 憑證，導致 docker pull 噴出 `certificate signed by unknown authority` |
| IT 管理政策 | 禁止安裝未授權軟體，Docker Desktop 安裝程式直接被擋下 |

**處理方式**：

**先試這個**：把 `localhost` 改成 `127.0.0.1`：

```
http://127.0.0.1:5678
```

**如果還是不行**，嘗試換一個 Port（公司環境常見的替代選項是 `8080`）：

```powershell
docker run -d --name n8n -p 8080:5678 -v "C:\n8n_data:/home/node/.n8n" docker.n8n.io/n8nio/n8n
```

瀏覽器改開 `http://localhost:8080`。

**如果 docker pull 卡住**，需要在 Docker Desktop 設定公司 Proxy：
Settings → Resources → Proxies → 填入公司內部的 HTTP/HTTPS Proxy 位址（向 IT 部門索取）

<!-- @img: docker-desktop-proxy-settings | Docker Desktop 設定企業 Proxy 的畫面 -->

> 💡 **建議做法**：在公司電腦安裝前，先詢問 IT 部門：（1）是否允許安裝 Docker Desktop，（2）是否需要 Proxy 設定，（3）本地 Port 5678 是否可用。有授權再裝，省去被資安系統反覆擋下的麻煩。

---

### 坑點四：C 碟被 WSL2 悄悄吃掉（硬碟爆滿）

**症狀**：裝了 Docker 幾週後，C 碟紅條爆滿。即使在 Docker 裡刪掉 Image，空間也完全沒有釋放。

**原因**：WSL2 使用一個叫做 `ext4.vhdx` 的虛擬硬碟檔存放 Linux 資料。這個檔案**只會變大、不會自動縮小**，即使 Linux 內部刪除了東西，Windows 這邊看不出來。

**主動壓縮（建議每個月做一次）**：

1. 完全關閉 Docker Desktop，並在 PowerShell 執行：

```powershell
wsl --shutdown
```

2. 開啟 Windows 搜尋，輸入 `diskpart`，**以系統管理員身份**開啟

3. 在 diskpart 視窗依序輸入（把 `你的用戶名` 換成你的 Windows 帳號名稱）：

```
select vdisk file="C:\Users\你的用戶名\AppData\Local\Docker\wsl\data\ext4.vhdx"
attach vdisk readonly
compact vdisk
detach vdisk
exit
```

<!-- @img: diskpart-compact-vhdx | diskpart 執行壓縮 WSL2 虛擬硬碟的畫面 -->

> 壓縮時間視檔案大小而定，可能需要幾分鐘。

---

### 坑點五：Port 衝突（最好解決的坑）

**症狀**：執行 `docker run` 後噴出：

```
Bind for 0.0.0.0:5678 failed: port is already allocated
```

**原因**：電腦上已有一個 n8n 容器在跑，或其他程式佔用了 5678 Port。

**修復步驟**：

```powershell
# 查看所有容器（包含停止的）
docker ps -a

# 如果看到舊的 n8n 容器，先刪掉它
docker rm -f n8n

# 確認 Port 是否被其他程式佔用
netstat -ano | findstr "5678"
```

<!-- @img: powershell-docker-ps-port-check | PowerShell 執行 docker ps 和 netstat 檢查 Port 佔用 -->

---

## 💡 日常維護：三個防坑好習慣

### 習慣一：優雅關機

準備關機前，先**右鍵點擊**工作列右下角的 Docker Desktop 圖示，選 **Quit Docker Desktop**。

直接強制關機很容易讓 WSL2 的檔案系統來不及寫入，隔天開機就可能遇到 Docker 壞掉的慘況。

### 習慣二：看日誌找病因

n8n 網頁打不開時，不要直接重裝。先看日誌：

```powershell
docker logs n8n
```

日誌通常會用白話文告訴你是「資料夾沒有讀寫權限」還是「Port 被佔用」，比盲目重試有效率多了。

### 習慣三：Volume 是命根子

永遠記住：**Container 是可以隨時丟棄的**，但 Volume 裡的資料才是你真正的財產。

只要 `-v "C:\n8n_data:/home/node/.n8n"` 這行指令沒有打錯，不管 Docker 怎麼更新、容器怎麼刪除，你的 n8n 工作流和設定都不會消失。

---

## 🗺️ 常用指令速查表

```powershell
# 啟動 n8n（D 碟版，推薦）
docker run -d --name n8n -p 5678:5678 -v "D:\n8n_data:/home/node/.n8n" docker.n8n.io/n8nio/n8n

# 啟動 n8n（C 碟版）
docker run -d --name n8n -p 5678:5678 -v "C:\n8n_data:/home/node/.n8n" docker.n8n.io/n8nio/n8n

# 會起之後再啟動
 docker start n8n

# 停止 n8n
docker stop n8n

# 查看執行中的容器
docker ps

# 查看所有容器（含停止的）
docker ps -a

# 查看 n8n 日誌
docker logs n8n

# 刪除 n8n 容器（資料不會消失，因為存在 Volume）
docker rm n8n

# 強制重啟 WSL2
wsl --shutdown
```

---

## 🔗 延伸閱讀

- **用 Mac 跨階簡單很多？** → [Mac 安裝 Docker + n8n 完整指南](/articles/docker-n8n-mac)
- **想了解 Windows 為什麼要跟 Linux 連在一起？** → [為什麼不建議在 Windows 原生環境安裝 OpenClaw？](/articles/why-not-windows-openclaw)
- **想深入了解 WSL2 的管理方式？** → [WSL 完整教學](/articles/windows-wsl-guide)
- **想在 Windows 上跑 AI Agent？** → [Windows 安裝 OpenClaw 完整教學](/articles/install-openclaw-windows)
- **想用免費本地 LLM？** → [Ollama + OpenClaw 快速上手｜Windows 篇](/articles/ollama-openclaw-windows)

# 查看所有容器（含停止的）
docker ps -a

# 查看 n8n 日誌
docker logs n8n

# 停止 n8n
docker stop n8n

# 刪除 n8n 容器（資料不會消失，因為存在 Volume）
docker rm n8n

# 強制重啟 WSL2
wsl --shutdown
```
