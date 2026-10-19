/** 迴圈版 min／max：Math.min(...arr) 在元素超過約 12 萬個時會丟出「Maximum call stack size exceeded」 */
export function minMax(values: number[]): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return { min, max };
}

export function median(values: number[]): number {
  return quantile(values, 0.5);
}

/** 線性內插分位數（同 numpy 預設、statistics.quantiles(method='inclusive')） */
export function quantile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const pos = (s.length - 1) * p;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}
