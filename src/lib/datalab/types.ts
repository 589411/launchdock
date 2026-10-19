// 顧客數據戰情室 — 共用型別。全部欄位已正規化，與資料來源（日晴／內建樣本／自有檔案）無關。

/** epoch day（自 1970-01-01 起算的日數；只取日期、不含時分，固定以檔案內的日曆日為準） */
export type Day = number;

export interface Table {
  name: string;
  headers: string[];
  rows: string[][];
}

export interface Txn {
  id: string;
  /** 匿名交易為 null */
  customerId: string | null;
  day: Day;
  /** 退貨為負數 */
  amount: number;
  isReturn: boolean;
  campaignId?: string;
  store?: string;
  channel?: string;
}

export interface Line {
  txnId: string;
  sku: string;
  qty: number;
  amount: number;
}

export interface Dataset {
  source: 'sample' | 'sunlit' | 'own';
  /** 資料最後一天 + 1，RFM 的基準日（不用「今天」，避免舊資料全部變成流失） */
  asOf: Day;
  txns: Txn[];
  lines?: Line[];
}

// ── 資料健檢 ──────────────────────────────────────────────────
export type Level = 'ok' | 'info' | 'warn';

export interface HealthCheck {
  id: string;
  /** 對應哪個檔案 */
  table: string;
  level: Level;
  title: string;
  /** 白話說明，含「後續分析怎麼處理」 */
  detail: string;
  count?: number;
  total?: number;
}

export type PiiKind = 'email' | 'phone' | 'national_id' | 'card' | 'hash' | 'name' | 'address' | 'quasi';

export interface PiiFinding {
  table: string;
  column: string;
  kind: PiiKind;
  /** 0..1，命中非空值的比例（只靠欄名判斷時為 0） */
  rate: number;
  /** 已遮罩的範例，絕不放原值 */
  maskedSample: string;
  note: string;
}

export interface HealthReport {
  checks: HealthCheck[];
  pii: PiiFinding[];
  /** 清洗決策表：後續模組會排除什麼、為什麼 */
  decisions: { rule: string; why: string }[];
  /** 各模組最小需求不足時的提醒 */
  rows: Record<string, number>;
}

// ── RFM ───────────────────────────────────────────────────────
export type SegmentKey =
  | 'champion'
  | 'loyal'
  | 'newPotential'
  | 'atRiskBig'
  | 'attention'
  | 'dormant'
  | 'lost';

export interface RfmCustomer {
  id: string;
  r: number;
  f: number;
  m: number;
  rScore: number;
  fScore: number;
  mScore: number;
  fm: number;
  segment: SegmentKey;
}

export interface SegmentStat {
  key: SegmentKey;
  count: number;
  /** 佔客數比例 0..1 */
  countShare: number;
  sumM: number;
  /** 佔營收（M 加總）比例 0..1 */
  revenueShare: number;
  medianR: number;
  medianF: number;
  medianM: number;
}

export interface RfmResult {
  asOf: Day;
  customers: RfmCustomer[];
  segments: SegmentStat[];
  /** grid[rScore-1][fm-1] = 客數 */
  grid: number[][];
  /** 被排除的交易（不進客戶分析）統計 */
  excluded: { anonymous: number; returns: number };
}
