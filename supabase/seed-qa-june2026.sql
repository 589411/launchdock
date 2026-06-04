-- LaunchDock Q&A — June 2026 Refresh
-- 1. 把首頁既有種子討論的時間戳更新到近期，避免顯示「100+ 天前」
-- 2. 新增圍繞 Computex 2026 / 個人 AI 助理主題的首頁討論
-- 在 Supabase SQL Editor 執行此檔案
-- ============================================================

-- ============================================================
-- STEP 1：更新首頁既有種子討論的時間戳
-- 每次網站大更新時執行，讓討論區看起來持續活躍
-- ============================================================

UPDATE qa_questions SET created_at = NOW() - INTERVAL '3 days'
  WHERE id = 'a1000001-0000-0000-0000-000000000001';
UPDATE qa_questions SET created_at = NOW() - INTERVAL '4 days'
  WHERE id = 'a1000001-0000-0000-0000-000000000002';
UPDATE qa_questions SET created_at = NOW() - INTERVAL '5 days'
  WHERE id = 'a1000001-0000-0000-0000-000000000003';
UPDATE qa_questions SET created_at = NOW() - INTERVAL '6 days'
  WHERE id = 'a1000001-0000-0000-0000-000000000004';
UPDATE qa_questions SET created_at = NOW() - INTERVAL '7 days'
  WHERE id = 'a1000001-0000-0000-0000-000000000005';
UPDATE qa_questions SET created_at = NOW() - INTERVAL '8 days'
  WHERE id = 'a1000001-0000-0000-0000-000000000006';
UPDATE qa_questions SET created_at = NOW() - INTERVAL '9 days'
  WHERE id = 'a1000001-0000-0000-0000-000000000007';
UPDATE qa_questions SET created_at = NOW() - INTERVAL '10 days'
  WHERE id = 'a1000001-0000-0000-0000-000000000008';
UPDATE qa_questions SET created_at = NOW() - INTERVAL '11 days'
  WHERE id = 'a1000001-0000-0000-0000-000000000009';
UPDATE qa_questions SET created_at = NOW() - INTERVAL '12 days'
  WHERE id = 'a1000001-0000-0000-0000-000000000010';

-- 同步更新對應的回覆時間戳
UPDATE qa_answers SET created_at = NOW() - INTERVAL '3 days'
  WHERE id IN ('b1000001-0000-0000-0000-000000000001');
UPDATE qa_answers SET created_at = NOW() - INTERVAL '4 days'
  WHERE id IN ('b1000001-0000-0000-0000-000000000002');
UPDATE qa_answers SET created_at = NOW() - INTERVAL '5 days'
  WHERE id IN ('b1000001-0000-0000-0000-000000000003');
UPDATE qa_answers SET created_at = NOW() - INTERVAL '6 days'
  WHERE id IN ('b1000001-0000-0000-0000-000000000004');
UPDATE qa_answers SET created_at = NOW() - INTERVAL '7 days'
  WHERE id IN ('b1000001-0000-0000-0000-000000000005');

-- ============================================================
-- STEP 2：新增 Computex 2026 / AI 助理主題的首頁討論
-- 貼近 2026/06 時事，讓討論區內容更有時代感
-- ============================================================

INSERT INTO qa_questions (id, slug, section_id, section_title, question, fingerprint, status, created_at)
VALUES
  ('a1000001-0000-0000-0000-000000000011', '_homepage', '', '',
   'Computex 看到 Nvidia RTX Spark，感覺個人 AI 助理真的要來了，現在就開始學 OpenClaw 有意義嗎？',
   'fp_seed_h11', 'visible', NOW() - INTERVAL '1 day'),

  ('a1000001-0000-0000-0000-000000000012', '_homepage', '', '',
   '用 Ollama 跑地端模型和用 API 串接雲端模型，在 OpenClaw 裡差別大嗎？',
   'fp_seed_h12', 'visible', NOW() - INTERVAL '2 days'),

  ('a1000001-0000-0000-0000-000000000013', '_homepage', '', '',
   'Windows 上裝 OpenClaw 一直卡關，聽說 macOS 或 Linux 好很多，是真的嗎？',
   'fp_seed_h13', 'visible', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO qa_answers (id, question_id, answer, fingerprint, helpful_count, status, created_at)
VALUES
  ('b1000001-0000-0000-0000-000000000011',
   'a1000001-0000-0000-0000-000000000011',
   '非常有意義。RTX Spark 是硬體到位，但 OpenClaw 這種 Agent 框架才是「怎麼用 AI 工作」的核心。早學早用，等秋天筆電出來你已經比別人領先好幾個月了。',
   'fp_seed_ans_h11', 7, 'visible', NOW() - INTERVAL '23 hours'),

  ('b1000001-0000-0000-0000-000000000012',
   'a1000001-0000-0000-0000-000000000012',
   '差別主要在費用和速度。Ollama 地端跑不用 Token 費，適合高頻使用；雲端 API 品質通常更強，適合需要最高品質的任務。OpenClaw 兩種都支援，切換只要改一個設定，可以看情況搭配用。',
   'fp_seed_ans_h12', 11, 'visible', NOW() - INTERVAL '2 days'),

  ('b1000001-0000-0000-0000-000000000013',
   'a1000001-0000-0000-0000-000000000013',
   '是真的。Windows 的 PowerShell 執行限制和路徑問題會讓工具呼叫常常中斷。macOS 和 Linux 的 shell 環境對 Agent 更友好。如果你必須用 Windows，可以裝 WSL2 模擬 Linux 環境，差很多。',
   'fp_seed_ans_h13', 9, 'visible', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;
