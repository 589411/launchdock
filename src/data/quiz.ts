// ============================================================
// AI 能力等級自評測驗 — 唯一策展點（題庫 + 推薦對應 + 計分）
// ------------------------------------------------------------
// 設計：行為自評為主（無對錯），結果「缺口導向」。
//   四個能力維度由低到高代表一條能力階梯：
//     chat(L1) → documents(L2) → tools(L3) → automation(L4)
//   每題選項帶分（0..N，越高代表越進階的行為）。
//   維度分數 = 取得分 / 滿分；過門檻即「解鎖」。
//   缺口 = 由低到高第一個未解鎖的維度（使用者最該補的）。
//
// 維護方式：直接改本檔即可，不需動文章 .md。
//   - 改題目 / 選項 → questions
//   - 改各級推薦文章 → levels[n].recommended（slug，中英共用）
//   - 改門檻 → config.unlockThreshold
// ============================================================

export interface LocalizedText {
  zh: string;
  en: string;
}

export type DimensionKey = 'chat' | 'documents' | 'tools' | 'automation';

export interface Dimension {
  key: DimensionKey;
  /** 此維度解鎖後對應的階級 */
  level: number;
  name: LocalizedText;
  /** 結果頁「缺口橫幅」用：你還沒開始 ___ */
  gapHeadline: LocalizedText;
  gapDetail: LocalizedText;
}

export interface QuizOption {
  text: LocalizedText;
  score: number;
}

export interface QuizQuestion {
  id: string;
  dimension: DimensionKey;
  text: LocalizedText;
  options: QuizOption[];
}

export interface LevelInfo {
  title: LocalizedText;
  blurb: LocalizedText;
  /** 推薦文章 slug（中英共用同 slug） */
  recommended: string[];
}

export const config = {
  /** 維度過此比例（0..1）即視為已解鎖 */
  unlockThreshold: 0.6,
};

// ── 四維 = 一條能力階梯（由低到高，順序即 gating 順序） ──────────
export const dimensions: Dimension[] = [
  {
    key: 'chat',
    level: 1,
    name: { zh: '對話力', en: 'Conversation' },
    gapHeadline: { zh: '先把「跟 AI 對話」練熟', en: 'Get comfortable talking to AI first' },
    gapDetail: {
      zh: '你還在很基礎地用聊天。先學會把問題講清楚、選對模型，AI 的回答品質會差很多。',
      en: 'You are still using chat at a basic level. Learn to frame questions well and pick the right model — answer quality changes dramatically.',
    },
  },
  {
    key: 'documents',
    level: 2,
    name: { zh: '文件力', en: 'Documents' },
    gapHeadline: { zh: '下一步：讓 AI 幫你讀寫文件、整理知識', en: 'Next: let AI read/write docs and organize knowledge' },
    gapDetail: {
      zh: '你會聊天了，但還沒讓 AI 處理你的文件與知識。這一步能立刻幫你省下大量整理時間。',
      en: "You can chat, but haven't put AI to work on your documents and knowledge yet. This step saves you real time immediately.",
    },
  },
  {
    key: 'tools',
    level: 3,
    name: { zh: '工具力', en: 'Tools' },
    gapHeadline: { zh: '下一步：讓 AI 真的「動手」用工具', en: 'Next: let AI actually use tools' },
    gapDetail: {
      zh: '你還沒讓 AI 跨出聊天框——申請 API Key、接連接器、用 MCP 發 email/查資料，AI 才開始真正幫你做事。',
      en: 'You have not let AI step outside the chat box yet — API keys, connectors, MCP to send email or fetch data. This is where AI starts doing real work.',
    },
  },
  {
    key: 'automation',
    level: 4,
    name: { zh: '自動化力', en: 'Automation' },
    gapHeadline: { zh: '下一步：讓任務自動、定時跑起來', en: 'Next: make tasks run automatically on a schedule' },
    gapDetail: {
      zh: '你已經會用工具，但還是手動觸發。把重複工作包成 Agent / Skill / 排程，AI 就能自己把事做完。',
      en: 'You can use tools but still trigger them by hand. Wrap repetitive work into agents / skills / schedules and AI finishes tasks on its own.',
    },
  },
];

// ── 題庫（每維 3 題，選項分數 0..3） ───────────────────────────
export const questions: QuizQuestion[] = [
  // ---- chat ----
  {
    id: 'chat_usage',
    dimension: 'chat',
    text: { zh: '你最常怎麼用 AI 聊天工具？', en: 'How do you most often use AI chat tools?' },
    options: [
      { score: 0, text: { zh: '幾乎沒用過，只試過一兩次', en: 'Barely used it, tried once or twice' } },
      { score: 1, text: { zh: '偶爾問問題、查點資料', en: 'Occasionally ask questions or look things up' } },
      { score: 2, text: { zh: '天天用，會多輪對話把問題講清楚', en: 'Daily, with multi-turn chats to clarify' } },
      { score: 3, text: { zh: '會刻意調整問法（給範例、設角色）讓回答更準', en: 'Deliberately craft prompts (examples, roles) for better answers' } },
    ],
  },
  {
    id: 'chat_recover',
    dimension: 'chat',
    text: { zh: '當 AI 回答得不夠好時，你通常會？', en: "When AI's answer isn't good enough, you usually?" },
    options: [
      { score: 0, text: { zh: '放棄或改回自己 Google', en: 'Give up or go back to Google' } },
      { score: 1, text: { zh: '換句話再問一次', en: 'Rephrase and ask again' } },
      { score: 2, text: { zh: '補上背景、具體要求再問', en: 'Add context and specific requirements' } },
      { score: 3, text: { zh: '給範例/格式/限制，並請它一步步想', en: 'Give examples/format/constraints and ask it to reason step by step' } },
    ],
  },
  {
    id: 'chat_models',
    dimension: 'chat',
    text: { zh: '對不同 AI 模型（GPT、Claude、Gemini…）的差異，你？', en: 'About differences between AI models (GPT, Claude, Gemini…), you?' },
    options: [
      { score: 0, text: { zh: '不知道差在哪', en: 'No idea how they differ' } },
      { score: 1, text: { zh: '聽過名字但沒比較過', en: 'Heard the names but never compared' } },
      { score: 2, text: { zh: '大概知道各自強項', en: 'Roughly know their strengths' } },
      { score: 3, text: { zh: '會依任務選不同模型', en: 'Pick different models per task' } },
    ],
  },
  // ---- documents ----
  {
    id: 'doc_process',
    dimension: 'documents',
    text: { zh: '你會用 AI 處理文件（讀長文、摘要、改寫、寫草稿）嗎？', en: 'Do you use AI on documents (long reads, summaries, rewrites, drafts)?' },
    options: [
      { score: 0, text: { zh: '沒這樣用過', en: 'Never' } },
      { score: 1, text: { zh: '偶爾貼一段請它摘要', en: 'Occasionally paste a paragraph for a summary' } },
      { score: 2, text: { zh: '常用來改寫、草擬文件', en: 'Regularly rewrite/draft documents' } },
      { score: 3, text: { zh: '會丟整份/多份資料讓它整理產出', en: 'Feed whole/multiple files for it to synthesize' } },
    ],
  },
  {
    id: 'doc_pkm',
    dimension: 'documents',
    text: { zh: '你有把 AI 接進筆記 / 知識管理（Notion、Obsidian…）嗎？', en: 'Have you connected AI to your notes / PKM (Notion, Obsidian…)?' },
    options: [
      { score: 0, text: { zh: '沒有', en: 'No' } },
      { score: 1, text: { zh: '想過但還沒做', en: 'Thought about it, not yet' } },
      { score: 2, text: { zh: '有，手動複製貼上', en: 'Yes, via manual copy-paste' } },
      { score: 3, text: { zh: '有，且有固定流程整理知識', en: 'Yes, with a routine for organizing knowledge' } },
    ],
  },
  {
    id: 'doc_rag',
    dimension: 'documents',
    text: { zh: '對 RAG（讓 AI 讀你自己的資料庫回答），你？', en: 'About RAG (AI answering from your own data), you?' },
    options: [
      { score: 0, text: { zh: '沒聽過', en: 'Never heard of it' } },
      { score: 1, text: { zh: '聽過但不知怎麼用', en: 'Heard of it but unsure how' } },
      { score: 2, text: { zh: '大概懂概念', en: 'Roughly understand the concept' } },
      { score: 3, text: { zh: '實際做過 / 在用', en: 'Actually built / use it' } },
    ],
  },
  // ---- tools ----
  {
    id: 'tool_apikey',
    dimension: 'tools',
    text: { zh: '你申請過 AI 服務的 API Key 並拿來串接東西嗎？', en: "Have you obtained an AI service API key and used it to connect things?" },
    options: [
      { score: 0, text: { zh: '不知道 API Key 是什麼', en: "Don't know what an API key is" } },
      { score: 1, text: { zh: '知道但沒申請過', en: 'Know of it but never got one' } },
      { score: 2, text: { zh: '申請過、試著呼叫過', en: 'Got one and tried calling it' } },
      { score: 3, text: { zh: '常用 API 串自己的應用', en: 'Regularly wire APIs into my own apps' } },
    ],
  },
  {
    id: 'tool_actions',
    dimension: 'tools',
    text: { zh: '你讓 AI 實際「動手」用工具了嗎（發 email、查日曆、抓網頁…）？', en: 'Have you let AI actually use tools (send email, check calendar, fetch web…)?' },
    options: [
      { score: 0, text: { zh: '沒有，只是聊天', en: 'No, just chatting' } },
      { score: 1, text: { zh: '試過內建的小工具', en: 'Tried built-in mini tools' } },
      { score: 2, text: { zh: '接過一兩個連接器', en: 'Connected one or two integrations' } },
      { score: 3, text: { zh: '日常讓 AI 用多種工具完成任務', en: 'Daily, AI uses many tools to get tasks done' } },
    ],
  },
  {
    id: 'tool_mcp',
    dimension: 'tools',
    text: { zh: '對 MCP（Model Context Protocol）或類似的工具連接機制，你？', en: 'About MCP (Model Context Protocol) or similar tool-connection mechanisms, you?' },
    options: [
      { score: 0, text: { zh: '沒聽過', en: 'Never heard of it' } },
      { score: 1, text: { zh: '聽過但不懂', en: "Heard of it but don't get it" } },
      { score: 2, text: { zh: '懂概念', en: 'Understand the concept' } },
      { score: 3, text: { zh: '實際接過', en: 'Actually wired it up' } },
    ],
  },
  // ---- automation ----
  {
    id: 'auto_schedule',
    dimension: 'automation',
    text: { zh: '你有設定過讓 AI「自動、定時」執行任務（排程 / 觸發）嗎？', en: 'Have you set AI tasks to run automatically on a schedule / trigger?' },
    options: [
      { score: 0, text: { zh: '沒有', en: 'No' } },
      { score: 1, text: { zh: '想做但還沒做', en: 'Want to, not yet' } },
      { score: 2, text: { zh: '做過簡單的排程', en: 'Set up simple schedules' } },
      { score: 3, text: { zh: '有穩定在跑的自動化', en: 'Have automations running reliably' } },
    ],
  },
  {
    id: 'auto_agent',
    dimension: 'automation',
    text: { zh: '你用過 AI Agent（自己規劃步驟、連續執行）或 n8n 等工作流工具嗎？', en: 'Have you used AI agents (self-planning, multi-step) or workflow tools like n8n?' },
    options: [
      { score: 0, text: { zh: '沒有', en: 'No' } },
      { score: 1, text: { zh: '聽過', en: 'Heard of them' } },
      { score: 2, text: { zh: '試搭過簡單流程', en: 'Built a simple flow' } },
      { score: 3, text: { zh: '有實際在用的 Agent / 工作流', en: 'Have agents / workflows in real use' } },
    ],
  },
  {
    id: 'auto_skill',
    dimension: 'automation',
    text: { zh: '你會把重複的工作包成可重用的「技能 / 腳本」讓 AI 自動完成嗎？', en: 'Do you package repetitive work into reusable skills/scripts for AI to run?' },
    options: [
      { score: 0, text: { zh: '不會', en: 'No' } },
      { score: 1, text: { zh: '想過', en: 'Thought about it' } },
      { score: 2, text: { zh: '做過一兩個', en: 'Made one or two' } },
      { score: 3, text: { zh: '有一套自己的自動化技能庫', en: 'Have my own library of automations' } },
    ],
  },
];

// ── 各級定位 + 推薦文章（slug 中英共用，缺口維度 → 對應這一級） ──
export const levels: Record<number, LevelInfo> = {
  1: {
    title: { zh: 'Level 1 — 對話入門', en: 'Level 1 — Conversation Starter' },
    blurb: { zh: '你正在用 AI 聊天起步，先把對話練到位。', en: 'You are getting started with AI chat — master conversation first.' },
    recommended: ['why-openclaw', 'llm-guide', 'prompt-engineering', 'ai-tool-landscape'],
  },
  2: {
    title: { zh: 'Level 2 — 文件協作', en: 'Level 2 — Document Collaborator' },
    blurb: { zh: '你會聊天了，接下來讓 AI 幫你讀寫文件、整理知識。', en: 'You can chat — next, let AI handle your documents and knowledge.' },
    recommended: ['pkm-system', 'rag-explained', 'cot-and-reasoning', 'token-economics'],
  },
  3: {
    title: { zh: 'Level 3 — 工具操作', en: 'Level 3 — Tool Operator' },
    blurb: { zh: '你能用文件了，接下來讓 AI 真的動手用工具、接連接器。', en: 'You work with documents — next, let AI use tools and connectors.' },
    recommended: ['dont-fomo-ai-tools', 'ai-api-key-guide', 'mcp-protocol', 'llm-tool-calling-era', 'telegram-integration'],
  },
  4: {
    title: { zh: 'Level 4 — 自動化', en: 'Level 4 — Automation Builder' },
    blurb: { zh: '你會用工具了，接下來把任務自動化、定時自己跑。', en: 'You use tools — next, automate tasks to run on their own.' },
    recommended: ['openclaw-agent', 'openclaw-skill', 'from-prompt-to-skill', 'multi-agent-swarm', 'what-is-n8n'],
  },
};

/** 四維全解鎖（已達頂）時的推薦：進階 / 最新 */
export const topLevelInfo: LevelInfo = {
  title: { zh: '你已到頂 — 自動化高手', en: "You're at the top — Automation Pro" },
  blurb: { zh: '四項能力都解鎖了！這些進階主題讓你走更遠。', en: 'All four capabilities unlocked! These advanced topics take you further.' },
  recommended: ['deploy-openclaw-cloud', 'multi-agent-swarm', 'hermes-agent', 'ai-agent-browsers'],
};

// ── 計分 ──────────────────────────────────────────────────────
export interface DimensionResult {
  key: DimensionKey;
  level: number;
  name: LocalizedText;
  /** 取得分 */
  score: number;
  /** 滿分 */
  max: number;
  /** 0..1 */
  pct: number;
  unlocked: boolean;
}

export interface QuizResult {
  dimensions: DimensionResult[];
  /** 連續解鎖的最高階（最低 1） */
  primaryLevel: number;
  /** 由低到高第一個未解鎖的維度；全解鎖時為 null */
  gap: DimensionResult | null;
}

/**
 * 計分。
 * @param answers questionId → 選到的選項 index
 */
export function scoreQuiz(answers: Record<string, number>): QuizResult {
  const dimResults: DimensionResult[] = dimensions.map((dim) => {
    const qs = questions.filter((q) => q.dimension === dim.key);
    let score = 0;
    let max = 0;
    for (const q of qs) {
      const maxOpt = Math.max(...q.options.map((o) => o.score));
      max += maxOpt;
      const picked = answers[q.id];
      if (picked != null && q.options[picked]) {
        score += q.options[picked].score;
      }
    }
    const pct = max > 0 ? score / max : 0;
    return {
      key: dim.key,
      level: dim.level,
      name: dim.name,
      score,
      max,
      pct,
      unlocked: pct >= config.unlockThreshold,
    };
  });

  // primaryLevel = 由第一維起連續解鎖的數量（最低 1）
  let consecutive = 0;
  for (const d of dimResults) {
    if (d.unlocked) consecutive++;
    else break;
  }
  const primaryLevel = Math.max(1, consecutive);

  // gap = 由低到高第一個未解鎖
  const gap = dimResults.find((d) => !d.unlocked) ?? null;

  return { dimensions: dimResults, primaryLevel, gap };
}

/** 取得結果頁要推薦的那一級（缺口優先；全解鎖回 topLevelInfo） */
export function recommendedFor(result: QuizResult): LevelInfo {
  if (result.gap) return levels[result.gap.level] ?? topLevelInfo;
  return topLevelInfo;
}
