import type { Dataset, HealthReport, RfmResult } from './types';
import type { RepurchaseResult } from './repurchase';
import type { BasketResult } from './basket';
import type { ValueResult } from './value';
import type { ExperimentResult } from './experiment';
import { minMax } from './stats';

export type Severity = 'high' | 'medium' | 'low';

export interface Risk {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  /** 該怎麼降低 */
  mitigation: string;
}

export interface RiskInput {
  dataset: Dataset;
  health: HealthReport;
  rfm: RfmResult;
  repurchase: RepurchaseResult;
  basket: BasketResult;
  value: ValueResult;
  experiment: ExperimentResult;
}

const ORDER: Record<Severity, number> = { high: 0, medium: 1, low: 2 };

/** 由資料自己的特徵產生風險清單；有幾條「一定要提」的放在最後（同意、因果） */
export function buildRisks(inp: RiskInput): Risk[] {
  const { dataset, health, rfm, repurchase, basket, value, experiment } = inp;
  const out: Risk[] = [];
  const n = dataset.txns.length;
  const days = dataset.txns.map((t) => t.day);
  const span = n ? minMax(days).max - minMax(days).min + 1 : 0;

  if (health.pii.length) {
    out.push({
      id: 'pii',
      severity: 'high',
      title: `資料裡有個資欄位（${health.pii.length} 個）`,
      detail: '姓名、電話、Email 等欄位一旦貼進外部 AI 工具，就離開了你的控制。',
      mitigation: '分析前先在 Excel 刪掉這些欄位，或改成匿名代號；提示詞只放彙總數字。',
    });
  }
  if (span < 365) {
    out.push({
      id: 'season',
      severity: span < 180 ? 'high' : 'medium',
      title: `資料只涵蓋 ${span} 天，看不出季節性`,
      detail: '節慶、換季、檔期都會讓回購與營收忽高忽低，不到一年的資料很難分辨「趨勢」和「季節」。',
      mitigation: '結論只講這段期間；有條件時補上去年同期，再下「變好或變差」的判斷。',
    });
  }
  const anon = n ? rfm.excluded.anonymous / n : 0;
  if (anon > 0.3) {
    out.push({
      id: 'anon',
      severity: anon > 0.5 ? 'high' : 'medium',
      title: `${Math.round(anon * 100)}% 的交易沒有顧客編號`,
      detail: '所有顧客層級的結論（分群、回購、價值）只代表「有留下編號」的那群人，很可能是比較忠誠的一群。',
      mitigation: '報告裡寫清楚涵蓋範圍；長期來說，在結帳時鼓勵留下會員編號。',
    });
  }
  const ret = n ? rfm.excluded.returns / n : 0;
  if (ret > 0.1) {
    out.push({
      id: 'returns',
      severity: 'medium',
      title: `退貨佔 ${Math.round(ret * 100)}% 的交易`,
      detail: '退貨多時，營收與回購都會被高估或誤判，也可能代表商品或服務有問題。',
      mitigation: '先看退貨集中在哪些品類與門市，再決定要不要把它當成單獨議題處理。',
    });
  }
  if (value.top20Share >= 0.7) {
    out.push({
      id: 'concentration',
      severity: 'medium',
      title: `營收高度集中（前 20% 顧客貢獻 ${Math.round(value.top20Share * 100)}%）`,
      detail: '少數大客戶的行為會左右整體數字，也讓你依賴他們。',
      mitigation: '大客戶用個別關心代替群發；同時規劃怎麼把第二層顧客養大。',
    });
  }
  if (!basket.available) {
    out.push({
      id: 'no-basket',
      severity: 'low',
      title: '沒有商品資料，做不了組合推薦',
      detail: basket.reason ?? '',
      mitigation: '補上品名或品類欄位；在那之前，個人化先用客群與回購時機。',
    });
  }
  if (experiment.available && experiment.noise.shareOver1pp > 0.2) {
    out.push({
      id: 'noise',
      severity: 'high',
      title: '運氣造成的差距不小，小幅度的效果看不出來',
      detail: `什麼都沒做、隨機分兩組，有 ${Math.round(experiment.noise.shareOver1pp * 100)}% 的分法差距超過 1 個百分點（95% 的情況落在 ${experiment.noise.p025Pp.toFixed(1)} 至 ${experiment.noise.p975Pp.toFixed(1)} 個百分點）。`,
      mitigation: '只投入「預期效果夠大」的活動；對象太少就合併多次活動再看，或把對照組留久一點。',
    });
  }
  if (repurchase.eligible < 500) {
    out.push({
      id: 'small-n',
      severity: 'medium',
      title: `有購買紀錄的顧客只有 ${repurchase.eligible} 位`,
      detail: '樣本小，分成客群、再分成對照組之後，每一格都很小，百分比會大幅跳動。',
      mitigation: '不要切太細；用長一點的期間；對小客群只做觀察，不下結論。',
    });
  }
  // 一定要提的兩條
  out.push({
    id: 'selection',
    severity: 'high',
    title: '挑好客人發優惠，成效一定「看起來很好」',
    detail: experiment.available
      ? `在這份資料裡，什麼都沒做，累計消費前 20% 的顧客 30 天內回來買的比例（${(experiment.selected.rateTop * 100).toFixed(1)}%），就比其他人（${(experiment.selected.rateRest * 100).toFixed(1)}%）高 ${experiment.selected.diffPp.toFixed(1)} 個百分點。`
      : '對象本來就是最可能回來的人，拿他們跟其他人比較，差距不是活動造成的。',
    mitigation: '先決定對象，再從同一批對象裡「隨機」留一組不聯絡的對照組，只比這兩組。',
  });
  out.push({
    id: 'consent',
    severity: 'high',
    title: '聯絡顧客需要有合法的聯絡同意與停發機制',
    detail: '這套分析不會告訴你「誰同意收行銷訊息」。資料裡有電話或 Email，不等於可以拿來發行銷訊息。',
    mitigation: '只發給明確同意的人；每則訊息附取消方式；設頻率上限（例如每人每 14 天最多一則），並記錄誰要求停止。',
  });
  return out.sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);
}
