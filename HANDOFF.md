# HANDOFF — 藍鴨導入 LINE 會員系統（新 session 起手包）

> 一次性交接文件。這是給「乾淨新 session」的起手包，讓你一進 repo 就能直接進入評估設計，不用重新盤點。
> 完成評估/實作、Joseph gate 後可刪本檔。現況正本仍以 `STATUS.md` + `BACKLOG.md` 為準。
> 建立：2026-07-10（由上一個 session 產出，該 session 剛完成「藍鴨小聚上站露出 + events external_url」）。

---

## 一、核心任務（一句話）

**在藍鴨既有的 Supabase Auth 會員系統上，多接一個「LINE 登入」入口，並評估通知/報名是否改走 LINE 生態**——重點是複用 Joseph 早就解過的件，不是從零建會員系統。

先跟 Joseph 用一句話對齊核心任務再動工（全域憲法）。

---

## 二、藍鴨現況（already there，別重造）

藍鴨**已經有一套完整會員系統**，別當成從零開始：

- **登入**：Supabase Auth + **Google OAuth**（前端 `supabase.auth.signInWithOAuth`，`/auth/callback` 收 redirect）。
- **會員表**：`member_profiles`（`supabase/migrations/001_auth_members_events.sql:10-31`）——`user_id`→auth.users、`display_name`、`avatar_url`、`email`、`role`(member/admin)、`notification_preferences`(JSONB)。
- **自動建檔 trigger**：`handle_new_user()`（`001:36-58`）在 auth.users INSERT 後建 profile。
- **活動/報名**：`events` + `event_registrations` 表；`EventCard.tsx` 原生報名（Google 登入→寫 event_registrations→Resend 確認信）。2026-07-10 剛加 `external_url`（有值→報名導外部表單）。
- **通知**：Resend edge functions（`supabase/functions/send-registration-confirmation`、`send-event-reminder`），由 DB webhook 觸發。
- **admin**：`/admin/events`（role=admin）可增修活動。

---

## 三、複用指標（記憶池已解，進去先 grep 驗證還在）

`grep -i "line 登入\|liff\|custom oidc" ~/github/memory/memory/solutions.md`

1. **網站接 LINE 登入（正解，非 LIFF）**：Supabase Auth **Custom OAuth/OIDC Provider**，Identifier 填 `line`，前端一行 `signInWithOAuth({ provider: 'custom:line' })`，issuer `https://access.line.me`，開 `email_optional`。免自建 Edge Function。
   - 在哪：`589411/lovestrings` 分支 `feat/line-login-remove-lovable`（`src/lib/oauth.ts` + Login 按鈕 + migration）。
2. **LIFF 認人/多頁**（若要「LINE 內開網頁自動帶身份」才需要）：`line-booking-system/liff-init.js`、`new-cpc` 雙入口。多數情況藍鴨用 #1 的 Custom OIDC 就夠，不一定要 LIFF。
3. **LINE 推播**：skill `line-daily-push`（Cloudflare Worker + Messaging API push）。

---

## 四、⚠️ 最關鍵的整合坑（先解這個再談其他）

`handle_new_user()` trigger（`001:43-49`）把 `NEW.email` 寫進 `member_profiles.email`，而該欄位是 **`NOT NULL` + `UNIQUE`**（`001:15,27`）。

**LINE 用戶常常沒有 email** → 這 trigger 會 **NOT NULL 違規、整筆註冊失敗**（正是 lovestrings 記憶記的坑）。而且若 email 給空字串當 fallback，第二個無 email 的 LINE 用戶會撞 `UNIQUE(email)`。

**這是 LINE 登入能不能通的第一道關卡。** 進場第一件事就是設計這個 trigger 的 fallback（email 改 nullable，或合成 placeholder，或 display_name 用 LINE `name`）——需要一個 migration，且會動 production（走上一個 session 建立的 migration 流程：`supabase/migrations/00X_*.sql` + Supabase MCP `apply_migration` 到 project `lxudxtpfenotkpgmhomq`）。

---

## 五、三個待 Joseph 拍板的設計題

- **(a) LINE Login 取代 Google，還是並存多一個選項？**（建議並存、漸進，不動現有 Google 用戶）
- **(b) 通知走 LINE push 補充/取代 Resend email？**（LINE 會員常無 email → push 更合適；`line-daily-push` 是現成件。但原生 Resend 流程已建好，要評估要不要雙軌）
- **(c) 報名流程是否改「LINE Login → 原生報名 → LINE 推播確認」？**

---

## 六、關鍵關聯：這可能就是 external_url 退場所指的「正式模式」⭐

上一個 session 給 events 加了 `external_url`（7/29 試營運場報名導 Google 表單）。Joseph 說「正式模式穩定就讓 external_url 退場，避免二次轉換」。

**LINE 會員很可能就是那個「正式模式」的最終形態**：LINE Login + LINE 推播報名確認（LINE 生態內完成、免 email、免二次轉換）。所以 **LINE 會員導入 / 8-26 正式場報名 / external_url 退場是同一個決策**，一起想清楚，別分三次各做一半。（BACKLOG「來自規劃」有對應兩條。）

---

## 七、進場先讀 / 範圍紀律

1. 先讀 `STATUS.md`（現況正本）+ `BACKLOG.md`「來自規劃」的兩條（LINE 會員 / external_url 退場）。
2. `grep` 記憶池驗證複用件還在（第三節）。
3. 讀 `supabase/migrations/001_auth_members_events.sql`（會員/trigger 正本）與 `src/lib/supabase.ts`、`/auth/callback`。
4. **範圍紀律**：只做 LINE 會員這條線，別順手動別的。動 production DB/Auth 設定前先跟 Joseph 確認（破壞性/對外變更）。Supabase 專案 = `lxudxtpfenotkpgmhomq`（launchdock）。
5. React island 驗證用 `npm run preview`（不要 `npm run dev`，見 STATUS 已知坑）；本機 preview 無 Supabase env，會員功能要在 production 或設好 env 才驗得到。
