// ============================================================
// 「用 Claude 打造的產品」頁的唯一資料來源
// /products/ 與 /en/products/ 都從這裡 .map() 生成，改內容只改這支。
// 誠實原則：只有已上線／實際在用的才放 live；規劃中的一律 roadmap，不寫成已上線。
// ============================================================

export type ProductTier = 'api' | 'code' | 'roadmap';

export interface Product {
  id: string;
  tier: ProductTier;
  icon: string;
  name: { zh: string; en: string };
  tagline: { zh: string; en: string };
  summary: { zh: string; en: string };
  stack: string[];
  url?: string;
  /** 英文頁改連的網址（子站有英文版時用），沒寫就用 url */
  urlEn?: string;
  /** 內部工具：沒有公開網址 */
  internal?: boolean;
}

export const products: Product[] = [
  // ── Tier 1：產品執行時直接呼叫 Claude API ──────────────────
  {
    id: 'hey-o',
    tier: 'api',
    icon: '🎧',
    name: { zh: 'Hey-O! 英聽口說', en: 'Hey-O! Listening & Speaking' },
    tagline: { zh: '英聽 · 跟讀 · 聽寫 · 生字本', en: 'Listening · shadowing · dictation · word bank' },
    summary: {
      zh: '以動畫故事為素材的英語聽說練習 Web App：聽力、跟讀、聽寫與生字本一條龍，後端串接 Claude API 處理學習內容。',
      en: 'An English listening-and-speaking web app built on animated stories: listening drills, shadowing, dictation and a personal word bank, with the Claude API powering the learning content behind it.',
    },
    stack: ['Claude API', 'Cloudflare Workers'],
    url: 'https://hey-o.launchdock.app',
  },
  {
    id: 'line-oa-tutor',
    tier: 'api',
    icon: '💬',
    name: { zh: 'LINE 學員 AI 助教', en: 'LINE AI Teaching Assistant' },
    tagline: { zh: '學員在 LINE 上直接問，AI 即時回答', en: 'Students ask on LINE, get answers instantly' },
    summary: {
      zh: '課程專用的 LINE 官方帳號：學員課後卡關直接在 LINE 發問，由 Claude 依課程脈絡回答，問答紀錄回流成教材改版的依據。',
      en: 'A course-specific LINE Official Account: students who get stuck after class ask right in LINE, Claude answers in the context of the course, and the Q&A log feeds back into revising the materials.',
    },
    stack: ['Claude API', 'LINE Messaging API', 'Cloudflare Workers', 'KV', 'R2'],
    internal: true,
  },
  {
    id: 'violin-lesson-analysis',
    tier: 'api',
    icon: '🎻',
    name: { zh: '提琴課錄影分析', en: 'Violin Lesson Video Analysis' },
    tagline: { zh: '上課錄影 → 給學生的具體回饋', en: 'Lesson recordings → concrete feedback for students' },
    summary: {
      zh: '把提琴課錄影交給 Claude 整理，產出給學生的課後回饋與練習重點，讓一對一教學的觀察不再只留在老師腦中。',
      en: 'Violin lesson recordings are processed with Claude into post-lesson feedback and practice priorities for each student, so a teacher’s one-on-one observations don’t stay only in the teacher’s head.',
    },
    stack: ['Claude API'],
    internal: true,
  },
  {
    id: 'sunlit',
    tier: 'api',
    icon: '🏪',
    name: { zh: '日晴生活 零售模擬', en: 'Sunlit Retail Simulation' },
    tagline: { zh: '虛構連鎖店：官網＋後台數據＋模擬經營', en: 'A fictional chain store: storefront + back-office data + management sim' },
    summary: {
      zh: '為企業「消費行為洞察」課程打造的虛構連鎖零售品牌：前台官網、可下載數據的後台、模擬經營遊戲，讓學員用真實感的資料練 AI 數據分析。',
      en: 'A fictional retail chain built for corporate consumer-insight training: a storefront site, a back office with downloadable data and a store-management game, so learners practice AI-assisted data analysis on realistic data.',
    },
    stack: ['Claude API', 'Claude Code'],
    url: 'https://sunlit.launchdock.app',
  },

  // ── Tier 2：用 Claude Code 開發、維運的站與工具 ─────────────
  {
    id: 'launchdock',
    tier: 'code',
    icon: '🦆',
    name: { zh: '藍鴨 LaunchDock 主站', en: 'LaunchDock main site' },
    tagline: { zh: '近 80 篇手把手 AI 教學，中英雙語', en: '~80 step-by-step AI tutorials, bilingual' },
    summary: {
      zh: '就是你正在看的這個站。內容產線、截圖工作流、讀者卡關回報、課堂即時投票與能力測驗、系統提示詞組合器，全部與 Claude Code 協作開發與維運。',
      en: 'The site you’re reading. Its content pipeline, screenshot workflow, per-section “stuck” reporting, live classroom polls and quizzes, and the system-prompt builder are all developed and maintained together with Claude Code.',
    },
    stack: ['Claude Code', 'Astro', 'Supabase', 'Cloudflare Pages'],
    url: 'https://launchdock.app',
  },
  {
    id: 'lab',
    tier: 'code',
    icon: '🧪',
    name: { zh: '藍鴨實驗室', en: 'Launchdock Lab' },
    tagline: { zh: '課堂 demo 實例庫', en: 'A library of classroom demos' },
    summary: {
      zh: 'YAML 驅動的 demo 展示庫：Claude Code 依專案內的操作手冊新增、驗證、建置條目，GitHub Actions 自動部署與巡檢壞連結。',
      en: 'A YAML-driven demo showcase: Claude Code adds, validates and builds entries by following a playbook in the repo, while GitHub Actions handles deployment and broken-link checks.',
    },
    stack: ['Claude Code', 'Claude Code Skills', 'GitHub Actions'],
    url: 'https://lab.launchdock.app',
    urlEn: 'https://lab.launchdock.app/en/',
  },
  {
    id: 'masters',
    tier: 'code',
    icon: '🎓',
    name: { zh: '大師專家團', en: 'Masters Hub' },
    tagline: { zh: '管理理論打包成隨選 AI 專家', en: 'Management theory packaged as on-demand AI experts' },
    summary: {
      zh: '5 組主題、22 位管理與行銷大師的框架，做成點一下就能用的 AI 專家，課堂上用來做商業模式與策略討論。',
      en: '22 management and marketing masters across 5 topic packs, each packaged as a one-click AI expert, used in class for business-model and strategy discussions.',
    },
    stack: ['Claude Code'],
    url: 'https://masters.launchdock.app',
  },
  {
    id: 'daily-bread',
    tier: 'code',
    icon: '📖',
    name: { zh: '每日靈糧', en: 'Daily Bread' },
    tagline: { zh: '讀經進度 PWA，可分享到 LINE', en: 'A Bible-reading PWA with LINE sharing' },
    summary: {
      zh: '每日讀經進度、一年讀經計畫、小組共讀與 LINE 分享的 PWA，跨裝置同步。',
      en: 'A PWA for daily Bible reading: progress tracking, a one-year plan, group reading and LINE sharing, synced across devices.',
    },
    stack: ['Claude Code', 'Firebase', 'Cloudflare'],
    url: 'https://daily-bread.launchdock.app',
  },

  // ── Tier 3：規劃中（尚未開發，不寫成已上線）───────────────
  {
    id: 'big-pack',
    tier: 'roadmap',
    icon: '📦',
    name: { zh: '藍鴨大補帖', en: 'Launchdock Big Pack' },
    tagline: { zh: '訂閱制：MCP 連接器＋驗證過的提示詞＋每月課程', en: 'Subscription: MCP connectors + validated prompts + monthly classes' },
    summary: {
      zh: '把課堂上驗證過的提示詞包做成有版本、可更新的 MCP 連接器，常駐在學員自己的 Claude 裡，搭配每月課程。',
      en: 'Turning prompt packs validated in class into versioned, updatable MCP connectors that live in each learner’s own Claude, paired with monthly classes.',
    },
    stack: ['MCP', 'Claude'],
  },
  {
    id: 'line-oa-managed',
    tier: 'roadmap',
    icon: '🤖',
    name: { zh: 'LINE AI 客服代管', en: 'Managed LINE AI Customer Service' },
    tagline: { zh: '給中小企業的 LINE 官方帳號 AI 客服', en: 'AI customer service on LINE for small businesses' },
    summary: {
      zh: '幫中小企業把 LINE 官方帳號接上 Claude：準備 QA 語料、架好伺服器、依用量計費，老闆不用自己顧主機。',
      en: 'Connecting small businesses’ LINE Official Accounts to Claude: we prepare the Q&A knowledge, run the server and bill by usage, so owners never have to babysit infrastructure.',
    },
    stack: ['Claude API', 'LINE Messaging API', 'Cloudflare Workers'],
  },
];
