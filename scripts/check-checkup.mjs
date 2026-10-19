// 體檢題庫自檢：結構完整、推薦 slug 存在、英文鏡像齊全。用法：npx tsx scripts/check-checkup.mjs
import { readdirSync } from 'node:fs';
import { questions, dimensions, advice, imbalanceRules, recommended, stages, scoreCheckup } from '../src/data/checkup.ts';
import { en } from '../src/data/checkup.en.ts';

const errors = [];
const err = (m) => errors.push(m);

for (const q of questions) {
  if (q.options.length !== 4) err(`${q.id}: 選項不是 4 個`);
  if (q.options.map((o) => o.score).join() !== '0,1,2,3') err(`${q.id}: 分數必須依序 0,1,2,3`);
}
for (const d of dimensions) {
  if (questions.filter((q) => q.dimension === d.key).length !== 3) err(`${d.key}: 不是 3 題`);
  for (const lv of [1, 2, 3, 4]) if (!advice[d.key]?.[lv]?.diagnosis || !advice[d.key][lv].next) err(`advice ${d.key}.${lv} 缺`);
  if (!en.dimensions?.[d.key]?.short) err(`en.dimensions.${d.key} 缺（含 short）`);
  if (d.short.length > 5) err(`${d.key}: short 超過 5 字，手機雷達圖會被切`);
  for (const lv of [1, 2, 3, 4]) if (!en.advice?.[`${d.key}.${lv}`]) err(`en.advice ${d.key}.${lv} 缺`);
}
for (const s of stages) if (!en.stages?.[s.level]) err(`en.stages.${s.level} 缺`);
for (const q of questions) {
  const e = en.questions?.[q.id];
  if (!e || !e.text || e.options?.length !== 4 || e.options.some((x) => !x)) err(`en.questions.${q.id} 缺或選項數不對`);
}
for (const r of imbalanceRules) {
  const e = en.warnings?.[r.id];
  if (!e) err(`en.warnings.${r.id} 缺`);
  else if (r.detail.includes('{hi}') !== e.detail.includes('{hi}') || r.detail.includes('{lo}') !== e.detail.includes('{lo}')) err(`en.warnings.${r.id} 佔位符不一致`);
}
for (const col of ['articles', 'articles/en']) {
  const have = new Set(readdirSync(`src/content/${col}`).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)));
  for (const [dim, slugs] of Object.entries(recommended)) for (const s of slugs) if (!have.has(s)) err(`推薦 ${dim}: ${s} 不存在於 ${col}`);
}

// 行為檢查
const all = (n) => Object.fromEntries(questions.map((q) => [q.id, n]));
const lo = scoreCheckup(all(0));
const hi = scoreCheckup(all(3));
if (lo.overallStage !== 1 || hi.overallStage !== 4) err(`極端值階段錯誤 lo=${lo.overallStage} hi=${hi.overallStage}`);
const shadow = scoreCheckup({ ...all(2), people_rule: 0, people_tools: 0, people_line: 0 });
if (!shadow.warnings.some((w) => w.id === 'shadow_ai')) err('影子 AI 規則沒觸發');
if (lo.warnings.length || hi.warnings.length) err('全低或全高不該有警示');

if (errors.length) {
  console.error('❌ 體檢自檢失敗:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log(`✅ 體檢自檢通過：${questions.length} 題、${dimensions.length} 面向、${imbalanceRules.length} 條失衡規則`);
