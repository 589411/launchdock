// ── 內嵌 SVG 雷達圖（N 軸，依 dims 長度動態） ──────────────────
export interface RadarDim {
  label: string;
  pct: number; // 0..1
  isGap: boolean;
}
export function RadarChart({ dims, ariaLabel = 'capability radar' }: { dims: RadarDim[]; ariaLabel?: string }) {
  // viewBox 比圖本身寬，留兩側空間給軸標籤，避免被切掉
  const W = 320;
  const H = 250;
  const cx = W / 2;
  const cy = H / 2;
  const r = 74;
  const n = dims.length;
  // 從正上方開始順時針平均分佈
  const angleOf = (i: number) => (-90 + (360 / n) * i) * (Math.PI / 180);
  const pointAt = (i: number, value: number) => ({
    x: cx + r * value * Math.cos(angleOf(i)),
    y: cy + r * value * Math.sin(angleOf(i)),
  });

  const rings = [0.25, 0.5, 0.75, 1];
  const dataPoints = dims.map((d, i) => pointAt(i, Math.max(d.pct, 0.02)));
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W }} role="img" aria-label={ariaLabel}>
      {/* 格線環 */}
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={dims.map((_, i) => { const p = pointAt(i, ring); return `${p.x},${p.y}`; }).join(' ')}
          fill="none"
          stroke="var(--color-surface-lighter)"
          strokeWidth={1}
        />
      ))}
      {/* 軸線 */}
      {dims.map((_, i) => {
        const p = pointAt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--color-surface-lighter)" strokeWidth={1} />;
      })}
      {/* 資料多邊形 */}
      <polygon points={dataPath} fill="var(--color-brand)" fillOpacity={0.28} stroke="var(--color-brand)" strokeWidth={2} />
      {/* 資料點 */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={dims[i].isGap ? 5 : 3.5} fill={dims[i].isGap ? '#f59e0b' : 'var(--color-brand-light)'} />
      ))}
      {/* 軸標籤 */}
      {dims.map((d, i) => {
        const lp = pointAt(i, 1.0);
        // 標籤往外推一點
        const lx = cx + (lp.x - cx) * 1.18;
        const ly = cy + (lp.y - cy) * 1.18;
        const anchor = Math.abs(lx - cx) < 4 ? 'middle' : lx > cx ? 'start' : 'end';
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor={anchor as any}
            dominantBaseline="middle"
            fontSize={12}
            fontWeight={d.isGap ? 700 : 500}
            fill={d.isGap ? '#f59e0b' : 'var(--color-text-secondary)'}
          >
            {d.isGap ? `⚠️ ${d.label}` : d.label}
          </text>
        );
      })}
    </svg>
  );
}
