---
title: "被邀請加入 Claude Team 團隊怎麼做？收信、接受邀請到找到共用專案一次走完"
description: "同事或老闆說「我邀你進 Claude 團隊了」，然後呢？這篇用實際截圖走完成員端流程：收信點 Accept invite、確認用對帳號、決定個人帳號要不要保留，進去後再帶你看團隊多給了什麼——組織技能、連接器、共用專案，以及怎麼把共用專案釘在側欄。"
contentType: "tutorial"
scene: "環境準備"
difficulty: "入門"
createdAt: "2026-10-15"
verifiedAt: "2026-10-15"
archived: false
order: 6
prerequisites: ["claude-team-setup"]
estimatedMinutes: 8
tags: ["Anthropic", "設定"]
modules: [M06]
stuckOptions:
  "接受邀請": ["我沒收到邀請信", "點了連結卻用錯帳號", "Accept invite 之後沒反應"]
  "個人帳號去留": ["Keep both accounts 和只用團隊差在哪？", "選了只用團隊，個人 Pro／Max 會怎樣？", "之後還能切回個人帳號嗎？"]
  "加入之後": ["團隊裡的共用專案在哪找？", "怎麼把共用專案釘在側欄？", "我的對話同事看得到嗎？"]
---

> **一句話**：被邀請進 Claude Team，你要做的只有三件事——**開信點 Accept invite → 確認「Accepting as」是你要用的 email → 決定個人帳號要不要保留**（不確定就選 **Keep both accounts**）。進去之後，團隊分享的專案在左側 **Projects → Shared with you**，點右上角圖釘就能釘在側欄。

**關鍵字**：加入 Claude Team、Claude 團隊邀請、Accept invite、Accepting as、Keep both accounts、Shared with you、共用專案、組織技能、連接器

---

## 這篇是誰的？

這是〈[Claude Team 方案怎麼申請？](/articles/claude-team-setup/)〉的**成員端**延伸篇。那篇是給**開團隊的管理者**看的（付款、邀請、設定網域），這篇是給**被邀請的人**看的：你不用付錢、不用設定網域，只要接住邀請，然後知道進去後有什麼可以用。

如果你是管理者，先看一眼下面這張——這是你在「成員」頁按 **新增成員** 時的畫面，輸入對方的 email、選角色與席位層級，按 **新增 1 位成員**，對方信箱就會收到邀請。

![管理者端：成員頁的「新增成員」視窗，輸入電子郵件、選角色與席位層級](/images/articles/join-claude-team/admin-add-member-dialog.png)

> 💡 邀請信寄的是**你輸入的那個 email**。所以如果你要用 Gmail 加入，管理者就要用你的 Gmail 邀你，而且團隊的「允許網域」要有 `gmail.com`（管理者那篇有教）。

---

## 開始前：確認這兩件事

1. **邀請信寄去哪個信箱？** 去那個信箱找一封標題像 **You're invited to join（團隊名稱）on Claude** 的信。沒看到先查垃圾信件匣。
2. **你瀏覽器現在登入的是哪個 Claude 帳號？** 下一步會用「目前登入的帳號」加入，登入錯帳號是最常見的失誤。

---

## Step 1：開信，點「Accept invite」

信裡的 **Accept invite** 按鈕會把你帶到瀏覽器的加入頁。

![Gmail 收到「You're invited to join … on Claude」邀請信，中間有 Accept invite 按鈕](/images/articles/claude-team-setup/invite-email-gmail.png)

如果需要登入、或跳出驗證碼，做法在〈[Claude Team 方案怎麼申請？](/articles/claude-team-setup/)〉的登入段落有說明。

---

## Step 2：先看「Accepting as」，再按 Accept invite

加入頁會寫「**Join（團隊名稱）**」、誰邀請你，以及**「Accepting as」後面那個 email**。

**按下去之前先看一下這個 email 是不是你要用的。** 如果不是（例如你想用公司信箱加入，但瀏覽器登入的是私人帳號），先登出、換對帳號再回來點邀請信的連結。

確認沒問題，按 **Accept invite**。不想加入就按下面的 **Decline**。

![加入頁：寫著 Join 團隊名稱、邀請人、Accepting as 目前登入的 email，下方有 Accept invite 與 Decline](/images/articles/join-claude-team/accept-invite-page.png)

頁面最下面那行小字也值得讀一次：按下去代表你同意加入**由管理者（Admin）管理的 Team 方案**，並確認已知悉 Anthropic 的隱私政策。

---

## Step 3：決定個人帳號要保留還是收掉

如果你**原本就有個人的 Claude 帳號**（而且是用同一個 email），加入後會跳出「You've joined（團隊名稱）!」視窗，要你二選一：

- **Keep both accounts**：個人帳號和團隊帳號都保留，**隨時可以切換**。
- **Use（團隊名稱）only**：個人帳號會關閉；如果你原本付費訂閱個人方案（截圖中是 Max），**方案會退款**，通常約 24 小時內退回，接著會再問你舊對話與專案怎麼處理。

選好按 **Continue**。

![「You've joined」視窗：預設選 Keep both accounts，另一個選項是只用團隊](/images/articles/join-claude-team/joined-keep-both-accounts.png)

**不確定就選預設的 Keep both accounts。** 這個選擇最安全：沒有任何東西被關掉，之後想改再改。

「只用團隊」適合的情況是：你原本的個人訂閱就是為了工作才買的，現在公司付錢了，不想重複付費。但它會**關閉個人帳號**，決定前先確認裡面沒有私人的對話或專案要留。

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **鴨編的話**：把它想成你原本有一支自己的手機門號，公司又發了一支公務機。「兩個都保留」是兩支都帶著；「只用團隊」是把私人門號註銷、只留公務機。能不能退回去、舊簡訊要不要搬，都要在按下去之前想清楚。

---

## Step 4：看到「You're here!」就加入成功了

選好之後會進到熟悉的 Claude 首頁，標題變成 **You're here!**，右下角跳出一則提示：

> Your accounts will stay separate. Switch between them anytime.

意思是：你的個人帳號和團隊帳號**各自獨立**，隨時可以切換——對話不會混在一起。切換的入口在左下角的帳號區，點開就能選要用哪個帳號。

![加入成功後的首頁，標題「You're here!」，右下角圈起「Your accounts will stay separate」提示](/images/articles/join-claude-team/joined-welcome-toast.png)

> 💡 如果加入後覺得「我原本的對話不見了」——不用慌，你現在可能在團隊帳號。切回個人帳號就看得到（前提是上一步選了 Keep both accounts）。

---

## 加入之後：團隊多給了你什麼？

進來之後，左側欄的 **Customize**、**Projects** 這兩個地方，是最能看出團隊價值的。

### Customize：技能與連接器

點左側 **Customize**，會看到上方有 **Skills**、**Connectors**、**Plugins** 三個分頁。

**Connectors（連接器）**讓 Claude 連到你的 Google Drive、Gmail、Google Calendar、Notion、Microsoft 365 等外部服務。畫面上打勾的是已經連上的，「＋」是還沒連的，要用再點。

![Customize 的 Connectors 分頁：步驟 1 點 Customize、2 點 Connectors、3 圈起各個連接器卡片](/images/articles/join-claude-team/customize-connectors.png)

**Skills（技能）**那一頁，除了 Anthropic 提供的，還可能多一區 **From your organization**，標示 **pre-installed by your organization**——這是**管理者替全團隊預先裝好**的技能，你不用自己找、自己裝，直接就能用。

![Customize 的 Skills 分頁：紅框處為「From your organization」，由組織預先安裝的技能](/images/articles/join-claude-team/customize-skills-org.png)

> ⚠️ 連接器會讓 Claude 讀到你連上的服務裡的資料（例如信件、雲端硬碟檔案）。第一次連之前想一下：**這是公司帳號還是私人帳號？** 公司的工作內容，用公司的帳號連。

### Projects：個人、組織、別人分享給你的

點左側 **Projects**，上方有三個分頁：

| 分頁 | 裡面是什麼 |
|---|---|
| **Your projects** | 你自己建立的專案 |
| **Organization** | 整個組織共用的專案 |
| **Shared with you** | 同事單獨分享給你的專案 |

![Projects 頁面：箭頭指向 Your projects、Organization、Shared with you 三個分頁](/images/articles/join-claude-team/projects-tabs.png)

同事分享專案給你後，會出現在 **Shared with you**，卡片上寫著誰建立的、多久前更新。

![Projects 的 Shared with you 分頁，列出同事分享給你的專案](/images/articles/join-claude-team/projects-shared-with-you.png)

---

## 把共用專案釘在側欄

常用的共用專案，每次都從 Projects 點進去很麻煩。進到專案頁後：

1. 點右上角的**圖釘**圖示
2. 回頭看左側欄，**Pinned** 區就多出這個專案，以後一鍵進入

![專案頁：①右上角圖釘、②專案標題區、③左側 Pinned 區出現該專案](/images/articles/join-claude-team/pin-shared-project.png)

專案頁右側還有幾個設定：**Instructions**（專案指示）、**Files**（專案檔案）、**Memory**（記憶）、**Schedule**（排程）。頁面底下有一行小字值得記住：

> Shared · Created by …　All sessions are private unless shared · Memory is private to you

翻成白話：**專案是共用的，但你在專案裡開的對話預設是私人的，除非你自己分享；記憶也只屬於你。** 同事不會因為同在一個專案就看到你問了什麼。

---

## 🚨 常見狀況與解法

### 我沒收到邀請信

先查垃圾信件匣與其他分頁（促銷、社交）。還是沒有，請管理者確認**邀請寄到的 email 有沒有打對**。

### 按了 Accept invite 卻用錯帳號加入

「Accepting as」那個 email 就是你加入用的帳號。登出目前的 Claude、換成正確帳號後，再回信箱重新點邀請連結。

### 邀請連結顯示 Invalid invite link

代表這條連結已經失效。請管理者重新寄一封邀請給你。

### 加入後，原本的對話不見了

沒有不見，是你現在在**團隊帳號**。從左下角切回個人帳號就看得到。

### 我選了「只用團隊」，後悔了

這個選項會關閉個人帳號，**按下去之前**才是最好的決定時機。已經選了的話，請直接聯絡 Anthropic 客服詢問能否恢復，我們沒有實測過這種情況，不在這裡亂給保證。

---

## 你現在會了什麼

- 看懂邀請信與加入頁，知道要先確認「Accepting as」
- 在 **Keep both accounts** 與只用團隊之間做出不後悔的選擇
- 找到團隊多給你的東西：組織預裝的技能、連接器、共用專案
- 把常用的共用專案釘在側欄

**下一步**：管理者如果還沒設好組織指示，可以參考〈[系統提示詞怎麼設？ChatGPT、Claude、Gemini、Grok「給 AI 的指令」一次教會你](/articles/set-system-prompt/)〉；你自己也可以用同樣的原理，為自己建立專案指示，讓每次對話都從同一套規範開始。
