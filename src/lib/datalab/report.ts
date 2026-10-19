import type { Dataset, HealthReport, RfmResult } from './types';
import type { TouchpointResult } from './touchpoints';
import { dayToString } from './normalize';
import { segmentInfo } from '../../data/datalab';
import { segments as workshopSegments, type CheckSpec } from '../../data/workshop';
import { compareClaim, expectedValues, formatExpected } from './check';
import { minMax } from './stats';
import type { RepurchaseResult } from './repurchase';
import type { BasketResult } from './basket';
import type { ValueResult } from './value';

export interface ReportInput {
  sourceLabel: string;
  dataset: Dataset;
  health: HealthReport;
  rfm: RfmResult;
  touch: TouchpointResult;
  notes: Record<string, string>;
  claims: Record<string, string>;
  /** 第 2 天的分析（沒有就不放進報告） */
  repurchase?: RepurchaseResult;
  basket?: BasketResult;
  value?: ValueResult;
}

export interface ReportModel {
  generatedAt: string;
  sourceLabel: string;
  range: { from: string; to: string };
  txns: number;
  customers: number;
  memberShare: number;
  /** 只有使用者勾選「顯示金額」才會有值 */
  revenue?: number;
  segments: { name: string; count: number; countShare: number; revenueShare: number; sumM?: number }[];
  findings: string[];
  /** 第 2 天：行為與價值（只有彙總；金額要勾選才有） */
  day2?: {
    repeatRate: number;
    repeatRevenueShare: number;
    medianInterval: number;
    dueNow: number;
    topPairs: { a: string; b: string; nAB: number; lift: number }[];
    basketNote?: string;
    top20Share: number;
    aovMedian?: number;
    spendMedian?: number;
  };
  healthWarnings: string[];
  piiColumns: string[];
  checks: { label: string; mine: string; expected: string; status: 'match' | 'off' | 'empty' }[];
  notes: { title: string; text: string }[];
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

export function buildReport(inp: ReportInput, opts: { showAmounts: boolean }): ReportModel {
  const { dataset, health, rfm, touch } = inp;
  const days = dataset.txns.map((t) => t.day);
  const { min: from, max: to } = minMax(days);
  const segs = rfm.segments.filter((s) => s.count > 0);
  const top = [...segs].sort((a, b) => b.revenueShare - a.revenueShare)[0];
  const biggest = [...segs].sort((a, b) => b.countShare - a.countShare)[0];

  const findings: string[] = [];
  findings.push(`有顧客編號的交易佔 ${pct(touch.memberShare)}，其餘 ${pct(1 - touch.memberShare)} 的交易無法歸到任何顧客。`);
  if (top) findings.push(`「${segmentInfo[top.key].name}」貢獻最多營收（${pct(top.revenueShare)}），只佔顧客 ${pct(top.countShare)}。`);
  if (biggest && biggest.key !== top?.key) findings.push(`人數最多的是「${segmentInfo[biggest.key].name}」（${pct(biggest.countShare)}），營收貢獻 ${pct(biggest.revenueShare)}。`);

  const day2in = inp.repurchase && inp.basket ? { repurchase: inp.repurchase, basket: inp.basket } : undefined;
  const exp = expectedValues(dataset, touch, rfm, day2in);
  const checks: ReportModel['checks'] = [];
  const notes: ReportModel['notes'] = [];
  for (const seg of workshopSegments) {
    for (const spec of (seg.checks ?? []) as CheckSpec[]) {
      const mine = inp.claims[`${seg.id}.${spec.id}`];
      if (!mine || !mine.trim()) continue;
      const r = compareClaim(spec, mine, exp[spec.id]);
      checks.push({ label: spec.label, mine: mine.trim(), expected: formatExpected(spec, exp[spec.id]), status: r.status });
    }
    const note = inp.notes[seg.id]?.trim();
    if (note && seg.takeawayLabel) notes.push({ title: seg.takeawayLabel.replace(/…$/, ''), text: note });
  }

  let day2: ReportModel['day2'];
  if (inp.repurchase && inp.basket && inp.value) {
    const r = inp.repurchase;
    findings.push(`有 ${(r.repeatRate * 100).toFixed(1)}% 的顧客回頭買過（買過 2 個購買日以上），他們貢獻了 ${(r.repeatRevenueShare * 100).toFixed(1)}% 的營收；回購間隔中位數 ${r.median} 天。`);
    const tp = inp.basket.available ? inp.basket.topByLift[0] : undefined;
    if (tp) findings.push(`最常一起買的是「${tp.a}」和「${tp.b}」（同時出現 ${tp.nAB} 次，lift ${tp.lift.toFixed(1)}）。`);
    day2 = {
      repeatRate: r.repeatRate,
      repeatRevenueShare: r.repeatRevenueShare,
      medianInterval: r.median,
      dueNow: r.dueNow,
      topPairs: inp.basket.available ? inp.basket.topByLift.slice(0, 3).map((x) => ({ a: x.a, b: x.b, nAB: x.nAB, lift: x.lift })) : [],
      basketNote: inp.basket.available ? undefined : inp.basket.reason,
      top20Share: inp.value.top20Share,
      aovMedian: opts.showAmounts ? inp.value.aovMedian : undefined,
      spendMedian: opts.showAmounts ? inp.value.spendMedian : undefined,
    };
  }

  return {
    generatedAt: new Date().toISOString().slice(0, 10),
    sourceLabel: inp.sourceLabel,
    range: { from: dayToString(from), to: dayToString(to) },
    txns: dataset.txns.length,
    customers: rfm.customers.length,
    memberShare: touch.memberShare,
    revenue: opts.showAmounts ? dataset.txns.reduce((s, t) => s + t.amount, 0) : undefined,
    segments: segs.map((s) => ({
      name: segmentInfo[s.key].name,
      count: s.count,
      countShare: s.countShare,
      revenueShare: s.revenueShare,
      sumM: opts.showAmounts ? s.sumM : undefined,
    })),
    findings,
    day2,
    healthWarnings: health.checks.filter((c) => c.level === 'warn').map((c) => c.title),
    piiColumns: health.pii.map((p) => `${p.table}.${p.column}`),
    checks,
    notes,
  };
}

/** 一鍵複製的純文字摘要（貼 LINE、信件、簡報備忘都能用） */
export function reportToText(r: ReportModel): string {
  const L: string[] = [];
  L.push(`【顧客數據分析成果】${r.generatedAt}`);
  L.push(`資料：${r.sourceLabel}｜${r.range.from} 至 ${r.range.to}｜${r.txns.toLocaleString()} 筆交易、${r.customers.toLocaleString()} 位顧客`);
  if (r.revenue !== undefined) L.push(`淨營收：NT$${Math.round(r.revenue).toLocaleString()}`);
  L.push('');
  L.push('◼ 主要發現');
  r.findings.forEach((f) => L.push(`- ${f}`));
  L.push('');
  L.push('◼ 客群分佈（佔客數／佔營收）');
  r.segments.forEach((s) => L.push(`- ${s.name}：${s.count} 人，${pct(s.countShare)}／${pct(s.revenueShare)}`));
  if (r.day2) {
    const d = r.day2;
    L.push('');
    L.push('◼ 行為與價值（第 2 天）');
    L.push(`- 回購率 ${pct(d.repeatRate)}；回頭客貢獻 ${pct(d.repeatRevenueShare)} 的營收；回購間隔中位數 ${d.medianInterval} 天；已超過回購節奏的顧客 ${d.dueNow} 位`);
    L.push(`- 累計消費最高的 20% 顧客貢獻 ${pct(d.top20Share)} 的營收`);
    if (d.aovMedian !== undefined) L.push(`- 客單價中位數 NT$${Math.round(d.aovMedian).toLocaleString()}；每位顧客累計消費中位數 NT$${Math.round(d.spendMedian ?? 0).toLocaleString()}`);
    d.topPairs.forEach((p) => L.push(`- 常一起買：${p.a} × ${p.b}（${p.nAB} 次，lift ${p.lift.toFixed(1)}）`));
    if (d.basketNote) L.push(`- 商品關聯：${d.basketNote}`);
  }
  if (r.healthWarnings.length) {
    L.push('');
    L.push('◼ 資料要注意');
    r.healthWarnings.forEach((w) => L.push(`- ${w}`));
  }
  if (r.checks.length) {
    L.push('');
    L.push('◼ 我跟 AI 的數字核對');
    r.checks.forEach((c) => L.push(`- ${c.label} 我的 AI：${c.mine}；標準算法：${c.expected}（${c.status === 'match' ? '一致' : c.status === 'off' ? '有出入' : '未核對'}）`));
  }
  if (r.notes.length) {
    L.push('');
    L.push('◼ 我學到');
    r.notes.forEach((n) => L.push(`- ${n.title}：${n.text}`));
  }
  L.push('');
  L.push('由藍鴨 LaunchDock 顧客數據戰情室產生，資料只在本機計算。');
  return L.join('\n');
}
