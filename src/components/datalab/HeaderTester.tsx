import { useMemo, useState } from 'react';
import { detectFromHeaders, FIELD_LABEL, type FieldKey } from '../../lib/datalab/detect';
import { buildDiagnosticReport, diagnoseStructure, parseHeaderBlocks } from '../../lib/datalab/diagnose';
import { card, muted, secondary } from './views';

const SAMPLE = `單據日期,客戶代號,客戶名稱,品號,品名,規格,數量,單價,未稅金額,含稅金額,稅額,業務員
---
品名,1月,2月,3月,4月,5月,6月,合計
---
日期,客人,買了什麼,多少錢`;

export default function HeaderTester() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const blocks = useMemo(() => parseHeaderBlocks(text), [text]);
  const results = useMemo(
    () =>
      blocks.map((headers) => {
        const { mapping } = detectFromHeaders(headers);
        const used = new Set(Object.values(mapping).filter((g) => g.col >= 0).map((g) => g.col));
        return { headers, mapping, diagnosis: diagnoseStructure(headers, mapping), unmatched: headers.filter((_, i) => !used.has(i)) };
      }),
    [blocks],
  );
  // 跨多份檔案：哪些欄名最常沒被認出來（最值得加進同義詞的候選）
  const unmatchedCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of results) for (const h of new Set(r.unmatched)) m.set(h, (m.get(h) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [results]);

  async function copyAll() {
    const txt = results.map((r, i) => `#${i + 1}\n` + buildDiagnosticReport({ fileType: '未知', rowCount: 0, headers: r.headers, mapping: r.mapping })).join('\n\n');
    try {
      await navigator.clipboard.writeText(txt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="max-w-[820px] mx-auto">
      <h1 className="text-2xl font-extrabold tracking-tight">欄名測試頁</h1>
      <p className="text-sm mt-2" style={secondary}>
        貼上檔案的欄位名稱（<b>只要欄名，不要貼資料</b>），立刻看到戰情室會怎麼辨識。多份檔案請用單獨一行 <code>---</code> 分開。
        課前請學員寄欄名給你，你貼在這裡，就知道哪些會卡。
      </p>
      <p className="text-xs mt-2" style={muted}>
        這一頁只比對欄名，不檢查資料值，所以日期、金額欄最高只會顯示「猜的」。實際上傳時會再用資料值確認。欄名全部在你的瀏覽器裡比對，不會送出。
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={7}
        placeholder="例如：單據日期,客戶代號,品名,數量,單價,未稅金額"
        aria-label="貼上欄位名稱"
        className="mt-4 w-full px-3 py-2 rounded-lg border text-sm font-mono"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-lighter)' }}
      />
      <button onClick={() => setText(SAMPLE)} className="mt-2 text-xs underline" style={muted}>
        填入範例
      </button>

      {results.length > 0 && (
        <div className="mt-6 space-y-5">
          {results.map((r, i) => (
            <section key={i} className="rounded-2xl border p-4" style={card} aria-label={`第 ${i + 1} 份`}>
              <h2 className="font-semibold">第 {i + 1} 份：{r.headers.length} 個欄位</h2>
              <p className="text-sm mt-1"><b>{r.diagnosis.title}</b></p>
              <p className="text-xs mt-1" style={secondary}>{r.diagnosis.explain} {r.diagnosis.canDo}</p>
              <table className="w-full text-sm mt-3">
                <tbody>
                  {(Object.keys(FIELD_LABEL) as FieldKey[]).map((f) => {
                    const g = r.mapping[f];
                    return (
                      <tr key={f} className="border-t" style={{ borderColor: 'var(--color-surface-lighter)' }}>
                        <td className="py-1 pr-2 whitespace-nowrap">{FIELD_LABEL[f]}</td>
                        <td className="py-1">{g.col >= 0 ? r.headers[g.col] : <span style={muted}>— 沒找到</span>}</td>
                        <td className="py-1 text-xs whitespace-nowrap" style={{ color: g.confidence === 'none' ? 'var(--color-text-muted)' : '#22c55e' }}>
                          {g.confidence === 'none' ? '' : '欄名吻合'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {r.unmatched.length > 0 && (
                <p className="text-xs mt-2" style={muted}>未對應的欄位：{r.unmatched.join('、')}</p>
              )}
            </section>
          ))}

          {results.length > 1 && unmatchedCount.length > 0 && (
            <section className="rounded-2xl border p-4" style={card}>
              <h2 className="font-semibold">最常沒被認出來的欄名</h2>
              <p className="text-xs mt-1" style={muted}>出現越多份檔案的欄名，越值得加進 <code>src/data/import-profiles.ts</code> 的同義詞。</p>
              <ul className="text-sm mt-2 space-y-1">
                {unmatchedCount.slice(0, 20).map(([h, n]) => (
                  <li key={h}>{h}　<span style={muted}>（{n} 份）</span></li>
                ))}
              </ul>
            </section>
          )}

          <button onClick={() => void copyAll()} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--color-brand)' }}>
            {copied ? '已複製 ✓' : '複製全部診斷報告'}
          </button>
        </div>
      )}
    </div>
  );
}
