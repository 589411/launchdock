// ============================================================
// 中小企業 AI 導入體檢 — 唯一策展點（面向 + 題庫 + 診斷建議 + 失衡規則 + 計分）
// ------------------------------------------------------------
// 設計：不是考試，是「定位」。公司在每個面向各自落在哪一階段。
//   - 每題 4 個選項 = 4 個階段（分數 0..3 對應階段 1..4），問的是行為／事實，不問感受。
//   - 面向之間沒有先後（不像 quiz.ts 的能力階梯），所以不做解鎖門檻；
//     各面向算平均後換成階段，「面向之間的落差」本身就是洞察（見 imbalanceRules）。
//   - 結果完全規則式（不呼叫 LLM）：診斷與「下一步一件事」都寫在本檔，人工審稿。
//
// 階段的分界是「誰在動手」：
//   1 觀望 → 2 人問 AI（個人嘗試）→ 3 AI 在固定流程裡做一段事（流程導入）→ 4 AI 自己跑、有指標有規範（制度化）
//
// 維護方式：直接改本檔即可，不需動頁面。
//   - 改題目／選項 → questions
//   - 改診斷與下一步 → advice
//   - 改失衡警示 → imbalanceRules
//   - 改推薦文章 → recommended（slug 中英共用；scripts/check-checkup.mjs 會驗證存在）
//   - 英文版放在 checkup.en.ts（以 id 對應，沒填就退回中文）
// ============================================================

import { en as enPack } from './checkup.en';

export type Locale = 'zh-tw' | 'en';

export type DimensionKey = 'strategy' | 'data' | 'process' | 'decision' | 'people';
export type StageLevel = 1 | 2 | 3 | 4;

export interface StageInfo {
  level: StageLevel;
  name: string;
  /** 一句話：這一階段的公司長什麼樣子 */
  blurb: string;
}

export interface Dimension {
  key: DimensionKey;
  name: string;
  /** 雷達圖軸標籤用的短名（手機寬度放不下全名） */
  short: string;
  /** 這個面向在看什麼（作答頁分段標題下方） */
  intro: string;
}

export interface QuizOption {
  text: string;
  /** 0..3，對應階段 1..4 */
  score: number;
}

export interface Question {
  id: string;
  dimension: DimensionKey;
  text: string;
  options: QuizOption[];
}

export interface Advice {
  /** 現況診斷 */
  diagnosis: string;
  /** 下一步「一件事」 */
  next: string;
}

export const config = {
  /** 平均分 → 階段的切點：<0.5 → 1、<1.5 → 2、<2.5 → 3、其餘 4 */
  cuts: [0.5, 1.5, 2.5] as const,
};

// ── 四個階段 ───────────────────────────────────────────────────
export const stages: StageInfo[] = [
  { level: 1, name: '觀望', blurb: '還沒開始，或只是聽說。AI 跟公司的日常工作還沒有交集。' },
  { level: 2, name: '個人嘗試', blurb: '員工各自用 AI 聊天、查資料（人問 AI），公司層面沒有共識也沒有管理。' },
  { level: 3, name: '流程導入', blurb: '有幾件固定的事交給 AI 做一段，有人負責、有範本、有人驗收。' },
  { level: 4, name: '制度化', blurb: 'AI 能自己跑起來，有指標、有規範，並且進入決策與日常管理。' },
];

// ── 五個面向（順序即結果頁顯示順序；同分時取較前面者為「最該先補」） ──
export const dimensions: Dimension[] = [
  {
    key: 'strategy',
    short: '定位策略',
    name: 'AI 定位與策略',
    intro: '先看清公司現在停在哪一格：高層有沒有共識、有沒有投入、說不說得出「人問 AI」和「AI 自己做事」的差別。',
  },
  {
    key: 'data',
    short: '數據報表',
    name: '數據與報表自動化',
    intro: '老闆想看數字時，要等人整理，還是打開就有？',
  },
  {
    key: 'process',
    short: '營運流程',
    name: '營運痛點與流程',
    intro: '錢和時間從哪裡流掉：重複做的、要等人才能動的、只有資深員工才會的。',
  },
  {
    key: 'decision',
    short: '決策驗證',
    name: '決策與新商機驗證',
    intro: '把「我覺得應該做」變成「我確定要做」：AI 在這裡不是代筆，而是陪練。',
  },
  {
    key: 'people',
    short: '人員安全',
    name: '人員、工具與資料安全',
    intro: '員工在用什麼、資料往哪裡去、哪些事絕對不能交給 AI。',
  },
];

// ── 題庫（每面向 3 題，選項分數 0..3） ─────────────────────────
export const questions: Question[] = [
  // ---- strategy ----
  {
    id: 'strategy_consensus',
    dimension: 'strategy',
    text: '老闆與高階主管，對「公司要用 AI 做什麼」有共識嗎？',
    options: [
      { score: 0, text: '沒討論過' },
      { score: 1, text: '各自有想法，但沒有坐下來談過' },
      { score: 2, text: '談過，有幾個想試的方向' },
      { score: 3, text: '有明確目標與負責人，定期檢視進度' },
    ],
  },
  {
    id: 'strategy_budget',
    dimension: 'strategy',
    text: '公司在 AI 上的投入是怎麼處理的？',
    options: [
      { score: 0, text: '沒有任何投入' },
      { score: 1, text: '員工自己掏錢，或用免費版' },
      { score: 2, text: '公司付費訂閱了一兩種工具' },
      { score: 3, text: '有年度預算，並檢視投入換到了什麼' },
    ],
  },
  {
    id: 'strategy_position',
    dimension: 'strategy',
    text: '你說得出公司現在哪些事是「人問 AI」、哪些事是「AI 自己做」嗎？',
    options: [
      { score: 0, text: '說不出來，公司沒在用' },
      { score: 1, text: '說得出，目前全是人問 AI（聊天、查資料）' },
      { score: 2, text: '有一兩件事是 AI 在固定流程裡先做，人再驗收' },
      { score: 3, text: '盤點過，也清楚下一步要讓 AI 接手哪一段' },
    ],
  },

  // ---- data ----
  {
    id: 'data_report',
    dimension: 'data',
    text: '公司每週或每月的報表，是怎麼產生的？',
    options: [
      { score: 0, text: '全部手動整理 Excel' },
      { score: 1, text: '手動為主，偶爾請 AI 幫忙整理或寫公式' },
      { score: 2, text: '部分報表有範本或工具，半自動' },
      { score: 3, text: '報表自動更新，不需要人手動做' },
    ],
  },
  {
    id: 'data_view',
    dimension: 'data',
    text: '老闆想看營運數字時，通常怎麼拿到？',
    options: [
      { score: 0, text: '問人，等人整理好再給' },
      { score: 1, text: '有數字，但散在不同檔案或系統裡' },
      { score: 2, text: '有一份固定的總表或儀表板，但要人更新' },
      { score: 3, text: '打開就是最新數字，自動更新' },
    ],
  },
  {
    id: 'data_external',
    dimension: 'data',
    text: '同業動態、市場消息，公司怎麼蒐集？',
    options: [
      { score: 0, text: '沒有系統地蒐集' },
      { score: 1, text: '靠自己滑到什麼看什麼' },
      { score: 2, text: '定期請 AI 或工具整理，再由人閱讀' },
      { score: 3, text: '自動蒐集整理，固定送到該看的人手上' },
    ],
  },

  // ---- process ----
  {
    id: 'process_repeat',
    dimension: 'process',
    text: '重複做的工作（報價、對帳、回信、建檔…），你們盤點過嗎？',
    options: [
      { score: 0, text: '沒有' },
      { score: 1, text: '心裡大概有數，但沒寫下來' },
      { score: 2, text: '列過清單，挑了幾項用 AI 試' },
      { score: 3, text: '有清單與優先順序，已有項目交給 AI 做' },
    ],
  },
  {
    id: 'process_wait',
    dimension: 'process',
    text: '有些事得「等特定的人」才能動（卡在某人或某個步驟）。這部分你們怎麼處理？',
    options: [
      { score: 0, text: '不清楚卡在哪' },
      { score: 1, text: '知道有，但沒有改善' },
      { score: 2, text: '找出來了，開始用範本或 AI 減少等待' },
      { score: 3, text: '已改成流程，不等特定人也能進行' },
    ],
  },
  {
    id: 'process_know',
    dimension: 'process',
    text: '只有資深員工才會的做法，有被記錄下來嗎？',
    options: [
      { score: 0, text: '都在他腦袋裡' },
      { score: 1, text: '偶爾口頭交接' },
      { score: 2, text: '有寫成文件或 SOP，但沒人維護' },
      { score: 3, text: '有文件，而且能讓 AI 讀來輔助新人或回答問題' },
    ],
  },

  // ---- decision ----
  {
    id: 'decision_basis',
    dimension: 'decision',
    text: '重大決策（投資、新產品、擴編），通常依據什麼？',
    options: [
      { score: 0, text: '老闆的直覺與經驗' },
      { score: 1, text: '直覺為主，偶爾查點資料' },
      { score: 2, text: '會先蒐集資料、做簡單分析' },
      { score: 3, text: '有固定的依據與指標，決策前先驗證' },
    ],
  },
  {
    id: 'decision_sparring',
    dimension: 'decision',
    text: '想到新點子時，會讓 AI 當陪練嗎？（挑戰你、問倒你、找盲點，而不只是幫你寫）',
    options: [
      { score: 0, text: '不會' },
      { score: 1, text: '偶爾請 AI 幫忙想點子或寫文案' },
      { score: 2, text: '會請 AI 提出反對意見、找漏洞' },
      { score: 3, text: '固定流程：點子都先被 AI 挑戰過，再拿去討論' },
    ],
  },
  {
    id: 'decision_test',
    dimension: 'decision',
    text: '新點子（新產品、新服務）在正式投入前，怎麼驗證？',
    options: [
      { score: 0, text: '想到就做' },
      { score: 1, text: '跟幾個人聊聊' },
      { score: 2, text: '寫成一頁說明，小範圍試試看' },
      { score: 3, text: '有固定的輕量驗證流程，達標才擴大' },
    ],
  },

  // ---- people ----
  {
    id: 'people_rule',
    dimension: 'people',
    text: '員工使用 AI，公司有明確規範嗎？',
    options: [
      { score: 0, text: '沒有規範，也不確定誰在用' },
      { score: 1, text: '口頭提醒「小心一點」' },
      { score: 2, text: '有書面規則，寫明哪些資料不能貼' },
      { score: 3, text: '規則、教育訓練、定期檢查都有' },
    ],
  },
  {
    id: 'people_tools',
    dimension: 'people',
    text: '員工用的 AI 工具與帳號，怎麼管理？',
    options: [
      { score: 0, text: '不知道大家用了哪些' },
      { score: 1, text: '各用各的個人帳號' },
      { score: 2, text: '公司統一選定工具與帳號' },
      { score: 3, text: '統一管理帳號與權限，離職會收回' },
    ],
  },
  {
    id: 'people_line',
    dimension: 'people',
    text: '哪些事「可以交給 AI」、哪些事「絕對不能交」，公司有劃線嗎？',
    options: [
      { score: 0, text: '沒想過' },
      { score: 1, text: '心裡有感覺，但沒說清楚' },
      { score: 2, text: '有劃線（例如客戶個資、合約不上傳）' },
      { score: 3, text: '劃線寫成規則，並依風險分級' },
    ],
  },
];

// ── 各面向 × 各階段：現況診斷 + 下一步一件事 ───────────────────
export const advice: Record<DimensionKey, Record<StageLevel, Advice>> = {
  strategy: {
    1: {
      diagnosis: 'AI 對公司來說還是「別人的事」，還沒有人想過它跟你的生意有什麼關係。',
      next: '這週只做一件事：列出公司最花時間的三件工作，問自己「如果有個助理能幫我做這件，值多少錢？」',
    },
    2: {
      diagnosis: '員工各自在用，但公司沒有共同的目標，用得好壞全看個人。',
      next: '開一次 30 分鐘的會，讓每個人分享「我用 AI 做了什麼」，挑一件變成公司要一起做的事。',
    },
    3: {
      diagnosis: '有幾件事已經在用，但還沒有人為成效負責，也沒有衡量標準。',
      next: '指定一位負責人，為最成功的那一件定一個數字（省多少時間、少多少錯誤），每月檢視一次。',
    },
    4: {
      diagnosis: '策略與投入都有章法，優勢是能持續累積。',
      next: '風險是自滿。每季重新盤點一次「還有哪一段可以讓 AI 接手」，並淘汰沒效果的投入。',
    },
  },
  data: {
    1: {
      diagnosis: '數字靠人工整理，老闆要看時得等人。',
      next: '挑一份每週都在做的報表，請 AI 協助整理欄位與公式，先省下第一個小時。',
    },
    2: {
      diagnosis: '偶爾用 AI 輔助整理，但數字仍然分散，更新靠人。',
      next: '把最常看的 3 個數字集中到一張總表，欄位固定，為自動化打底。',
    },
    3: {
      diagnosis: '已經有固定的總表或儀表板，但更新還需要人。',
      next: '找出更新中最耗時的一步，把它自動化（資料匯入或定時整理），目標是不用手動更新。',
    },
    4: {
      diagnosis: '數字自動更新、隨時可看，這是少數公司才有的基礎。',
      next: '把「看數字」推進到「被提醒」：設定異常通知，讓數字主動找人，而不是人去找數字。',
    },
  },
  process: {
    1: {
      diagnosis: '重複性的工作還沒被看見，所以也還沒被改善。',
      next: '記錄一週：每做完一件事，就標註它是「重複做的」「要等人的」還是「只有某人會的」，一週後你就有清單。',
    },
    2: {
      diagnosis: '知道哪裡慢，但還在憑感覺，沒有系統地處理。',
      next: '從清單挑一件最簡單、最重複的工作，用 AI 做出第一版範本，實際用一週。',
    },
    3: {
      diagnosis: '有些流程已經有 AI 協助，但還靠少數人撐著。',
      next: '把這些做法寫成 SOP 和提示詞範本，讓第二個人也能照做，流程才不會綁在一個人身上。',
    },
    4: {
      diagnosis: '流程能脫離特定的人運作，知識也被保存下來。',
      next: '挑下一個瓶頸：哪一段仍然需要人盯著？評估能不能讓 AI 自動串接，人只負責驗收。',
    },
  },
  decision: {
    1: {
      diagnosis: '決策主要靠直覺，缺少事先檢驗的機制。',
      next: '下次想到新點子，先用一頁紙寫下：給誰、解決什麼問題、怎麼知道有效。寫不出來就先別做。',
    },
    2: {
      diagnosis: '會蒐集資料，但點子還沒被認真挑戰過。',
      next: '把點子丟給 AI，明確要求它「扮演最挑剔的客戶，找出五個會失敗的理由」，再回頭修改。',
    },
    3: {
      diagnosis: '驗證已有雛型，但還不穩定，沒有固定流程。',
      next: '定一個固定模板：一頁說明、過關標準、時限。所有新點子都走同一套。',
    },
    4: {
      diagnosis: '點子先被挑戰、再被驗證，決策有依據。',
      next: '回頭檢驗：過去驗證過的點子，結果跟當時的預測差多少？用來校正你的判斷標準。',
    },
  },
  people: {
    1: {
      diagnosis: '沒有規範是最大的風險：員工可能已經把客戶資料貼進公司不知道的工具。',
      next: '今天先做兩件事：問一次大家都在用什麼工具；明確說「客戶個資、合約、財務報表不能貼進 AI」。',
    },
    2: {
      diagnosis: '有基本規則，但工具與帳號仍然分散，難以管理。',
      next: '統一選一兩種公司認可的工具與帳號，並把「哪些資料能交、哪些不能交」寫成一頁。',
    },
    3: {
      diagnosis: '規則與工具都建立了，接下來是讓它真的被遵守。',
      next: '把規則變成日常：納入新人訓練、定期檢查，並依風險為資料分級。',
    },
    4: {
      diagnosis: '治理完整，AI 可以在安全的範圍內放心擴大使用。',
      next: '在安全前提下放寬：評估哪些場景能讓 AI 接手更多環節，又不增加風險。',
    },
  },
};

// ── 失衡警示：面向之間的落差，往往比單一分數更有價值 ─────────────
export interface ImbalanceRule {
  id: string;
  headline: string;
  /** 可用 {hi}、{lo} 代入較高／較低的面向名稱 */
  detail: string;
  /** 回傳 null 表示沒觸發；回傳物件則為要代入的面向名稱 */
  check: (stageOf: Record<DimensionKey, StageLevel>) => { hi?: DimensionKey; lo?: DimensionKey } | null;
}

function maxMin(stageOf: Record<DimensionKey, StageLevel>) {
  const keys = dimensions.map((d) => d.key);
  let hi = keys[0];
  let lo = keys[0];
  for (const k of keys) {
    if (stageOf[k] > stageOf[hi]) hi = k;
    if (stageOf[k] < stageOf[lo]) lo = k;
  }
  return { hi, lo };
}

export const imbalanceRules: ImbalanceRule[] = [
  {
    id: 'shadow_ai',
    headline: '有人在用，但沒有規範',
    detail:
      '其他面向已經有在用 AI，但「人員、工具與資料安全」還停在最前面。這是中小企業最常見的風險：資料可能已經流出去，而公司還不知道。建議優先補這一塊。',
    check: (s) => {
      if (s.people > 1) return null;
      const others = (['strategy', 'data', 'process', 'decision'] as DimensionKey[]).filter((k) => s[k] >= 2);
      return others.length > 0 ? { hi: others[0], lo: 'people' } : null;
    },
  },
  {
    id: 'data_no_decision',
    headline: '數字有了，但還沒進決策',
    detail: '「數據與報表自動化」已經走在前面，但「決策與新商機驗證」還在直覺為主。把數字拿來驗證想法，才是自動化報表真正的回報。',
    check: (s) => (s.data >= 3 && s.decision <= 1 ? { hi: 'data', lo: 'decision' } : null),
  },
  {
    id: 'say_not_do',
    headline: '說得多，做得少',
    detail: '「AI 定位與策略」已經有想法，但「營運痛點與流程」還沒動起來。挑一件最小的重複工作，先做出第一個成果，策略才會變成真的。',
    check: (s) => (s.strategy >= 3 && s.process <= 1 ? { hi: 'strategy', lo: 'process' } : null),
  },
  {
    id: 'uneven',
    headline: '發展不均',
    detail: '「{hi}」與「{lo}」落差兩階以上。落差太大時，走得快的那一塊常被走得慢的拖住。先補「{lo}」，整體才會一起往前。',
    check: (s) => {
      const { hi, lo } = maxMin(s);
      return s[hi] - s[lo] >= 2 ? { hi, lo } : null;
    },
  },
];

// ── 推薦閱讀（slug 中英共用；缺口面向 → 對應文章） ───────────────
export const recommended: Record<DimensionKey, string[]> = {
  strategy: ['ai-tool-decision-framework', 'which-ai-tool-for-you', 'dont-fomo-ai-tools', 'ai-speed-and-opportunity'],
  data: ['looker-studio-csv-analysis', 'workflow-report', 'workflow-reconcile'],
  process: ['what-is-n8n', 'workflow-inbox', 'workflow-docdiff', 'make-gmail-sheets-automation'],
  decision: ['prompt-engineering', 'from-prompt-to-skill', 'ai-agent-jargon'],
  people: ['claude-team-setup', 'join-claude-team', 'ai-share-link-not-private', 'mcp-servers-picks'],
};

/** 所有推薦會用到的 slug（頁面只傳這些文章的 metadata 給 island） */
export const allRecommendedSlugs: string[] = Array.from(new Set(Object.values(recommended).flat()));

// ── 計分 ──────────────────────────────────────────────────────
export interface DimensionResult {
  key: DimensionKey;
  /** 平均分 0..3 */
  avg: number;
  /** 0..1（雷達圖用） */
  pct: number;
  stage: StageLevel;
}

export interface FiredWarning {
  id: string;
  hi?: DimensionKey;
  lo?: DimensionKey;
}

export interface CheckupResult {
  dimensions: DimensionResult[];
  overallStage: StageLevel;
  overallAvg: number;
  /** 平均分最低的面向（同分取順序較前者） */
  weakest: DimensionResult;
  warnings: FiredWarning[];
}

function toStage(avg: number): StageLevel {
  const [a, b, c] = config.cuts;
  if (avg < a) return 1;
  if (avg < b) return 2;
  if (avg < c) return 3;
  return 4;
}

/**
 * 計分。
 * @param answers questionId → 選到的選項 index（沒答的題以 0 分計）
 */
export function scoreCheckup(answers: Record<string, number>): CheckupResult {
  const dimResults: DimensionResult[] = dimensions.map((dim) => {
    const qs = questions.filter((q) => q.dimension === dim.key);
    let sum = 0;
    for (const q of qs) {
      const picked = answers[q.id];
      if (picked != null && q.options[picked]) sum += q.options[picked].score;
    }
    const avg = qs.length > 0 ? sum / qs.length : 0;
    return { key: dim.key, avg, pct: avg / 3, stage: toStage(avg) };
  });

  const overallAvg = dimResults.reduce((s, d) => s + d.avg, 0) / dimResults.length;
  const weakest = dimResults.reduce((w, d) => (d.avg < w.avg ? d : w), dimResults[0]);

  const stageOf = Object.fromEntries(dimResults.map((d) => [d.key, d.stage])) as Record<DimensionKey, StageLevel>;
  const warnings: FiredWarning[] = [];
  for (const rule of imbalanceRules) {
    const hit = rule.check(stageOf);
    if (hit) warnings.push({ id: rule.id, ...hit });
  }

  return { dimensions: dimResults, overallStage: toStage(overallAvg), overallAvg, weakest, warnings };
}

// ── 在地化（英文以 id 對應 checkup.en.ts，沒填就退回中文） ──────────
export interface LocalizedContent {
  stages: StageInfo[];
  dimensions: Dimension[];
  questions: Question[];
  advice: Record<DimensionKey, Record<StageLevel, Advice>>;
  warnings: Record<string, { headline: string; detail: string }>;
}

export function localize(locale: Locale): LocalizedContent {
  const warnings = Object.fromEntries(imbalanceRules.map((r) => [r.id, { headline: r.headline, detail: r.detail }]));
  if (locale !== 'en') return { stages, dimensions, questions, advice, warnings };

  const E = enPack;
  return {
    stages: stages.map((s) => ({ ...s, ...(E.stages?.[s.level] ?? {}) })),
    dimensions: dimensions.map((d) => ({ ...d, ...(E.dimensions?.[d.key] ?? {}) })),
    questions: questions.map((q) => {
      const e = E.questions?.[q.id];
      return e
        ? { ...q, text: e.text, options: q.options.map((o, i) => ({ ...o, text: e.options[i] ?? o.text })) }
        : q;
    }),
    advice: Object.fromEntries(
      (Object.keys(advice) as DimensionKey[]).map((k) => [
        k,
        Object.fromEntries(
          ([1, 2, 3, 4] as StageLevel[]).map((lv) => [lv, { ...advice[k][lv], ...(E.advice?.[`${k}.${lv}`] ?? {}) }]),
        ),
      ]),
    ) as Record<DimensionKey, Record<StageLevel, Advice>>,
    warnings: Object.fromEntries(
      Object.entries(warnings).map(([id, w]) => [id, { ...w, ...(E.warnings?.[id] ?? {}) }]),
    ),
  };
}
