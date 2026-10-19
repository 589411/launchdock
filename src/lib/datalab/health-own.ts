import type { Dataset, HealthCheck, HealthReport, Table } from './types';
import type { Mapping } from './detect';
import type { OwnBuildResult } from './normalize';
import { dayToString, parseFlexibleDay } from './normalize';
import { DECISIONS } from './health';
import { scanPii } from './pii';
import { quantile } from './stats';

const pct = (n: number, total: number) => (total ? `${((n / total) * 100).toFixed(1)}%` : '0%');

/**
 * 自己上傳的一張扁平表的資料健檢。
 * 與日晴（多檔）版的差別：沒有「交易總額對明細」的對帳，改檢查欄位缺值、重複列、日期／金額無法辨識、
 * 負數金額與樣本大小。個資掃描與清洗決策表沿用同一套。
 */
export function runHealthOwn(
  table: Table,
  mapping: Mapping,
  built: OwnBuildResult,
  dataset: Dataset,
): { report: HealthReport; facts: Record<string, number> } {
  const checks: HealthCheck[] = [];
  const facts: Record<string, number> = {};
  const total = table.rows.length;
  const stats = built.stats!;

  checks.push({
    id: 'own_overview',
    table: table.name,
    level: 'info',
    title: `${total.toLocaleString()} 列、${table.headers.length} 欄；辨識出 ${dataset.txns.length.toLocaleString()} 筆交易`,
    detail: stats.lineLevel
      ? '你的檔案裡同一個單號出現在多列，所以我把「一列」當成一個商品明細，把同一單號的金額加總成一筆交易。'
      : '每一列視為一筆交易。',
    count: dataset.txns.length,
    total,
  });

  if (stats.droppedDate > 0) {
    facts.dropped_date = stats.droppedDate;
    checks.push({
      id: 'own_date_unparseable',
      table: table.name,
      level: 'warn',
      title: `有 ${stats.droppedDate} 列日期無法辨識，分析時已略過`,
      detail: '可能是空白、不存在的日期（例如 2 月 31 日），或不支援的寫法。這些列不會進入任何分析，請先修正再重新上傳。',
      count: stats.droppedDate,
      total,
    });
  }
  if (stats.droppedAmount > 0) {
    facts.dropped_amount = stats.droppedAmount;
    checks.push({
      id: 'own_amount_unparseable',
      table: table.name,
      level: 'warn',
      title: `有 ${stats.droppedAmount} 列金額無法辨識，分析時已略過`,
      detail: '金額欄混入文字或空白。常見寫法（NT$1,200、1,200 元、(100)）我都能讀，其他的就會被略過。',
      count: stats.droppedAmount,
      total,
    });
  }

  // 日期樣式與範圍
  const patterns = new Map<string, number>();
  const days: number[] = [];
  const cDate = mapping.date.col;
  for (const r of table.rows) {
    const v = (r[cDate] ?? '').trim();
    patterns.set(v.replace(/\d/g, '9'), (patterns.get(v.replace(/\d/g, '9')) ?? 0) + 1);
    const d = parseFlexibleDay(v);
    if (d !== null) days.push(d);
  }
  if (patterns.size > 1) {
    const majority = Math.max(...patterns.values());
    checks.push({
      id: 'own_date_format',
      table: table.name,
      level: 'warn',
      title: `日期格式不一致：${total - majority} 列和其他列寫法不同`,
      detail: '同一欄混著不同的日期寫法。已統一轉成日期，但建議回頭把來源資料的格式統一。',
      count: total - majority,
      total,
    });
  }
  if (days.length) {
    const min = Math.min(...days);
    const max = Math.max(...days);
    const far = max - quantile(days, 0.99) > 366;
    checks.push({
      id: 'own_date_range',
      table: table.name,
      level: far ? 'warn' : 'info',
      title: `交易日期範圍：${dayToString(min)} 至 ${dayToString(max)}`,
      detail: far
        ? '最晚的日期離其他資料很遠，很可能是輸入錯誤。分群會以「資料最後一天」當基準日，一個過頭的日期會讓所有人都看起來像流失客。'
        : '分群的「基準日」會用資料最後一天再加一天，不用今天。',
    });
  }

  // 完全重複的列
  const seen = new Set<string>();
  let dup = 0;
  for (const r of table.rows) {
    const key = r.join('\u001f');
    if (seen.has(key)) dup++;
    else seen.add(key);
  }
  facts.duplicate_rows = dup;
  if (dup > 0) {
    checks.push({
      id: 'own_duplicates',
      table: table.name,
      level: 'warn',
      title: `有 ${dup} 列和其他列「完全一樣」`,
      detail: stats.lineLevel
        ? '同一張單買了兩件同樣的商品，系統可能就會匯出兩列一模一樣的資料，這種是合法的。但如果是重複匯出，金額就會被算兩次。先回到來源確認，不要無腦去重。'
        : '一模一樣的兩列可能是真的買了兩次，也可能是重複匯出。先回到來源確認再決定是否去除。',
      count: dup,
      total,
    });
  }

  // 匿名、退貨、負數、零
  const anon = dataset.txns.filter((t) => t.customerId === null).length;
  facts.anonymous = anon;
  if (anon > 0) {
    checks.push({
      id: 'own_anonymous',
      table: table.name,
      level: anon / dataset.txns.length > 0.1 ? 'warn' : 'info',
      title: `沒有顧客編號的交易 ${anon.toLocaleString()} 筆（${pct(anon, dataset.txns.length)}）`,
      detail: '這些交易算不出「是誰買的」。營收照算，但客戶分群、回購週期會排除它們，所以顧客分析看到的只是「有顧客編號的那一部分」。',
      count: anon,
      total: dataset.txns.length,
    });
  }
  const returns = dataset.txns.filter((t) => t.isReturn).length;
  facts.returns = returns;
  if (returns > 0) {
    checks.push({
      id: 'own_returns',
      table: table.name,
      level: 'info',
      title: `退貨 ${returns} 筆`,
      detail: '有「是否退貨」旗標，或金額是負數的，都視為退貨。退貨不算一次購買，但會從該顧客的消費金額扣除。',
      count: returns,
      total: dataset.txns.length,
    });
  }
  const zero = dataset.txns.filter((t) => t.amount === 0).length;
  if (zero > 0) {
    checks.push({
      id: 'own_zero',
      table: table.name,
      level: 'info',
      title: `金額為 0 的交易 ${zero} 筆`,
      detail: '可能是贈品、換貨或資料錯誤。它們會被算成一次購買，請確認是否合理。',
      count: zero,
      total: dataset.txns.length,
    });
  }

  // 樣本大小
  const customers = new Set(dataset.txns.filter((t) => t.customerId !== null && !t.isReturn).map((t) => t.customerId)).size;
  facts.customers = customers;
  if (customers < 30) {
    checks.push({
      id: 'own_small',
      table: table.name,
      level: 'warn',
      title: `有購買紀錄的顧客只有 ${customers} 位`,
      detail: '樣本很小，分群與比例只能當示範，不適合據此下決策。',
      count: customers,
    });
  }

  const pii = scanPii({ [table.name]: table });
  return { report: { checks, pii, decisions: DECISIONS, rows: { [table.name]: total } }, facts };
}
