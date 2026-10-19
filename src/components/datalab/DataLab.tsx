import { useEffect, useRef, useState } from 'react';
import { buildDatasetFromSunlitSchema, dayToString } from '../../lib/datalab/normalize';
import { runHealth } from '../../lib/datalab/health';
import { runRfm } from '../../lib/datalab/rfm';
import { healthPrompt, rfmPrompt, segmentMessagePrompt } from '../../lib/datalab/prompts';
import { isValidUnlockCode, loadSample, loadSunlit } from '../../lib/datalab/sources';
import { segmentInfo, UNLOCK_STORAGE_KEY } from '../../data/datalab';
import type { Dataset, HealthReport, Level, PiiKind, RfmResult } from '../../lib/datalab/types';

type SourceKind = 'sample' | 'sunlit';
type Tab = 'health' | 'rfm';

interface Loaded {
  source: SourceKind;
  dataset: Dataset;
  health: HealthReport;
  rfm: RfmResult;
}

const card = { backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-surface-lighter)' } as const;
const muted = { color: 'var(--color-text-muted)' } as const;
const secondary = { color: 'var(--color-text-secondary)' } as const;
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const money = (n: number) => `NT$${Math.round(n).toLocaleString()}`;

const LEVEL: Record<Level, { label: string; color: string }> = {
  warn: { label: '要注意', color: '#f59e0b' },
  info: { label: '留意', color: 'var(--color-brand-light)' },
  ok: { label: '正常', color: '#22c55e' },
};

const PII_LABEL: Record<PiiKind, string> = {
  email: 'Email',
  phone: '電話',
  national_id: '身分證字號',
  card: '信用卡號',
  hash: '雜湊（假名化）',
  name: '姓名',
  address: '地址',
  quasi: '準識別碼',
};

export default function DataLab() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loading, setLoading] = useState<SourceKind | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('health');
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [stage, setStage] = useState<number | null>(null);
  // 連點或同時觸發兩次載入時，只採用最後一次的結果
  const reqId = useRef(0);

  useEffect(() => {
    try {
      setUnlocked(sessionStorage.getItem(UNLOCK_STORAGE_KEY) === '1');
    } catch {
      /* ignore */
    }
    const s = Number(new URLSearchParams(window.location.search).get('stage'));
    if (s >= 1 && s <= 4) setStage(s);
  }, []);

  async function load(kind: SourceKind) {
    const id = ++reqId.current;
    setError('');
    setLoading(kind);
    try {
      const tables = kind === 'sample' ? await loadSample() : await loadSunlit();
      if (id !== reqId.current) return;
      const built = buildDatasetFromSunlitSchema(tables, kind);
      if (!built.dataset) throw new Error(built.error ?? '資料格式無法解析');
      const { report } = runHealth(tables);
      setLoaded({ source: kind, dataset: built.dataset, health: report, rfm: runRfm(built.dataset) });
      setTab('health');
    } catch (e) {
      if (id !== reqId.current) return;
      setError(
        kind === 'sunlit'
          ? `無法載入日晴完整資料（${e instanceof Error ? e.message : '未知錯誤'}）。可能是網路不穩，或對方網站不允許從這裡讀取。你可以先用內建小樣本，流程完全一樣。`
          : `載入失敗（${e instanceof Error ? e.message : '未知錯誤'}）`,
      );
    } finally {
      if (id === reqId.current) setLoading(null);
    }
  }

  async function unlock() {
    if (await isValidUnlockCode(code)) {
      setCodeError('');
      setUnlocked(true);
      try {
        sessionStorage.setItem(UNLOCK_STORAGE_KEY, '1');
      } catch {
        /* ignore */
      }
      void load('sunlit');
    } else {
      setCodeError('密碼不正確，請向提供密碼的人確認。');
    }
  }

  function clearData() {
    reqId.current++;
    setLoaded(null);
    setError('');
  }

  const intro =
    stage === null
      ? null
      : stage <= 2
        ? '你的體檢結果顯示資料這一塊還在起步，建議先從「資料健檢」開始：先看清資料可以信到什麼程度，再做分析。'
        : '你的體檢結果顯示資料基礎已經有了，可以直接進「客群分群」，看看哪一群最值錢、哪一群最該先處理。';

  return (
    <div className="max-w-[820px] mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">顧客數據戰情室</h1>
        <p className="text-sm mt-2" style={secondary}>
          用一份顧客交易資料，走一遍「資料健檢 → 客群分群」，並產生可以貼給你自己 AI 工具的提示詞。
        </p>
        {intro && (
          <p className="text-sm mt-3 rounded-xl px-4 py-3 border" style={{ ...card, borderColor: 'var(--color-brand)' }}>
            {intro}
          </p>
        )}
      </div>

      <div className="rounded-xl px-4 py-3 mb-6 border text-sm" style={card}>
        🔒 <b>全部在你的瀏覽器裡計算，資料不會上傳到任何地方。</b>
        <span style={muted}> 不信的話，打開瀏覽器開發者工具的 Network 分頁：你只會看到下載資料的請求，沒有任何上傳。</span>
      </div>

      {!loaded ? (
        <SourcePicker
          loading={loading}
          unlocked={unlocked}
          code={code}
          setCode={setCode}
          codeError={codeError}
          error={error}
          onSample={() => void load('sample')}
          onSunlit={() => void load('sunlit')}
          onUnlock={() => void unlock()}
        />
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap rounded-xl px-4 py-3 mb-4 border text-sm" style={card}>
            <span>
              <b>{loaded.source === 'sample' ? '內建小樣本' : '日晴生活完整資料'}</b>
              <span style={muted}>
                {' '}
                · {loaded.dataset.txns.length.toLocaleString()} 筆交易 · 截至 {dayToString(loaded.dataset.asOf - 1)}
              </span>
            </span>
            <button onClick={clearData} className="text-xs underline" style={muted}>
              清除資料、換一份
            </button>
          </div>

          <div className="flex gap-2 mb-5" role="tablist">
            {(
              [
                ['health', '① 資料健檢與個資掃描'],
                ['rfm', '② 客群分群（RFM）'],
              ] as [Tab, string][]
            ).map(([k, label]) => (
              <button
                key={k}
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: tab === k ? 'var(--color-brand)' : 'var(--color-surface-lighter)',
                  color: tab === k ? '#fff' : 'var(--color-text-primary)',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'health' ? <HealthView health={loaded.health} /> : <RfmView rfm={loaded.rfm} />}
        </>
      )}
    </div>
  );
}

// ── 選資料來源 ────────────────────────────────────────────────
function SourcePicker(props: {
  loading: SourceKind | null;
  unlocked: boolean;
  code: string;
  setCode: (s: string) => void;
  codeError: string;
  error: string;
  onSample: () => void;
  onSunlit: () => void;
  onUnlock: () => void;
}) {
  const busy = props.loading !== null;
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">選一份資料開始</h2>

      <div className="rounded-2xl p-5 border" style={card}>
        <h3 className="font-semibold">內建小樣本</h3>
        <p className="text-sm mt-1" style={secondary}>
          150 位會員、約 1,000 筆交易。是虛構零售品牌「日晴生活」資料的縮小版，保留了真實資料會有的毛病（匿名交易、退貨、日期格式混用…），email 都已換成假的。任何人都能直接用。
        </p>
        <button
          disabled={busy}
          onClick={props.onSample}
          className="mt-3 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
          style={{ backgroundColor: 'var(--color-brand)' }}
        >
          {props.loading === 'sample' ? '載入中…' : '用內建小樣本開始'}
        </button>
      </div>

      <div className="rounded-2xl p-5 border" style={card}>
        <h3 className="font-semibold">日晴生活完整資料</h3>
        <p className="text-sm mt-1" style={secondary}>
          1,200 位會員、8,000 筆交易、18 個月的完整版。輸入日晴後台的密碼即可載入。
        </p>
        {props.unlocked ? (
          <button
            disabled={busy}
            onClick={props.onSunlit}
            className="mt-3 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            {props.loading === 'sunlit' ? '載入中…' : '載入完整資料'}
          </button>
        ) : (
          <div className="mt-3 flex gap-2 flex-wrap">
            <input
              type="password"
              value={props.code}
              onChange={(e) => props.setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !busy && props.code.trim() !== '' && props.onUnlock()}
              placeholder="日晴後台密碼"
              aria-label="日晴後台密碼"
              className="px-3 py-2 rounded-lg border text-sm"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-lighter)' }}
            />
            <button
              disabled={busy || props.code.trim() === ''}
              onClick={props.onUnlock}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-brand)' }}
            >
              解鎖並載入
            </button>
          </div>
        )}
        {props.codeError && (
          <p className="text-xs mt-2" style={{ color: '#f59e0b' }} role="alert">
            {props.codeError}
          </p>
        )}
        <p className="text-xs mt-3" style={muted}>
          這個密碼只是用來對應課堂進度，資料本身是公開的教學資料。
        </p>
      </div>

      <div className="rounded-2xl p-5 border border-dashed" style={{ borderColor: 'var(--color-surface-lighter)' }}>
        <h3 className="font-semibold" style={secondary}>
          上傳你自己的資料
        </h3>
        <p className="text-sm mt-1" style={muted}>
          即將推出：上傳 CSV，自動偵測欄位並讓你確認，同樣全程在瀏覽器裡計算。
        </p>
      </div>

      {props.error && (
        <p className="text-sm rounded-xl px-4 py-3 border" style={{ ...card, borderColor: '#f59e0b' }} role="alert">
          {props.error}
        </p>
      )}
    </div>
  );
}

// ── 資料健檢 ──────────────────────────────────────────────────
function HealthView({ health }: { health: HealthReport }) {
  const order: Level[] = ['warn', 'info', 'ok'];
  const checks = [...health.checks].sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level));
  return (
    <div className="space-y-6">
      <p className="text-sm" style={secondary}>
        做分析前，先看資料「可以信到什麼程度」。真實資料很少是乾淨的，難的從來不是拿到資料，而是拿到之後怎麼辦。
      </p>

      <div className="space-y-3">
        {checks.map((c) => (
          <div key={c.id} className="rounded-xl p-4 border" style={{ ...card, borderColor: c.level === 'warn' ? '#f59e0b' : card.borderColor }}>
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded shrink-0 mt-0.5" style={{ color: LEVEL[c.level].color, border: `1px solid ${LEVEL[c.level].color}` }}>
                {LEVEL[c.level].label}
              </span>
              <p className="font-medium text-sm">{c.title}</p>
            </div>
            <p className="text-sm mt-2" style={secondary}>
              {c.detail.replace(/\*\*/g, '')}
            </p>
            <p className="text-xs mt-1" style={muted}>
              來自 {c.table}.csv
            </p>
          </div>
        ))}
      </div>

      <section>
        <h3 className="text-lg font-semibold mb-3">個資欄位掃描</h3>
        {health.pii.length === 0 ? (
          <p className="text-sm" style={secondary}>
            沒有偵測到明顯的個資欄位。
          </p>
        ) : (
          <div className="rounded-xl border overflow-x-auto" style={card}>
            <table className="w-full text-sm">
              <thead>
                <tr style={muted} className="text-left text-xs">
                  <th className="px-3 py-2">欄位</th>
                  <th className="px-3 py-2">類型</th>
                  <th className="px-3 py-2">範例（已遮罩）</th>
                </tr>
              </thead>
              <tbody>
                {health.pii.map((p) => (
                  <tr key={`${p.table}.${p.column}`} className="border-t align-top" style={{ borderColor: 'var(--color-surface-lighter)' }}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {p.table}.{p.column}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{PII_LABEL[p.kind]}</td>
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs">{p.maskedSample || '—'}</span>
                      <span className="block text-xs mt-1" style={muted}>
                        {p.note}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs mt-2" style={muted}>
          這些欄位預設不納入分析，也不會出現在下面的提示詞裡。
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">清洗決策表：後續分析怎麼處理</h3>
        <ul className="space-y-2">
          {health.decisions.map((d) => (
            <li key={d.rule} className="rounded-xl p-3 border text-sm" style={card}>
              <b>{d.rule}</b>
              <span className="block text-xs mt-1" style={secondary}>
                {d.why}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <PromptBox title="複製給你的 AI 工具：幫我解讀這份健檢" text={healthPrompt(health)} />
    </div>
  );
}

// ── RFM ───────────────────────────────────────────────────────
function RfmView({ rfm }: { rfm: RfmResult }) {
  const n = rfm.customers.length;
  const maxShare = Math.max(...rfm.segments.map((s) => Math.max(s.countShare, s.revenueShare)), 0.01);
  const gridMax = Math.max(...rfm.grid.flat(), 1);
  return (
    <div className="space-y-6">
      <p className="text-sm" style={secondary}>
        用「最近一次消費（R）、消費次數（F）、消費金額（M）」把顧客分成七群。只看有會員編號的顧客（{n.toLocaleString()} 位）；
        已排除匿名交易 {rfm.excluded.anonymous.toLocaleString()} 筆，退貨不算一次購買。基準日 {dayToString(rfm.asOf)}（資料最後一天 + 1）。
      </p>
      {n < 30 && (
        <p className="text-sm rounded-xl px-4 py-3 border" style={{ ...card, borderColor: '#f59e0b' }}>
          顧客只有 {n} 位，分群結果僅供示範，不適合據此下決策。
        </p>
      )}

      <section>
        <h3 className="text-lg font-semibold mb-1">各群「佔客數」與「佔營收」</h3>
        <p className="text-xs mb-3" style={muted}>
          兩條不一樣長，就是重點：有些群人很多但沒貢獻多少，有些群人少卻撐起大半營收。
        </p>
        <div className="space-y-3">
          {rfm.segments.map((s) => (
            <div key={s.key}>
              <div className="flex justify-between text-sm mb-1">
                <b>{segmentInfo[s.key].name}</b>
                <span style={muted}>
                  {s.count} 人 · 客數 {pct(s.countShare)} · 營收 {pct(s.revenueShare)}
                </span>
              </div>
              <Bar value={s.countShare / maxShare} color="var(--color-surface-lighter)" label="客數" />
              <Bar value={s.revenueShare / maxShare} color="var(--color-brand)" label="營收" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-1">熱度圖：最近消費 × 頻次金額</h3>
        <p className="text-xs mb-3" style={muted}>
          縱軸是「最近一次購買距今多久」，把所有顧客排序後分成五等，最上面是最近的前 20%；橫軸是「買幾次、花多少」的綜合分，分成五等，越右邊越多。格子裡的數字是人數，顏色越深人越多。
        </p>
        <Heat grid={rfm.grid} max={gridMax} />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">每一群，第一件該做的事</h3>
        <div className="space-y-3">
          {rfm.segments
            .filter((s) => s.count > 0)
            .map((s) => (
              <div key={s.key} className="rounded-xl p-4 border" style={card}>
                <div className="flex justify-between gap-2 flex-wrap">
                  <b>{segmentInfo[s.key].name}</b>
                  <span className="text-xs" style={muted}>
                    最近購買中位數 {Math.round(s.medianR)} 天前 · {s.medianF} 次 · 累計 {money(s.medianM)}
                  </span>
                </div>
                <p className="text-sm mt-1" style={secondary}>
                  {segmentInfo[s.key].blurb}
                </p>
                <p className="text-sm mt-2">👉 {segmentInfo[s.key].action}</p>
              </div>
            ))}
        </div>
      </section>

      <PromptBox title="複製給你的 AI 工具：幫我解讀這個分群" text={rfmPrompt(rfm)} />
      <PromptBox title="複製給你的 AI 工具：每一群各寫一則 LINE 訊息" text={segmentMessagePrompt(rfm)} />
    </div>
  );
}

function Bar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div className="h-2 rounded-full mb-1" style={{ backgroundColor: 'var(--color-surface)' }} role="img" aria-label={`${label} ${(value * 100).toFixed(0)}%`}>
      <div className="h-full rounded-full" style={{ width: `${Math.max(value * 100, 1)}%`, backgroundColor: color }} />
    </div>
  );
}

function Heat({ grid, max }: { grid: number[][]; max: number }) {
  // 上面是 R 分高（最近）：把 rScore 5 排在第一列
  const rows = [5, 4, 3, 2, 1];
  const rowLabel: Record<number, string> = { 5: '最近', 4: '較近', 3: '中間', 2: '較久', 1: '很久' };
  const colLabel: Record<number, string> = { 1: '少', 2: '', 3: '', 4: '', 5: '多' };
  return (
    <div className="max-w-[420px] mx-auto">
      <div className="grid gap-1" style={{ gridTemplateColumns: 'auto repeat(5, 1fr)' }}>
        {rows.map((r) => (
          <div key={r} className="contents">
            <span className="text-xs self-center pr-1 whitespace-nowrap" style={muted}>
              {rowLabel[r]}
            </span>
            {[1, 2, 3, 4, 5].map((fm) => {
              const v = grid[r - 1][fm - 1];
              return (
                <div
                  key={fm}
                  className="aspect-square rounded flex items-center justify-center text-xs font-medium"
                  style={{
                    backgroundColor: 'var(--color-brand)',
                    opacity: v === 0 ? 0.08 : 0.2 + 0.8 * (v / max),
                    color: '#fff',
                  }}
                  title={`最近消費「${rowLabel[r]}」× 頻次金額第 ${fm} 等：${v} 人`}
                >
                  {v || ''}
                </div>
              );
            })}
          </div>
        ))}
        <span />
        {[1, 2, 3, 4, 5].map((fm) => (
          <span key={fm} className="text-xs text-center" style={muted}>
            {colLabel[fm]}
          </span>
        ))}
      </div>
    </div>
  );
}

function PromptBox({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  async function copy() {
    let done = false;
    try {
      await navigator.clipboard.writeText(text);
      done = true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      done = document.execCommand('copy');
      ta.remove();
    }
    setCopied(done);
    setFailed(!done);
    setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, 2200);
  }
  return (
    <details className="rounded-xl border" style={card}>
      <summary className="px-4 py-3 text-sm font-medium cursor-pointer">{title}</summary>
      <div className="px-4 pb-4">
        <p className="text-xs mb-2" style={muted}>
          提示詞裡只有彙總數字，沒有任何個人資料。貼到你自己的 AI 工具就能用。
        </p>
        <pre className="text-xs whitespace-pre-wrap rounded-lg p-3 max-h-64 overflow-auto" style={{ backgroundColor: 'var(--color-surface)' }}>
          {text}
        </pre>
        <button onClick={() => void copy()} className="mt-3 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--color-brand)' }}>
          {copied ? '已複製 ✓' : failed ? '複製失敗，請手動選取上方文字' : '複製提示詞'}
        </button>
      </div>
    </details>
  );
}
