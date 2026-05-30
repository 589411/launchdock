-- LaunchDock Q&A Seed Data — Hermes Agent 專題
-- 涵蓋 Hermes vs OpenClaw 比較、適合對象、技術問答
-- 在 Supabase SQL Editor 執行此檔案
-- ============================================================

-- ============================================================
-- hermes-agent（Hermes Agent 快速上手）
-- ============================================================

INSERT INTO qa_questions (id, slug, section_id, section_title, question, fingerprint, status, created_at) VALUES
  ('b0400001-0000-0000-0000-000000000001', 'hermes-agent', '', '', 'Hermes 跟 OpenClaw 有什麼不同？要選哪個？', 'fp_seed_ha01', 'visible', '2026-04-28 09:00:00+00'),
  ('b0400001-0000-0000-0000-000000000002', 'hermes-agent', '', '', 'Hermes 適合什麼樣的人用？', 'fp_seed_ha02', 'visible', '2026-04-28 09:30:00+00'),
  ('b0400001-0000-0000-0000-000000000003', 'hermes-agent', '', '', 'Hermes 的記憶功能跟 OpenClaw 的 Soul / Agent Memory 是同一件事嗎？', 'fp_seed_ha03', 'visible', '2026-04-28 10:00:00+00'),
  ('b0400001-0000-0000-0000-000000000004', 'hermes-agent', '', '', '`ollama launch hermes` 的雲端模型是免費的嗎？', 'fp_seed_ha04', 'visible', '2026-04-28 10:30:00+00'),
  ('b0400001-0000-0000-0000-000000000005', 'hermes-agent', '', '', 'Hermes 的「70+ 內建技能」是什麼意思？跟 OpenClaw 的 Skill 一樣嗎？', 'fp_seed_ha05', 'visible', '2026-04-28 11:00:00+00'),
  ('b0400001-0000-0000-0000-000000000006', 'hermes-agent', '', '', '我已經在用 OpenClaw，還需要裝 Hermes 嗎？可以一起用嗎？', 'fp_seed_ha06', 'visible', '2026-04-28 11:30:00+00'),
  ('b0400001-0000-0000-0000-000000000007', 'hermes-agent', '', '', '我完全沒有技術背景，Hermes 還是 OpenClaw 比較容易入門？', 'fp_seed_ha07', 'visible', '2026-04-28 12:00:00+00'),
  ('b0400001-0000-0000-0000-000000000008', 'hermes-agent', '', '', 'Hermes 支援 WhatsApp 和 Signal，OpenClaw 只有 Telegram？', 'fp_seed_ha08', 'visible', '2026-04-28 12:30:00+00'),
  ('b0400001-0000-0000-0000-000000000009', 'hermes-agent', '', '', 'Hermes 是開源的嗎？可以自己改程式嗎？', 'fp_seed_ha09', 'visible', '2026-04-28 13:00:00+00'),
  ('b0400001-0000-0000-0000-000000000010', 'hermes-agent', '', '', 'Windows 也可以用 Hermes 嗎？', 'fp_seed_ha10', 'visible', '2026-04-28 13:30:00+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO qa_answers (id, question_id, answer, fingerprint, helpful_count, status, created_at) VALUES
  ('c0400001-0000-0000-0000-000000000001', 'b0400001-0000-0000-0000-000000000001',
   '兩者定位相似但取向不同。Hermes 是 Nous Research 做的獨立 AI Agent 專案，強調「一行指令啟動、開箱即用」，內建 70+ 技能、跨對話記憶，靠 Ollama 安裝。OpenClaw 則是高度可自訂的框架，強調你可以自己設計 Skill、定義 Soul 人設、串接 MCP 工具，適合想打造專屬工作流的人。

簡單說：**想快速體驗就選 Hermes；想長期打造自己的 AI 系統就選 OpenClaw。** 兩個都裝也完全沒問題。',
   'fp_seed_ha_a01', 32, 'visible', '2026-04-28 09:20:00+00'),

  ('c0400001-0000-0000-0000-000000000002', 'b0400001-0000-0000-0000-000000000002',
   'Hermes 特別適合：
1. **想快速嘗試 AI Agent 的人** — 一行指令就能跑起來，不需要事先設定 API Key
2. **已經裝了 Ollama 的人** — `ollama launch hermes` 直接接上你現有的環境
3. **想用多個訊息平台的人** — 支援 Telegram、Discord、Slack、WhatsApp、Signal、Email，選擇多
4. **想要 AI 記得對話的人** — 跨 session 記憶是內建的，不用另外設定

如果你在意「我要能自己客製化工作流」，那 OpenClaw 更適合。',
   'fp_seed_ha_a02', 28, 'visible', '2026-04-28 09:45:00+00'),

  ('c0400001-0000-0000-0000-000000000003', 'b0400001-0000-0000-0000-000000000003',
   '概念相似但實作不同。Hermes 的記憶是對話結束後自動把重點摘要存起來，下次啟動時載入，比較接近「日記式記憶」。OpenClaw 的 Agent Memory 功能更細膩，可以主動分類、搜尋、管理記憶，也可以和 Soul 人設結合，讓 AI 隨著互動成長。

如果只是要「AI 記得你上次說了什麼」，Hermes 的記憶就夠用了。',
   'fp_seed_ha_a03', 19, 'visible', '2026-04-28 10:15:00+00'),

  ('c0400001-0000-0000-0000-000000000004', 'b0400001-0000-0000-0000-000000000004',
   '選擇畫面上列出的雲端模型（如 `minimax-m2.7:cloud`、`kimi-k2.5:cloud`）是 Ollama 提供的合作方案，**目前有免費額度**，安裝流程中不需要輸入 API Key。但免費額度的速率限制比自備 API Key 嚴，使用量大的話可能會有排隊等待。

本機模型（`gemma4`、`qwen3.6`）完全免費但需要獨立顯示卡。',
   'fp_seed_ha_a04', 24, 'visible', '2026-04-28 10:45:00+00'),

  ('c0400001-0000-0000-0000-000000000005', 'b0400001-0000-0000-0000-000000000005',
   '不完全一樣。Hermes 的「內建技能」是指它自帶的功能模組，像是網頁搜尋、程式生成、文件摘要等，你說「幫我搜尋 XX」它就知道怎麼做，不需要你寫設定。

OpenClaw 的 Skill 是你自己定義的可重複工作流，比較像是自動化腳本——你決定觸發條件、步驟和輸出格式，適合你個人的重複任務。

Hermes 的技能是「已經做好等你用」，OpenClaw 的 Skill 是「你決定要做什麼」。',
   'fp_seed_ha_a05', 21, 'visible', '2026-04-28 11:15:00+00'),

  ('c0400001-0000-0000-0000-000000000006', 'b0400001-0000-0000-0000-000000000006',
   '不需要二選一，可以一起用。兩個是完全獨立的工具，不會互相干擾。你可以用 OpenClaw 管理日常自動化工作流，同時也用 Hermes 測試不同模型的回應差異，或是在不同訊息平台上用 Hermes 快速聊天。

很多人的做法是：**先用 Hermes 快速體驗 AI Agent 的感覺，了解自己需要什麼之後，再用 OpenClaw 打造更客製化的系統。**',
   'fp_seed_ha_a06', 26, 'visible', '2026-04-28 11:45:00+00'),

  ('c0400001-0000-0000-0000-000000000007', 'b0400001-0000-0000-0000-000000000007',
   '就「第一次跑起來的難度」來說，**Hermes 更容易**。一行 `ollama launch hermes` 就搞定，安裝過程有互動引導，不需要事先準備 API Key（選雲端模型的話）。

OpenClaw 需要多一步：先申請 LLM 的 API Key（可以用免費的 Google AI Studio），再安裝和設定。

兩個都不需要寫程式，照教學走都 OK。如果你想最快感受「AI Agent 是什麼感覺」，先從 Hermes 開始。',
   'fp_seed_ha_a07', 35, 'visible', '2026-04-28 12:15:00+00'),

  ('c0400001-0000-0000-0000-000000000008', 'b0400001-0000-0000-0000-000000000008',
   '對，這是 Hermes 目前比 OpenClaw 更豐富的地方。Hermes 支援 Telegram、Discord、Slack、WhatsApp、Signal、Email，可以在你習慣的 app 裡和 AI 聊。

OpenClaw 官方目前主推 Telegram 整合，其他平台的支援需要靠社群的方案或自己橋接。

如果你平常用 WhatsApp 或 Signal，Hermes 會是更直接的選擇。',
   'fp_seed_ha_a08', 17, 'visible', '2026-04-28 12:45:00+00'),

  ('c0400001-0000-0000-0000-000000000009', 'b0400001-0000-0000-0000-000000000009',
   '是的，Hermes 是 [Nous Research](https://nousresearch.com/) 的開源專案，程式碼在 GitHub 上（[NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)），MIT 授權，可以 fork 和修改。

不過要改核心功能需要有 JavaScript/Node.js 的基礎。一般使用者用預設設定就夠了，不需要動程式碼。',
   'fp_seed_ha_a09', 13, 'visible', '2026-04-28 13:15:00+00'),

  ('c0400001-0000-0000-0000-000000000010', 'b0400001-0000-0000-0000-000000000010',
   '可以，但 Windows 需要透過 WSL2（Windows Subsystem for Linux）來跑 Hermes，因為它是設計給 Linux/macOS 環境的。

詳細步驟看這篇：[Hermes Agent Windows + WSL2 篇](/articles/hermes-agent-windows)，流程是：安裝 WSL2 → 在 WSL 裡裝 Ollama → `ollama launch hermes`。聽起來複雜，其實跟著教學走大約 15-20 分鐘搞定。',
   'fp_seed_ha_a10', 29, 'visible', '2026-04-28 13:45:00+00')
ON CONFLICT (id) DO NOTHING;
