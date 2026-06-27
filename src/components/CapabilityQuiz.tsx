import { useState, useEffect } from 'react';
import {
  questions,
  dimensions,
  scoreQuiz,
  recommendedFor,
  levels,
  type QuizResult,
  type LocalizedText,
} from '../data/quiz';

interface ArticleMeta {
  title: string;
  description: string;
  url: string;
}

interface Props {
  locale: 'zh-tw' | 'en';
  /** slug → 文章精簡 metadata（由 Astro 頁面傳入，僅含推薦會用到的） */
  articles: Record<string, ArticleMeta>;
}

const STORAGE_KEY = 'launchdock-quiz-result';

export default function CapabilityQuiz({ locale, articles }: Props) {
  const L = locale === 'en' ? 'en' : 'zh';
  const tr = (t: LocalizedText) => t[L];

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);

  // 還原上次結果
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved?.answers) {
          setAnswers(saved.answers);
          setResult(scoreQuiz(saved.answers));
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const t = {
    intro: { zh: '2 分鐘 AI 能力測驗', en: '2-Minute AI Capability Check' },
    introSub: {
      zh: '依你「平常怎麼用 AI」回答，沒有對錯。做完告訴你缺哪塊、下一步學什麼。',
      en: 'Answer based on how you actually use AI — no right or wrong. Get your gap and next steps.',
    },
    progress: { zh: '題', en: '' },
    of: { zh: '/', en: '/' },
    back: { zh: '← 上一題', en: '← Back' },
    yourGap: { zh: '你的下一步', en: 'Your Next Step' },
    breakdown: { zh: '你的四項能力', en: 'Your Four Capabilities' },
    unlocked: { zh: '已解鎖', en: 'Unlocked' },
    gapTag: { zh: '⚠️ 缺口', en: '⚠️ Gap' },
    locked: { zh: '尚未解鎖', en: 'Locked' },
    summary: { zh: '整體定位', en: 'Overall' },
    retake: { zh: '重新測驗', en: 'Retake' },
    readMore: { zh: '推薦閱讀', en: 'Recommended reading' },
    allDone: { zh: '看完所有教學', en: 'Browse all tutorials' },
  };

  function pick(qid: string, optIdx: number) {
    const next = { ...answers, [qid]: optIdx };
    setAnswers(next);
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      const r = scoreQuiz(next);
      setResult(r);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers: next, at: Date.now() }));
      } catch {
        /* ignore */
      }
    }
  }

  function retake() {
    setAnswers({});
    setCurrent(0);
    setResult(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  // ── 結果畫面 ──────────────────────────────────────────────
  if (result) {
    const rec = recommendedFor(result);
    const recCards = rec.recommended
      .map((slug) => ({ slug, meta: articles[slug] }))
      .filter((x) => x.meta);

    return (
      <div className="max-w-[760px] mx-auto">
        {/* 缺口橫幅（主角） */}
        <div
          className="rounded-2xl p-6 mb-8 border"
          style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-brand)' }}
        >
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-brand-light)' }}>
            {tr(t.yourGap)}
          </span>
          {result.gap ? (
            <>
              <h2 className="text-2xl font-extrabold mt-2 mb-2">
                {tr(dimGap(result).gapHeadline)}
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {tr(dimGap(result).gapDetail)}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold mt-2 mb-2">{tr(rec.title)}</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{tr(rec.blurb)}</p>
            </>
          )}

          {/* 推薦文章卡 */}
          <div className="mt-5 space-y-3">
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              {tr(t.readMore)}
            </p>
            {recCards.map(({ slug, meta }) => (
              <a
                key={slug}
                href={meta.url}
                className="block p-4 rounded-xl border transition-all group"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-lighter)' }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium group-hover:underline">{meta.title}</h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{meta.description}</p>
                  </div>
                  <span style={{ color: 'var(--color-text-muted)' }} className="shrink-0">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* 四項能力分項（雷達圖 + 狀態標籤） */}
        <h3 className="text-lg font-semibold mb-4">{tr(t.breakdown)}</h3>
        <div className="flex flex-col items-center mb-4">
          <RadarChart
            dims={result.dimensions.map((d) => ({
              label: tr(d.name),
              pct: d.pct,
              isGap: result.gap?.key === d.key,
            }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {result.dimensions.map((d) => {
            const isGap = result.gap?.key === d.key;
            const pctText = Math.round(d.pct * 100);
            const tag = d.unlocked ? t.unlocked : isGap ? t.gapTag : t.locked;
            const dot = d.unlocked ? 'var(--color-brand)' : isGap ? '#f59e0b' : 'var(--color-surface-lighter)';
            return (
              <div
                key={d.key}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg"
                style={{ backgroundColor: 'var(--color-surface-light)' }}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dot }} />
                  {tr(d.name)}
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>L{d.level}</span>
                </span>
                <span className="text-xs whitespace-nowrap" style={{ color: d.unlocked ? 'var(--color-brand-light)' : isGap ? '#f59e0b' : 'var(--color-text-muted)' }}>
                  {tr(tag)} · {pctText}%
                </span>
              </div>
            );
          })}
        </div>

        {/* 整體定位（次要總結） */}
        <div className="rounded-xl p-4 mb-6 text-center" style={{ backgroundColor: 'var(--color-surface-light)' }}>
          <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>{tr(t.summary)}</p>
          <p className="text-lg font-bold mt-1">{tr(levels[result.primaryLevel].title)}</p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={retake}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--color-surface-lighter)', color: 'var(--color-text-primary)' }}
          >
            {tr(t.retake)}
          </button>
          <a
            href={locale === 'en' ? '/en/articles' : '/articles'}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            {tr(t.allDone)}
          </a>
        </div>
      </div>
    );
  }

  // ── 作答畫面 ──────────────────────────────────────────────
  const q = questions[current];
  const progress = ((current) / questions.length) * 100;

  return (
    <div className="max-w-[640px] mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">{tr(t.intro)}</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>{tr(t.introSub)}</p>
      </div>

      {/* 進度 */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
          <span>{current + 1} {tr(t.of)} {questions.length} {tr(t.progress)}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-lighter)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: 'var(--color-brand)' }} />
        </div>
      </div>

      {/* 題目 */}
      <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-surface-lighter)' }}>
        <h2 className="text-lg font-semibold mb-5">{tr(q.text)}</h2>
        <div className="space-y-3">
          {q.options.map((opt, idx) => {
            const selected = answers[q.id] === idx;
            return (
              <button
                key={idx}
                onClick={() => pick(q.id, idx)}
                className="w-full text-left px-4 py-3 rounded-xl border transition-all"
                style={{
                  backgroundColor: selected ? 'var(--color-brand)' : 'var(--color-surface)',
                  borderColor: selected ? 'var(--color-brand)' : 'var(--color-surface-lighter)',
                  color: selected ? '#fff' : 'var(--color-text-primary)',
                }}
              >
                {tr(opt.text)}
              </button>
            );
          })}
        </div>
      </div>

      {current > 0 && (
        <button
          onClick={() => setCurrent(current - 1)}
          className="mt-4 text-sm transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {tr(t.back)}
        </button>
      )}
    </div>
  );
}

// 取出缺口維度的完整定義（含 gapHeadline/gapDetail）
function dimGap(result: QuizResult) {
  const d = dimensions.find((x) => x.key === result.gap?.key);
  return d!;
}

// ── 內嵌 SVG 雷達圖（N 軸，依 dims 長度動態） ──────────────────
interface RadarDim {
  label: string;
  pct: number; // 0..1
  isGap: boolean;
}
function RadarChart({ dims }: { dims: RadarDim[] }) {
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
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W }} role="img" aria-label="capability radar">
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
