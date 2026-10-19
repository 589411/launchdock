import type { HealthCheck, HealthReport, Table } from './types';
import { colIndex } from './csv';
import { scanPii } from './pii';
import { parseDay } from './normalize';
import { quantile } from './stats';

const pct = (n: number, total: number) => (total ? `${((n / total) * 100).toFixed(1)}%` : '0%');

function numOf(s: string | undefined): number {
  const v = Number((s ?? '').replace(/[,\s]/g, ''));
  return Number.isFinite(v) ? v : 0;
}

export interface HealthFacts {
  [key: string]: number | Record<string, number>;
}

/** 資料健檢。回傳報告與「可對照的事實數字」（供自檢腳本比對獨立算出的參考答案） */
export function runHealth(tables: Record<string, Table>): { report: HealthReport; facts: HealthFacts } {
  const checks: HealthCheck[] = [];
  const facts: HealthFacts = {};
  const rows: Record<string, number> = {};
  for (const [name, t] of Object.entries(tables)) rows[name] = t.rows.length;

  // ── transactions ─────────────────────────────────────────────
  const tx = tables.transactions;
  const it = tables.txn_items;
  if (tx) {
    const total = tx.rows.length;
    const iMember = colIndex(tx, 'member_id');
    const iRet = colIndex(tx, 'is_return');
    const iDt = colIndex(tx, 'txn_datetime');
    const iStore = colIndex(tx, 'store_id');
    const iId = colIndex(tx, 'txn_id');
    const iAmt = colIndex(tx, 'total_amount');
    const iDisc = colIndex(tx, 'discount_amount');

    if (iMember >= 0) {
      const n = tx.rows.filter((r) => (r[iMember] ?? '').trim() === '').length;
      facts.txn_anonymous = n;
      checks.push({
        id: 'txn_anonymous',
        table: 'transactions',
        level: n / total > 0.1 ? 'warn' : 'info',
        title: `匿名交易 ${n.toLocaleString()} 筆（${pct(n, total)}）`,
        detail:
          '這些交易沒有會員編號，算不出「是誰買的」。營收照算，但客戶分群、回購週期會排除它們——所以顧客分析看到的只是「有會員的那一部分」，不是全店。',
        count: n,
        total,
      });
    }

    if (iRet >= 0) {
      const isRet = (r: string[]) => /^true$/i.test((r[iRet] ?? '').trim());
      const ret = tx.rows.filter(isRet);
      const withMember = iMember >= 0 ? ret.filter((r) => (r[iMember] ?? '').trim() !== '').length : 0;
      facts.txn_returns = ret.length;
      facts.txn_returns_with_member = withMember;
      checks.push({
        id: 'txn_returns',
        table: 'transactions',
        level: 'info',
        title: `退貨 ${ret.length.toLocaleString()} 筆（其中 ${withMember} 筆有會員）`,
        detail:
          '退貨的金額是負數。分析時：退貨不算「一次購買」（不增加頻次、不當成最近消費日），但會從該顧客的消費金額中扣掉。',
        count: ret.length,
        total,
      });
    }

    if (iDt >= 0) {
      // 以「樣式」分組（數字都換成 9）：只有出現多種樣式才算不一致，整欄都是 2025/01/02 不該被當成問題
      const patterns = new Map<string, number>();
      let unparseable = 0;
      const days: number[] = [];
      for (const r of tx.rows) {
        const v = (r[iDt] ?? '').trim();
        const key = v.replace(/\d/g, '9');
        patterns.set(key, (patterns.get(key) ?? 0) + 1);
        const d = parseDay(v);
        if (d === null) unparseable++;
        else days.push(d);
      }
      const majority = Math.max(...patterns.values());
      const minority = total - majority;
      facts.txn_minority_date_format = minority;
      checks.push({
        id: 'txn_date_format',
        table: 'transactions',
        level: patterns.size > 1 ? 'warn' : 'ok',
        title: patterns.size > 1 ? `日期格式不一致：${minority} 筆和其他筆寫法不同` : '日期格式一致',
        detail:
          patterns.size > 1
            ? '同一欄混著不同的日期寫法（例如 2025-01-02T15:39:00 與 2025/01/02 15:39）。排序、算天數前一定要先統一，否則會算錯或被丟掉。這裡已統一轉成日期。'
            : '所有日期都是同一種寫法，可以直接排序與計算。',
        count: minority,
        total,
      });
      if (unparseable > 0) {
        checks.push({
          id: 'txn_date_unparseable',
          table: 'transactions',
          level: 'warn',
          title: `有 ${unparseable} 筆日期無法辨識，分析時已略過`,
          detail: '可能是空白、不存在的日期（例如 2 月 31 日），或目前不支援的寫法（例如民國年）。這些交易不會進入任何分析，請先修正再重跑。',
          count: unparseable,
          total,
        });
      }
      if (days.length > 0) {
        const min = Math.min(...days);
        const max = Math.max(...days);
        const p99 = quantile(days, 0.99);
        const far = max - p99 > 366;
        checks.push({
          id: 'txn_date_range',
          table: 'transactions',
          level: far ? 'warn' : 'info',
          title: `交易日期範圍：${new Date(min * 86400000).toISOString().slice(0, 10)} 至 ${new Date(max * 86400000).toISOString().slice(0, 10)}`,
          detail: far
            ? '最晚的日期離其他資料很遠，很可能是輸入錯誤。分群會以「資料最後一天」當基準日，一個過頭的日期會讓所有人都看起來像流失客，請先確認。'
            : '分群的「基準日」會用資料最後一天再加一天，不用今天，所以舊資料也能正常分析。',
        });
      }
    }

    if (iStore >= 0) {
      const counts: Record<string, number> = {};
      for (const r of tx.rows) counts[r[iStore] ?? ''] = (counts[r[iStore] ?? ''] ?? 0) + 1;
      facts.txn_store_codes = counts;
      const special = Object.entries(counts).filter(([code]) => /^\D*9{2,}$/.test(code));
      if (special.length) {
        const n = special.reduce((s, [, c]) => s + c, 0);
        checks.push({
          id: 'txn_store_special',
          table: 'transactions',
          level: 'info',
          title: `有看起來不是實體店的店別代碼：${special.map(([c, k]) => `${c}（${k} 筆）`).join('、')}`,
          detail: '像是 99 結尾的代碼，常是線上、系統或測試用途。要先問清楚它代表什麼，再決定要不要和實體門市放在一起比較。',
          count: n,
          total,
        });
      }
    }

    // 交易總額 vs 明細加總
    if (it && iId >= 0 && iAmt >= 0) {
      const iiId = colIndex(it, 'txn_id');
      const iiAmt = colIndex(it, 'line_amount');
      if (iiId >= 0 && iiAmt >= 0) {
        const sums = new Map<string, number>();
        for (const r of it.rows) sums.set(r[iiId], (sums.get(r[iiId]) ?? 0) + numOf(r[iiAmt]));
        let equal = 0;
        let minusDisc = 0;
        let other = 0;
        let noItems = 0;
        const reconOk = new Set<string>();
        for (const r of tx.rows) {
          const s = sums.get(r[iId]);
          if (s === undefined) {
            noItems++;
            continue;
          }
          const totalAmt = numOf(r[iAmt]);
          const disc = iDisc >= 0 ? numOf(r[iDisc]) : 0;
          if (Math.abs(totalAmt - s) < 1e-6) {
            equal++;
            reconOk.add(r[iId]);
          } else if (Math.abs(totalAmt - (s - disc)) < 1e-6) {
            minusDisc++;
            reconOk.add(r[iId]);
          } else other++;
        }
        facts.recon_equal = equal;
        facts.recon_equal_minus_discount = minusDisc;
        facts.recon_other = other;
        facts.txn_without_items = noItems;
        checks.push({
          id: 'recon',
          table: 'transactions',
          level: other > 0 ? 'warn' : 'ok',
          title:
            other === 0
              ? `交易總額與明細對得上（${equal} 筆相等、${minusDisc} 筆為「明細 − 折扣」${noItems > 0 ? `；另有 ${noItems} 筆沒有明細，無法對帳` : ''}）`
              : `有 ${other} 筆交易總額對不上明細`,
          detail:
            other === 0
              ? `拿「交易總額」和「明細加總」對帳，有明細的交易全部吻合，代表這兩個檔案可以放心串在一起。（折扣筆的差額剛好等於折扣金額。）${noItems > 0 ? '沒有明細的交易只能算整體營收，無法做商品層級分析。' : ''}`
              : '這些交易的總額既不等於明細加總、也不等於「加總 − 折扣」。先查清楚原因（漏匯出？手動改價？）再做商品層級的分析。',
          count: other,
          total: tx.rows.length - noItems,
        });

        // ── txn_items 重複列 ──
        const seen = new Set<string>();
        const dupTxn = new Map<string, number>();
        let dupRows = 0;
        for (const r of it.rows) {
          const key = r.join('\u001f');
          if (seen.has(key)) {
            dupRows++;
            dupTxn.set(r[iiId], (dupTxn.get(r[iiId]) ?? 0) + 1);
          } else seen.add(key);
        }
        let legit = 0;
        for (const [txn, k] of dupTxn) if (reconOk.has(txn)) legit += k;
        facts.items_exact_duplicate_rows = dupRows;
        facts.items_duplicate_rows_reconcile = legit;
        if (dupRows > 0) {
          checks.push({
            id: 'items_duplicates',
            table: 'txn_items',
            level: legit === dupRows ? 'info' : 'warn',
            title: `明細有 ${dupRows} 列「完全一樣」的重複列${legit === dupRows ? '，但都是合法的' : `，其中 ${dupRows - legit} 列對不上帳`}`,
            detail:
              legit === dupRows
                ? '同一張單買了兩件同樣的商品，系統就會匯出兩列一模一樣的資料。這些重複列算進去之後，交易總額剛好對得上，所以它們是真的、不是髒資料。**不能無腦去重**，否則會少算銷量。'
                : '有些完全重複的明細列，算進去後交易總額對不上，可能是真的重複匯出。請逐筆確認後再去重。',
            count: dupRows,
            total: it.rows.length,
          });
        }
      }
    }
  }

  // ── members ─────────────────────────────────────────────────
  const mb = tables.members;
  if (mb) {
    const total = mb.rows.length;
    const iEmail = colIndex(mb, 'email');
    const iBirth = colIndex(mb, 'birth_year');
    if (iEmail >= 0) {
      const raw = mb.rows.map((r) => (r[iEmail] ?? '').toString());
      const empty = raw.filter((v) => v.trim() === '').length;
      const dirty = raw.filter((v) => v.trim() !== '' && v !== v.trim().toLowerCase()).length;
      const groups = new Map<string, number>();
      for (const v of raw) {
        const k = v.trim().toLowerCase();
        if (k) groups.set(k, (groups.get(k) ?? 0) + 1);
      }
      const shared = [...groups.values()].filter((c) => c >= 2);
      facts.members_email_empty = empty;
      facts.members_email_dirty = dirty;
      facts.members_email_shared_groups = shared.length;
      facts.members_email_shared_members = shared.reduce((s, c) => s + c, 0);
      checks.push({
        id: 'members_email',
        table: 'members',
        level: shared.length > 0 || dirty > 0 ? 'warn' : 'info',
        title: `email：${empty} 筆空白、${dirty} 筆大小寫或空白不一致、${shared.length} 組帳號共用同一個 email`,
        detail:
          '大小寫與前後空白不同，會讓同一個 email 看起來像兩個人。整理後有幾組會員共用同一個 email，常見原因是重複開卡——同一個人被當成兩個會員，會讓分群與回購週期偏差。email 本身屬個資，分析時不需要，預設不納入。',
        count: shared.length,
        total,
      });
    }
    if (iBirth >= 0) {
      const n = mb.rows.filter((r) => (r[iBirth] ?? '').trim() === '').length;
      facts.members_birth_year_empty = n;
      checks.push({
        id: 'members_birth_year',
        table: 'members',
        level: n > 0 ? 'info' : 'ok',
        title: `出生年空白 ${n} 筆（${pct(n, total)}）`,
        detail: '年齡帶的分析會排除這些人，並在結果旁標註樣本數；不要用平均值硬補。',
        count: n,
        total,
      });
    }
  }

  const pii = scanPii(tables);

  const decisions = [
    { rule: '匿名交易不進客戶分析', why: '沒有會員編號就不知道是誰，無法算 R／F／M。營收仍計入整體。' },
    { rule: '退貨不算一次購買', why: '退貨不增加購買頻次、不當成最近消費日；但會從該顧客的消費金額扣除。' },
    { rule: '日期統一轉成日期（不看時分）', why: '混用的寫法先統一，才能排序與計算天數。' },
    { rule: '不對明細做無腦去重', why: '同單買兩件會產生一模一樣的兩列；先用交易總額對帳，確認是合法重複再保留。' },
    { rule: '個資欄位預設不納入分析與提示詞', why: 'email、電話、姓名分析不需要；要複製給 AI 工具的內容只含彙總數字。' },
    { rule: '基準日＝資料最後一天 + 1', why: '用資料本身的最後一天而不是「今天」，否則舊資料會全部看起來像流失客。' },
  ];

  return { report: { checks, pii, decisions, rows }, facts };
}
