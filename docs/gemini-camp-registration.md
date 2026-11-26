# 藍鴨Gemini陪跑營：報名與優惠碼

> 狀態：程式已寫好、**尚未套用到遠端 Supabase、尚未部署 Edge Function**。上線前需 Joseph 同意。

## 檔案

- `supabase/migrations/018_gemini_camp_registrations.sql`：資料表與兌換優惠碼的函式（RLS 全關，只走 service role）
- `supabase/functions/gemini-camp-register/index.ts`：`check`（檢查優惠碼）與 `register`（報名、扣次數、寫入、寄信）
- `src/data/gemini-camp-register.ts`：前端用的方案、身份、任務選項與價格
- `src/components/GeminiCampRegisterForm.tsx`：報名表單（含即時套用優惠碼）
- `src/components/GeminiCampRegisterPage.astro`，`src/pages/gemini-camp/register.astro`，`src/pages/en/gemini-camp/register.astro`：報名頁

## 規則（已確認）

| 項目 | 規則 |
|---|---|
| 三類免費 | 社福團體、教會、身障團體工作人員與全職同工：免學費（100%，不含 Gemini 訂閱） |
| 優惠等級 | 超早鳥 6 折（`percent_off = 40`）、早鳥 7 折（`30`）、一般 8 折（`20`）、免費（`100`） |
| 每組碼 | 各自獨立，有效期 2 個月，可用 5 次 |
| 寄信 | 報名後自動寄確認信（沿用 `_shared/resend.ts`） |
| 折扣計算 | 只在後端算。基本／進階 NT$3,000，兩個月 NT$5,700，折扣套在該方案原價上 |

> ⚠️ 折扣是「百分比」存進資料庫：6 折要填 **40**，不是 60。

## 開優惠碼（不寫進 repo）

優惠碼會被公開的 repo 看到，所以**不要寫進程式或 migration**。由 Joseph 在 Supabase SQL Editor 執行，`code` 自己取，建議用隨機字串：

```sql
insert into gemini_camp_coupons (code, label, percent_off, max_uses, expires_at)
values
  ('請換成隨機碼1', '超早鳥 6 折', 40,  5, now() + interval '2 months'),
  ('請換成隨機碼2', '早鳥 7 折',   30,  5, now() + interval '2 months'),
  ('請換成隨機碼3', '一般 8 折',   20,  5, now() + interval '2 months'),
  ('請換成隨機碼4', '免費（社福／教會／身障／全職同工）', 100, 5, now() + interval '2 months');
```

- 每組碼 5 次。若要更多名額，多開幾組碼即可。
- 碼一律大寫。資料表有 check 限制，小寫會被拒絕。

## 部署順序（都要你同意）

1. 在 Supabase 執行 `018_gemini_camp_registrations.sql`
2. 部署 Edge Function：`supabase functions deploy gemini-camp-register`
3. 設定環境變數：`RESEND_API_KEY`（已有就不用再設）、`FROM_EMAIL`（已有就不用再設）
4. 插入上面的優惠碼
5. 前端 `PUBLIC_SUPABASE_URL`、`PUBLIC_SUPABASE_ANON_KEY` 已在用，不需要新增
6. 線上測試：用一組碼報名，確認寫入資料表、次數 +1、收到確認信

## 已知限制（上線前要處理或接受）

- **沒有 Turnstile 或其他驗證碼**，只有 honeypot。如果被灌假報名，要加驗證。
- 優惠碼檢查 `check` 會回答「有效／無效」，理論上可以被拿來試碼。碼用隨機字串可以降低風險。
- 報名的付款還沒接，確認信寫的是「會再 Email 確認繳費方式」。
- 寄信失敗時報名仍然成功，回傳 `email_sent: false`，表單會提示「我們已收到」。
