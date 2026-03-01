-- LaunchDock Q&A Seed Data — 第二波
-- 增加更多文章和首頁的問答，讓社群更活絡
-- 在 Supabase SQL Editor 執行此檔案
-- ============================================================

-- ============================================================
-- 首頁討論區 (_homepage) — 追加
-- ============================================================

INSERT INTO qa_questions (id, slug, section_id, section_title, question, fingerprint, status, created_at) VALUES
  ('a1000001-0000-0000-0000-000000000006', '_homepage', '', '', '請問 LaunchDock 的教學會持續更新嗎？多久更新一次？', 'fp_seed_h06', 'visible', '2026-02-25 08:30:00+00'),
  ('a1000001-0000-0000-0000-000000000007', '_homepage', '', '', '我是老師，想帶學生一起操作，有班級使用方案嗎？', 'fp_seed_h07', 'visible', '2026-02-25 14:15:00+00'),
  ('a1000001-0000-0000-0000-000000000008', '_homepage', '', '', '有沒有推薦的學習順序？我怕跳著看會漏掉什麼', 'fp_seed_h08', 'visible', '2026-02-26 09:40:00+00'),
  ('a1000001-0000-0000-0000-000000000009', '_homepage', '', '', '用手機可以操作 OpenClaw 嗎？', 'fp_seed_h09', 'visible', '2026-02-26 16:00:00+00'),
  ('a1000001-0000-0000-0000-000000000010', '_homepage', '', '', '有考慮做 YouTube 影片教學嗎？我比較習慣看影片', 'fp_seed_h10', 'visible', '2026-02-27 11:20:00+00');

INSERT INTO qa_answers (id, question_id, answer, fingerprint, helpful_count, status, created_at) VALUES
  ('b1000001-0000-0000-0000-000000000006', 'a1000001-0000-0000-0000-000000000006', '會持續更新，大約每週 1-2 篇新文章。如果 OpenClaw 有重大版本更新，也會第一時間修正已有的教學。', 'fp_seed_ans06', 8, 'visible', '2026-02-25 09:10:00+00'),
  ('b1000001-0000-0000-0000-000000000007', 'a1000001-0000-0000-0000-000000000007', '目前沒有特別的班級方案，但文章完全免費，直接把連結分享給學生就好。如果人數多的話，雲端部署方案可能比較好管理，不用每台電腦都裝。', 'fp_seed_ans07', 11, 'visible', '2026-02-25 14:55:00+00'),
  ('b1000001-0000-0000-0000-000000000008', 'a1000001-0000-0000-0000-000000000008', '建議走首頁的「新手養蝦路線」，那個是有設計過的順序：先認識 → 選 AI → 申請 Key → 安裝 → 第一次啟動 → 第一個 Skill。照順序走不會漏。', 'fp_seed_ans08', 19, 'visible', '2026-02-26 10:15:00+00'),
  ('b1000001-0000-0000-0000-000000000009', 'a1000001-0000-0000-0000-000000000009', '安裝和設定建議用電腦。但裝好之後，日常使用可以透過 Telegram app 跟你的 AI 對話，手機完全 OK。', 'fp_seed_ans09', 14, 'visible', '2026-02-26 16:35:00+00'),
  ('b1000001-0000-0000-0000-000000000010', 'a1000001-0000-0000-0000-000000000010', '有在規劃！不過文字教學的好處是你可以照自己的速度來，卡住的時候可以回頭看。影片太快跟不上反而更挫折。目前先把文字版做好做滿 😄', 'fp_seed_ans10', 16, 'visible', '2026-02-27 11:55:00+00');

-- ============================================================
-- deploy-openclaw-cloud（雲端部署）
-- ============================================================

INSERT INTO qa_questions (id, slug, section_id, section_title, question, fingerprint, status, created_at) VALUES
  ('ac000001-0000-0000-0000-000000000001', 'deploy-openclaw-cloud', '', '', 'Zeabur 免費方案會有流量限制嗎？', 'fp_seed_dc01', 'visible', '2026-02-25 10:30:00+00'),
  ('ac000001-0000-0000-0000-000000000002', 'deploy-openclaw-cloud', '', '', '部署完之後要怎麼更新版本？', 'fp_seed_dc02', 'visible', '2026-02-25 15:45:00+00'),
  ('ac000001-0000-0000-0000-000000000003', 'deploy-openclaw-cloud', '', '', '可以用 Railway 或 Render 嗎？Zeabur 在中國好像連不上', 'fp_seed_dc03', 'visible', '2026-02-26 13:10:00+00');

INSERT INTO qa_answers (id, question_id, answer, fingerprint, helpful_count, status, created_at) VALUES
  ('bc000001-0000-0000-0000-000000000001', 'ac000001-0000-0000-0000-000000000001', 'Zeabur 免費方案每月有 $5 USD 額度，跑 OpenClaw 的話大概能撐一個月。超過的話會暫停服務，不會額外收費。', 'fp_seed_dc_a01', 12, 'visible', '2026-02-25 11:05:00+00'),
  ('bc000001-0000-0000-0000-000000000002', 'ac000001-0000-0000-0000-000000000002', '在 Zeabur 後台找到你的專案，按 Redeploy 就會拉最新的 image。或者設好 webhook，每次 GitHub push 自動部署。', 'fp_seed_dc_a02', 9, 'visible', '2026-02-25 16:20:00+00'),
  ('bc000001-0000-0000-0000-000000000003', 'ac000001-0000-0000-0000-000000000003', 'Railway、Render、Fly.io 理論上都可以，只是教學目前只寫了 Zeabur。基本概念一樣：拉 Docker image → 設環境變數 → 部署。有空我會補其他平台的教學。', 'fp_seed_dc_a03', 15, 'visible', '2026-02-26 13:45:00+00');

-- ============================================================
-- google-api-key-guide（Google API Key）
-- ============================================================

INSERT INTO qa_questions (id, slug, section_id, section_title, question, fingerprint, status, created_at) VALUES
  ('ad000001-0000-0000-0000-000000000001', 'google-api-key-guide', '', '', 'Google AI Studio 的 Key 跟 GCP 的 Key 是一樣的嗎？', 'fp_seed_gk01', 'visible', '2026-02-25 12:00:00+00'),
  ('ad000001-0000-0000-0000-000000000002', 'google-api-key-guide', '', '', '免費額度用完了會自動扣錢嗎？', 'fp_seed_gk02', 'visible', '2026-02-26 08:20:00+00'),
  ('ad000001-0000-0000-0000-000000000003', 'google-api-key-guide', '', '', '台灣的 Google 帳號可以用嗎？有區域限制嗎？', 'fp_seed_gk03', 'visible', '2026-02-27 10:15:00+00');

INSERT INTO qa_answers (id, question_id, answer, fingerprint, helpful_count, status, created_at) VALUES
  ('bd000001-0000-0000-0000-000000000001', 'ad000001-0000-0000-0000-000000000001', '不一樣。AI Studio 的 Key 是專門給 Gemini API 用的，比較簡單。GCP 的 Key 功能更多但設定比較複雜。新手用 AI Studio 就好。', 'fp_seed_gk_a01', 17, 'visible', '2026-02-25 12:35:00+00'),
  ('bd000001-0000-0000-0000-000000000002', 'ad000001-0000-0000-0000-000000000002', 'AI Studio 的免費 tier 用完就是「暫停服務」，不會扣錢。除非你主動去開 billing 升級。所以放心用。', 'fp_seed_gk_a02', 22, 'visible', '2026-02-26 08:55:00+00'),
  ('bd000001-0000-0000-0000-000000000003', 'ad000001-0000-0000-0000-000000000003', '台灣完全可以用，目前沒有區域限制。只要有 Google 帳號就能申請。', 'fp_seed_gk_a03', 10, 'visible', '2026-02-27 10:50:00+00');

-- ============================================================
-- token-economics（Token 經濟學）
-- ============================================================

INSERT INTO qa_questions (id, slug, section_id, section_title, question, fingerprint, status, created_at) VALUES
  ('ae000001-0000-0000-0000-000000000001', 'token-economics', '', '', '一個中文字算幾個 token？', 'fp_seed_te01', 'visible', '2026-02-26 11:30:00+00'),
  ('ae000001-0000-0000-0000-000000000002', 'token-economics', '', '', '有什麼工具可以事先算 token 數嗎？', 'fp_seed_te02', 'visible', '2026-02-26 14:50:00+00'),
  ('ae000001-0000-0000-0000-000000000003', 'token-economics', '', '', 'Agent 跑一次任務大概花多少 token？', 'fp_seed_te03', 'visible', '2026-02-27 09:00:00+00');

INSERT INTO qa_answers (id, question_id, answer, fingerprint, helpful_count, status, created_at) VALUES
  ('be000001-0000-0000-0000-000000000001', 'ae000001-0000-0000-0000-000000000001', '中文字大概 1-2 個 token，看用哪個模型。GPT-4 系列大約 1.5 token/字，Gemini 差不多。可以用 OpenAI 的 Tokenizer（platform.openai.com/tokenizer）實際測。', 'fp_seed_te_a01', 20, 'visible', '2026-02-26 12:05:00+00'),
  ('be000001-0000-0000-0000-000000000002', 'ae000001-0000-0000-0000-000000000002', 'OpenAI Tokenizer 是最準的（platform.openai.com/tokenizer），或裝 tiktoken 這個 Python 套件來算。Gemini 的話可以在 AI Studio 裡直接看 token 計數。', 'fp_seed_te_a02', 13, 'visible', '2026-02-26 15:25:00+00'),
  ('be000001-0000-0000-0000-000000000003', 'ae000001-0000-0000-0000-000000000003', '差很多，看任務複雜度。簡單的一問一答大概 500-1000 token，Agent 自己推理+呼叫工具的話可能 3000-10000。加了 --debug 可以看每次的 token 消耗。', 'fp_seed_te_a03', 18, 'visible', '2026-02-27 09:35:00+00');

-- ============================================================
-- openclaw-soul（Soul 人設）
-- ============================================================

INSERT INTO qa_questions (id, slug, section_id, section_title, question, fingerprint, status, created_at) VALUES
  ('af000001-0000-0000-0000-000000000001', 'openclaw-soul', '', '', 'Soul 跟 System Prompt 有什麼不一樣？', 'fp_seed_so01', 'visible', '2026-02-26 15:55:00+00'),
  ('af000001-0000-0000-0000-000000000002', 'openclaw-soul', '', '', '可以讓 AI 用台語回話嗎？', 'fp_seed_so02', 'visible', '2026-02-27 13:30:00+00');

INSERT INTO qa_answers (id, question_id, answer, fingerprint, helpful_count, status, created_at) VALUES
  ('bf000001-0000-0000-0000-000000000001', 'af000001-0000-0000-0000-000000000001', 'Soul 就是 OpenClaw 對 System Prompt 的封裝。差別在於 Soul 可以用 YAML 結構化管理，可以版本控制、繼承、覆寫，比單一字串靈活很多。', 'fp_seed_so_a01', 14, 'visible', '2026-02-26 16:30:00+00'),
  ('bf000001-0000-0000-0000-000000000002', 'af000001-0000-0000-0000-000000000002', '可以啊 😂 在 Soul 裡寫 language 設 zh-TW 然後 personality 加上「用台語語感回話」就好。不過模型台語能力不算強，建議搭配幾個範例讓它學。', 'fp_seed_so_a02', 21, 'visible', '2026-02-27 14:05:00+00');

-- ============================================================
-- mcp-protocol（MCP 協定）
-- ============================================================

INSERT INTO qa_questions (id, slug, section_id, section_title, question, fingerprint, status, created_at) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'mcp-protocol', '', '', 'MCP 跟普通 API 呼叫有什麼不一樣？', 'fp_seed_mc01', 'visible', '2026-02-26 10:20:00+00'),
  ('b0000001-0000-0000-0000-000000000002', 'mcp-protocol', '', '', 'OpenClaw 支援哪些 MCP server？', 'fp_seed_mc02', 'visible', '2026-02-27 15:40:00+00');

INSERT INTO qa_answers (id, question_id, answer, fingerprint, helpful_count, status, created_at) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'MCP 定義了「工具描述」的標準格式，AI 可以自己讀懂有哪些工具可以用、參數是什麼。普通 API 還要人工寫串接程式碼，MCP 讓 AI 自動學會用工具。', 'fp_seed_mc_a01', 16, 'visible', '2026-02-26 10:55:00+00'),
  ('c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000002', '社群常用的有 filesystem、web-search、github、notion、google-drive。完整列表可以看 OpenClaw 的 GitHub wiki，或到 MCP 的 awesome-list 找。', 'fp_seed_mc_a02', 12, 'visible', '2026-02-27 16:15:00+00');

-- ============================================================
-- prompt-engineering（Prompt 工程）
-- ============================================================

INSERT INTO qa_questions (id, slug, section_id, section_title, question, fingerprint, status, created_at) VALUES
  ('b0100001-0000-0000-0000-000000000001', 'prompt-engineering', '', '', '在 OpenClaw 裡面 prompt 要寫在哪裡？', 'fp_seed_pe01', 'visible', '2026-02-27 08:10:00+00'),
  ('b0100001-0000-0000-0000-000000000002', 'prompt-engineering', '', '', 'Few-shot 的範例要給幾個才夠？', 'fp_seed_pe02', 'visible', '2026-02-27 14:30:00+00');

INSERT INTO qa_answers (id, question_id, answer, fingerprint, helpful_count, status, created_at) VALUES
  ('c0100001-0000-0000-0000-000000000001', 'b0100001-0000-0000-0000-000000000001', '主要有兩個地方：Soul 檔（定義 AI 的基礎個性和行為準則）和 Skill 檔（針對特定任務的 prompt）。平常聊天的話直接用 Telegram 打字就好，那也算 prompt。', 'fp_seed_pe_a01', 11, 'visible', '2026-02-27 08:45:00+00'),
  ('c0100001-0000-0000-0000-000000000002', 'b0100001-0000-0000-0000-000000000002', '通常 2-3 個就夠了，重點是多樣性。不要 3 個範例都差不多，給不同情境的範例效果最好。如果任務很簡單，zero-shot（不給範例）也常常就行了。', 'fp_seed_pe_a02', 15, 'visible', '2026-02-27 15:05:00+00');

-- ============================================================
-- openclaw-model-config（模型設定）
-- ============================================================

INSERT INTO qa_questions (id, slug, section_id, section_title, question, fingerprint, status, created_at) VALUES
  ('b0200001-0000-0000-0000-000000000001', 'openclaw-model-config', '', '', 'temperature 調高跟調低差在哪？', 'fp_seed_mc01b', 'visible', '2026-02-26 17:20:00+00'),
  ('b0200001-0000-0000-0000-000000000002', 'openclaw-model-config', '', '', '可以同時設多個模型，不同任務用不同模型嗎？', 'fp_seed_mc02b', 'visible', '2026-02-27 12:00:00+00');

INSERT INTO qa_answers (id, question_id, answer, fingerprint, helpful_count, status, created_at) VALUES
  ('c0200001-0000-0000-0000-000000000001', 'b0200001-0000-0000-0000-000000000001', '簡單說：低 temperature（0-0.3）→ 回答穩定、可預測，適合寫程式或整理資料。高 temperature（0.7-1.0）→ 比較有創意、回答多樣，適合腦力激盪或寫文案。', 'fp_seed_mc_b01', 23, 'visible', '2026-02-26 17:55:00+00'),
  ('c0200001-0000-0000-0000-000000000002', 'b0200001-0000-0000-0000-000000000002', '可以！在 config.yaml 裡設定多個 model profile，然後在不同 Skill 裡指定用哪個 profile。例如：寫信用 GPT-4o，日常雜務用 Gemini Flash 省錢。', 'fp_seed_mc_b02', 17, 'visible', '2026-02-27 12:35:00+00');

-- ============================================================
-- telegram-integration（Telegram 整合）
-- ============================================================

INSERT INTO qa_questions (id, slug, section_id, section_title, question, fingerprint, status, created_at) VALUES
  ('b0300001-0000-0000-0000-000000000001', 'telegram-integration', '', '', '群組裡可以加 OpenClaw bot 嗎？還是只能私聊？', 'fp_seed_tg01', 'visible', '2026-02-27 09:50:00+00'),
  ('b0300001-0000-0000-0000-000000000002', 'telegram-integration', '', '', '可以傳圖片給 bot 嗎？它能看懂圖裡的東西嗎？', 'fp_seed_tg02', 'visible', '2026-02-27 16:40:00+00');

INSERT INTO qa_answers (id, question_id, answer, fingerprint, helpful_count, status, created_at) VALUES
  ('c0300001-0000-0000-0000-000000000001', 'b0300001-0000-0000-0000-000000000001', '可以加到群組！不過建議用 @mention 觸發（@你的bot名 幫我XXX），不然它會回每一則訊息，群組裡會很吵 😅', 'fp_seed_tg_a01', 19, 'visible', '2026-02-27 10:25:00+00'),
  ('c0300001-0000-0000-0000-000000000002', 'b0300001-0000-0000-0000-000000000002', '如果你用的 LLM 支援 vision（像 GPT-4o、Gemini Pro Vision），就可以直接傳圖片，AI 看得懂。拍螢幕截圖問「這個錯誤怎麼修」超方便。', 'fp_seed_tg_a02', 24, 'visible', '2026-02-27 17:15:00+00');
