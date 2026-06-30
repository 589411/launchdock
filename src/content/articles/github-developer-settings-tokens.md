---
title: "GitHub 開發者設定導覽：Fine-grained Token、SSH/GPG 金鑰在哪管理"
description: "搞不清楚 GitHub 的 Personal Access Token、SSH/GPG 金鑰、GitHub Apps 在哪設定？這篇帶你認識 Settings → Developer settings 底下各個頁面，重點講解較安全的 Fine-grained Token，以及操作敏感設定時的 passkey 二次驗證。"
contentType: "guide"
scene: "環境準備"
difficulty: "中級"
createdAt: "2026-06-29"
verifiedAt: "2026-06-29"
archived: false
order: 2
prerequisites: []
estimatedMinutes: 8
tags: ["GitHub", "API", "設定", "整合"]
stuckOptions:
  "找不到開發者設定": ["Developer settings 在哪？", "Personal access tokens 在哪一層？", "Fine-grained 跟 classic 差在哪？"]
  "Fine-grained Token": ["為什麼建議用 fine-grained？", "token 會過期嗎？", "在哪按 Generate new token？"]
  "Confirm access 二次驗證": ["為什麼一直要我用 passkey？", "沒有 passkey 怎麼辦？", "這個驗證多久要做一次？"]
---

> **一句話**：GitHub 的金鑰與權杖都收在 **Settings → Developer settings** 底下。要拿給程式／CLI 用的存取權杖，優先用權限更細、可設到期日的 **Fine-grained personal access token**。

**關鍵字**：GitHub、Developer settings、Personal Access Token、PAT、Fine-grained token、Tokens classic、SSH keys、GPG keys、Vigilant mode、GitHub Apps、Confirm access、passkey、二次驗證

---

## 為什麼要認識這些設定？

當你開始用 GitHub 做點進階的事——用 `git` 推送、跑 `gh` CLI、串 CI/CD、讓某個服務存取你的 repo——常會遇到「請提供 Personal Access Token」或「設定 SSH 金鑰」。這些東西全部收在同一個地方：**Settings → Developer settings**。這篇幫你把這張地圖建立起來，之後看到「去產生一組 token」就知道往哪走。

---

## SSH 與 GPG 金鑰：身分與簽章

在 **Settings → SSH and GPG keys** 可以管理：

- **SSH keys**：讓你免帳密用 `git@github.com` 推送程式。
- **GPG keys**：替你的 commit 數位簽章，讓 GitHub 標記為 **Verified**。
- **Vigilant mode**：開啟後，沒簽章的 commit 會被標為 **Unverified**，提高可信度。

![GitHub 的 SSH and GPG keys 設定頁，含 Vigilant mode](/images/articles/github-developer-settings-tokens/github-ssh-gpg-keys.png)

---

## Developer settings：權杖與 App 都在這

點到最底的 **Developer settings**，左側會看到幾個區塊：

- **GitHub Apps／OAuth Apps**：你建立的應用程式整合。
- **Personal access tokens**：又分 **Fine-grained tokens**（新、推薦）與 **Tokens (classic)**（舊）。

![GitHub Developer settings 左側選單，Personal access tokens 分 Fine-grained 與 classic](/images/articles/github-developer-settings-tokens/github-developer-settings-menu.png)

### 🚨 Fine-grained 跟 classic 差在哪？該用哪個？

- **Tokens (classic)**：權限是「整包」的，勾了 `repo` 就等於能碰你**所有** repo，且預設不強制到期。
- **Fine-grained tokens**：可以**指定只授權某幾個 repo**、把權限拆得很細（只讀 Contents、只寫 Issues…），且**一定要設到期日**。

> 💡 除非工具明確只吃 classic，否則**一律優先用 fine-grained**——權限最小化、會自動過期，外洩風險小很多。

---

## Fine-grained Token 清單：建立與管理

進到 **Fine-grained tokens** 會看到你現有的權杖清單：每個顯示**最後使用時間**與**是否已過期**，右側可 **Delete**。要新增就點右上角 **Generate new token**。

![GitHub Fine-grained personal access tokens 清單頁](/images/articles/github-developer-settings-tokens/github-fine-grained-tokens-list.png)

> ⚠️ Token 只在**建立當下**完整顯示一次，務必當場複製存好；關掉就再也看不到原文（只能重新產生）。**Token 等同密碼，絕不要貼進前端程式或 commit 進 git。**
>
> 清單上看到一堆「This token has expired」是正常的——fine-grained token 到期就自動失效，是預期中的安全行為，過期的可以直接刪掉。

---

## 🚨 操作到一半要你「Confirm access」？

當你要動到敏感設定（建立／刪除 token、改金鑰）時，GitHub 會跳出 **Confirm access**，要求你用 **passkey／GitHub Mobile／email 驗證碼**再驗證一次身分（這叫 sudo 模式）。

![GitHub Confirm access 頁，要求用 passkey 二次驗證](/images/articles/github-developer-settings-tokens/github-confirm-access-passkey.png)

這是保護機制，不是出錯。用你設定過的 passkey（或選其他方式）通過即可；通過後一小段時間內的敏感操作就不會再一直問。

---

## 重點回顧

- 金鑰與權杖都在 **Settings → Developer settings**。
- 給程式／CLI 用的存取權杖，**優先用 Fine-grained token**：可限定 repo、權限最小化、強制到期。
- Token **只顯示一次**，當場存好；它等於密碼，**別進前端、別進 git**。
- 動敏感設定時的 **Confirm access（passkey）** 是 sudo 保護機制，不是錯誤。
