# 藍鴨週報公開訂閱

本文件說明「在網站開一個訂閱電子報的輸入欄位」的設計與上線步驟。

**現況（此分支）：只做程式與本機預覽，尚未套用到正式環境。** 未得 Joseph 本人同意前，不要：

- 把 migration 017 套用到正式 Supabase
- 部署 `newsletter-subscribe` / `newsletter-confirm` / `newsletter-unsubscribe`
- 改 Cloudflare DNS、Resend 網域、Turnstile widget
- 合併到 `main`，或把分支推到公開 repo `589411/launchdock`
- 對真實信箱寄確認信或週報

每日 X 摘要是 Joseph 的私人 Telegram，**不得**做成公開訂閱，也不得從這組表單寫入 `list = 'daily'`。

## 這次訂的是什麼

- 名單名稱：藍鴨週報（`list = 'weekly'`）
- 頻率：約每週一封；沒有適合題材時可能休刊
- 內容：標題、2–3 句摘要、連到網站全文（不是把整篇文章貼在信裡）
- 雙重確認：填表 → 勾選同意 → 收到確認信並點擊後，狀態才從 `pending` 變成 `confirmed`
- 退訂：每封信底部免登入連結；GET 只帶到確認頁，真正退訂要在頁面上按一次，或由信箱服務商走 RFC 8058 POST

不會自動把 `member_profiles` 或活動報名者加入週報名單。

## 表單放在哪裡

- 中文首頁底部（活動區塊之後），不放在最上方，避免之後與陪跑營橫幅（PR #7）重疊
- 英文首頁同步一塊
- `/subscribe/`、`/en/subscribe/` 獨立說明頁
- 文章頁「相關文章」之後
- 頁尾精簡表單，以及「訂閱週報」連結；訂閱／確認／退訂頁本身不再重複頁尾表單

配色：`#0f3460` / `#1a4a8a` / `#ffffff`，系統字型。

本機預覽狀態（只在 `astro dev` 有效，正式 build 不會帶）：

- `/subscribe/?state=success` → 「請去收確認信」
- `/subscribe/?state=duplicate` / `?state=error`
- 首頁請加 `&source=home`，避免頁尾表單同時被切換，例如 `/?state=success&source=home`
- `/unsubscribe/?state=done` → 已退訂畫面

## 資料表與權限

檔案：`supabase/migrations/017_newsletter_subscribers.sql`（註明尚未套用）。

### `newsletter_subscribers`

| 欄位 | 說明 |
| --- | --- |
| email / email_normalized | 顯示用與比對用（小寫） |
| list | `weekly`（預設）或 `daily`（只預留，公開端不寫） |
| status | `pending` / `confirmed` / `unsubscribed` |
| confirm_token / confirm_token_expires_at | 確認信用，48 小時有效，可重寄（10 分鐘節流） |
| unsubscribe_token | 退訂用，長期有效 |
| source | `home` / `footer` / `subscribe_page` / `article` |
| confirmed_at / unsubscribed_at / last_confirm_sent_at | 時間戳 |

唯一鍵：`(email_normalized, list)`。同一信箱可以存在不同 list，但公開表單只會寫 `weekly`。

### `newsletter_sends`

紀錄之後實際寄週報的結果，以 `(subscriber_id, send_date)` 防止同一天重寄。本次不上線寄報。

### 權限

- 兩張表都 `ENABLE ROW LEVEL SECURITY`
- **不建立任何 policy**
- `REVOKE ALL` 給 `anon`、`authenticated`
- 前端的 anon key 完全讀不到名單、token、寄送紀錄
- 所有讀寫只走 Edge Function 的 service role（service role 會繞過 RLS）

不要把訂閱名單存進 `member_profiles`。

## Edge Functions

| 函式 | 方法 | 行為 |
| --- | --- | --- |
| `newsletter-subscribe` | POST | 驗證同意、honeypot、可選 Turnstile；只寫 `list=weekly`；忽略客戶端傳來的 list；Resend 寄確認信。honeypot 有值時回 `{status:'pending'}` 但不寫庫、不寄信。已 confirmed 回 `already_confirmed`；10 分鐘內重送回 `already_pending`。JWT：前端帶 anon key。 |
| `newsletter-confirm` | GET/POST | token 有效且未過期才把 `pending` → `confirmed`。JWT：確認頁帶 anon key。 |
| `newsletter-unsubscribe` | GET / POST | GET 302 到 `/unsubscribe/?t=`（**不直接退訂**）。POST 才退訂，已退訂也回成功。必須用 `--no-verify-jwt` 部署，因為 RFC 8058 一鍵退訂不會帶 Authorization。 |

防濫用：

- honeypot 欄位 `website`（一定有）
- Turnstile：程式已接好，但本分支不安裝 widget、不改 Cloudflare。未設 `TURNSTILE_SECRET` 時後端略過，方便本機預覽。
- 確認信 10 分鐘節流、token 48 小時過期

確認信走既有 `supabase/functions/_shared/resend.ts`（`RESEND_API_KEY` + `FROM_EMAIL`），Reply-To 為 `info@launchdock.app`。**不**改用 Cloudflare Email Sending。

## 上線前需要 Joseph 授權的步驟

以下每一步都會動到正式環境，請逐項點頭後再做。建議順序：先驗證寄信網域與套用資料表，再部署函式，最後才把前端合併上線。

### 1. 在 Resend 驗證 `launchdock.app`（動到 Cloudflare DNS）

現況：站上已有 Resend 程式與 `RESEND_API_KEY`，但 apex `launchdock.app` 尚未在 Resend 通過驗證，用這個網域當寄件人會失敗（歷史 `email_logs` 出現 403）。

請 Joseph 登入 Resend → Domains → 新增 `launchdock.app`，依當下畫面上的紀錄操作。常見會是：

- 一到多筆 **DKIM CNAME**（或 TXT），selector 以 Resend 顯示的為準
- **SPF**：apex 目前只有 `v=spf1 include:_spf.mx.cloudflare.net ~all`（給 Cloudflare Email Routing 收信）。同一個主機只能有一筆 SPF，必須**合併**成例如 `v=spf1 include:_spf.mx.cloudflare.net include:amazonses.com ~all` 或 Resend 文件指定的 `include:`，不能另開第二筆 TXT 覆蓋或並存
- **DMARC**：目前沒有 `_dmarc`。建議先加監控用 `v=DMARC1; p=none; rua=mailto:info@launchdock.app`，不要一開始就 `p=reject`

注意：

- 不要刪掉或改掉 Cloudflare Email Routing 的 MX，以及現有的 `cf2024-1._domainkey`（這是收 `info@`、`joseph@` 用的）
- DKIM selector 不要互相覆寫
- `FROM_EMAIL` 建議等網域驗證通過後再改成 `藍鴨週報 <noreply@launchdock.app>` 或 Joseph 指定的 `news@` / `hello@`
- 驗證完成後，先用 Joseph 自己的信箱測一封確認信，確認不進垃圾信件匣

### 2. 把 migration 017 套用到正式 Supabase（動到資料庫）

專案：`launchdock`（ref `lxudxtpfenotkpgmhomq`）。

可在 Dashboard SQL Editor 貼上 `supabase/migrations/017_newsletter_subscribers.sql`，或在已登入的環境執行對應的 `supabase db push`（僅針對此 migration）。套用後請確認：

- 兩張表存在
- RLS 已開啟且沒有 policy
- `anon` / `authenticated` 沒有權限
- 沒有從 `member_profiles` 觸發的自動插入

### 3. 設定 Edge Function secrets（動到 Supabase secrets）

```
supabase secrets set RESEND_API_KEY=...          # 若正式專案已有，核對即可，不要重印到聊天
supabase secrets set FROM_EMAIL='藍鴨週報 <noreply@launchdock.app>'
supabase secrets set PUBLIC_SITE_URL=https://launchdock.app
```

Turnstile 若同時啟用：

```
supabase secrets set TURNSTILE_SECRET=...
supabase secrets set TURNSTILE_HOSTNAMES=launchdock.app,www.launchdock.app
```

### 4. 部署三支 Edge Function（動到正式 Functions）

在已連結正式專案的目錄：

```
supabase functions deploy newsletter-subscribe
supabase functions deploy newsletter-confirm
supabase functions deploy newsletter-unsubscribe --no-verify-jwt
```

`newsletter-unsubscribe` 一定要加 `--no-verify-jwt`。

### 5.（可選）Cloudflare Turnstile widget（動到 Cloudflare）

本分支只把程式接好，尚未建立 widget。若要啟用：

- 在 Cloudflare 為 `launchdock.app` 建立 Turnstile widget
- 把 site key 設到 Cloudflare Pages 的 `PUBLIC_TURNSTILE_SITE_KEY`
- 把 secret 設到上一節的 `TURNSTILE_SECRET` / `TURNSTILE_HOSTNAMES`
- 未完成這步之前，表單只靠 honeypot

不要在沒有授權時跑任何會改 Cloudflare 的設定精靈。

### 6. 前端上線（動到公開 repo 與 Cloudflare Pages）

程式目前只在 private `589411/launchdock-dev` 的本分支。Cloudflare Pages 會建置公開 `589411/launchdock` 的**每一個分支**，所以不要把開發分支推到公開 repo。

等 Joseph 說「合併上線」之後：

- 以乾淨 commit 把已核准內容同步到公開 `589411/launchdock` 的 `main`（commit 訊息只寫做了什麼）
- 確認 Pages 建置成功
- 用 curl 檢查 `/`、`/en/`、`/subscribe/`、`/en/subscribe/`、`/unsubscribe/`
- 用 Joseph 的信箱走一次：填表 → 收確認信 → 確認 → 退訂頁

Cloudflare Pages 已有的 `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY` 可沿用；若啟用 Turnstile 再加 site key。

## 明確不會做的事

- 不把會員或活動報名者寫進週報名單
- 不把每日 X 摘要做成公開訂閱
- 不在未授權時寄週報或確認信
- 不在未授權時改 DNS、Supabase 或 Pages
