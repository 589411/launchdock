# STATUS — launchdock

> 單一真相。每次離開前更新（全域憲法收尾鐵律）。
**最後更新：** 2026-08-09（**課堂即時投票已上 production 並照 Joseph 手機實測回饋改版：一次只出一題＋綁課程段落＋停下來討論、業態擴到 14 個並可自己打字**；commit `cff0f71`／`66f43c7`／`daa70d7` 皆已 push。**講師端畫面仍沒有人看過**，詳見下方「下一個具體動作」最新條）｜前次 2026-08-08（課堂即時投票初版＋migration 016 上 production＋匿名 RLS 12 項端到端驗過）｜前次 2026-08-05（**8/06 工研院場次 `25ZEA9` 待命；「送出失敗」已定位＝場次被關非 bug，訊息已改成可行動指引**；同日 90人併發壓測 PASS＋後台首次實看＋DEMO01 已清空＋QR code 已內建，詳見下方「下一個具體動作」最新條）｜前次 2026-08-03（**班級測驗（quiz 團體班模式）已實作＋migration 014 已上 production＋匿名 RLS 端到端驗過，尚未真人實測、尚未 push**，詳見下方「下一個具體動作」最新條）｜前次 2026-07-27（**新文章 `set-system-prompt` 系統提示詞四平台教學中英雙版——本地 build 綠、9 張圖本機遮罩＋兩輪覆核、尚未 push，等 Joseph review 遮罩圖，詳見下方「下一個具體動作」最新條**）｜前次 2026-07-24（**首頁討論區換成 FAQ + 鴨聚招牌改字**——commit `bb39e8f`：① Hero pill『鴨聚·Assemble！』→『免費·限額／7/29 線上工作坊｜兩小時親手寫第一段 AI 系統提示詞』（英文版 pill 一併改）② `<HomeDiscussion>`（停 100+ 天像荒廢、打臉 Hero）→ **資料驅動 FAQ**（`89af33d`，取代先前寫死版）：唯一來源 `src/data/home-faq.ts`，畫面 `<details>` 與 FAQPage JSON-LD 都由它 `.map()` 生成（不會 drift），保留 `#discussion` 錨點，底部留真人求助入口；移除 HomeDiscussion import。CLAUDE.md 已加「新增文章時的 FAQ 同步規則」（首頁 FAQ 只改 home-faq.ts、~10 則上限）。✅ **meetup.astro 也已對齊**（commit `0978b9f`：title/description/eyebrow 從內行人「鴨聚 Assemble」改成「7/29 免費線上工作坊｜兩小時，親手寫出你的第一段 AI 系統提示詞」，跟首頁 pill 一致；H1/內文本就對齊未動）。前段：SEO 灘頭堡落地：cowork 7 篇 + caffeinate 文章 SEO 優化已上線——commit `2b268d3`，錯誤碼文字化 + 高曝光文章 CTR 優化，只動標題/description/開頭/FAQ；同日還做了 ① 首頁 Hero 中英換臉（Hermes 排 OpenClaw 前）② redact 漏 key 資安事故止血 + 記坑 ③ 刪 50 張孤兒圖(21.9MB)+加 `npm run orphans` 稽核工具。`HANDOFF_hero_reface.md` 任務完成已刪）
**整體狀態：** 🟢 進行中（2026-07-18 另修 Search Console 122 頁未索引：trailing-slash+canonical 全站修正已上線，見 docs/seo-indexing-fix.md）

## 📈 SEO 成效量測（進行中，等 08-10 驗收）
2026-07-23~25 上線一批 SEO 改動（Hero 換臉、8 篇文章標題/description/FAQ、首頁資料驅動 FAQ+schema、meetup 招牌），**現在太早看不出成效**（GSC 資料延遲+需重爬）。已建立閉環：
- **改版前基準**：`docs/seo-baseline-2026-07-27.md`——GSC 近3月總覽（點擊656/曝光40.1K/CTR1.6%/排名14.1）+ 成效計分卡（cli 1345曝光、github developer settings 444、api key 154、google api key 146 這些高曝光低點擊頁的 before CTR）+ **判讀框架（after 落哪格→有效複製/文案再改/催爬/換槓桿）** + 變更清單供歸因。
- **回撈排程**：cloud agent `trig_01S94FvRh8HvBgV7wRfgAeSQ`，2026-08-10 09:00 台北觸發，會自動產 `docs/seo-after-2026-08-10.md` 對照草稿（before 帶好、after 留白）。**它撈不到 GSC**（雲端登不進），到時需人開瀏覽器撈「最近28天」數字填進去。
- **下一步（08-10）**：撈 GSC after → 逐列比計分卡 CTR → 依判讀框架決定「複製成功公式 or 再修文案 or 催爬」。這就是「是否進步／再修正」的依據。

## 一句話現況
旗艦教學站（Astro，47 篇文章）。07-05 大整理：內容制度正本上線（EDITORIAL + 兩個任務範本 +
四角色產線）、LLM 接入層（llms.txt + 全站 .md 端點）、8 張概念缺圖以 SVG 補齊、
圖庫 94MB→70MB、講義線打通（modules → handout）。全部改動已本地 build 驗證通過、尚未 commit。

## 下一個具體動作 ⭐
**2026-08-09 課堂即時投票改版完成，仍卡在「講師端沒有人看過」** ⬅️ 最新

### 🔴 明天第一件事：開講師端看版面（只有 Joseph 做得了）

<https://launchdock.app/admin/poll-live/>（Google 登入）。
production 留著測試場次 **`DEMO12`**（`poll_active` 已設成 Q3，內有 3 票 + 1 則匿名留言），
登入就有圖可看，不必自己建場次。

**要看的五件事**：
1. 出題區的按鈕（Day 3 五顆／Day 4 三顆／Q0／✏️ 臨時出題）——點 `Q9` 或 `Q4` 看切換
2. 長條圖
3. 匿名留言牆（第 1 層備案，可直接念）
4. 勾「業態交叉表」→ 業態 × 選項矩陣
5. 按「🖥 投影模式」——**字在投影機上夠不夠大**，這是最可能要調的一項

順手按一次「⏸ 停下來討論」，另開手機看 <https://launchdock.app/poll/?code=DEMO12>
按「🔄 更新」，確認學員端會收起選項改顯示討論題。

**看完刪測試資料**：`DELETE FROM quiz_sessions WHERE code = 'DEMO12';`

### 🟡 之後

2. **8/12 當天**：建場次 → 投影代碼＋QR → 先出 `Q0` 暖身（測通系統＋點名）→ 照
   `docs/class-poll-runbook.md` 跑。**⛔ 那天不要開 `/admin/quiz-live/`**（那頁才有「結束收件」，
   誤按一次全班投不了）。
3. **8/12 建議 Google 表單並行保險**（HANDOFF §五之三 的時程建議），8/14 再全押站上版本。
   Day 4 只有 3 題，失敗也能無縫退回表單。
4. **改題庫必跑 `npm run poll:check`**——講義已經印出去，題號/選項差一個字，
   學員當場就會問「我這題是哪一題」。

### 📌 這次學到、值得記的

**部署驗證挑錯字串會浪費十分鐘。** `/poll/` 是 React island，SSR 出來的 HTML 只有
「連線中…」，元件內文字全在 hydration 的 JS chunk 裡。要驗新版有沒有上線，
**抓 `<title>`（在 HTML 裡）或直接抓 `/_astro/*.js` chunk**，不要 grep 頁面 HTML 的內文。
另外 `class-poll.*.js` 是 ClassPoll 與 PollLiveDashboard 共用的 chunk，
**不會出現在頁面的 `<script src>` 清單裡**（由 ClassPoll.js 內層 import），要從 chunk 內容找。

---

**2026-08-05 手機實測踩到「送出失敗」→ 已定位＋訊息已修｜8/06 工研院場次待命**
- **🎓 明天上課用的**：場次 **`25ZEA9`**「0806工研院消費行為洞察與預測」，status=open／phase=pre／**responses=0（測試資料已清空，乾淨待命）**。學員連結 `https://launchdock.app/quiz/?code=25ZEA9`，或投影後台的 QR。
- **⛔ 現場最重要的一條紅線**：**全班交完前，絕對不要按「⏹ 結束收件」**。交卷的 RLS 是 `WITH CHECK is_quiz_session_open(session_id)`，只認 `status='open'`；一按下去，所有還在作答的人交卷會**當場 401 失敗**。這顆鈕是**下課後**才按的。
- **Joseph 手機實測回報「送出失敗」→ 已 repro 並定位**：用 anon key 打同一支 API 重現出 `42501 / HTTP 401 new row violates row-level security policy`，證明失敗當下 `status≠open`。**不是 bug、不是程式錯**，是場次被關（後台按到「結束收件」）。後來場次回到 open，他重試就成功了。
- **已排除自動關閉**：此 DB **無 pg_cron、`quiz_sessions` 上零 trigger** → 狀態不會自己變，只有人按才會關。所以明天不會無故中斷。
- **答案不會掉**：交卷失敗時本機保留結果＋提供「重試送出」，學員不必重做 12 題。
- **已修（`6ccb8eb`，Joseph 指示）**：交卷失敗訊息從乾巴巴的「送出失敗（結果仍已保留在本機）」→ **可行動指引**：「送出失敗，可能是網路不穩。等幾秒再按一次『重試送出』就好——你的答案已保留在本機，不會不見。若重試多次都失敗，請告訴講師。」中英雙語。**理由（Joseph 的判斷，正確）**：教室現場最常見的其實是 wifi／Cloudflare 抖動，不是場次被關，學員需要的是「等幾秒再按一次」而不是知道 RLS 是什麼。build 綠 173 頁。
- **前情**（同日稍早）：90 人併發壓測 PASS（180 requests 全綠、中位 0.64s、後台吃得下 90 筆、35kB/輪詢）；後台畫面首次親眼確認（左代碼右 QR 並排正確）；DEMO01＋LOAD90 壓測資料全清。
- **仍沒驗到**：結果頁 `CapabilityQuiz.tsx:310` 的 `grid grid-cols-2` 在窄螢幕是否擠（Joseph 手機跑完 12 題但沒回報版面問題，暫視為可接受）。

**2026-08-05 90 人併發壓測 PASS ＋ 後台畫面首次實看 ＋ 8/06 工研院場次待命** ⬅️ 最新
- **背景**：Joseph 明天（8/06）有真課「0806工研院消費行為洞察與預測」，場次已自建＝**代碼 `25ZEA9`**（status=open、phase=pre、responses=0，隨時可上場）。他問「90 人同時用會有問題嗎」。
- **壓測（對 production 實打，非推論）**：建臨時場次 `LOAD90` → 用 anon key 同時發 **90 人 × (1 RPC 換場次 + 1 交卷) = 180 requests**（走真實 PostgREST + RLS + phase trigger）。**結果全綠**：RPC 90/90 → 200、交卷 90/90 → 201、**零失敗零限流**；全部打完 5.9 秒；交卷耗時 最快 0.23s／中位 **0.64s**／最慢 3.83s（最慢那筆是我單機硬開 90 條並發自己塞住，真實情境是 90 支不同手機，只會更好）。
- **資料正確性**：90 列、90 個不同 `participant_id`、phase 全部正確是 `pre`（trigger 沒漏）。**後台實測吃得下**：儀表板正確顯示「90 份課前測已交／本班平均 L2.0／程度分佈」，沒有變慢或截斷。
- **流量**：90 列 ≈ **35kB／次輪詢**，每 5 秒一次 ≈ 25MB/hr。Supabase **free 方案**（org `averna`）月流量 5GB → 一堂課約 50MB，**完全夠**；但別把後台開著放整天。
- ✅ **後台畫面首次親眼確認**（用 Joseph 已登入的 Chrome）：左「代碼大字」右「QR」並排正確、「點一下放大投影」在、三顆操作鈕（複製連結／結束收件／切到課後測）都在、底下顯示完整作答網址。**先前 STATUS 一直記「我沒看過後台」——此條已解除。**
- **DB 在 `ap-south-1`（孟買）**：台灣過去 RTT 約 100–150ms，已內含在上面的實測數字裡，不是問題但別誤以為在東京。
- **壓測資料已清乾淨**：`LOAD90` 場次＋90 列全刪，現在 DB 只剩工研院那一場（0 筆）。
- **仍沒驗到（唯一剩的）**：**手機實機作答**。macOS Chrome 視窗縮不到 390px，我逼不出真手機 viewport。程式碼層面最可疑的一處＝結果頁 `CapabilityQuiz.tsx:310` 的 `grid grid-cols-2` **沒有 mobile breakpoint**，窄螢幕每格只剩 ~170px 要塞「維度名 L2」+「已解鎖 · 75%」，可能擠。→ **開課前請用手機掃 QR 真做完一次 12 題**（2 分鐘），重點看結果頁那四格。

**2026-08-05 班級測驗：DEMO01 測試資料已清空 + QR code 已內建** ⬅️ 最新
- **緣起**：Joseph 說「測驗功能我沒看到」。查證結果＝**功能早就上線且已 push**（`674c70a`/`e6b581c`，production `/quiz/`、`/admin/quiz-live/` 皆 200），沒看到是因為**刻意隱藏**：`/quiz/` 沒帶 `?code=` 對一般訪客完全不變、`/admin/quiz-live/` 要 Google 登入才顯示內容。**這是設計，不是 bug**——但也代表沒有任何自然入口會讓人「不小心發現」它。
- **① DEMO01 已清乾淨**：刪 19 份作答（課前 10／課後 9）＋場次本身。現在 `quiz_sessions=0`、`quiz_responses=0`，production DB 零測試殘留。**下次要看後台長怎樣得自己開一場新的。**
- **② QR code 已內建**（推翻先前「手動轉、不加依賴」的決定，Joseph 8/05 指示）：加 `qrcode` ^1.5.4 依賴；投影區改成左「代碼大字」右「QR」並排，QR 已帶 `?code=`，實體班掃了直接進作答頁不用手打；**點 QR 可放大到 `min(60vh,460px)` 投影**，再點縮小。產圖 640px（放大不糊），顯示尺寸由 CSS 控。
- **技術**：`import('qrcode')` 動態載入 → Vite 切成獨立 chunk `browser.*.js`（25.8KB），**只有後台掛載時才下載，173 個公開頁零成本**；產圖失敗時靜默降級成「只顯示代碼」，不擋畫面。
- **驗證（已跑）**：`npm run build` 綠 173 頁；**QR round-trip 實測 PASS**——用元件裡一模一樣的參數（width 640／margin 1／ecc M）產圖，再用 jsQR 解碼回來，字串與原網址完全相同（`https://launchdock.app/quiz/?code=A1B2C3`）；dist 確認 chunk 有切開。
- ✅ **2026-08-05 Joseph 已實測 QR：OK**（後台畫面我本人仍沒看過——AdminGuard 要 Google 登入，本機 preview 又踩下面那個 `/auth/callback` 無斜線 404 的既有坑——但版面與掃碼由 Joseph 目視確認通過）。**QR 這條線收斂**：編碼端有 jsQR round-trip、落地端有真人掃碼，兩頭都對上。
- **仍沒驗到的（只有真人上課會浮現）**：① **手機作答流程零實測**——實體班掃 QR 必然用手機開，但 12 題介面／送出／localStorage 都只在桌機驗過，**這是最可能出包的一塊**；② **從沒多人同時作答**（`participant_id` 靠瀏覽器區分，邏輯無誤但沒實跑）；③ 課後測切換的現場操作沒真人跑過（8/04 只用同一顆瀏覽器模擬 pre→post）。
- **下一個動作**：開課前先用手機掃碼真做完一次 12 題（2 分鐘，補掉 ① 的空白）。**操作提醒**：場次目前 0，上課前要先建一場；收完記得按「⏹ 結束收件」，否則連結一直開著。

**2026-08-09 課堂即時投票依手機實測回饋改版（`66f43c7`＋`daa70d7`，已 push）** ⬅️ 最新
- **Joseph 手機實測提了兩件事，都改了**：
  ① **「八題一次列完像問卷，學員走馬看花一路投完」**——這是設計錯誤，不是小瑕疵：
  投票的定位是**課程中間停下來的互動**，一次列完就等於把整堂課的互動點一次用光。
  改成**學員一次只看得到當下這一題**，其他七題完全不出現，畫面最上面標明
  「Day 3 · 段 2 · N1 商品關聯」。題庫每題新增 `segment`（學員端段落標示）與
  `discuss`（討論題）。講師端加「⏸ 停下來討論」：學員端收起選項、改顯示討論題、
  顯示自己選了什麼。**代價**：晚到的人補不了前面的題（Joseph 選這個方案時已知）。
  ② **業態太局限**——擴到 14 個（加傳產／製造、批發貿易 B2B、醫療診所、補教教育、
  旅宿觀光、汽機車、建材五金），「其他」改成**可自己打字**（20 字）。清單再長都會漏，
  打字才是根本解，而且交叉表上看到的是真實行業名而不是一堆「其他」。
  業態改成進場先問一次，之後縮成底部一行可改。
- **⏸ 停下來討論不是權限**：只寫 `poll_active.locked`，**不動場次 status**——
  按下去不會有任何人送出失敗，晚到的人還投得進來。跟「不要按結束收件」那條紅線是兩回事。
- **順手修的兩個上台會看到的瑕疵**：`🗪` 在系統字型下是豆腐框 → 換 `💬`；
  出題區說明與講師台詞的 markdown `**粗體**` 會原樣印出星號 → 說明改 `<b>`，
  台詞加 `Emphasized` 元件把 `**` 渲染成真粗體。
- **驗證**：build 綠 175 頁；`npm run poll:check` 8/8 對齊；**手機寬度真瀏覽器**走過
  選業態（打字「寵物用品」）→ 投票 → 討論狀態三段畫面，打字的業態正確落庫。

**2026-08-08 課堂即時投票 class poll（migration 016 已上 production）**
- **為什麼**：日晴生活零售 AI 課 8/12（Day 3）、8/14（Day 4）要用。跑完 Colab 得到一個數字 → 問全班「這個數字在你那行是多少？」→ 投影分布 → 挑極端值邀請分享。正本規格＝`sunlit-retail-sim/wp9-colab/HANDOFF.md` §五之三。
- **為什麼不塞進既有 quiz**：`quiz_responses` 的 schema 硬綁能力測驗（`scores`/`primary_level`/`gap_dimension` 都 NOT NULL），參數題沒有分數也沒有等級 → **開姊妹表 `poll_responses`，共用 `quiz_sessions`**（同一組代碼、同一個 QR、`is_quiz_session_open()` 直接複用）。
- **關鍵簡化：學員端不輪詢。** 即時是投影給全班看的，講師口頭喊「請重新整理」即可。學員端也輪詢的話一堂課 75 萬次請求。這一刀砍掉 90% 複雜度。
- **⛔ 紅線落實成程式**：`/admin/poll-live/` **故意沒有「結束收件」鈕**（poll 模式整堂課都在收件，中途誤按一次全班掛）。場次若是關閉狀態，講師端會出紅色橫幅導去 quiz-live 重新開放。上課那天不要開 quiz-live 那一頁。
- **產物**：`supabase/migrations/016_create_class_polls.sql`（`poll_responses` + `quiz_sessions.poll_active` JSONB + `resolve_quiz_session` 多回傳一欄）、`src/data/class-poll.ts`（八題唯一策展點，含講師台詞與跨業態備案）、`src/components/ClassPoll.tsx`（學員端 `/poll/`）、`src/components/PollLiveDashboard.tsx`（講師端 `/admin/poll-live/`）、`scripts/check-poll-alignment.mjs`（`npm run poll:check`）、`docs/class-poll-runbook.md`、nav ×5。
- **⭐ 題目對齊已機器驗證**：`npm run poll:check` 拿 `sunlit-retail-sim/wp9-colab/handouts/day{3,4}-學員講義-v2.md` 對撞題庫，**8/8 題的題目、選項、Day、出場順序逐字一致**。過程中修掉兩個真的錯：① Day 4 段號寫錯（Q7 在段 1 我寫段 2、Q10 在段 2 我寫段 3）② Q10 備案表第四列文字沒照講義。**講義印出去了，這個腳本以後每次改題庫都要跑。**
- **驗證（已跑）**：`npm run build` 綠 175 頁（+2）。migration 已套 production `lxudxtpfenotkpgmhomq`，anon key 實打 REST **12 項全過**：代碼換場次（含 poll_active）／投票 201／讀別人的票＝空／列舉場次＝空／投到不存在場次被擋／**匿名 UPDATE 改不動別人的票**（PostgREST 回 204 但 0 列受影響，已用 service role 查證原值未變）／**匿名 DELETE 刪不掉**／note 201 字被 CHECK 擋／choice_index 99 被 CHECK 擋／關閉場次後代碼換不到＋投不進去／**迴歸：AI 能力測驗交卷仍 201**（resolve_quiz_session 被 DROP 重建過）。security advisor **零新增**。測試資料已刪乾淨。
- **學員端真瀏覽器實測**：本機 dev + production DB，選業態→投票→補一句話，兩筆都正確落庫（含中文 note、業態、選項文字）。**同一人重投＝多插一列，後台取最新**（不開 UPDATE 權限的既定設計）。
- **🔴 沒驗到的**：① **講師端畫面我本人沒看過**——AdminGuard 要 Google 登入，我不能代登。出題、長條圖、匿名留言牆、業態交叉表、投影模式**全部只有程式邏輯正確，版面沒人看過**。② 手機實機沒測（學員一定用手機）。③ 沒有多人同時投票過。
- **🧹 待清**：production 還留著一筆測試場次 `DEMO12`（`[TEST] 本機畫面驗收 勿用`，含我投的 2 筆）——**刻意留著讓 Joseph 開講師端就有圖可看**。看完請刪：`DELETE FROM quiz_sessions WHERE code = 'DEMO12';`

**2026-08-04 班級測驗加「課前／課後」成效對照（migration 015，已 push）**
- **設計＝單一場次雙階段**（不是開兩場）：同一組代碼、同一條連結，老師課後在後台按「🎓 切到課後測」，學員重開同連結再做一次；配對靠同一顆瀏覽器的匿名 `participant_id`。現場只需唸一次代碼。
- **phase 由伺服器決定，不信前端**：`BEFORE INSERT` trigger `set_quiz_response_phase()` 直接抄當下場次的 phase。**已實測**：anon 硬送 `phase:"post"` 而場次仍是 pre → 入庫被蓋回 `pre`。
- **後台新增**：階段切換鈕、「現在收的是課前測/課後測」標示、**🎓 這堂課的成效**區塊（課前 L→課後 L→推進值＋四項解鎖率前後疊圖），優先用「課前課後都做過」的人**配對比較**（無配對才退回全體平均，介面會註明）。
- **學員端**：橫幅顯示課前測/課後測 badge；課後測時若手上是還原自 localStorage 的舊結果，**擋掉補送、改要求「重新作答」**（否則會把課前答案當課後成績送出）。
- **驗證**：build 綠 173 頁；trigger 防竄改實測過；瀏覽器實跑課後測流程（同一顆瀏覽器 pre=L1 → post=L4，phase 正確）。**唯一沒跑到的仍是講師後台畫面**（需 Google 登入）。
- **測試資料**：production 留著場次 **DEMO01**（課前 9 份／課後 9 份，含 8 位假學員），登入後台即可看到成效對照長怎樣（預期：課前 L1.9 → 課後 L2.8，推進 +0.9，配對 9 人）。~~**看完告訴我，我清掉。**~~ → **2026-08-05 已清空**（見上一條）。

**2026-08-03 班級測驗（quiz 團體班模式）已做完，等真人實測＋Joseph 決定 push** ⬅️ 最新
- **要解的問題**（Joseph 8/03 提）：上課前想快速知道「本班同學程度在哪」，線上與實體學員都算，好當場調整課程內容。
- **做法**：`/quiz` 加課堂模式（網址帶 `?code=XXXXXX` 才啟動，一般訪客畫面完全不變）；`/admin/quiz-live` 建場次、投影代碼、每 5 秒看全班聚合。**沿用現有 12 題自評題庫**（未加新題）。
- **產物**：`supabase/migrations/014_create_quiz_sessions.sql`（`quiz_sessions`＋`quiz_responses`＋`resolve_quiz_session`／`is_quiz_session_open` 兩支 SECURITY DEFINER）、`src/components/QuizLiveDashboard.tsx`（新，含 AdminGuard）、`CapabilityQuiz.tsx`（加課堂橫幅＋匿名送出＋舊結果補送按鈕）、`src/pages/admin/quiz-live.astro`（新）、`supabase-types.ts`＋三個 admin 頁 nav＋AuthButton 選單。
- **隱私設計**：全匿名——只存瀏覽器產的隨機 `participant_id`，不存姓名/email/user_id；後台畫面只有聚合數字，可安全投影。anon **只能 INSERT**、不能 SELECT 任何作答；場次代碼**不可列舉**（anon 對 `quiz_sessions` 零 SELECT 權限，只能用 RPC 拿 code 換 id）。同一人重交不覆蓋、後台取最新一筆。
- **驗證（已跑）**：`npm run build` 綠（173 頁）。migration 已套 production `lxudxtpfenotkpgmhomq`，並用 anon key 實打 REST 七項全過：代碼換場次可（大小寫皆可）／列舉場次＝空／交卷 201／讀作答＝空／交到不存在場次被 RLS 擋／場次關閉後換代碼＝空且交卷被擋。測試資料已刪乾淨（sessions=0, responses=0）。**advisor 新增兩筆 WARN 0028/0029＝那兩支 DEFINER 函式 anon 可執行，是刻意設計**（學員本來就匿名），同既有 `increment_helpful` 性質。
- **學員端已瀏覽器實測（本機 preview，未登入狀態）**：① 舊結果補送按鈕 → 入庫欄位正確；② 12 題作答完自動送出 → `primary_level=1`/`gap=chat` 正確；③ 同一人重交＝2 列但 `distinct participant=1`（後台取最新）。**學員全程零登入**，只有講師後台要 Google 登入。
- **坑（既有、非本次造成）**：全站 6 處 OAuth `redirectTo` 寫 `/auth/callback`（無斜線），但 `trailingSlash: 'always'` → **本機 `astro preview` 登入回來會 404**（線上 Cloudflare Pages 會補斜線所以沒事）。**不可改成加斜線**：Supabase `uri_allow_list` 存的是無斜線的 `http://localhost:4321/auth/callback` 與 `https://launchdock.app/auth/callback`，改了反而對不上、線上登入會壞。本機要測後台就手動在網址列補斜線。
- **2026-08-03 已 push**（Cloudflare Pages 自動部署）。**剩下**：① 你在 production `/admin/quiz-live/` 登入看一次後台（目前留著測試場次 **DEMO01**「【本機實測】8/03 測試班」含 9 人假資料供檢視，**看完要清掉**）；② 選配：QR code（實體班掃碼最順，需加 `qrcode` 依賴）、課前/課後 delta（加 `phase` 欄位）、加 3–5 題有正解的觀念題。

**2026-07-30 藍鴨小聚 8/26 已下架 + 原生報名確認信管線已建好（卡 Resend 帳號）** ⬅️ 最新——① 組合器（見下一段）已上線且 M5 端到端驗證過。② **8/26 小聚（階②「把專屬提示詞存起來」）Joseph 說先下架**（日期有變數）→ event 設回 `draft`（標題/Meet 連結 `meet.google.com/qqg-zvio-mks`/原生報名全留著，改 published 即復活）；首頁 hero banner 已從 8/26 改指 `/tools/prompt-builder/`（中英，已 push）。③ **原生報名確認信管線全建好**：函式 `send-registration-confirmation` 已部署（verify_jwt=false）+ 內容帶 Meet 連結、pg_net 已裝、event_registrations INSERT webhook（migration 011/012）、報名數 RPC 改回 DEFINER（013，修「顯示 0」bug）。**唯一卡點＝Resend 的 API key 與 verified 網域不同帳號**：現有 key 打 `apcs.launchdock.app`（子網域、9 個月前另帳號驗的）回 403 未驗證 → 需 Joseph 讓「key 與 verified 網域同一 Resend 帳號」（或在 key 所屬帳號驗網域）。④ 每月營運：小聚每場要更新 `events.meet_link`（memory `meetup-monthly-meet-link`）。**復活 8/26 時**：確認 Resend 帳號一致 → 測試帳號報名收信 → republish + banner 改回。**待清**：event_registrations 有 2 筆今日測試列（jjaimark2 registered、launchdock cancelled），等 Joseph 點頭再刪。

**（前一段）2026-07-29 藍鴨組合器：會員登入＋提示詞儲存 M1–M4 已合 main 上線（等瀏覽器實測）**——devplan（`prompt-builder-auth-devplan.md`）原假設導 Firebase；第 0 步盤點發現本站早有完整 Supabase Google 登入會員系統（AuthButton/AuthProvider/`member_profiles`/AdminMembers），故**改用 Supabase、不導 Firebase**。① **M1** migration `010_create_saved_prompts`（owner-only RLS + server-side 20 則/人上限 trigger + REVOKE EXECUTE 硬化）**已套 production `lxudxtpfenotkpgmhomq` 並功能實測**（插 20 OK、第 21 被 check_violation 擋、rolled-back 零殘留）；② **M2–M4** `launchdock-meet/prompt-builder.html` 移植成 `/tools/prompt-builder/`（`PromptBuilder.tsx` island + Astro 頁，站上主題 token、明暗雙主題，prose 輸出**驗證與原版 byte 一致**）；工具本體人人可用（試＋複製），只有儲存/我的提示詞（載回編輯/重新命名/刪除）促登入；③ **入口**：Header 🧰 工具下拉（桌機+手機）+ `prompt-engineering` 文章 CTA（中英）。**2026-07-29 已 merge main + push（分支 `feat/prompt-builder` 併入，STATUS/BACKLOG 衝突手動合併）**，Cloudflare Pages 自動部署 `launchdock.app/tools/prompt-builder/`。**M5 已驗證（2026-07-30）**：① 資料層/RLS 對 production 實跑全過（auth.uid 解析、A 存→A 讀=1、B 讀/刪 A 的=0、匿名讀=0、20 則上限、table 權限對照 event_registrations 一致、測試列零殘留）；② **端到端閉環**：Joseph 用瀏覽器真人 Google 登入→儲存，DB 確認該筆 `saved_prompts` 欄位全對（title 自動取第一句、platform 對到微調、selections 完整可載回）。**剩待辦（皆選配/非阻擋）**：① Q2「更多職業卡」是否會員限定、Q3 登入是否勾電子報（Joseph 決）；② **英文版工具**（需翻 PAIN/ROLE/PREF/TUNE → `/en/tools/prompt-builder/`，已記 BACKLOG）；③ main 已有 `set-system-prompt` 文章，可再補一條 CTA 過去。M6 會員名單＝既有 `member_profiles`，等同已完成。

**2026-07-27 碎碎念文：`voice-input-ai-context`（語音亂聊補上下文）中英雙版——已 push 上線** ⬅️ 最新
- **緣起**：綁三條線＝① Joseph 7/9 台中課早就教「語音輸入快速補 LLM 上下文」② AI 大師 Karpathy 公開同款「long ramble / switch to voice / 亂聊 10 分鐘 / Mind Meld」（查證：推文 x.com/karpathy/status/2079610838143623371 屬實，多家二手佐證）③ 補上先前查到的站上內容缺口（無此概念文）。定位純觀點碎碎念（guide/scene 鴨編的碎碎念·blog/order 99），**不配圖**（EDITORIAL 允許純觀點零截圖），個人故事概略帶過不編細節（Joseph 指定）。
- **產物**：`voice-input-ai-context.md`＋`en/`；concepts.yaml 加概念「語音輸入補上下文」（canonical＝本篇）；registry 重生 **75 篇/55 概念**。內文手動連 `set-system-prompt`／`ai-share-link-not-private`（HTML 驗證無巢狀 `<a>`、無雙連結）。
- **驗證＋上線**：build 綠（171 頁）、無 @img 欠債、無斜線連結、概念連結生效；push 後 production 200。
- **坑筆記**：手動連「系統提示詞」時它已是概念名詞（Remark 會自動連），本次剛好沒打架（我的手動連結是首次出現、plugin 跳過），但下次連概念詞應直接寫純文字讓 plugin 處理，別手動連。

**2026-07-27（插隊）新聞回應文：`ai-share-link-not-private`（AI 分享連結≠私密連結）中英雙版——本地 build 綠、瀏覽器實看過、等 Joseph review 語氣＋事實後決定 push** ⬅️ 最新
- **緣起**：回應 2026-07 Claude 分享對話被 Google/Bing 索引外流事件（電腦王阿達等報導）。定位＝碎碎念/觀點文，教一個第一性原則心智模型「分享連結 ≠ 私密連結」，適合當 SME/新手教材。
- **查證（站上硬規則）**：事件在我知識截止後，實查多來源交叉確認：Cybernews／IBTimes(Reuters)／Yahoo Tech／Hackread／Neowin＝Claude 2026/7 分享頁缺 `noindex` 被索引，外流 API 金鑰/履歷/加密錢包/律師筆記/疑似 SSN；前三次同類事件也查實＝ChatGPT 2025/7（~4,500 篇/~10 萬被爬，OpenAI 下架功能）、Grok 2025/8（37 萬+，含密碼）、Claude 2025。**Perplexity/Notion「預設私密」的確切行為沒查實 → 刻意不寫，改用已證實的「修復只差一行 noindex」論點**。
- **產物**：`ai-share-link-not-private.md`＋`en/`（guide／scene 鴨編的碎碎念·blog／入門／order 99）；3 張圖 `public/images/articles/ai-share-link-not-private/`（Claude 分享按鈕→分享對話框「Keep private/Create public link·Anyone with the link can view」→已建立公開連結）。concepts.yaml 加概念「分享連結 ≠ 私密連結」（canonical＝本篇）；registry 重生 **74 篇/55 概念**。含「誠實角度」段（我是 Anthropic 模型、客觀陳述不護航）。
- **遮罩**：n3 那張是 Joseph 剛建立的**真‧公開 share 連結**，原樣登站等於自建反向連結、可能被 Google 索引（正踩文章警告的坑）→ 已用座標黑框遮掉 URL 的 UUID，保留 `claude.ai/share/` 前綴示意。三張都是他自己「誰最強」測試對話、無第三方 PII。
- **驗證**：build 綠（169 頁）＋無孤兒＋3 圖引用＋無斜線連結＋`npm run preview` 開瀏覽器看過三張圖與遮罩 URL 都正確渲染。
- **下一步（需 Joseph）**：① 過目語氣（尤其「誠實角度」批 Anthropic 那段）與事實框架 → 點頭；② 授權後 `git add` 三新檔＋concepts＋registry＋STATUS，commit＋push。**尚未 commit／push**。可選：加進 `home-faq.ts`（「claude 對話被 google 搜到」時事題）、meetup warmups、或做成一頁式 SME 教材。

**2026-07-27 反向截圖新文章：`set-system-prompt`（系統提示詞四平台教學）中英雙版——本地 build 綠、等 Joseph review 遮罩圖後 push** ⬅️ 最新
- **緣起**：配合 7/29 工作坊「親手寫第一段 AI 系統提示詞」＝四階梯第①階，把當晚的帶得走講義先寫成站上文章。桌面 33 張 07-27 截圖（Gemini/ChatGPT/Claude/Grok 四平台設定「給 AI 的指令」全流程）反推成文。
- **產物**：`src/content/articles/set-system-prompt.md`＋`en/set-system-prompt.md`（tutorial／scene 基礎使用·basics／入門）；9 張遮罩後 JPEG 進 `public/images/articles/set-system-prompt/`（1800px、~180–230KB）；`concepts.yaml` 加概念「系統提示詞」（canonical＝本篇，別名含 System Prompt/自訂指令/給 AI 的指令）；registry 重生 **73 篇/55 概念**。內文連 `/meetup/`＋自動連結 prompt-engineering／openclaw-soul／from-prompt-to-skill。附一段可複製新手模板（關於我／回答方式／語氣）。
- **遮罩（本機做完、兩輪視覺覆核）**：選 10→用 9 張（棄 Claude 選單那張＝email+姓名兩處 PII、改文字描述）。**redact `--scan` 一律回報 0（記憶已記＝對 email 系統性漏抓，不可信）**，改用 **PIL 座標實心黑框**：Claude 兩個「Jose」表單欄＋背後「Welcome, Jose!」問候語；Grok 三張左下角 `launchdockapp@gmail.com`（含選單開啟時被 UI 模糊那張也補蓋）。逐張放大覆核 clean。handle「launchdock」（無 @gmail）＝公開品牌，保留。
- **驗證**：`npm run build` 綠（167 頁，+2）＋`npm run orphans` 無孤兒＋dist 該篇 9 圖引用/概念連結/無斜線連結=0 都過＋`npm run preview` 開瀏覽器實看渲染（麵包屑/標籤/圖說交錯/紅框標註都正確）。
- **下一步（需 Joseph）**：① 過目 `public/images/articles/set-system-prompt/*.jpg` 遮罩 → 點頭；② 決定四平台順序/是否加 Claude 選單那張；③ 授權後 `git add` 三新檔＋concepts.yaml＋registry，commit＋push（push 前依慣例再跑一次 `--scan` 並人眼複核，本篇 PII 靠人眼非 scan）；④ 可選：加進 `home-faq.ts`（「chatgpt 自訂指令怎麼設」類新手高需求題）、meetup.astro warmups 掛這篇。**尚未 commit／push**（遵循反向截圖文章先 review 再上傳慣例）。

**2026-07-23 自動化工作流升級為獨立 scene + 四篇掛 modules（已上 production 實測）**——commit `f6b734a`。① **scene 升級（保留彈性、後續可持續加工作流）**：`content.config.ts` zh enum 加「自動化工作流」、en enum 加 `automation`；`i18n/ui.ts` 補 `scene.automation` 與 `sceneKeyToLabel` 中英各一筆；`pages/articles/index.astro` 與 `pages/en/articles/index.astro` 的 sceneOrder/SCENE_ICONS 補新 scene（排在「整合與自動化」之後）；四篇 `workflow-*` 中英 scene 從 integration 改 automation。**icon 對調**（語意更準）：整合與自動化→`api-integrations.png`、自動化工作流→`automation.png`。② **modules 接講義線**：reconcile／inbox／docdiff→`M05`（自動化工作流與 RPA）、report→`M05`+`M07`（資料分析與視覺化）。tag「自動化工作流」保留（scene 導覽軸 + tag 自由聚合並存，不衝突）。registry 重生 72 篇/55 概念。**驗證**：build 綠（165 頁）＋ preview 開瀏覽器看中英「場景瀏覽」都出現獨立「自動化工作流／Automation Workflows」區塊、四篇齊備；push 後 production `/articles/`、`/en/articles/`、文章頁 scene 都確認上線。
**下一步（可挑）**：① 講義抽組實測 `npm run handout M05`（四篇已掛，可產出 M05 講義）；② 英文互動頁（現在英文文章連的是中文 wizard，文中已註明，需把四個 wizard 文案 i18n 化 + 開 `/en/workflows/*`）；③ ✅ **首頁 Hero 中英換臉 + cowork 7 篇 SEO 優化都已上線**（`HANDOFF_hero_reface.md` 已刪）；✅ **`caffeinate-keep-mac-awake.md` SEO 優化已完成**（commit `b8e56ea`，CC 直接做非等 cowork 橋接：標題改「caffeinate 是什麼」+ description 定義 + 一句話/關鍵字 + 補 `killall caffeinate` + FAQ，中英雙版）；同日還修了鴨編頭像 `<img>` 被反引號包成 code 的 render bug（全 repo 6 篇 `cece64c`）。`docs/image-text-harvest-checklist.md`、`docs/troubleshoot-template.md` 兩個 cowork 文件仍未追蹤（可留可 commit）。④ **SEO 灘頭堡重定位（來自 07-23 Search Console 90 天數據，重要）**：實測翻案——OpenClaw/龍蝦 在搜尋幾乎掛零（前 25 僅 `openclaw 自動切換模型` 2 點擊），真正在收人的是 **Hermes/Ollama 疑難排解**（`ollama hermes` 8、`error: unknown integration: hermes` 一整叢，高意圖低競爭排得上）與**新手概念題**（`cli`/`cli是什麼` 1,700+ 曝光、`github developer settings` 444 曝光、`api key`/`google api key` 各 ~150 曝光，但點擊近 0＝Google 已把新手帶到門口、標題沒接住）。定調：站的真實身份＝「非技術者卡在 AI 第一哩路時 Google 會丟過來的站」，Hermes 報錯＝高意圖窄門、新手概念題＝巨量低轉換入口，兩條該經營；OpenClaw 留作品牌與未來下注、別再當 SEO 主軸。→ 待辦：針對 Hermes 報錯串與 CLI/API key 新手題寫/優化文章接住這些流量。

**（前一段）2026-07-22 自動化工作流四條已全數上線（production 200 驗證）**——來源＝ `~/github/workflow-claude/HANDOFF.md`（Cowork 整併版交接包，取代舊的 `HANDOFF-workflow-reconcile.md`；四條的 wizard/astro/文章都在該資料夾按 launchdock 路徑排好，直接複製即可）。四條：`/workflows/reconcile/`（對帳・進階）、`/workflows/report/`（報表・中級）、`/workflows/inbox/`（收件匣・入門）、`/workflows/docdiff/`（文件差異・進階），各配一篇 `workflow-*` 文章**中英雙版**、tag `自動化工作流`、scene 整合與自動化／integration，並全部進 `quiz.ts` levels[4].recommended（自動化＝能力階梯最頂 L4）。全部 wizard **純前端零 API**，CSV／文件只在瀏覽器內解析、不上傳；末段附可複製提示詞 + 開啟 Claude。registry 72 篇/55 概念。
**驗證**：`npm run build` 綠（165 頁）＋ `npm run preview` 瀏覽器逐條實跑——對帳（4 相符／1 金額不符／1 只在內部帳／1 只在銀行，日期差自動視為同一筆）、報表（總計 $2,813k、7月環比 +41%、6月 −22% 標紅，數字覆算正確）、收件匣（4 訊息抽 4 待辦／3 個明確截止，有截止日的排前面）、文件差異（4 處實質變更全標「對你不利」：付款 30→45 天、交期 14→21 天、逾期罰則被刪、新增 7 天視同驗收）；深/淺色都正常。
**下一步（可挑）**：① 四篇 `modules: []` 接講義線（BACKLOG 已記）；② 「自動化工作流」目前是 tag，若這條線再長考慮升級成 `scene` enum；③ 英文互動頁（現在英文文章連的是中文 wizard，文中已註明）。

**（同日）2026-07-21 AI 連 GitHub 兩篇：已上線**——push 前重跑 `redact-screenshots.py --scan` 再確認 13/13 clean；`grok-connect-github`、`chatgpt-connect-github` 中英雙版 production 皆 200。分支 `article/connect-github-20260721`、`feat/workflow-reconcile` 都已合併並刪除。

**（前一段，已被上面整併取代）2026-07-22 對帳自動化工作流：已上線**——分支 `feat/workflow-reconcile`（commit 9ac2f17，已 merge main + push，Cloudflare Pages 自動部署）。來源＝ `~/github/workflow-claude/` 的交接包（HANDOFF-workflow-reconcile.md，架構已定案）。內容：① `ReconcileWizard.tsx` 四步互動 island（選情境→一鍵比對→結果+白話解讀→換自己 CSV；**純前端零 API**，CSV 只在瀏覽器內解析不上傳；末段附可複製提示詞 + 開啟 Claude）；② `/workflows/reconcile/` 路由頁（BaseLayout + `client:load`）；③ 文章 `workflow-reconcile` **中英雙版**（tag `自動化工作流`、difficulty 進階、scene 整合與自動化／integration，醒目 CTA 連互動頁）；④ `quiz.ts` levels[4].recommended 加 `workflow-reconcile`（自動化＝能力階梯最頂 L4）；⑤ registry 重生 67 篇/53 概念。驗證：`npm run build` 綠（152 頁）、`npm run preview` 開瀏覽器實跑四步（結果 4 相符／1 金額不符／1 只在內部帳／1 只在銀行，日期差自動視為同一筆）、深/淺色都正常、中英文章頁與 quiz 資料掛載都確認。**2026-07-22 已 merge main + push**（先 connect-github 那支、再本支，STATUS 衝突手動合併）。待辦：文章 `modules: []` 尚未接講義線（已寫進 BACKLOG）。

**（同日一起上線）2026-07-21 AI 連 GitHub 兩篇：已上線**——分支 `article/connect-github-20260721`（commit 7615b9f，已 merge main + push）。兩篇中英雙版：① `grok-connect-github`（Grok 免費版**實測可用**：一句話「寫一個介紹cli工具的網站，上傳到github repo」→ 2m14s → GitHub 上真的多出 repo `cli-tool-website` 含 README+index.html，重點教 GitHub App 授權範圍 All vs Only select、sudo mode、怎麼收回；9 張圖）② `chatgpt-connect-github`（外掛程式→GitHub→安裝→「與 GitHub 連線」授權；**誠實寫出免費版模型無法完成實際 GitHub 任務、需訂閱**，並指出該 connector 定位是 PR/issue/CI triage，四個 Skills 裡沒有 Create Repository；4 張圖）。兩篇互相導流＋接 `deploy-to-github-pages`／`mcp-protocol`／`github-account-signup`。圖 13 張全部本機遮罩（腳本 OCR 漏抓多處，靠手動實心黑框補：Grok 左下 email、ChatGPT 側欄私人對話標題、Grok 回覆內的 GitHub Pages 網址），兩輪視覺覆核＋最終 scan 13/13 clean。concepts.yaml 加 Grok／連接器，registry 68 篇/55 概念，build 綠。查證：xAI 官方文件「連接器對所有 Grok 使用者開放」；OpenAI help 頁 403 取不到 → 方案限制一律寫成「實測」不寫成官方政策。**2026-07-21 收工前已依 Joseph 決定重跑一版：GitHub handle `josephchang7-dev` 與 repo／Pages 網址改為露出（公開帳號＋public repo），遮罩 token 收斂成 `Joseph Chang`／`josephyhchang7`／`gmail.com`；5 張圖重轉、重掃 13/13 clean、build 綠。→ **2026-07-22 Joseph 授權，已 merge main + push；push 前重跑 --scan 再確認 13/13 clean。分支可刪。**

**（同場加映，已 commit 3083da8）`redact-screenshots.py` 加「左下角帳號區保底黑框」**——根因是 `--mask-text` 依賴 OCR 先讀到字，畫面一暗化（彈窗跳出時側欄變灰）OCR 就讀不到，token 再準也漏（本次 Grok 左下角姓名+email 兩輪都沒抓到，靠人眼才發現）。現在 pass 3 對左下角固定比例區塊直接蓋實心黑框、**預設開**，比例取聯集同時涵蓋整桌面截圖與已裁切視窗圖；左下角本身是內文時（GitHub repo 頁 README）用 `--no-corner-mask` 關掉。順手修掉 `--suffix` 誤收 .jpg 造成 src==dst 的 SameFileError。docs/reverse-article-from-screenshots.md 已同步（含「token 挑太寬會誤傷」：`--mask-text joseph` 會連公開 handle 一起遮，要遮真名請給 `"Joseph Chang"`）。三種模式都實測過。**

**（前一段）2026-07-20 github-account-signup 併入「用 Google 一鍵註冊」：本地 commit 完成、等 Joseph 點頭 push**——把新桌面截圖的「Continue with Google」OAuth 路徑併入既有 github-account-signup（中英雙版），重構成「共用起點 → 方式 A Google 一鍵（推薦）→ 方式 B 填表 → 共用裝置驗證/Dashboard/選單」；並補上往 deploy-to-github-pages 的正向連結（deploy 早已反向連回來，雙向連結完成）。新增 4 張圖（google-search / continue-with-google / account-chooser / oauth-consent，轉 JPEG 220-308K）；其中 account-chooser、oauth-consent 含真實 email＋人名，已用 `redact-screenshots.py --mask-text` 遮罩（OCR 預設漏抓、靠人工 token 補）＋**瀏覽器逐圖視覺覆核**＋最終 scan 9/9 clean。build 綠。**尚未 push**（遵循 PII 圖片先 review 再上傳的慣例，避免重演 email 外流事故）。→ Joseph 過目遮罩圖後說一聲即 push。

**（前一段）2026-07-18 反向截圖 8 篇新文章：等 Joseph 逐篇 review → 決定是否 push 上線**——本次用桌面累積的 167 張截圖，全量 triage 後分主題產出 8 篇中英雙版（共 16 檔）＋58 張本機遮罩後乾淨圖，全部在分支 `article/screenshot-batch-20260718` 上 commit（**未 push**，遵循「反向截圖文章先 review 再上傳」慣例）。8 篇：① `kaggle-account-signup`（註冊 Kaggle）② `looker-studio-csv-analysis`（Looker Studio 上傳 CSV）③ `openrouter-free-llm-api-key`（OpenRouter 拿免費 LLM key）④ `make-gmail-sheets-automation`（Make 起手：Gmail→Sheets）⑤ `google-cloud-oauth-api-setup`（GCP 建專案/啟用 API/OAuth）⑥ `make-llm-email-auto-tagging`（Make 串 LLM 自動分類信件）⑦ `ollama-cloud-api-key`（Ollama 雲端 key 當備援）⑧ `ai-agents-build-line-booking-system`（碎碎念：三個 AI 分工做 LINE 預約系統）。遮罩經 redact 腳本 + 手動黑框 + **兩輪獨立 AI 視覺稽核**（批次1抓到 Kaggle 名字馬賽克太淺 + Make 頭像縮寫，已補實心黑框重驗 clean）。**已於 2026-07-18 合併 main（merge ad5ea92）+ push，launchdock.app 8 篇正式上線並驗證 HTTP 200；分支 `article/screenshot-batch-20260718` 可刪。** 若日後回頭優化：可考慮補每篇 modules 掛講義線、或把 Make 系列做成 series。concepts.yaml 已加 Make/Google Cloud/Kaggle/Looker Studio 4 概念、`npm run registry` 已重生（66 篇/53 概念）。原圖仍在 `~/Desktop`（未刪，gitignore 的 `_staging` 有 raw/clean 備份）。

**（前一段）2026-07-10 LINE 會員 Phase 1b：LINE 登入接 channel（等 Joseph 建 channel，之後再做）**——Phase 1a（不需 channel 的部分）已完成：① 文章「分享到 LINE」按鈕（`ShareToLine.astro`，純 LINE it! URL，零 API/零配額，塞 `ArticleLayout` → 47 篇自動有）**已 commit c858921 + push + CF Pages 部署，production 實測確認上線**；② migration 008（`member_profiles.email` 改可空 + `handle_new_user` 容忍 LINE 無 email 用戶）**已寫、尚未套 production**（跟 cpc_* 共用庫，套庫待 Joseph gate）。**下一步（需 Joseph）**：① 決定 LINE Login channel 掛哪個帳號（要跟未來 OA 同 provider）→ 建 channel 拿 Channel ID/Secret；② Supabase Dashboard 開 Custom OIDC `custom:line`（issuer access.line.me、email_optional）；③ 套 migration 008；④ 前端 AuthButton/EventCard/AuthProvider/AdminGuard 四處加「用 LINE 登入」（Google 並存）；⑤ 瀏覽器實測登入→建 profile→報名。Phase 2（OA webhook 自動回覆課程，避開 200 push/月 上限）見 BACKLOG。

**（前一段）2026-07-10 藍鴨小聚已上站露出＋原生 events 支援外部報名（已上 production）**——原本 `/meetup` 是孤兒頁（站上無入口）。已做：① 首頁 hero banner（中英）→ /meetup；② events 表加 `external_url` 欄位（migration 007，已套 production）+ 改 EventCard（有值→報名按鈕導外部表單、隱藏報名人數；無值→維持原生 Google 登入報名）+ AdminEvents 加欄位（你日後可自行增修活動）；③ production 建 7/29 藍鴨小聚（external_url=forms.gle/K9BUvxV6svWUgYVN9、published），`/events` 即將舉辦(1)、前往報名導表單，已瀏覽器實測。**下一步由你挑**：① 對外宣傳 /meetup（LINE/社群）；② `dont-fomo` 的 LINE 短文（cowork outputs/line-post-dont-fomo.md）部署後點開確認 URL 再貼；③ 8/26 正式場改用**原生報名**（建 event 時 external_url 留空即走 Resend 自動信）；④ BACKLOG 其他（47 篇批量掛 modules、ai-agent-browsers 補 2 圖）。

**（背景）活動系統雙軌**：原生 events（Supabase `events` 表 + EventList/EventCard，站上報名或 external_url 導外部）｜`/meetup` 獨立硬編頁（完整 landing，報名走 Google 表單）。7/29 這場兩者並存：hero banner→/meetup（詳頁），/events→原生卡（直接導表單）。
較早待辦不變：AI 能力測驗已驗證待 commit；`ai-agent-browsers` 待補 2 張截圖。

## 怎麼驗證這一步成功
`npm install && npm run build` 過（07-05 已在乾淨環境驗證 exit 0）、
`dist/llms.txt`、`dist/articles/<slug>.md` 存在、文章頁概念圖正常顯示。

## 卡點 / 待你決定
- 本次改動的 commit 授權（見上）。
- lab 三筆 REPLACE 條目的實際連結（只有你有），見 launchdock-lab/STATUS.md。
- feedback-monitor.sh 需要 `.env`（SUPABASE_URL + SERVICE_KEY）——回饋 loop 停擺的唯一原因。
- ✅ Supabase 安全加固（migration 006）已於 07-05 套到 production 並 commit：4 個 SECURITY DEFINER
  view 轉 security_invoker、`handle_new_user`/`rls_auto_enable` 收回 anon EXECUTE、7 函式釘 search_path、
  3 唯讀函式轉 SECURITY INVOKER。ERROR 級 lint 全清。**唯一剩手動**：Dashboard → Authentication 開啟
  Leaked Password Protection（HaveIBeenPwned）。`increment_helpful` 刻意保留 DEFINER（給 anon 加計數器）。
- ⚠️ cpc_* 是別專案暫寄同一 Supabase：已 revoke anon/authenticated（new-cpc repo 001 補版控）。
  根本解是搬進獨立 schema / 獨立 project——只要還共用 anon key 風險就掛著（尚未動）。

## 進度脈絡（新的在上）
- 2026-07-19 導流量測（來源端追蹤，不依賴子站分析）：查出 lab/masters 都無分析工具→改在主站量。① migration `009_create_outbound_clicks`（新增 outbound_clicks 表，anon-insert RLS，同 004 pattern，**已套 production** lxudxtpfenotkpgmhomq）；② `OutboundTracker.astro`（BaseLayout 全站，一個委派 click listener 記 {target,placement,fingerprint,referrer,path} 進 Supabase，靠 isSupabaseConfigured 閘門，本機無 env 會被 tree-shake 成 no-op＝正常）；③ 8 個入口連結掛 `data-track-outbound`/`data-placement`（home-card/header/header-mobile/footer）；④ `/admin/traffic` 導流儀表板（TrafficDashboard.tsx，總點擊/→Lab/→Masters/近7天＋各位置成效表＋最有效徽章）。**已用 5 筆 seed row 對 production 實測儀表板正確、再刪除**。全部 push main。
- 2026-07-19 生態系導流閉環（含常駐入口）：① 首頁 `index.astro` 加「學完，拿去用」入口區塊（Lab／Masters 兩張卡）；② Header 加「🧰 工具」hover 下拉（純 CSS 無 JS）＋ mobile menu 內嵌連結；③ Footer 加 實驗室／大師團 連結；i18n 補 `nav.tools*` 中英 key；順手把 desktop nav 收成 gap-4＋whitespace-nowrap 讓 7 個項目在筆電單行不折。全部 build 綠 + 瀏覽器實測（文章頁確認全站生效）+ push main。同日兩子站也各加「← 回藍鴨主站」連結（masters-hub、launchdock-lab，已 push）。→ 主站↔子站雙向流量閉環完成。可選再加：卡片/連結掛 UTM 參數以量測導流。
- 2026-07-18 SEO 未索引修正（commit 9e3296b，已上 production 實測）：根因＝全站內部連結/hreflang/nav 無斜線→Cloudflare 308→Google 判「重新導向」(85)；文章頁無 canonical→重複(12)。修：astro.config trailingSlash:'always'、BaseLayout 自我 canonical+hreflang 斜線、remark 概念外掛/registry/102 篇內文/Header/各元件連結全補斜線。dist 無斜線連結=0、sitemap 143 全斜線。後續：Joseph 到 SC 按「驗證修正」+要求索引。完整紀錄與 checklist：docs/seo-indexing-fix.md。
- 2026-07-10 LINE 會員 Phase 1a（不需 channel 的部分，已 build 綠 + 瀏覽器實測）：① 新增 `src/components/ShareToLine.astro`——文章一鍵分享到 LINE，用官方 LINE it! share endpoint（純靜態 `<a>`，零 API/零配額/零 channel），塞進 `ArticleLayout.astro` → 中英 47 篇（含未來新增）自動全有、未動任何一篇文章；i18n 加 `article.share.line`/`article.share.hint`。② migration 008 `member_profiles.email` 改可空 + 重寫 `handle_new_user()` 容忍 LINE 無 email 用戶（保留 006 加固），對 Google 用戶零影響——**檔案已寫、尚未套 production**。設計討論（三塊：LINE 登入 / 分享 / 詢問→自動回覆避開 200 push 上限）與分階段見 BACKLOG「藍鴨導入 LINE 會員系統」。
- 2026-07-10 新增商模 roadmap `docs/ROADMAP.md`：「vibe coding 課 × 限時能力包」試營運實驗（月底）。關鍵洞察＝`memory-mcp` 已是 remote read-only MCP，限時能力包架構已存在、只差限時 token；demo 任務源自 `launchdock-lab`、能力包內容源自 `589411/memory`。三個待驗數字：付費轉換/續訂率/任務完成率。細節待辦已進 BACKLOG 規劃區。（純規劃文件，無程式改動）
- 2026-07-10 藍鴨小聚上站露出 + 原生 events 加外部報名能力（已上 production）：發現 `/meetup` 是孤兒頁（首頁/活動頁都無入口，訪客只有拿到網址才點得到）。
  階段一（靜態，commit bf33019）：首頁 hero banner + /events 手動精選卡（中英）→ /meetup。
  階段二（commit b83f905 + 714cbac）：migration 007 加 `events.external_url`；EventCard 有值→報名導外部表單+隱藏報名人數，無值→維持原生 Google 登入報名；AdminEvents 加欄位；production 建 7/29 場（external_url=表單、published）；驗證 /events 即將舉辦(1)+前往報名導表單後，移除階段一手動卡（原生取代）。hero banner 保留。
- 2026-07-10 新碎碎念/橋接文 `dont-fomo-ai-tools`（中英）：接測驗「工具力」缺口的推薦文（已進 quiz.ts levels[3] 首位）。
  論點＝「AI 自動調用工具正變成跨廠牌內建基本盤，所以別 FOMO、該練判斷不是追型號」，綁 Joseph 昨天課堂預言 + 2026-07-09 OpenAI 更新當證據。
  查證：GPT-5.6 Sol/Terra/Luna 7/9 上線、ChatGPT+Codex 併桌面 App（含 Free）、ChatGPT Work 跨 App agent（多家點名衝 Claude Cowork）皆已多方證實；max/ultra 檔位、500萬/100萬 統計、Claude Code 匯入、Sites 等未能獨立證實 → 刻意未寫進文。
  附帶產出 LINE 課程群組短文（cowork outputs/line-post-dont-fomo.md，URL 待部署）。**未 build、未 commit、待 gate**。
- 2026-07-10 新踩坑文 `caffeinate-keep-mac-awake`（中英）：Agent 跑很久／掛著接訊息時 Mac 休眠→斷線，用 caffeinate 解。
  contentType: troubleshoot、scene 基礎使用、零 @img（全 CLI 走 code block）。查證：caffeinate -dimsu 五 flag（ss64/Apple）、OpenClaw（Steinberger，前身 Warelay/Moltbot）、Hermes（Nous Research，2026-02）。
  concepts.yaml 新增 caffeinate、registry 已重跑。**未 build（沙箱缺 rollup-linux）、未 commit、待 gate**。
- 2026-07-08 新增活動頁 `src/pages/meetup.astro`（`/meetup`）：藍鴨小聚「鴨聚·Assemble！」7/29 試營運場（系統提示詞主題）。
  用 BaseLayout+Tailwind token+複用 .hero-section，含四階梯路線圖 + 導流三篇文章（Soul/from-prompt-to-skill/新文）。
  build 過、瀏覽器實測渲染正常。**✅ 2026-07-08 FORM_URL 已接上**（forms.gle/K9BUvxV6svWUgYVN9），已 build 驗證 + commit + push，/meetup 可對外分享。
  報名/發信結論：試營運走 Google 表單+固定 Meet link+確認頁回信（省工、免登入）；站上原生 events 有 send-registration-confirmation(Resend) 自動信，留 8 月正式場再接。
  表單細節：launchdockapp 帳號建、系統提示詞主題、4 題（稱呼/AI程度/最想學/最卡關）、收 email（作答者手動輸入）、提交後確認頁附 Meet link（ays-gqvd-zcx，7/29 20:00–22:00）。
  帳號分工：Meet 房間用 tranngoclan51873（有 Gemini/Google One，撐 2hr/100人，純幕後）、對外品牌全走 launchdockapp、個人 589411 不碰。當天需登入 tranngoclan 主持。
  題目定案：單場＝「系統提示詞」；「從小白到指揮官」當整個階梯的 slogan（非單場題目）。
- 2026-07-05（晚）新碎碎念文：`openclaw-hermes-or-claude-max`（中英）——「初學者選 OpenClaw/Hermes？先分清學 vs 幹活」。
  框架：開源拿來學、付費助理拿來幹活（化解站的 OpenClaw 定位張力）。build 過、registry 已更新、Joseph gate 通過已 commit
- 2026-07-05（晚）DB 安全加固 006 上 production（見卡點區）
- 2026-07-05 內容制度正本：docs/EDITORIAL.md + templates/（observation-to-article、pitfall-to-article、concept-svg）；
  文章 schema 加 `modules` 欄位；`npm run handout M0x` 抽組講義；CLAUDE.md 掛薄索引
- 2026-07-05 LLM 接入層：/llms.txt、/llms-full.txt、每篇 /articles/<slug>.md（中英）
- 2026-07-05 補 8 張概念圖 SVG（ai-agent-memory-guide ×4、which-ai-tool-for-you ×4，皆 AI 生成，無機敏資訊）
- 2026-07-05 圖庫瘦身：73 張 >500KB 的 4K retina PNG 縮至寬 1800（94MB→70MB，git 可還原）
- 2026-07-05 清理：docs/ 13 個一次性討論稿歸檔 docs/archive/、修 dev-harness 斷鏈引用、harness prompt 草稿歸檔
- 2026-06-27 「AI 能力測驗」功能已驗證未 commit
- 2026-06-27 「AI 代理瀏覽器」文（截圖待補 2 張）
- 2026-06-19 導入內容 loop（BACKLOG.md + 每週一排程監控）

## 已知坑
- 任何圖片插入後**必須**跑機敏掃描（見 CLAUDE.md 安全規則）。生成的 SVG 概念圖除外（無真實資料）。
- ⚠️ **批次上圖會留「孤兒圖」＝沒被任何文章引用卻已 push public**（2026-07-23 稽核揪出 50 張/21.9MB，含未審的 API key 生 dump）。孤兒＝資安曝險（沒經遮罩審查）＋肥肉。**定期跑 `npm run orphans`**（= `scripts/find-orphan-images.mjs`，掃 src+docs 的 `/images/articles/...` 引用 vs 磁碟差集）；`npm run orphans -- --rm` 印出可複製的 `git rm` 指令（**刻意不自動刪**，孤兒可能是待用素材如錯誤碼 SEO 截圖，人看過再決定）。
- ⚠️ **`redact-screenshots.py --scan` 的綠燈不可信任**（2026-07-23 事故）：它靠 OCR 抓 token 再遮，對 **base64／長亂數 key 系統性漏抓**。`ollama-openclaw-windows/` 兩張圖的 `ollama.com/connect?...key=` 真憑證，scan 回報「0 敏感區、全 clean」卻實際外洩並已 push public。**鐵律**：凡是「登入／connect／API key／PAT／OAuth secret」類截圖，**一律人眼逐張覆核**，別信 scan 綠燈；遮這種 key 用座標黑框（`PIL ImageDraw.rectangle`）不要靠 OCR。文字檔的 key 才能靠 grep（`AIza`/`GOCSPX-`/`sk-ant-`/`sk-or-v1-`/`ghp_`/`github_pat_`/`ollama.com/connect?...key=`）；截圖裡的要用看的。高風險資料夾清單見本次對話。
- sitemap 靠 build 自動產；llms/.md 端點不會進 sitemap（已驗證）。
- React island 互動驗證要用 `npm run preview`，**不要用 `npm run dev`**（React19+Vite dev-only 的
  `jsxDEV is not a function` 問題，preview 用 production React 正常）。
- 概念圖規格（顏色/字體/底卡）正本在 `docs/templates/concept-svg.md`，不要即興發揮。
