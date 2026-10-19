import { useState, useEffect } from 'react';
import {
  questions as zhQuestions,
  recommended,
  scoreCheckup,
  localize,
  type CheckupResult,
  type DimensionKey,
  type Locale,
} from '../data/checkup';
import { RadarChart } from './RadarChart';

interface ArticleMeta {
  title: string;
  description: string;
  url: string;
}

interface Props {
  locale: Locale;
  /** slug → 文章精簡 metadata（由 Astro 頁面傳入，僅含推薦會用到的） */
  articles: Record<string, ArticleMeta>;
}

const STORAGE_KEY = 'launchdock-checkup-result';

type UiText = { zh: string; en: string };

const ui = {
  title: { zh: '企業 AI 導入體檢', en: 'Company AI Adoption Check-up' },
  intro: {
    zh: '3 分鐘、15 題，看看公司現在走到 AI 導入的哪一階段。選最接近「公司實際狀況」的那一項，不是你希望的樣子。',
    en: '3 minutes, 15 questions: see which stage of AI adoption your company is at. Pick what is actually true today, not what you hope for.',
  },
  progressOf: { zh: '/', en: '/' },
  back: { zh: '← 上一題', en: '← Back' },
  overall: { zh: '公司目前的整體階段', en: 'Your overall stage' },
  stageWord: { zh: '階段', en: 'Stage' },
  warnings: { zh: '需要注意的地方', en: 'Watch out for' },
  focus: { zh: '建議先從這裡開始', en: 'Start here' },
  focusNote: { zh: '五個面向中最需要補強的一個', en: 'The weakest of your five areas' },
  focusSame: { zh: '五個面向落點相近，就從這一個開始', en: 'Your five areas are level, so start with this one' },
  focusTop: { zh: '你已經走在前面，這是下一步可以再深化的方向', en: 'You are well ahead; this is where to deepen next' },
  focusTopTitle: { zh: '可以再深化的方向', en: 'Where to deepen next' },
  next: { zh: '下一步', en: 'Next step' },
  diagnosis: { zh: '現況', en: 'Where you are' },
  readMore: { zh: '推薦閱讀', en: 'Recommended reading' },
  breakdown: { zh: '五個面向的落點', en: 'Where you stand, by area' },
  disclaimer: {
    zh: '這是自評工具，用來幫你定位與開啟討論，不是正式診斷。每個面向只有 3 題，建議找主管與同事各做一次，比較答案的差異，往往比分數本身更有用。',
    en: 'This is a self-assessment to help you place yourself and start a conversation, not a formal audit. Each area has only 3 questions. Have a few colleagues take it too: the differences in answers are often more useful than the score.',
  },
  retake: { zh: '重新體檢', en: 'Retake' },
  moreTutorials: { zh: '看所有教學', en: 'Browse all tutorials' },
  events: { zh: '看近期活動', en: 'See upcoming events' },
} satisfies Record<string, UiText>;

export default function AICheckup({ locale, articles }: Props) {
  const L = locale === 'en' ? 'en' : 'zh';
  const tr = (t: UiText) => t[L];
  const colon = L === 'en' ? ': ' : '：';
  const content = localize(locale);
  const questions = content.questions;

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState<CheckupResult | null>(null);

  // 還原上次結果（只在題目 id 都對得上時才還原，避免題庫改版後吃到舊資料）
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      const ids = zhQuestions.map((q) => q.id);
      if (saved?.answers && ids.every((id) => typeof saved.answers[id] === 'number')) {
        setAnswers(saved.answers);
        setResult(scoreCheckup(saved.answers));
      }
    } catch {
      /* ignore */
    }
  }, []);

  function pick(qid: string, optIdx: number) {
    const next = { ...answers, [qid]: optIdx };
    setAnswers(next);
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      setResult(scoreCheckup(next));
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

  const dimName = (key: DimensionKey) => content.dimensions.find((d) => d.key === key)?.name ?? key;
  const stageInfo = (lv: number) => content.stages.find((s) => s.level === lv)!;

  // ── 結果畫面 ──────────────────────────────────────────────
  if (result) {
    const overall = stageInfo(result.overallStage);
    const focusKey = result.weakest.key;
    const focusAdvice = content.advice[focusKey][result.weakest.stage];
    // 五個面向階段相同時，「最弱」只是順序上的第一個，不該用警示色、也不該說成缺口
    const allSame = result.dimensions.every((d) => d.stage === result.dimensions[0].stage);
    const atTop = result.weakest.stage === 4;
    const focusLabel = atTop ? ui.focusTopTitle : ui.focus;
    const focusNote = atTop ? ui.focusTop : allSame ? ui.focusSame : ui.focusNote;
    const recCards = (recommended[focusKey] ?? [])
      .map((slug) => ({ slug, meta: articles[slug] }))
      .filter((x) => x.meta);

    return (
      <div className="max-w-[760px] mx-auto">
        {/* 整體階段 */}
        <div
          className="rounded-2xl p-6 mb-6 border text-center"
          style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-brand)' }}
        >
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-brand-light)' }}>
            {tr(ui.overall)}
          </span>
          <h2 className="text-3xl font-extrabold mt-2">
            {tr(ui.stageWord)} {result.overallStage} · {overall.name}
          </h2>
          <StageSteps level={result.overallStage} names={content.stages.map((s) => s.name)} />
          <p className="text-sm mt-4" style={{ color: 'var(--color-text-secondary)' }}>
            {overall.blurb}
          </p>
        </div>

        {/* 失衡警示 */}
        {result.warnings.length > 0 && (
          <div className="mb-6 space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: '#f59e0b' }}>
              ⚠️ {tr(ui.warnings)}
            </h3>
            {result.warnings.slice(0, 3).map((w) => {
              const tpl = content.warnings[w.id];
              const detail = tpl.detail
                .replaceAll('{hi}', w.hi ? dimName(w.hi) : '')
                .replaceAll('{lo}', w.lo ? dimName(w.lo) : '');
              return (
                <div
                  key={w.id}
                  className="rounded-xl p-4 border"
                  style={{ backgroundColor: 'var(--color-surface-light)', borderColor: '#f59e0b' }}
                >
                  <p className="font-semibold text-sm">{tpl.headline}</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {detail}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* 先從這裡開始 */}
        <div
          className="rounded-2xl p-6 mb-8 border"
          style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-brand)' }}
        >
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-brand-light)' }}>
            {tr(focusLabel)}
          </span>
          <h2 className="text-2xl font-extrabold mt-2">{dimName(focusKey)}</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {tr(focusNote)}
          </p>
          <p className="text-sm mt-4" style={{ color: 'var(--color-text-secondary)' }}>
            {focusAdvice.diagnosis}
          </p>
          <p className="text-sm mt-3 font-medium">
            👉 {tr(ui.next)}{colon}{focusAdvice.next}
          </p>

          {recCards.length > 0 && (
            <div className="mt-5 space-y-3">
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                {tr(ui.readMore)}
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
                      <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                        {meta.description}
                      </p>
                    </div>
                    <span style={{ color: 'var(--color-text-muted)' }} className="shrink-0">
                      →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* 五面向落點 */}
        <h3 className="text-lg font-semibold mb-4">{tr(ui.breakdown)}</h3>
        <div className="flex flex-col items-center mb-4">
          <RadarChart
            ariaLabel={tr(ui.breakdown)}
            dims={result.dimensions.map((d) => ({
              label: content.dimensions.find((x) => x.key === d.key)?.short ?? d.key,
              pct: d.pct,
              isGap: !allSame && d.key === focusKey,
            }))}
          />
        </div>
        <div className="space-y-3 mb-8">
          {result.dimensions.map((d) => {
            const a = content.advice[d.key][d.stage];
            const isFocus = !allSame && d.key === focusKey;
            return (
              <div
                key={d.key}
                className="rounded-xl p-4 border"
                style={{
                  backgroundColor: 'var(--color-surface-light)',
                  borderColor: isFocus ? '#f59e0b' : 'var(--color-surface-lighter)',
                }}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="font-semibold text-sm">{dimName(d.key)}</span>
                  <span className="text-xs" style={{ color: 'var(--color-brand-light)' }}>
                    {tr(ui.stageWord)} {d.stage} · {stageInfo(d.stage).name}
                  </span>
                </div>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4].map((n) => (
                    <span
                      key={n}
                      className="h-1.5 flex-1 rounded-full"
                      style={{ backgroundColor: n <= d.stage ? 'var(--color-brand)' : 'var(--color-surface-lighter)' }}
                    />
                  ))}
                </div>
                <p className="text-sm mt-3" style={{ color: 'var(--color-text-secondary)' }}>
                  <span className="font-medium">{tr(ui.diagnosis)}{colon}</span>
                  {a.diagnosis}
                </p>
                <p className="text-sm mt-2">
                  <span className="font-medium">{tr(ui.next)}{colon}</span>
                  {a.next}
                </p>
              </div>
            );
          })}
        </div>

        <p className="text-xs mb-6 text-center" style={{ color: 'var(--color-text-muted)' }}>
          {tr(ui.disclaimer)}
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={retake}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--color-surface-lighter)', color: 'var(--color-text-primary)' }}
          >
            {tr(ui.retake)}
          </button>
          <a
            href={locale === 'en' ? '/en/events/' : '/events/'}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            {tr(ui.events)}
          </a>
          <a
            href={locale === 'en' ? '/en/articles/' : '/articles/'}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--color-surface-lighter)', color: 'var(--color-text-primary)' }}
          >
            {tr(ui.moreTutorials)}
          </a>
        </div>
      </div>
    );
  }

  // ── 作答畫面 ──────────────────────────────────────────────
  const q = questions[current];
  const progress = (current / questions.length) * 100;
  const dim = content.dimensions.find((d) => d.key === q.dimension)!;
  const firstOfDim = current === 0 || questions[current - 1].dimension !== q.dimension;

  return (
    <div className="max-w-[640px] mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">{tr(ui.title)}</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
          {tr(ui.intro)}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
          <span>
            {current + 1} {tr(ui.progressOf)} {questions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-lighter)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: 'var(--color-brand)' }} />
        </div>
      </div>

      <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-surface-lighter)' }}>
        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-brand-light)' }}>
          {dim.name}
        </p>
        {firstOfDim && (
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
            {dim.intro}
          </p>
        )}
        <h2 className="text-lg font-semibold mb-5">{q.text}</h2>
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
                {opt.text}
              </button>
            );
          })}
        </div>
      </div>

      {current > 0 && (
        <button onClick={() => setCurrent(current - 1)} className="mt-4 text-sm transition-colors" style={{ color: 'var(--color-text-muted)' }}>
          {tr(ui.back)}
        </button>
      )}
    </div>
  );
}

// 四階段進度點（整體階段用）
function StageSteps({ level, names }: { level: number; names: string[] }) {
  return (
    <div className="flex items-start justify-center gap-2 mt-4 max-w-[420px] mx-auto">
      {names.map((name, i) => {
        const n = i + 1;
        const active = n === level;
        const reached = n <= level;
        return (
          <div key={n} className="flex-1 text-center">
            <div
              className="h-1.5 rounded-full"
              style={{ backgroundColor: reached ? 'var(--color-brand)' : 'var(--color-surface-lighter)' }}
            />
            <span
              className="block text-[11px] mt-1"
              style={{ color: active ? 'var(--color-brand-light)' : 'var(--color-text-muted)', fontWeight: active ? 700 : 400 }}
            >
              {name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
