// 顧客數據戰情室自檢：以獨立（Python）算出的參考答案比對 TypeScript 實作，加上合成邊界案例。
// 用法：npx tsx scripts/check-datalab.mjs   （日晴資料路徑可用環境變數 SUNLIT_DATA 指定）
import { readFileSync, existsSync } from 'node:fs';
import { parseCSV, toTable, decodeBuffer } from '../src/lib/datalab/csv.ts';
import { parseDay, buildDatasetFromSunlitSchema } from '../src/lib/datalab/normalize.ts';
import { runHealth } from '../src/lib/datalab/health.ts';
import { runRfm, repurchaseIntervals, classify, customerStats } from '../src/lib/datalab/rfm.ts';
import { detectMapping, mappingToNames, mappingFromNames, templateCsv, missingFor } from '../src/lib/datalab/detect.ts';
import { buildDatasetFromMapping, parseFlexibleDay, parseAmount } from '../src/lib/datalab/normalize.ts';
import { runHealthOwn } from '../src/lib/datalab/health-own.ts';
import { runTouchpoints } from '../src/lib/datalab/touchpoints.ts';
import { compareClaim, parseClaim, expectedValues } from '../src/lib/datalab/check.ts';
import { buildReport, reportToText } from '../src/lib/datalab/report.ts';
import { segments as workshopSegments, fillPrompt } from '../src/data/workshop.ts';
import { scanPii, mask } from '../src/lib/datalab/pii.ts';
import { quantile, median } from '../src/lib/datalab/stats.ts';
import { segmentInfo } from '../src/data/datalab.ts';

const errors = [];
// 比較時忽略物件鍵的順序
const norm = (v) =>
  v && typeof v === 'object' && !Array.isArray(v)
    ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, norm(v[k])]))
    : Array.isArray(v) ? v.map(norm) : v;
const eq = (label, got, want) => {
  if (JSON.stringify(norm(got)) !== JSON.stringify(norm(want))) errors.push(`${label}: 得到 ${JSON.stringify(got)}，應為 ${JSON.stringify(want)}`);
};
// Node 讀小檔案時 buf.buffer 會帶到共用記憶體池，必須依 byteOffset 切出這個檔案自己的位元組
const bytesOf = (buf) => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

// ── 合成邊界案例（不需要日晴資料） ──────────────────────────────
eq('csv 基本', parseCSV('a,b\n1,2\n'), [['a', 'b'], ['1', '2']]);
eq('csv BOM+CRLF', parseCSV('﻿a,b\r\n1,2\r\n'), [['a', 'b'], ['1', '2']]);
eq('csv 引號逗號與跳脫', parseCSV('a,b\n"x,y","he said ""hi"""\n'), [['a', 'b'], ['x,y', 'he said "hi"']]);
eq('csv 引號內換行', parseCSV('a,b\n"line1\nline2",z\n'), [['a', 'b'], ['line1\nline2', 'z']]);
eq('csv 分號分隔', parseCSV('a;b\n1;2\n'), [['a', 'b'], ['1', '2']]);
eq('csv Tab 分隔', parseCSV('a\tb\n1\t2\n'), [['a', 'b'], ['1', '2']]);
eq('csv 末行無換行', parseCSV('a,b\n1,2'), [['a', 'b'], ['1', '2']]);
eq('csv 空欄位', parseCSV('a,b,c\n1,,3\n'), [['a', 'b', 'c'], ['1', '', '3']]);
eq('csv 欄位中間的引號不是開頭', parseCSV('name,qty\nTV 5" wide,1\nx,2\n'), [['name', 'qty'], ['TV 5" wide', '1'], ['x', '2']]);
// Big5：「會員」的 Big5 位元組
eq('Big5 解碼', decodeBuffer(new Uint8Array([0xb7, 0x7c, 0xad, 0xfb]).buffer), '會員');
eq('UTF-8 解碼', decodeBuffer(new TextEncoder().encode('會員').buffer), '會員');
eq('parseDay ISO', parseDay('2025-01-01T21:37:00'), parseDay('2025/1/1 08:00'));
eq('parseDay 不合法', parseDay('abc'), null);
eq('parseDay 不存在的日期（2/31）', parseDay('2025-02-31'), null);
eq('parseDay 不存在的月份', parseDay('2025-13-01'), null);
eq('parseDay 閏日', [parseDay('2024-02-29') !== null, parseDay('2025-02-29')], [true, null]);
eq('分位數', [quantile([1, 2, 3, 4], 0.25), quantile([1, 2, 3, 4], 0.75), median([5, 1, 3])], [1.75, 3.25, 3]);
eq('mask email', mask('tsai.yijun27@icloud.com'), 't***@i***.com');
eq('mask 姓名只留一個字', mask('王小明'), '王***');

// RFM 同值手算：3 位顧客，N=3
{
  const mk = (id, day, amt, ret = false) => ({ id: `${id}-${day}-${amt}`, customerId: id, day, amount: amt, isReturn: ret });
  const ds = {
    source: 'sample',
    asOf: 101,
    txns: [
      mk('A', 100, 500), mk('A', 90, 500), mk('A', 80, 500), // F=3, M=1500, R=1
      mk('B', 50, 200), // F=1, M=200, R=51
      mk('C', 50, 200), // 與 B 完全同值
      mk('C', 60, 300, true), // C 的退貨不算購買、金額從 M 扣：M=max(0,200-300)=0 …但退貨為負
      { id: 'anon', customerId: null, day: 100, amount: 999, isReturn: false },
    ],
  };
  // 退貨金額應為負值
  ds.txns[5].amount = -150;
  const r = runRfm(ds);
  const byId = Object.fromEntries(r.customers.map((c) => [c.id, c]));
  eq('RFM 顧客數（匿名排除）', r.customers.length, 3);
  eq('RFM A', [byId.A.r, byId.A.f, byId.A.m], [1, 3, 1500]);
  eq('RFM C 退貨扣款', [byId.C.f, byId.C.m], [1, 50]);
  eq('RFM 排除統計', r.excluded, { anonymous: 1, returns: 1 });
  // N=3：A 的 F/M 是最大 → 5 分；R 最近 → 5 分
  eq('RFM A 分數', [byId.A.rScore, byId.A.fScore, byId.A.mScore], [5, 5, 5]);
}
eq('分群 冠軍', classify(5, 5, 7), 'champion');
eq('分群 新客潛力', classify(5, 1, 1), 'newPotential');
eq('分群：最近才第一次買、但金額高 → 新客潛力（不是冠軍／忠誠）', classify(5, 5, 1), 'newPotential');
eq('分群：R3 只買一次、FM 高 → 需關注（不是忠誠）', classify(3, 4, 1), 'attention');
eq('分群：忠誠要買過兩次', classify(3, 3, 2), 'loyal');
eq('分群：最近有買、買過多次、但 FM 低 → 需關注（不掉到流失）', classify(5, 2, 3), 'attention');
eq('分群 高價值快流失', classify(1, 5, 9), 'atRiskBig');
eq('分群 沉睡', classify(2, 2, 3), 'dormant');
eq('分群 流失', classify(1, 1, 1), 'lost');
// 規則涵蓋所有組合：最近有買（R>=3）的人不可被分到沉睡或流失
for (let r = 1; r <= 5; r++) for (let fm = 1; fm <= 5; fm++) for (const f of [1, 2, 5]) {
  const k = classify(r, fm, f);
  if (!k) errors.push(`分群沒有涵蓋 R${r} FM${fm} F${f}`);
  if (r >= 3 && (k === 'lost' || k === 'dormant')) errors.push(`最近有買（R${r}）卻被分到 ${k}`);
}

// PII：不同型態
{
  const t = toTable('t', 'email,phone,tw_id,card,hash,note\na@b.com,0912-345-678,A123456789,4111111111111111,9e129820293d3844,hi\nc@d.org,0922333444,B223456789,5500005555555559,7e1f1827b5434cec,yo\n');
  const kinds = Object.fromEntries(scanPii({ t }).map((f) => [f.column, f.kind]));
  eq('PII 偵測', kinds, { email: 'email', phone: 'phone', tw_id: 'national_id', card: 'card', hash: 'hash' });
  const samples = scanPii({ t }).map((f) => f.maskedSample).join('|');
  if (/a@b\.com|4111111111111111|A123456789/.test(samples)) errors.push('PII 範例沒有遮罩');
  // 市話寫法、純數字長編號（不是雜湊）、product_name（不是姓名）、準識別碼不顯示範例
  const t2 = toTable('t2', 'tel,order_no,product_name,name,birth_year\n02-2345-6789,1234567890123456,保濕乳液,王小明,1989\n(02)23456789,1234567890123457,洗面乳,李小華,1990\n');
  const f2 = scanPii({ t2 });
  eq('PII 市話／數字編號／欄名', Object.fromEntries(f2.map((f) => [f.column, f.kind])), { tel: 'phone', name: 'name', birth_year: 'quasi' });
  if (f2.find((f) => f.column === 'birth_year')?.maskedSample !== '') errors.push('準識別碼不應顯示範例');
  if (f2.find((f) => f.column === 'name')?.maskedSample !== '王***') errors.push('姓名遮罩應只留一個字');
}

// ── 自有資料：欄位偵測、轉換、健檢 ───────────────────────────────
{
  // 範本本身必須能被偵測為「全部確定」並轉成可用的 Dataset
  const t = toTable('範本', templateCsv());
  const m = detectMapping(t);
  eq('範本欄位偵測', Object.fromEntries(Object.entries(m).filter(([, g]) => g.col >= 0).map(([k, g]) => [k, [t.headers[g.col], g.confidence]])), {
    customerId: ['customer_id', 'sure'], date: ['date', 'sure'], amount: ['amount', 'sure'], orderId: ['order_id', 'sure'],
    product: ['product', 'sure'], category: ['category', 'sure'], isReturn: ['is_return', 'sure'], store: ['store', 'sure'],
  });
  const b = buildDatasetFromMapping(t, m);
  eq('範本：單號重複 → 明細解讀', b.stats.lineLevel, true);
  eq('範本：交易數（A0001 兩列合成一筆）', b.dataset.txns.length, 4);
  eq('範本：A0001 金額加總', b.dataset.txns.find((x) => x.id === 'A0001').amount, 1000);
  eq('範本：退貨（旗標且金額負）', b.dataset.txns.find((x) => x.id === 'A0004').isReturn, true);
  eq('範本：匿名交易', b.dataset.txns.find((x) => x.id === 'A0003').customerId, null);
  eq('範本：缺欄位判斷', missingFor(m, ['customerId', 'date', 'amount', 'product']).length, 0);
  const h = runHealthOwn(t, m, b, b.dataset);
  eq('自有健檢：匿名 1、退貨 1', [h.facts.anonymous, h.facts.returns], [1, 1]);
  eq('自有健檢：樣本太小要警告', h.report.checks.some((c) => c.id === 'own_small'), true);
}
{
  // 中文欄名、民國年、Excel 序號、NT$ 與括號負數、通路欄
  const t = toTable('中文', '訂單編號,交易日期,會員編號,商品名稱,銷售金額,退貨,通路\nT1,114/01/02,M1,乳液,"NT$1,200",否,門市\nT2,114/01/05,M1,洗面乳,(300),是,線上\nT3,114/02/01,,乳液,680,否,門市\n');
  const m = detectMapping(t);
  eq('中文欄名偵測', Object.fromEntries(Object.entries(m).filter(([, g]) => g.col >= 0).map(([k, g]) => [k, t.headers[g.col]])), {
    customerId: '會員編號', date: '交易日期', amount: '銷售金額', orderId: '訂單編號', product: '商品名稱', isReturn: '退貨', channel: '通路',
  });
  const b = buildDatasetFromMapping(t, m);
  eq('中文：金額解析與退貨', b.dataset.txns.map((x) => [x.id, x.amount, x.isReturn]), [['T1', 1200, false], ['T2', -300, true], ['T3', 680, false]]);
  eq('中文：民國年', b.dataset.txns[0].day, parseFlexibleDay('2025-01-02'));
  eq('中文：以逐筆解讀（單號不重複）', b.stats.lineLevel, false);
  // 欄名記憶：隔天用同一種格式重傳時自動套用
  const names = mappingToNames(t, m);
  const again = mappingFromNames(t, names);
  eq('欄名記憶可還原', again.amount.col, m.amount.col);
}
{
  // 沒有任何有用欄名：日期靠樣式猜，其餘找不到並明確回報缺欄位
  const t = toTable('亂欄名', 'a,b,c\nx,2025-01-02,100\ny,2025-01-03,200\n');
  const m = detectMapping(t);
  eq('無欄名：日期用值猜', [t.headers[m.date.col], m.date.confidence], ['b', 'guess']);
  eq('無欄名：缺顧客與金額', missingFor(m, ['customerId', 'date', 'amount']), ['customerId', 'amount']);
  eq('缺欄位不建立 Dataset', buildDatasetFromMapping(t, m).dataset, null);
  // 單價不是交易金額
  const t2 = toTable('單價', 'customer,date,unit_price,total_amount\nA,2025-01-02,10,30\n');
  eq('單價 vs 總額', t2.headers[detectMapping(t2).amount.col], 'total_amount');
  eq('顧客名稱不是顧客編號', t2 && detectMapping(toTable('n', 'customer_name,date,amount\nA,2025-01-02,5\n')).customerId.col, -1);
}
// 接觸點（日晴完整資料）與工作坊核對數字

// ── 工作坊：核對與報告 ──────────────────────────────────────────
{
  const spec = (u) => ({ id: 'x', label: 'x', unit: u, hint: '' });
  eq('核對：筆數必須完全一致', [compareClaim(spec('count'), '1,817 筆', 1817).status, compareClaim(spec('count'), '1800', 1817).status], ['match', 'off']);
  eq('核對：百分比容許 ±1 個百分點', [compareClaim(spec('percent'), '63%', 63.01).status, compareClaim(spec('percent'), '60%', 63.01).status], ['match', 'off']);
  eq('核對：百分比寫成小數', parseClaim('0.63', 'percent', 63.0), 63);
  eq('核對：天數 ±1', [compareClaim(spec('days'), '49 天', 48).status, compareClaim(spec('days'), '60', 48).status], ['match', 'off']);
  eq('核對：空白或無數字', [compareClaim(spec('count'), '', 5).status, compareClaim(spec('count'), '不知道', 5).status], ['empty', 'empty']);
  // 每個工作坊段落的檢核項都必須有對應的標準答案
  const okKeys = new Set(['memberShare', 'anonymousCount', 'returnCount', 'onceOnly', 'top20Share', 'medianInterval']);
  for (const seg of workshopSegments) for (const c of seg.checks ?? []) if (!okKeys.has(c.id)) errors.push(`段落 ${seg.id} 的檢核項 ${c.id} 沒有標準答案`);
  eq('提示詞欄位代入', fillPrompt('欄位：{columns}', ['a', 'b']), '欄位：a、b');
  const ids = workshopSegments.map((s) => s.id);
  eq('段落 id 不重複', new Set(ids).size, ids.length);
}

// ── 日晴資料：對照獨立算出的參考答案 ────────────────────────────
const dir = process.env.SUNLIT_DATA ?? '/home/user/589411/sunlit-site/data';
if (!existsSync(`${dir}/transactions.csv`)) {
  console.log(`⚠️ 找不到日晴資料（${dir}），只跑了合成案例。`);
} else {
  const exp = JSON.parse(readFileSync(new URL('./fixtures/datalab-expected.json', import.meta.url), 'utf8'));
  const tables = {};
  for (const f of ['members', 'transactions', 'txn_items', 'campaign_targets', 'campaigns', 'products']) {
    tables[f] = toTable(f, decodeBuffer(bytesOf(readFileSync(`${dir}/${f}.csv`))));
  }
  for (const f of Object.keys(exp.rows)) eq(`rows.${f}`, tables[f].rows.length, exp.rows[f]);

  const { report, facts } = runHealth(tables);
  eq('txn_anonymous', facts.txn_anonymous, exp.txn_anonymous);
  eq('txn_returns', facts.txn_returns, exp.txn_returns);
  eq('txn_returns_with_member', facts.txn_returns_with_member, exp.txn_returns_with_member);
  eq('txn_minority_date_format', facts.txn_minority_date_format, exp.txn_slash_dates);
  eq('txn_store_codes', facts.txn_store_codes, exp.txn_store_codes);
  eq('items 重複列', facts.items_exact_duplicate_rows, exp.items_exact_duplicate_rows);
  eq('recon_equal', facts.recon_equal, exp.recon_equal);
  eq('recon_equal_minus_discount', facts.recon_equal_minus_discount, exp.recon_equal_minus_discount);
  eq('recon_other', facts.recon_other, exp.recon_other);
  eq('txn_without_items', facts.txn_without_items, exp.txn_without_items);
  eq('members_email_empty', facts.members_email_empty, exp.members_email_empty);
  eq('members_email_dirty', facts.members_email_dirty, exp.members_email_dirty);
  eq('members_email_shared_groups', facts.members_email_shared_groups, exp.members_email_shared_groups);
  eq('members_email_shared_members', facts.members_email_shared_members, exp.members_email_shared_members);
  eq('members_birth_year_empty', facts.members_birth_year_empty, exp.members_birth_year_empty);
  if (!report.pii.some((p) => p.table === 'members' && p.column === 'email' && p.kind === 'email')) errors.push('PII 沒偵測到 members.email');
  if (!report.pii.some((p) => p.column === 'phone_hash' && p.kind === 'hash')) errors.push('PII 沒偵測到 members.phone_hash');
  if (!report.checks.some((c) => c.id === 'items_duplicates' && c.level === 'info')) errors.push('重複明細應判為「合法」(info)');

  const { dataset, error } = buildDatasetFromSunlitSchema(tables, 'sunlit');
  if (!dataset) errors.push(`buildDataset 失敗：${error}`);
  else {
    const res = runRfm(dataset);
    eq('rfm.asOf', dataset.asOf, exp.rfm.asOf_day);
    eq('rfm.customers', res.customers.length, exp.rfm.customers);
    eq('rfm.F=1', res.customers.filter((c) => c.f === 1).length, exp.rfm.customers_F_eq_1);
    eq('rfm.F>=2', res.customers.filter((c) => c.f >= 2).length, exp.rfm.customers_F_ge_2);
    for (const s of res.segments) {
      const name = segmentInfo[s.key].name;
      const e = exp.rfm[name];
      if (!e) {
        errors.push(`參考答案缺客群 ${name}`);
        continue;
      }
      eq(`${name}.count`, s.count, e.count);
      eq(`${name}.sumM`, s.sumM, e.sum_M);
      eq(`${name}.medianR`, s.medianR, e.median_R_days);
      eq(`${name}.medianF`, s.medianF, e.median_F);
      eq(`${name}.medianM`, s.medianM, e.median_M);
    }
    const byId = Object.fromEntries(res.customers.map((c) => [c.id, c]));
    for (const s of exp.rfm.sample) {
      const c = byId[s.member_id];
      eq(`sample ${s.member_id}`, c && [c.r, c.f, c.m, c.rScore, c.fScore, c.mScore, c.fm, segmentInfo[c.segment].name], [s.R_days, s.F, s.M, s.R_score, s.F_score, s.M_score, s.FM, s.segment]);
    }
    const cst = customerStats(res, dataset);
    eq('customerStats.onceOnly', cst.onceOnly, exp.rfm.customers_F_eq_1);
    eq('customerStats.top20Share（獨立計算 0.63014…）', Math.round(cst.top20Share * 10000) / 10000, 0.6301);
    eq('customerStats.medianInterval', cst.medianInterval, exp.repurchase.median);
    const tp = runTouchpoints(dataset);
    eq('接觸點：匿名交易', tp.anonymousTxns, exp.txn_anonymous);
    eq('接觸點：門市筆數', Object.fromEntries(tp.byStore.map((x) => [x.label, x.count])), exp.txn_store_codes);
    eq('接觸點：每月合計等於交易數', tp.monthly.reduce((s, x) => s + x.count, 0), dataset.txns.length);
    // 報告：預設不含金額；勾選才含；摘要文字不得出現個資欄位的值
    const tpR = runTouchpoints(dataset);
    const input = { sourceLabel: '日晴完整資料', dataset, health: report, rfm: res, touch: tpR, notes: { d1s1: '匿名交易太多' }, claims: { 'd1s1.memberShare': '70%', 'd1s2.anonymousCount': '1817' } };
    const rep = buildReport(input, { showAmounts: false });
    eq('報告：預設不含金額', [rep.revenue, rep.segments.every((x) => x.sumM === undefined)], [undefined, true]);
    eq('報告：含金額時才有', buildReport(input, { showAmounts: true }).revenue !== undefined, true);
    eq('報告：核對結果', rep.checks.map((c) => c.status), ['off', 'match']);
    const txt = reportToText(rep);
    if (/NT\$/.test(txt)) errors.push('預設的摘要文字不應出現金額');
    if (/@icloud|@gmail|@yahoo/.test(txt)) errors.push('摘要文字出現 email');
    if (!txt.includes('匿名交易太多')) errors.push('摘要文字少了學員的心得');
    const iv = repurchaseIntervals(dataset);
    eq('repurchase.n', iv.length, exp.repurchase.intervals_n);
    eq('repurchase.median', median(iv), exp.repurchase.median);
    eq('repurchase.p25', quantile(iv, 0.25), exp.repurchase.p25);
    eq('repurchase.p75', quantile(iv, 0.75), exp.repurchase.p75);
  }
}

if (errors.length) {
  console.error('❌ 戰情室自檢失敗:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log('✅ 戰情室自檢通過（合成案例＋日晴參考答案比對）');
