import type { PiiFinding, PiiKind, Table } from './types';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^(?:\+?886[-\s]?|0)(?:9\d{2}[-\s]?\d{3}[-\s]?\d{3}|[2-8][-\s]?\d{7,8})$/;
const NATIONAL_ID = /^[A-Z][12]\d{8}$/;
const HEX_HASH = /^[0-9a-f]{16,}$/i;

const NAME_HINT = /(姓名|真實姓名|客戶名稱|顧客名稱|\bname\b|full_?name|customer_?name)/i;
const ADDRESS_HINT = /(地址|住址|address|addr)/i;
const QUASI_HINT = /(birth|生日|出生|gender|sex|性別|zip|郵遞區號)/i;

function luhn(digits: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits.charCodeAt(i) - 48;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function isCard(v: string): boolean {
  const d = v.replace(/[\s-]/g, '');
  return /^\d{13,19}$/.test(d) && luhn(d);
}

/** 遮罩：email 留首字與網域；其餘只留前兩碼。絕不回傳原值 */
export function mask(v: string): string {
  const s = v.trim();
  const at = s.indexOf('@');
  if (at > 0) return `${s[0]}***${s.slice(at)}`;
  return `${s.slice(0, 2)}***`;
}

const NOTES: Record<PiiKind, string> = {
  email: '可直接識別個人。分析時不需要它，預設不納入。',
  phone: '可直接識別個人。分析時不需要它，預設不納入。',
  national_id: '身分證字號屬高度敏感個資，請勿放進任何分析或貼給 AI 工具。',
  card: '疑似信用卡號，請務必移除後再分析。',
  hash: '看起來是雜湊或編碼後的值（假名化）。它不等於匿名：同一個值仍能串回同一個人。',
  name: '欄名看起來是姓名，請移除或改用代號。',
  address: '欄名看起來是地址，請移除或只保留縣市區。',
  quasi: '單獨看不一定能識別，但和其他欄位交叉後可能指認到個人（準識別碼）。',
};

export function scanPii(tables: Record<string, Table>): PiiFinding[] {
  const out: PiiFinding[] = [];
  for (const t of Object.values(tables)) {
    t.headers.forEach((h, ci) => {
      const sample: string[] = [];
      for (const r of t.rows) {
        const v = (r[ci] ?? '').trim();
        if (v !== '') sample.push(v);
        if (sample.length >= 500) break;
      }
      const hit = (fn: (v: string) => boolean) => (sample.length ? sample.filter(fn).length / sample.length : 0);
      const first = (fn: (v: string) => boolean) => sample.find(fn) ?? '';

      let kind: PiiKind | null = null;
      let rate = 0;
      let eg = '';
      const tests: [PiiKind, (v: string) => boolean, number][] = [
        ['email', (v) => EMAIL.test(v), 0.5],
        ['national_id', (v) => NATIONAL_ID.test(v), 0.5],
        ['phone', (v) => PHONE.test(v), 0.5],
        ['card', isCard, 0.8],
        ['hash', (v) => HEX_HASH.test(v), 0.5],
      ];
      for (const [k, fn, min] of tests) {
        const r = hit(fn);
        if (r >= min) {
          kind = k;
          rate = r;
          eg = first(fn);
          break;
        }
      }
      if (!kind) {
        if (NAME_HINT.test(h)) kind = 'name';
        else if (ADDRESS_HINT.test(h)) kind = 'address';
        else if (QUASI_HINT.test(h)) kind = 'quasi';
        if (kind) eg = sample[0] ?? '';
      }
      if (kind) {
        out.push({
          table: t.name,
          column: h,
          kind,
          rate,
          maskedSample: eg ? mask(eg) : '',
          note: NOTES[kind],
        });
      }
    });
  }
  return out;
}
