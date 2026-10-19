// 顧客數據戰情室自檢：以獨立（Python）算出的參考答案比對 TypeScript 實作，加上合成邊界案例。
// 用法：npx tsx scripts/check-datalab.mjs   （日晴資料路徑可用環境變數 SUNLIT_DATA 指定）
import { readFileSync, existsSync } from 'node:fs';
import { parseCSV, toTable, decodeBuffer, tableFromRows, looksLikeDataHeaders } from '../src/lib/datalab/csv.ts';
import { parseDay, buildDatasetFromSunlitSchema } from '../src/lib/datalab/normalize.ts';
import { runHealth } from '../src/lib/datalab/health.ts';
import { runRfm, repurchaseIntervals, classify, customerStats } from '../src/lib/datalab/rfm.ts';
import { detectMapping, mappingToNames, mappingFromNames, templateCsv, missingFor, requiredMissing, detectFromHeaders } from '../src/lib/datalab/detect.ts';
import { diagnoseStructure, buildDiagnosticReport, parseHeaderBlocks } from '../src/lib/datalab/diagnose.ts';
import { SYNONYMS } from '../src/data/import-profiles.ts';
import { buildDatasetFromMapping, parseFlexibleDay, parseAmount } from '../src/lib/datalab/normalize.ts';
import { runHealthOwn } from '../src/lib/datalab/health-own.ts';
import { runTouchpoints } from '../src/lib/datalab/touchpoints.ts';
import { runRepurchase } from '../src/lib/datalab/repurchase.ts';
import { runBasket } from '../src/lib/datalab/basket.ts';
import { runValue } from '../src/lib/datalab/value.ts';
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
  eq('範本：A0001 金額加總', b.dataset.txns.find((x) => x.id.startsWith('A0001')).amount, 1000);
  eq('範本：退貨（旗標且金額負）', b.dataset.txns.find((x) => x.id.startsWith('A0004')).isReturn, true);
  eq('範本：匿名交易', b.dataset.txns.find((x) => x.id.startsWith('A0003')).customerId, null);
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
// ── 審查找到的真實資料問題（POS 欄名、訂單合併、規模）──────────────
{
  const build = (csv) => { const t = toTable('t', csv); const m = detectMapping(t); return { t, m, b: buildDatasetFromMapping(t, m) }; };
  // 出生日期不是交易日期、會員等級不是會員編號
  const a = build('會員卡號,出生日期,銷貨日期,會員等級,實收金額\nM1,1990-01-01,2025-03-01,金卡,500\nM2,1985-05-05,2025-03-02,銀卡,300\nM3,1999-09-09,2025-03-03,金卡,200\nM1,1990-01-01,2025-03-04,金卡,100\n');
  eq('POS 欄名：交易日期選銷貨日期', a.t.headers[a.m.date.col], '銷貨日期');
  eq('POS 欄名：顧客編號選會員卡號', a.t.headers[a.m.customerId.col], '會員卡號');
  // 金額欄是整張單的總額、重複在每一列：只取一次
  const o = build('單號,銷貨日期,會員卡號,商品名稱,實收金額\nA1,2025-03-01,M1,乳液,430\nA1,2025-03-01,M1,洗面乳,430\nA2,2025-03-02,M2,乳液,300\nA2,2025-03-02,M2,面膜,300\n');
  eq('整張單總額重複：不加總', [o.b.stats.orderLevelAmount, o.b.dataset.txns.map((x) => x.amount)], [true, [430, 300]]);
  // 金額欄是明細小計：要加總
  const l = build('單號,銷貨日期,會員卡號,商品名稱,小計\nA1,2025-03-01,M1,乳液,430\nA1,2025-03-01,M1,洗面乳,300\nA2,2025-03-02,M2,乳液,300\n');
  eq('明細小計：加總', [l.b.stats.orderLevelAmount, l.b.dataset.txns.map((x) => x.amount)], [false, [730, 300]]);
  // 流水號每天重編：不同天的同號單不能併在一起
  const d = build('流水號,銷貨日期,會員卡號,金額\n1,2025-03-01,M1,100\n1,2025-03-01,M1,50\n1,2025-03-02,M2,200\n1,2025-03-02,M2,10\n2,2025-03-02,M3,70\n');
  eq('流水號每天重編：以單號＋日期區分', d.b.dataset.txns.length, 3);
  // 同一張單裡部分明細退貨：整張單仍是一次購買
  const pr = build('單號,銷貨日期,會員卡號,金額,退貨\nA1,2025-03-01,M1,300,否\nA1,2025-03-01,M1,100,是\nA2,2025-03-02,M2,50,否\n');
  eq('部分退貨：整張單不當成退貨', pr.b.dataset.txns.find((x) => x.id.startsWith('A1')).isReturn, false);
  eq('部分退貨：淨額', pr.b.dataset.txns.find((x) => x.id.startsWith('A1')).amount, 200);
  // 退貨單沿用原發票號碼、日期不同：不會把「單號重複」誤判成明細模式
  const rr = build('發票,銷貨日期,會員卡號,金額\nI1,2025-03-01,M1,100\nI2,2025-03-01,M2,200\nI3,2025-03-02,M3,300\nI4,2025-03-02,M4,400\nI1,2025-03-09,M1,-100\n');
  eq('退貨沿用發票號碼：仍逐筆解讀', rr.b.stats.lineLevel, false);
  // 全形、民國 7 碼
  eq('全形日期與民國七碼', [parseFlexibleDay('２０２５-０１-０２'), parseFlexibleDay('1140102')], [parseFlexibleDay('2025-01-02'), parseFlexibleDay('2025-01-02')]);
  eq('全形金額', parseAmount('１，２００'), 1200);
  // 只有數量與單價：金額由乘積推出
  const q = build('會員卡號,銷貨日期,數量,單價\nM1,2025-03-01,2,150\nM2,2025-03-02,1,80\n');
  eq('數量×單價', [requiredMissing(q.m), q.b.dataset.txns.map((x) => x.amount), q.b.stats.derivedAmount], [[], [300, 80], true]);
  eq('缺金額的錯誤訊息用白話', buildDatasetFromMapping(toTable('t', '會員卡號,銷貨日期\nM1,2025-03-01\n'), detectMapping(toTable('t', '會員卡號,銷貨日期\nM1,2025-03-01\n'))).error, '缺少必要欄位：金額（或「數量」加「單價」）');
  // 日期位數不同不算格式不一致；同一人大小寫不同要警告
  const sh = build('單號,銷貨日期,會員卡號,金額\nA1,2025/1/2,M1,10\nA2,2025/12/25,m1,20\nA3,2025/3/9,M2,30\n');
  const hh = runHealthOwn(sh.t, sh.m, sh.b, sh.b.dataset);
  eq('位數不同不報日期不一致', hh.report.checks.some((c) => c.id === 'own_date_format'), false);
  eq('編號大小寫碰撞', hh.facts.id_case_collisions, 1);
  // 沒有標題列的檔案：第一列是資料
  eq('偵測沒有標題列', [looksLikeDataHeaders(['王小明', '0912-345-678', '2025-01-02']), looksLikeDataHeaders(['a@b.com', 'x']), looksLikeDataHeaders(['單號', '日期', '金額'])], [true, true, false]);
  // 標題列在第三列的 POS 匯出
  const tf = tableFromRows('x', [['某某公司銷售明細', '', ''], ['', '', ''], ['單號', '日期', '金額'], ['A1', '2025-01-01', '100']]);
  eq('跳過標題列', [tf.headers, tf.rows.length], [['單號', '日期', '金額'], 1]);
  // UTF-16（Excel「Unicode 文字」）
  const u16 = new Uint8Array([0xff, 0xfe, ...[...'a,b\n1,2\n'].flatMap((c) => [c.charCodeAt(0), 0])]);
  eq('UTF-16 CSV', parseCSV(decodeBuffer(u16.buffer)), [['a', 'b'], ['1', '2']]);
  // 13 萬列不崩潰（Math.min(...arr) 在這個規模會爆堆疊）
  const big = ['單號,銷貨日期,會員卡號,金額'];
  for (let i = 0; i < 130000; i++) big.push(`B${i},2025-0${1 + (i % 9)}-1${i % 9},M${i % 5000},${10 + (i % 90)}`);
  const t0 = performance.now();
  const bg = build(big.join('\n'));
  const hb = runHealthOwn(bg.t, bg.m, bg.b, bg.b.dataset);
  const rb = buildReport({ sourceLabel: 'x', dataset: bg.b.dataset, health: hb.report, rfm: runRfm(bg.b.dataset), touch: runTouchpoints(bg.b.dataset), notes: {}, claims: {} }, { showAmounts: false });
  if (!rb.range.from) errors.push('13 萬列報告沒有日期範圍');
  if (performance.now() - t0 > 8000) errors.push(`13 萬列太慢：${Math.round(performance.now() - t0)} ms`);
}

// ── 欄名診斷：常見 ERP／POS／手打 Excel 的欄名組合（沒有真實學員檔案前的代用測試）────
{
  const kind = (h) => { const { mapping } = detectFromHeaders(h); return diagnoseStructure(h, mapping).kind; };
  const maps = (h) => { const { mapping } = detectFromHeaders(h); return Object.fromEntries(Object.entries(mapping).filter(([, g]) => g.col >= 0).map(([k, g]) => [k, h[g.col]])); };
  const erp = ['單據日期', '客戶代號', '客戶名稱', '品號', '品名', '規格', '數量', '單價', '未稅金額', '含稅金額', '稅額', '業務員'];
  eq('ERP 銷貨明細：類型', kind(erp), 'flat');
  eq('ERP 銷貨明細：對應', [maps(erp).date, maps(erp).customerId, maps(erp).quantity, maps(erp).unitPrice], ['單據日期', '客戶代號', '數量', '單價']);
  eq('ERP 含稅／未稅同分：標成「猜的」請使用者確認', detectFromHeaders(erp).mapping.amount.confidence, 'guess');
  eq('客戶名稱不會被當成顧客編號', maps(erp).customerId, '客戶代號');
  eq('商品：有品名時選品名，不選品號', maps(erp).product, '品名');
  eq('商品：只有品號時仍可使用', maps(['單據日期', '客戶代號', '品號', '金額']).product, '品號');
  eq('月報表：類型', kind(['品名', '1月', '2月', '3月', '4月', '5月', '6月', '合計']), 'pivot');
  eq('年度報表：類型', kind(['門市', '2023', '2024', '2025']), 'pivot');
  eq('會員主檔：類型', kind(['會員編號', '姓名', '手機', '生日', '性別', '會員等級', '入會日期', '地址']), 'members');
  eq('訂單明細：類型', kind(['單號', '品號', '品名', '數量', '單價']), 'items');
  eq('沒有顧客：類型', kind(['結帳日期', '發票號碼', '實收金額', '付款方式']), 'noCustomer');
  eq('手打 Excel 口語欄名', [kind(['日期', '客人', '買了什麼', '多少錢']), maps(['日期', '客人', '買了什麼', '多少錢']).customerId], ['flat', '客人']);
  eq('範本：類型', kind(['order_id', 'date', 'customer_id', 'product', 'category', 'amount', 'is_return', 'store']), 'flat');
  eq('什麼都對不上：類型', kind(['甲', '乙', '丙']), 'unknown');
  // 同義詞資料檔：每個詞都必須是小寫且不含空白、底線、連字號（比對時欄名會先這樣正規化）
  for (const [f, words] of Object.entries(SYNONYMS)) for (const w of words) if (w !== w.toLowerCase().replace(/[\s_\-./()（）]/g, '')) errors.push(`同義詞 ${f}:${w} 不符合正規化格式`);
  // 診斷報告：只含欄名；沒有標題列時完全不列欄名
  const rep = buildDiagnosticReport({ fileType: 'xlsx', rowCount: 120, headers: erp, mapping: detectFromHeaders(erp).mapping });
  if (!rep.includes('客戶代號') || !rep.includes('資料列數：120')) errors.push('診斷報告少了欄名或列數');
  const leak = buildDiagnosticReport({ fileType: 'csv', rowCount: 10, headers: null, note: '第一列看起來是資料' });
  if (/王小明|0912/.test(leak) || !leak.includes('為保護個資不列出')) errors.push('沒有標題列時診斷報告不可列出欄名');
  // 欄名測試頁：多組分隔
  eq('欄名分組（--- 與逗號、Tab、換行）', parseHeaderBlocks('a,b,c\n---\nd\te\n\n\nf\ng\nh'), [['a', 'b', 'c'], ['d', 'e'], ['f', 'g', 'h']]);
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
  const okKeys = new Set(['memberShare', 'anonymousCount', 'returnCount', 'onceOnly', 'top20Share', 'medianInterval', 'repeatRate', 'repeatRevenueShare', 'topPairCount']);
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

    // ── 第 2 天：回購、價值、商品關聯（對照獨立 Python 參考答案）──
    {
      const d2raw = JSON.parse(readFileSync(new URL('./fixtures/datalab-expected-day2.json', import.meta.url), 'utf8'));
      const d2 = { ...d2raw.partA, ...d2raw.partB, ...d2raw.partC };
      const rp = runRepurchase(dataset, res);
      const r4 = (x) => Math.round(x * 10000) / 10000;
      eq('回購：有購買紀錄的顧客', rp.eligible, d2.eligible_customers);
      eq('回購：回頭客人數', rp.repeatCustomers, d2.repeat_customers);
      eq('回購：回購率', r4(rp.repeatRate), d2.repeat_rate);
      eq('回購：回頭客營收佔比', r4(rp.repeatRevenueShare), d2.repeat_revenue_share);
      eq('回購：間隔數', rp.intervals, d2.intervals_n);
      eq('回購：中位數／P25／P75', [rp.median, rp.p25, rp.p75], [d2.intervals_median, d2.intervals_p25, d2.intervals_p75]);
      eq('回購：區間直方圖', rp.buckets.map((b) => b.count), d2.histogram_counts);
      eq('回購：該回來了的人數', rp.dueNow, d2.due_now_count);
      const va = runValue(dataset, res);
      const r2 = (x) => Math.round(x * 100) / 100;
      eq('價值：客單價平均／中位數', [r2(va.aovMean), r2(va.aovMedian)], [d2.aov_mean, d2.aov_median]);
      eq('價值：每位顧客累計消費平均／中位數', [r2(va.spendMean), r2(va.spendMedian)], [d2.spend_per_customer_mean, d2.spend_per_customer_median]);
      eq('價值：三層營收佔比加總為 1', Math.round(va.tiers.reduce((x, t) => x + t.share, 0) * 1e6) / 1e6, 1);
      const bk = runBasket(dataset);
      eq('商品關聯：購物籃數、門檻、符合門檻的配對數', [bk.baskets, bk.minCount, bk.eligiblePairs], [d2.baskets_N, d2.min_count, d2.eligible_pairs_count]);
      const norm = (t) => ({ a: t.a, b: t.b, n_ab: t.nAB, n_a: t.nA, n_b: t.nB, lift: r4(t.lift), conf_a_to_b: r4(t.confAB), conf_b_to_a: r4(t.confBA) });
      eq('商品關聯：前 5 名（依 lift）', bk.topByLift.slice(0, 5).map(norm), d2.top5_by_lift);
      eq('商品關聯：前 5 名（依次數）', bk.topByCount.slice(0, 5).map(norm), d2.top5_by_count);
    }
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
