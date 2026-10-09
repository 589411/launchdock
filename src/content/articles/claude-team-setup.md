---
title: "Claude Team 方案怎麼申請？從付款、邀請成員到 Gmail 網域設定一次走完"
description: "想讓公司 2 個人以上一起用 Claude、統一付款、對話不拿去訓練模型？這篇用實際截圖走完 Claude Team 申請：從帳號選單升級、選席位與付款、建立團隊，到邀請成員、把 Gmail 加進允許網域、關掉會被白嫖的邀請連結，最後成員收信加入、決定個人帳號去留。附 2026 年 10 月台灣實付價格。"
contentType: "tutorial"
scene: "環境準備"
difficulty: "入門"
createdAt: "2026-10-10"
verifiedAt: "2026-10-10"
archived: false
order: 5
prerequisites: []
estimatedMinutes: 12
tags: ["Anthropic", "申請", "設定"]
modules: [M06]
stuckOptions:
  "選方案": ["Team 跟 Pro 差在哪？", "標準席位和進階席位怎麼選？", "一個人可以開 Team 嗎？"]
  "付款": ["結帳頁的 $ 是美金還是台幣？", "月繳還是年繳划算？", "可以開發票／收據嗎？"]
  "邀請成員": ["邀請一直送不出去", "成員用 Gmail 收不到邀請", "邀請連結要不要開？"]
  "加入團隊": ["加入後原本的對話不見了？", "我原本的 Pro／Max 要不要退？", "怎麼切回個人帳號？"]
---

> **一句話**：Claude Team 是給 **2～150 人**的公司方案——帳號選單 → **升級方案** → 切到 **Team 與 Enterprise** → **取得 Team 方案**，取團隊名稱、選席位付款後就開好了。最容易卡的是邀請：**成員的 email 網域必須在「允許網域」裡**，用 Gmail 的同事要先把 `gmail.com` 加進去；加完記得**關掉邀請連結**，不然任何拿到連結的 Gmail 使用者都能自動加入、吃掉你的席位。

**關鍵字**：Claude Team、Claude 團隊方案、Team 方案申請、標準席位、進階席位、邀請成員、允許的電子郵件網域、gmail.com、邀請連結、組織設定、Keep both accounts

---

## 為什麼要開 Team，而不是每人各買一個 Pro？

如果公司裡已經有兩三個人各自刷卡買 Claude Pro，你遲早會遇到這幾件事：

- **報帳很亂**：每個人一張收據、各自續訂，離職的人帳號還在扣款。
- **資料歸屬不清**：同事用個人帳號處理公司文件，對話留在他自己的帳號裡，人走了東西也跟著走。
- **沒人能管**：誰能用、用多少、能不能接外部服務，全憑個人自覺。

Team 方案把這些收回到「組織」手上：**統一付款、統一管理成員、預設不會用你們的內容訓練模型**，而且最少 2 個席位就能開。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：個人 Pro 像每個員工自己辦手機門號再報公帳；Team 像公司辦一個企業方案，門號歸公司、人走了把號碼收回來就好。人一多，差別就出來了。

---

## 開始前：準備好這三樣

1. **一個當「擁有者」的帳號**——建議用**公司網域的 email**（例如 `admin@你的公司.com`）另外登入一個 Claude 帳號來開團隊，不要用某個員工的私人帳號。這個帳號會成為團隊的「主要擁有者」，管付款與成員。
2. **一張信用卡／金融卡**（或 Apple Pay）。
3. **要邀請的成員 email 清單**。先看一下有沒有人用 Gmail 等非公司信箱——等一下會需要多一個步驟。

---

## 先看價格：2026 年 10 月台灣實付多少？

以下是 2026-10-09 在台灣地區實際走一次申請時畫面上的價格（新台幣、含 5% 加值稅）：

| 席位類型 | 年繳（平均每月） | 月繳 | 適合誰 |
|---|---|---|---|
| **標準席位** | NT$630／月（一年 NT$7,560） | NT$790／月 | 大多數人：日常對話、寫作、整理資料 |
| **進階席位** | NT$3,200／月（一年 NT$38,400） | 依結帳頁為準 | 重度使用者：用量是標準席位的 5 倍 |

- Anthropic 官網的美金定價：標準席位 **US$20**（年繳）／**US$25**（月繳），進階席位 **US$100**／**US$125**。
- 同一個團隊**可以混搭**：例如 1 個進階席位給最重度的人、其他人用標準席位。
- **Enterprise** 方案是 20 人以上、席位費另加用量計費，這篇不談。
- 價格會變動，**以你結帳當天的畫面為準**。

---

## Step 1：登入要當擁有者的帳號

1. 前往 [claude.ai](https://claude.ai)
2. 用 Google、Apple 或 email 登入。建議直接輸入**公司 email**，按「使用電子郵件繼續」

![Claude 登入頁，可選 Google、Apple 或輸入電子郵件繼續](/images/articles/claude-team-setup/claude-login-email.png)

如果你用 email 登入，信箱會收到一封登入信。如果你在**另一個瀏覽器或裝置**（例如手機）點開信裡的連結，畫面會改成顯示一組驗證碼——把這組數字輸入回**你一開始登入的那個瀏覽器**即可。

![Claude 顯示「使用驗證碼繼續」，請在最初登入的位置輸入此驗證碼](/images/articles/claude-team-setup/magic-link-code.png)

---

## Step 2：從帳號選單點「升級方案」

登入後，點左下角你的帳號名稱，跳出選單後點 **升級方案**。

![左下角帳號選單中的「升級方案」選項](/images/articles/claude-team-setup/account-menu-upgrade.png)

---

## Step 3：切到「Team 與 Enterprise」分頁

升級頁預設顯示的是**個人方案**（Free／Pro／Max）。Team 不在這裡——點上方的 **Team 與 Enterprise** 分頁。

![方案頁預設為個人方案，箭頭指向上方的「Team 與 Enterprise」分頁](/images/articles/claude-team-setup/pricing-personal-plans.png)

---

## Step 4：選 Team，按「取得 Team 方案」

左邊的 **Team** 卡片就是我們要的（2–150 位使用者）。上方可以切換「每月／年繳」看價格差異，確認後按最下方的 **取得 Team 方案**。

![Team 與 Enterprise 方案比較，圈起 Team 卡片下方的「取得 Team 方案」按鈕](/images/articles/claude-team-setup/team-enterprise-plans.png)

Team 方案包含的重點功能：Claude Code 與 Cowork、Claude Design、Microsoft 365 等整合、單一登入（SSO）、集中帳務管理，以及**預設不會使用你們的內容訓練模型**。

---

## Step 5：取團隊名稱，保持個人帳戶獨立

1. 在「團隊名稱」輸入公司或部門名稱——**成員收到的邀請信上會看到這個名字**，取一個大家認得出的
2. **「讓您的個人帳戶保持獨立」建議保持勾選**：Claude 會為團隊建立一個新的工作區，你原本這個帳號的對話與專案會留在個人帳戶裡，不會混進公司
3. 按 **繼續**

![「建立您的團隊」頁面，輸入團隊名稱並勾選「讓您的個人帳戶保持獨立」](/images/articles/claude-team-setup/create-team-name.png)

---

## Step 6：選席位數量與付款方式

1. 選 **每月** 或 **每年**（年繳省 20%）
2. Team 最少 **2 個席位**；要更多就按 **調整席位數量**
3. 往下捲，填付款資料：全名、國家或地區、郵遞區號，選 **金融卡** 或 **Apple Pay**
4. 確認「今日應付總額」後完成付款

![選擇席位與方案：每月或每年、2 個標準席位的訂單明細，下方是付款方式](/images/articles/claude-team-setup/checkout-seats-payment.png)

以畫面為例：月繳 2 個標準席位，小計 1,504.76 ＋ 加值稅 75.24，**今日應付 1,580**（台灣地區結帳頁的 `$` 是新台幣），換算每席每月 NT$790。

---

## Step 7：邀請成員（可以先跳過）

付款完成後會直接進到「邀請成員加入您的團隊」。你可以：

- 在「標準席位」框裡輸入 email，每輸入一個按 Enter，或上傳 CSV
- 按 **複製邀請連結**
- 或按 **不邀請，直接繼續**，晚點再從設定頁邀請

![「邀請成員加入您的團隊」，可輸入 email、複製邀請連結，或不邀請直接繼續](/images/articles/claude-team-setup/onboarding-invite-members.png)

注意說明文字那行：**「所有邀請都必須使用」你公司網域的 email**。如果你要邀的人用 Gmail，這裡會送不出去——先按「不邀請，直接繼續」，照下面 Step 9 把 Gmail 加進允許網域再回來邀。

---

## Step 8：認識「組織與存取權」設定頁

進到團隊後，從左下角帳號選單進入「設定」，左側會多出一整排**組織設定**。最常用的是 **組織與存取權**：

- **團隊總覽**：允許的 email 網域、席位總數（例如「2（可用 1）」）、成員總數
- **讓您的團隊使用 Claude**：新增另一位擁有者、邀請成員、驗證網域、設定 SSO 的入門清單
- **組織指示**：寫給 Claude、套用到全公司所有對話的規範（例如回答格式、資料處理原則），改完最多 1 小時生效

![組織與存取權頁面，圈起「邀請您的成員」並以箭頭指向「開始」按鈕](/images/articles/claude-team-setup/org-settings-invite-members.png)

點「邀請您的成員」旁的 **開始**，或左側 **成員** → 右上 **新增成員**，會跳出這個視窗：

![「新增成員」視窗：輸入電子郵件、選擇角色與席位層級](/images/articles/claude-team-setup/add-member-dialog.png)

- **電子郵件**：可一次貼多個，用逗號或換行分隔
- **角色**：一般同事選「使用者」
- **席位層級**：選「標準」或「進階」
- 視窗上方寫得很清楚：**新成員的費用從加入那天起按比例計算**

> 💡 建議至少再加一位**擁有者**（清單第一項「新增另一位擁有者」）。只有一個擁有者時，那個人離職或帳號出問題，整個團隊就沒人能管付款了。

---

## Step 9：同事用 Gmail？先把 gmail.com 加進允許網域

這是最多人卡住的一步。團隊預設**只接受擁有者自己那個網域**的 email。看「團隊總覽」左邊的 **允許的電子郵件網域**：

![團隊總覽中圈起「允許的電子郵件網域」欄位](/images/articles/claude-team-setup/allowed-email-domains.png)

1. 在組織與存取權頁往下捲到 **網域** 區塊
2. 點 **新增或編輯網域**

![網域區塊下方的「新增或編輯網域」連結](/images/articles/claude-team-setup/add-edit-domain.png)

3. 在「更新組織電子郵件網域」視窗輸入 `gmail.com`，按右邊的 **＋**，再按 **儲存**
4. 回到網域清單，就會看到 `gmail.com` 已加入

![網域清單中出現 gmail.com，「可被探索」顯示不允許](/images/articles/claude-team-setup/gmail-domain-added.png)

`gmail.com` 這類公開信箱會顯示「可被探索：不允許」——也就是陌生的 Gmail 使用者**搜不到**你的團隊，這是正常的。

---

## Step 10：🔴 加完 Gmail 後，關掉「邀請連結」

這一步不做不會報錯，但可能會讓你多付錢。

往下捲到 **使用者佈建**，你會看到兩個開關：

- **邀請連結**：「透過連結加入的任何人都會自動獲得核准」——只要 email 網域在允許清單內
- **成員邀請**：允許一般成員再去邀請其他人

把它們跟上一步連起來想：**允許網域裡有 `gmail.com` ＋ 邀請連結開著 ＝ 全世界任何一個 Gmail 使用者，只要拿到這條連結，就能自動加入並佔用一個付費席位。** 連結被轉傳一次就失控了。

所以除非你有特別需求，建議**兩個都關掉**，改成擁有者一個一個用 email 邀請：

![使用者佈建區塊中「邀請連結」與「成員邀請」兩個開關都已關閉](/images/articles/claude-team-setup/invite-link-toggles.png)

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：邀請連結就像把公司大門的密碼貼在群組。只有公司網域時還好，加了 `gmail.com` 之後，等於「任何有 Gmail 的人知道密碼就能進來，還自動拿一張員工證」。要邀誰，親手一個一個邀最安心。

---

## Step 11：成員收信、接受邀請

被邀請的同事會收到一封標題為 **You're invited to join（團隊名稱）on Claude** 的信，點 **Accept invite**：

![Gmail 收到「You're invited to join … on Claude」邀請信，中間有 Accept invite 按鈕](/images/articles/claude-team-setup/invite-email-gmail.png)

瀏覽器會開到加入頁。**按下去之前先看「Accepting as」後面的 email**——如果瀏覽器目前登入的是別的 Claude 帳號，先登出換對帳號，否則會用錯的身分加入。

![Claude 加入團隊頁面，顯示邀請人、Accepting as 帳號與 Accept invite 按鈕](/images/articles/claude-team-setup/accept-invite.png)

---

## Step 12：決定個人帳號要留還是收掉

如果這位同事原本就有個人 Claude 帳號，加入後會跳出「You've joined …」視窗，二選一：

- **Keep both accounts（兩個都保留）**：個人帳號和團隊之間可以隨時切換。**大多數人選這個。**
- **Use（團隊名稱）only（只用團隊）**：個人帳號會被關閉，原本付費的個人方案（例如 Pro、Max）**會退款**，通常約 24 小時內退回；接著讓你決定舊對話與專案怎麼處理。

![「You've joined」視窗：Keep both accounts 或只使用團隊帳號](/images/articles/claude-team-setup/joined-keep-both-accounts.png)

畫面上方還有一條提示「Bring chats and projects from your personal account into …」，想把個人帳號裡跟公司有關的對話、專案搬進團隊，可以從 **See options** 處理。

> 💡 如果同事原本就是為了工作才自費買 Pro／Max，加入團隊後選「只用團隊」可以拿回個人方案的錢，避免重複付費。但這個動作會**關閉個人帳號**，決定前先確認裡面沒有私人的東西要留。

---

## 🚨 常見狀況與解法

### 邀請送不出去／按鈕一直是灰的

幾乎都是 **email 網域不在允許清單**。回到 Step 9，把對方的網域（例如 `gmail.com`、合作夥伴的公司網域）加進「允許的電子郵件網域」再邀一次。

### 找不到 Team 方案

升級頁預設是「個人方案」分頁，Team 在旁邊的 **Team 與 Enterprise** 分頁（Step 3）。

### 結帳頁的金額跟方案頁對不起來

方案頁顯示的是**含稅**、且通常停在**年繳**的平均月費；結帳頁先列**未稅小計**再加加值稅，且預設**月繳**。月繳本來就比年繳貴約 20%，兩邊對不起來是正常的。

### 加入後，原本的對話不見了

沒有不見，是你現在在**團隊工作區**。點左下角帳號名稱可以切回個人帳號（前提是 Step 12 選了 Keep both accounts）。

### 一個人可以開 Team 嗎？

不行，Team 最少 2 個席位，最少也會收 2 席的費用。只有自己用的話，個人 Pro 或 Max 比較划算。

---

## 你現在會了什麼

- 從帳號選單升級，找到藏在第二個分頁的 Team 方案
- 看懂標準席位與進階席位的價差，選月繳或年繳
- 邀請成員、處理 Gmail 等外部網域
- 知道**加了 `gmail.com` 之後要關掉邀請連結**，避免席位被陌生人佔走
- 幫加入的同事決定個人帳號的去留

**下一步**：團隊開好後，最值得先做的一件事是寫好**組織指示**——讓全公司的 Claude 用同一套口吻與規範回答。寫法可以參考〈[系統提示詞怎麼設？ChatGPT、Claude、Gemini、Grok「給 AI 的指令」一次教會你](/articles/set-system-prompt/)〉，原理一模一樣，只是作用範圍從你一個人擴大到整個團隊。
