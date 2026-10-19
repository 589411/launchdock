import type { Dataset, HealthReport, RfmResult } from './types';
import type { TouchpointResult } from './touchpoints';
import { dayToString } from './normalize';
import { segmentInfo } from '../../data/datalab';
import { segments as workshopSegments, type CheckSpec } from '../../data/workshop';
import { compareClaim, expectedValues, formatExpected } from './check';
import { minMax } from './stats';

export interface ReportInput {
  sourceLabel: string;
  dataset: Dataset;
  health: HealthReport;
  rfm: RfmResult;
  touch: TouchpointResult;
  notes: Record<string, string>;
  claims: Record<string, string>;
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

  const exp = expectedValues(dataset, touch, rfm);
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
