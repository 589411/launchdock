import type { Mapping } from './detect';
import { FIELD_LABEL } from './detect';
import { PERIOD_HEADER, PROFILE_HEADER } from '../../data/import-profiles';

export type StructureKind = 'flat' | 'noCustomer' | 'pivot' | 'members' | 'items' | 'unknown';

export interface Diagnosis {
  kind: StructureKind;
  title: string;
  /** 為什麼這樣判斷、這型資料的本質是什麼 */
  explain: string;
  /** 這份資料「能做什麼」（誠實說明，包含做不到的） */
  canDo: string;
  /** 下一步怎麼做 */
  steps: string[];
}

/**
 * 依欄名與欄位對應判斷檔案屬於哪一型，並用白話說明下一步。
 * 只看欄名，不看資料內容，所以可以放心複製給別人。
 */
export function diagnoseStructure(headers: string[], m: Mapping): Diagnosis {
  const has = (k: keyof Mapping) => m[k].col >= 0;
  const canAmount = has('amount') || (has('quantity') && has('unitPrice'));
  const periods = headers.filter((h) => PERIOD_HEADER.test(h.trim())).length;
  const profile = headers.filter((h) => PROFILE_HEADER.test(h)).length;

  if (periods >= 3 && !has('date')) {
    return {
      kind: 'pivot',
      title: '這看起來是「報表式」資料（橫軸是月份或年度）',
      explain: '橫軸是時間、每一列是商品或門市的彙總。這種報表沒有「每一筆交易」，也沒有顧客。',
      canDo: '做不了顧客分群、回購週期這類顧客層級的分析；只能看商品與月份的趨勢。',
      steps: [
        '請 ERP 或系統改匯出「銷售明細」：每一筆交易一列，要有日期、金額，最好有顧客編號。',
        '如果只能拿到這份報表：它仍然可以用來檢查營收趨勢，但無法進入顧客分析。這時建議改用示範資料來練習流程。',
      ],
    };
  }
  if (has('customerId') && !canAmount && !has('date') && profile >= 2) {
    return {
      kind: 'members',
      title: '這看起來是「會員主檔」',
      explain: '只有會員的個人資料，沒有交易紀錄。',
      canDo: '單獨一份會員主檔做不了分析；它要和「交易明細」用顧客編號串起來才有用。',
      steps: [
        '另外準備一份交易明細：每筆交易有日期、金額、顧客編號。',
        '目前請先上傳交易明細。多個檔案自動串接的功能尚未提供；需要的話，請先用 Excel 把兩份合併成一張再上傳。',
      ],
    };
  }
  if (has('orderId') && (has('product') || has('quantity') || has('unitPrice')) && !has('date') && !has('customerId')) {
    return {
      kind: 'items',
      title: '這看起來是「訂單明細」（缺日期與顧客）',
      explain: '有單號與商品，但沒有日期和顧客。這通常是另一份「訂單主檔」的明細部分。',
      canDo: '單獨一份明細做不了顧客分析；它要和訂單主檔用單號串起來。',
      steps: [
        '請找出同一批單號的「訂單主檔」（有日期與顧客編號）。',
        '多個檔案自動串接的功能尚未提供；請先用 Excel（XLOOKUP 或 Power Query）依單號把日期與顧客帶進明細，合併成一張再上傳。',
      ],
    };
  }
  if (!has('customerId') && has('date') && canAmount) {
    return {
      kind: 'noCustomer',
      title: '有日期和金額，但沒有顧客編號',
      explain: '分群、回購週期這類分析一定要知道「是誰買的」。沒有顧客欄位，就只知道賣了多少、什麼時候賣的。',
      canDo: '現在只能看營收與時間的趨勢；顧客層級的分析做不了。',
      steps: [
        '如果有會員卡號、手機、LINE ID、email 任何一個，請整理成一欄當作顧客編號。',
        '用手機或 email 當編號時，建議在 Excel 裡先換成代號（例如 C001），不要把真實手機留在上傳的檔案裡。',
        '如果結帳時根本沒有記錄顧客：這份資料先用來練習流程，並從現在開始蒐集顧客編號。',
      ],
    };
  }
  if (has('customerId') && has('date') && canAmount) {
    return {
      kind: 'flat',
      title: '這是一張可分析的交易表',
      explain: '有顧客、日期、金額。',
      canDo: '可以進行資料健檢、接觸點與顧客分群。',
      steps: ['請確認下面每個欄位的對應是否正確。'],
    };
  }
  const missing = (['customerId', 'date', 'amount'] as const).filter((k) => (k === 'amount' ? !canAmount : !has(k)));
  return {
    kind: 'unknown',
    title: '無法辨識這份檔案的類型',
    explain: `必要的欄位還缺：${missing.map((k) => FIELD_LABEL[k]).join('、')}。`,
    canDo: '在補上必要欄位之前，無法進行分析。',
    steps: [
      '先手動在上面的下拉選單指定對應的欄位（如果你的檔案裡其實有）。',
      '確認第一列是欄位名稱，而且資料是「一列一筆交易」。',
    ],
  };
}

export interface DiagnosticInput {
  fileType: 'csv' | 'xlsx' | '未知';
  rowCount: number;
  /** 欄名；沒有標題列（第一列其實是資料）時必須是 null，欄名就是資料，不能出現在報告裡 */
  headers: string[] | null;
  mapping?: Mapping;
  note?: string;
}

/**
 * 給講師或開發者的診斷報告：欄位名稱、偵測結果、判斷的檔案類型。
 * 不含檔名、不含任何資料列的內容。
 */
export function buildDiagnosticReport(inp: DiagnosticInput): string {
  const L: string[] = ['【欄位診斷報告】（只含欄位名稱，沒有任何資料內容）'];
  L.push(`檔案格式：${inp.fileType}；資料列數：${inp.rowCount.toLocaleString()}`);
  if (inp.note) L.push(`狀況：${inp.note}`);
  if (inp.headers === null) {
    L.push('欄位名稱：（第一列看起來是資料而不是欄名，為保護個資不列出）');
    return L.join('\n');
  }
  L.push(`欄位數：${inp.headers.length}`);
  L.push('欄位名稱：');
  inp.headers.forEach((h, i) => L.push(`  ${i + 1}. ${h || '（沒有名稱）'}`));
  if (inp.mapping) {
    const m = inp.mapping;
    L.push('偵測結果：');
    const used = new Set<number>();
    for (const [k, g] of Object.entries(m)) {
      if (g.col >= 0) {
        used.add(g.col);
        L.push(`  ${FIELD_LABEL[k as keyof Mapping]} → ${inp.headers[g.col]}（${g.confidence === 'sure' ? '確定' : '猜的'}）`);
      } else L.push(`  ${FIELD_LABEL[k as keyof Mapping]} → （沒找到）`);
    }
    const rest = inp.headers.filter((_, i) => !used.has(i));
    if (rest.length) L.push(`未對應的欄位：${rest.join('、')}`);
    const d = diagnoseStructure(inp.headers, m);
    L.push(`判斷的檔案類型：${d.title}`);
  }
  return L.join('\n');
}

/** 把貼上的文字拆成多組欄名：組與組之間用單獨一行 --- 或連續兩個空行分隔；一組內可用逗號、Tab、頓號或換行分隔 */
export function parseHeaderBlocks(text: string): string[][] {
  const blocks = text.split(/\r?\n\s*---+\s*\r?\n|\r?\n\s*\r?\n\s*\r?\n/);
  return blocks
    .map((b) =>
      b
        .split(/[\t,，、\r\n]+/)
        .map((h) => h.trim())
        .filter(Boolean),
    )
    .filter((h) => h.length > 0);
}

