// ============================================================
// 顧客數據戰情室 — 工作坊流程（唯一策展點）
// ------------------------------------------------------------
// 投影片式的闖關：一次只看一段，做完才開下一段。每一段四個動作：
//   ① 任務（要回答什麼）→ ② 先自己試（用你自己的 AI 工具）→ ③ 對答案（標準算法算出的結果）→ ④ 我學到
// 「對答案」的重點不是給解答，而是讓學員核對 AI 有沒有算錯——LLM 分析常在定義、排除條件上出錯。
//
// 目前開放第 1 天；第 2 至 4 天陸續加入（只要在 segments 新增項目並實作對應的 view）。
// 網址 `?day=N` 可以把進度上限限制在第 N 天（例如現場帶領時只開到當天的段落）。
// ============================================================

export type ViewKey = 'touchpoints' | 'health' | 'rfm' | 'insight' | 'repurchase' | 'basket' | 'value' | 'insight2' | 'report';

/** 學員可以填「我的 AI 算出來的數字」來核對 */
export interface CheckSpec {
  id: ExpectedKey;
  label: string;
  unit: 'count' | 'percent' | 'days';
  /** 核對失敗時的提示（不給答案，提醒去追問 AI 的算法） */
  hint: string;
}

/** 由資料算出、可供核對的標準答案 */
export type ExpectedKey =
  | 'memberShare'
  | 'anonymousCount'
  | 'returnCount'
  | 'onceOnly'
  | 'top20Share'
  | 'medianInterval'
  | 'repeatRate'
  | 'repeatRevenueShare'
  | 'topPairCount';

export interface SegmentDef {
  id: string;
  day: 1 | 2 | 3 | 4;
  /** 該天內的第幾段（1 起算） */
  order: number;
  title: string;
  goal: string;
  /** 任務說明（學員要回答的問題） */
  task: string;
  /** 貼給自己 AI 工具的提示詞範本；{columns} 會換成欄位名稱（只有欄名，沒有資料） */
  tryPrompt: string;
  view: ViewKey;
  checks?: CheckSpec[];
  takeawayLabel: string;
}

export interface DayDef {
  day: 1 | 2 | 3 | 4;
  title: string;
  blurb: string;
  open: boolean;
}

export const days: DayDef[] = [
  { day: 1, title: '顧客資料的基礎', blurb: '看清資料從哪來、能不能信，把顧客分群。', open: true },
  { day: 2, title: '行為與價值', blurb: '回購週期、商品關聯、顧客價值。', open: true },
  { day: 3, title: '個人化與自動化', blurb: '推薦規則、分群文案、自動化觸發清單。', open: false },
  { day: 4, title: '驗證與落地', blurb: '成效驗證、風險、成果簡報。', open: false },
];

export const segments: SegmentDef[] = [
  {
    id: 'd1s1',
    day: 1,
    order: 1,
    title: '這份資料從哪裡來？',
    goal: '看顧客在哪些接觸點留下紀錄，以及有多少交易留下了「是誰買的」。',
    task: '先請你的 AI 工具回答兩個問題：我的交易有幾成留下了顧客編號？每個月的營收怎麼走？',
    tryPrompt: `我有一份顧客交易資料，欄位有：{columns}。
請你：
1. 算出「有顧客編號的交易」佔全部交易的百分比，並說明你怎麼判斷「有顧客編號」；
2. 依月份彙總營收，描述趨勢；
3. 如果有門市或通路欄位，比較各門市／通路的營收與「有顧客編號」的比例。
請先告訴我你的計算步驟，再給結果。`,
    view: 'touchpoints',
    checks: [
      {
        id: 'memberShare',
        label: '有顧客編號的交易，佔全部交易幾 %？',
        unit: 'percent',
        hint: '常見的差異：AI 把退貨也算進去，或把空白與「無」「N/A」當成有編號。回去問它怎麼數的。',
      },
    ],
    takeawayLabel: '從接觸點看，我的顧客資料最大的缺口是…',
  },
  {
    id: 'd1s2',
    day: 1,
    order: 2,
    title: '資料可以信嗎？',
    goal: '分析之前先體檢：缺值、重複、格式不一致、個資。',
    task: '請 AI 列出這份資料有哪些問題，再對答案，看它有沒有漏掉、或誤判。',
    tryPrompt: `我有一份顧客交易資料，欄位有：{columns}。
請在分析之前先幫我做資料體檢：
1. 哪些欄位有缺值？缺多少？
2. 有沒有完全重複的列？它們該不該刪？為什麼？
3. 日期、金額的格式有沒有不一致？
4. 有沒有退貨或負數金額？該怎麼處理？
5. 有沒有個資欄位（姓名、電話、email）？
請逐項回答，並說明你是怎麼檢查的。`,
    view: 'health',
    checks: [
      {
        id: 'anonymousCount',
        label: '沒有顧客編號的交易有幾筆？',
        unit: 'count',
        hint: '追問 AI：它是怎麼判斷「沒有顧客編號」的？空白、空格、「無」要不要算？',
      },
      {
        id: 'returnCount',
        label: '退貨有幾筆？',
        unit: 'count',
        hint: '追問 AI：它用什麼判斷退貨？旗標欄位、還是金額為負？兩者不一致時怎麼辦？',
      },
    ],
    takeawayLabel: '這份資料我最不放心的地方，以及我打算怎麼處理…',
  },
  {
    id: 'd1s3',
    day: 1,
    order: 3,
    title: '誰是你最值錢的顧客？',
    goal: '用最近一次消費、消費次數、消費金額，把顧客分成幾群。',
    task: '請 AI 幫你把顧客分群。注意：先要求它把算法寫清楚，再看結果。',
    tryPrompt: `我有一份顧客交易資料，欄位有：{columns}。
請做 RFM 分析：
1. 先說明你怎麼定義 R（最近一次購買距今天數）、F（購買次數）、M（消費金額），以及你怎麼處理退貨與沒有顧客編號的交易；
2. 基準日請用「資料裡最後一天再加一天」，不要用今天；
3. 把顧客分成 5 到 7 群，說明每一群的條件；
4. 告訴我：只買過一次的顧客有幾位？消費金額最高的 20% 顧客，貢獻了幾 % 的營收？
請先寫出計算步驟。`,
    view: 'rfm',
    checks: [
      {
        id: 'onceOnly',
        label: '只買過一次的顧客有幾位？',
        unit: 'count',
        hint: '追問 AI：退貨算不算一次購買？沒有顧客編號的交易有沒有排除？',
      },
      {
        id: 'top20Share',
        label: '消費金額最高的 20% 顧客，貢獻幾 % 營收？',
        unit: 'percent',
        hint: '追問 AI：「20%」是用顧客人數算，還是用交易筆數算？營收有沒有扣掉退貨？',
      },
    ],
    takeawayLabel: '分群之後，我最想先對哪一群做什麼…',
  },
  {
    id: 'd1s4',
    day: 1,
    order: 4,
    title: '讓 AI 解讀，你來把關',
    goal: '把彙總結果交給 AI 寫成白話報告，並學會檢查它。',
    task: '前三段你已經看過彙總結果。「對答案」裡會產生三份提示詞（只含統計數字、沒有任何個人資料），用它們請 AI 寫成白話報告，再逐一核對它引用的數字。',
    tryPrompt: '',
    view: 'insight',
    checks: [
      {
        id: 'medianInterval',
        label: '顧客「相鄰兩次購買」的間隔，中位數是幾天？',
        unit: 'days',
        hint: '不同算法會得到不同答案：是只看有買過 2 次以上的顧客？同一天買兩次算不算？先問 AI 它怎麼算的。',
      },
    ],
    takeawayLabel: 'AI 的報告裡，我發現需要打折扣或修正的地方是…',
  },
  {
    id: 'report-d1',
    day: 1,
    order: 5,
    title: '整理成你的成果',
    goal: '把這一天的發現，整理成一頁可以存成 PDF、也可以貼出去分享的報告。',
    task: '檢查報告的內容，決定要不要顯示金額，然後存成 PDF 或複製摘要文字。',
    tryPrompt: '',
    view: 'report',
    takeawayLabel: '',
  },
  // ── 第 2 天：行為與價值 ──────────────────────────────────────
  {
    id: 'd2s1',
    day: 2,
    order: 1,
    title: '多久會再回來買？',
    goal: '看顧客的購買節奏：回購率、通常隔幾天回來、誰「該回來了」。',
    task: '請你的 AI 工具算出：有幾 % 的顧客買過第二次？相鄰兩次購買之間通常隔幾天？',
    tryPrompt: `我有一份顧客交易資料，欄位有：{columns}。
請分析顧客的購買週期：
1. 先說明你怎麼定義「一次購買」與「回購」：同一天買兩次算幾次？退貨算不算？沒有顧客編號的交易怎麼處理？
2. 回購率：有幾 % 的顧客買過第二次以上？
3. 回購間隔：同一位顧客相鄰兩次購買相隔幾天？給我整體的中位數，並分成 0–7、8–14、15–30、31–60、61–90、91–180、181 天以上幾個區間，各有幾次。
4. 哪些顧客「已經超過自己平常的回購節奏」，該被提醒了？請說明你怎麼判斷。
請先寫出計算步驟。`,
    view: 'repurchase',
    checks: [
      {
        id: 'repeatRate',
        label: '買過第二次以上的顧客，佔有購買紀錄顧客的幾 %？',
        unit: 'percent',
        hint: '追問 AI：「買過第二次」是看交易筆數，還是看不同的購買日？同一天買兩次算不算回購？退貨算不算一次購買？',
      },
    ],
    takeawayLabel: '我的顧客通常隔多久回來，我可以在什麼時間點提醒他們…',
  },
  {
    id: 'd2s2',
    day: 2,
    order: 2,
    title: '哪些東西常一起買？',
    goal: '找出常被一起買的品類，並分辨「真的相關」和「只是都熱賣」。',
    task: '請 AI 找出最常出現在同一張單的兩個品類，並說明它怎麼判斷這是「真的相關」，而不是兩個都很熱賣。',
    tryPrompt: `我有一份顧客交易資料，欄位有：{columns}。
請做商品關聯分析（哪些品類常一起買）：
1. 先說明你用「商品」還是「品類」當單位，同一張單裡買兩件同樣的東西算幾次；
2. 只看沒有退貨的交易；
3. 找出最常同時出現在同一張單的兩個品類，告訴我它們同時出現在幾張單；
4. 光看次數會被熱賣品誤導。請再算「提升度（lift）」：同時出現的比例，除以兩者各自出現比例的乘積，並解釋 lift 大於 1 和接近 1 分別代表什麼；
5. 設一個最低次數門檻，避免偶然的配對。
請先寫出計算步驟。`,
    view: 'basket',
    checks: [
      {
        id: 'topPairCount',
        label: '最常一起出現的那一組品類，同時出現在幾張單？',
        unit: 'count',
        hint: '追問 AI：它用「商品」還是「品類」算？同一張單買兩件同一品類算一次還是兩次？有沒有把退貨的單排除？',
      },
    ],
    takeawayLabel: '我可以怎麼用這個發現（組合推薦、陳列、搭售）…',
  },
  {
    id: 'd2s3',
    day: 2,
    order: 3,
    title: '一位顧客值多少？',
    goal: '量化顧客價值：每位顧客平均花多少、回頭客貢獻多少營收、營收集中在哪些人。',
    task: '請 AI 算出回頭客（買過 2 個購買日以上）貢獻了多少營收，並比較「平均」和「中位數」的差別。',
    tryPrompt: `我有一份顧客交易資料，欄位有：{columns}。
請量化顧客價值：
1. 先說明你怎麼定義「顧客的累計消費」：退貨怎麼處理？沒有顧客編號的交易算不算？
2. 每位顧客累計消費的平均值與中位數，並解釋為什麼兩者差很多（如果有的話）；
3. 客單價（每筆非退貨交易的金額）的平均值與中位數；
4. 買過 2 個購買日以上的顧客（回頭客），貢獻了幾 % 的營收？
5. 把顧客依累計消費由高到低排序，前 20%、中間 30%、後 50% 各貢獻幾 % 營收。
請先寫出計算步驟。`,
    view: 'value',
    checks: [
      {
        id: 'repeatRevenueShare',
        label: '回頭客（買過 2 個購買日以上），貢獻幾 % 的營收？',
        unit: 'percent',
        hint: '追問 AI：營收有沒有扣掉退貨？有沒有排除沒有顧客編號的交易？「回頭客」是用交易筆數還是購買日判斷？',
      },
    ],
    takeawayLabel: '如果顧客價值這麼集中，我該把資源優先放在哪裡…',
  },
  {
    id: 'd2s4',
    day: 2,
    order: 4,
    title: '讓 AI 解讀行為與價值，你來把關',
    goal: '把回購、關聯、價值的彙總結果交給 AI 寫成白話報告，並學會檢查它。',
    task: '「對答案」裡有三份只含統計數字的提示詞。用它們請 AI 寫成報告，再用把關清單逐條檢查。',
    tryPrompt: '',
    view: 'insight2',
    takeawayLabel: 'AI 的解讀裡，我發現把「相關」說成「因果」的地方是…',
  },
  {
    id: 'report-d2',
    day: 2,
    order: 5,
    title: '整理成你的成果（第 1、2 天）',
    goal: '把兩天的發現整理成一頁可以存成 PDF、也可以貼出去分享的報告。',
    task: '檢查報告的內容，決定要不要顯示金額，然後存成 PDF 或複製摘要文字。',
    tryPrompt: '',
    view: 'report',
    takeawayLabel: '',
  },
];

/**
 * 畫面上要顯示的段落：只留不超過進度上限的天數；「整理成果」每個開放的天各有一個，
 * 畫面上只保留最後一天的（它涵蓋之前所有天的內容）。
 */
export function visibleSegments(ceiling: number): SegmentDef[] {
  const base = segments.filter((sg) => sg.day <= ceiling && days.find((d) => d.day === sg.day)?.open);
  const reports = base.filter((sg) => sg.view === 'report');
  const lastReportDay = reports.length ? Math.max(...reports.map((r) => r.day)) : 0;
  return base.filter((sg) => sg.view !== 'report' || sg.day === lastReportDay);
}

/** 把 {columns} 換成欄位名稱（只有欄名，不含任何資料） */
export function fillPrompt(template: string, columns: string[]): string {
  return template.replace('{columns}', columns.length ? columns.join('、') : '（請貼上你的欄位名稱）');
}
