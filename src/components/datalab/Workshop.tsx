import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { decodeBuffer, looksLikeDataHeaders, parseCSV, tableFromRows } from '../../lib/datalab/csv';
import { buildDatasetFromMapping, buildDatasetFromSunlitSchema, dayToString } from '../../lib/datalab/normalize';
import { detectMapping, FIELD_LABEL, mappingFromNames, mappingToNames, REQUIRED_FIELDS, requiredMissing, templateCsv, type FieldKey, type Mapping } from '../../lib/datalab/detect';
import { runHealth } from '../../lib/datalab/health';
import { runHealthOwn } from '../../lib/datalab/health-own';
import { runRfm } from '../../lib/datalab/rfm';
import { runTouchpoints } from '../../lib/datalab/touchpoints';
import { runRepurchase, type RepurchaseResult } from '../../lib/datalab/repurchase';
import { runBasket, type BasketResult } from '../../lib/datalab/basket';
import { runValue, type ValueResult } from '../../lib/datalab/value';
import { mask } from '../../lib/datalab/pii';
import { buildReport, reportToText } from '../../lib/datalab/report';
import { compareClaim, expectedValues, formatExpected } from '../../lib/datalab/check';
import { isValidUnlockCode, loadSample, loadSunlit } from '../../lib/datalab/sources';
import {
  clearAllLocal, loadData, loadProgress, recallMapping, rememberMapping, saveData, saveProgress, type Progress, type SavedData,
} from '../../lib/datalab/store';
import { UNLOCK_STORAGE_KEY } from '../../data/datalab';
import { days, fillPrompt, visibleSegments, type SegmentDef } from '../../data/workshop';
import type { Dataset, HealthReport, RfmResult, Table } from '../../lib/datalab/types';
import type { TouchpointResult } from '../../lib/datalab/touchpoints';
import { buildDiagnosticReport, diagnoseStructure } from '../../lib/datalab/diagnose';
import { BasketView, card, DiagCopyButton, HealthView, Insight2View, InsightView, muted, PromptBox, RepurchaseView, ReportView, RfmView, secondary, TouchpointView, ValueView } from './views';

type Source = 'sample' | 'sunlit' | 'own';

interface Loaded {
  source: Source;
  label: string;
  dataset: Dataset;
  health: HealthReport;
  rfm: RfmResult;
  touch: TouchpointResult;
  repurchase: RepurchaseResult;
  basket: BasketResult;
  value: ValueResult;
  /** 給「先自己試」提示詞用的欄位名稱（只有欄名，沒有資料） */
  columns: string[];
}

interface Pending {
  table: Table;
  mapping: Mapping;
  fileName: string;
  notice: string;
}

const SUNLIT_COLUMNS = ['txn_id', 'txn_datetime', 'store_id', 'member_id', 'channel', 'payment_method', 'total_amount', 'discount_amount', 'campaign_id', 'is_return'];
const MAX_BYTES = 20 * 1024 * 1024;
const MAX_ROWS = 200_000;
const MAX_COLS = 200;
const SOURCE_LABEL: Record<Source, string> = { sample: '內建小樣本', sunlit: '日晴生活完整資料', own: '你自己的資料' };

function finalize(source: Source, dataset: Dataset, health: HealthReport, columns: string[]): Loaded {
  const rfm = runRfm(dataset);
  return {
    source,
    label: SOURCE_LABEL[source],
    dataset,
    health,
    rfm,
    touch: runTouchpoints(dataset),
    repurchase: runRepurchase(dataset, rfm),
    basket: runBasket(dataset),
    value: runValue(dataset, rfm),
    columns,
  };
}

/** 自己的資料一律用中性的名稱，檔名不進健檢、提示詞或報告（檔名可能含公司或人名） */
const OWN_TABLE = '你的資料';

async function readFile(file: File): Promise<{ table: Table; notice: string }> {
  if (file.size > MAX_BYTES) throw new Error('檔案超過 20 MB。請先拆小，或只保留需要的欄位。');
  if (/\.xls$/i.test(file.name)) throw new Error('這是舊版 .xls 格式，請用 Excel 另存成 .xlsx 或 CSV 再上傳。');
  const buf = await file.arrayBuffer();
  let table: Table;
  let notice = '';
  if (/\.xlsx$/i.test(file.name)) {
    // 只有選了 Excel 檔才載入解析器，其他人不會多下載任何東西
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('這個瀏覽器版本太舊，讀不了 Excel 檔。請在 Excel 裡「另存新檔」成 CSV 再上傳，或改用最新版的 Chrome、Edge 或 Safari。');
    }
    const { readXlsx } = await import('../../lib/datalab/xlsx');
    const sheets = await readXlsx(buf);
    if (sheets.length === 0) throw new Error('這個 Excel 檔裡沒有任何工作表。');
    const best = sheets.reduce((a, b) => (b.rows.length > a.rows.length ? b : a));
    table = tableFromRows(OWN_TABLE, best.rows);
    if (sheets.length > 1) notice = `這個檔案有 ${sheets.length} 個工作表，我使用資料最多的「${best.name}」。`;
  } else {
    table = tableFromRows(OWN_TABLE, parseCSV(decodeBuffer(buf)));
  }
  if (table.rows.length === 0 || table.headers.length < 2) throw new Error('讀不到資料。請確認檔案第一列是欄位名稱，而且至少有兩欄。');
  if (table.headers.length > MAX_COLS) throw new Error(`欄位超過 ${MAX_COLS} 欄，這比較像報表而不是交易明細。請整理成「一列一筆交易」再上傳。`);
  if (table.rows.length > MAX_ROWS) throw new Error(`資料超過 ${MAX_ROWS.toLocaleString()} 列，瀏覽器可能跑不動。請先篩選日期範圍或拆成多份。`);
  // 沒有標題列的檔案：第一列其實是資料，會被當成欄名進到提示詞、報告與本機紀錄，所以直接擋下
  if (looksLikeDataHeaders(table.headers)) {
    throw new Error('第一列看起來是資料（例如日期、電話或 email），不是欄位名稱。請在最上面加一列欄位名稱再上傳。');
  }
  return { table, notice };
}

export default function Workshop() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [busy, setBusy] = useState<Source | 'file' | null>(null);
  const [error, setError] = useState('');
  const [errorFile, setErrorFile] = useState<'csv' | 'xlsx' | '未知'>('未知');
  /** 錯誤來自哪裡：日晴完整資料載入失敗時要提供「再試一次」 */
  const [errorSource, setErrorSource] = useState<'sunlit' | 'sample' | 'file' | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [saveLocal, setSaveLocal] = useState(false);
  const [saved, setSaved] = useState<SavedData | null>(null);
  /** 這份資料是否已存在這台電腦（沒存的話，離開頁面會遺失） */
  const [persisted, setPersisted] = useState(false);
  const [navCount, setNavCount] = useState(0);
  const [ceiling, setCeiling] = useState(4);
  const [stage, setStage] = useState<number | null>(null);
  const [progress, setProgress] = useState<Progress>({ completed: [], notes: {}, claims: {} });
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  // 連點或同時觸發兩次載入時，只採用最後一次的結果
  const reqId = useRef(0);

  const go = useCallback((i: number) => {
    setIdx(i);
    setNavCount((c) => c + 1);
  }, []);

  useEffect(() => {
    try {
      setUnlocked(sessionStorage.getItem(UNLOCK_STORAGE_KEY) === '1');
    } catch {
      /* ignore */
    }
    const qs = new URLSearchParams(window.location.search);
    const s = Number(qs.get('stage'));
    if (s >= 1 && s <= 4) setStage(s);
    const d = Number(qs.get('day'));
    if (d >= 1 && d <= 4) setCeiling(d);
    setProgress(loadProgress());
    void loadData().then((v) => v && setSaved(v));
  }, []);

  useEffect(() => saveProgress(progress), [progress]);

  const visible = useMemo(() => visibleSegments(ceiling), [ceiling]);
  const isOpen = useCallback((i: number) => i === 0 || progress.completed.includes(visible[i - 1]?.id), [progress.completed, visible]);

  // 自己的資料沒有存在這台電腦時，離開或重新整理頁面就會遺失，先提醒
  useEffect(() => {
    if (!loaded || loaded.source !== 'own' || persisted) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [loaded, persisted]);

  // 鍵盤 ← → 切換段落（在輸入框裡打字時不攔截）
  useEffect(() => {
    if (!loaded) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      // 只在沒有聚焦在表單或按鈕上時才當成翻頁（避免搶走下拉選單、輸入框的方向鍵）
      if (el && el !== document.body && el.id !== 'seg-title') return;
      if (e.key === 'ArrowRight' && idx < visible.length - 1 && isOpen(idx + 1)) go(idx + 1);
      if (e.key === 'ArrowLeft' && idx > 0) go(idx - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loaded, idx, visible.length, isOpen, go]);

  function start(l: Loaded, isPersisted = false) {
    // 進度、心得與核對數字都屬於「那一份資料」：換了資料，舊的答案與核對結果不能沿用
    let sum = 0;
    for (const t of l.dataset.txns) sum += t.amount;
    const fp = `${l.source}:${l.dataset.txns.length}:${l.dataset.asOf}:${Math.round(sum)}`;
    if (progress.fingerprint !== fp) setProgress({ fingerprint: fp, completed: [], notes: {}, claims: {} });
    setLoaded(l);
    setPersisted(isPersisted);
    setPending(null);
    setIdx(0);
    setNavCount(0);
    setRevealed({});
    setError('');
  }


  // ── 載入：內建樣本／日晴完整資料 ──
  async function loadCurated(kind: 'sample' | 'sunlit') {
    const id = ++reqId.current;
    setError('');
    setBusy(kind);
    try {
      const tables = kind === 'sample' ? await loadSample() : await loadSunlit();
      if (id !== reqId.current) return;
      const built = buildDatasetFromSunlitSchema(tables, kind);
      if (!built.dataset) throw new Error(built.error ?? '資料格式無法解析');
      start(finalize(kind, built.dataset, runHealth(tables).report, SUNLIT_COLUMNS));
    } catch (e) {
      if (id !== reqId.current) return;
      setErrorSource(kind);
      setError(
        kind === 'sunlit'
          ? `無法載入日晴完整資料（${e instanceof Error ? e.message : '未知錯誤'}）。可能是網路不穩，或對方網站不允許從這裡讀取。你可以先用內建小樣本，流程完全一樣。`
          : `載入失敗（${e instanceof Error ? e.message : '未知錯誤'}）`,
      );
    } finally {
      if (id === reqId.current) setBusy(null);
    }
  }

  async function unlock() {
    let valid = false;
    try {
      valid = await isValidUnlockCode(code);
    } catch {
      setCodeError('這個瀏覽器無法驗證密碼（可能不是安全連線，或版本太舊）。請改用內建小樣本，流程完全一樣。');
      return;
    }
    if (valid) {
      setCodeError('');
      setUnlocked(true);
      try {
        sessionStorage.setItem(UNLOCK_STORAGE_KEY, '1');
      } catch {
        /* ignore */
      }
      void loadCurated('sunlit');
    } else setCodeError('密碼不正確，請向提供密碼的人確認。');
  }

  // ── 自己的資料：讀檔 → 欄位對應 → 確認 ──
  async function onFile(file: File | undefined) {
    if (!file) return;
    setError('');
    setBusy('file');
    try {
      const { table, notice } = await readFile(file);
      const remembered = recallMapping(table.headers);
      const mapping = (remembered && mappingFromNames(table, remembered)) || detectMapping(table);
      setPending({ table, mapping, fileName: file.name, notice: remembered ? `${notice} 已套用你上次確認過的欄位對應。`.trim() : notice });
    } catch (e) {
      setErrorSource('file');
      setErrorFile(/\.xlsx$/i.test(file.name) ? 'xlsx' : /\.(csv|tsv|txt)$/i.test(file.name) ? 'csv' : '未知');
      setError(e instanceof Error ? e.message : '讀取檔案失敗');
    } finally {
      setBusy(null);
    }
  }

  async function confirmMapping() {
    if (!pending) return;
    setError('');
    try {
      const built = buildDatasetFromMapping(pending.table, pending.mapping);
      if (!built.dataset) {
        setError(built.error ?? '資料無法解析');
        return;
      }
      const { report } = runHealthOwn(pending.table, pending.mapping, built, built.dataset);
      rememberMapping(pending.table.headers, mappingToNames(pending.table, pending.mapping));
      let persistedNow = false;
      if (saveLocal) {
        const rec: SavedData = { dataset: built.dataset, health: report, columns: pending.table.headers, fileName: pending.fileName, savedAt: Date.now() };
        persistedNow = await saveData(rec);
        if (persistedNow) setSaved(rec);
        else setError('這個瀏覽器不允許把資料存在這台電腦（可能是無痕模式或儲存空間被封鎖）。你仍可以繼續，只是下次要重新上傳。');
      }
      start(finalize('own', built.dataset, report, pending.table.headers), persistedNow);
    } catch (e) {
      setError(`處理資料時發生錯誤：${e instanceof Error ? e.message : '未知錯誤'}。請檢查欄位對應，或換一份較小的檔案。`);
    }
  }

  function useSaved() {
    if (!saved) return;
    start(finalize('own', saved.dataset, saved.health, saved.columns), true);
  }

  /** 清掉這台電腦上所有紀錄：存起來的資料、欄位對應記憶、進度與心得 */
  async function forgetSaved() {
    await clearAllLocal();
    setSaved(null);
    setPersisted(false);
    setProgress({ completed: [], notes: {}, claims: {} });
  }

  function reset() {
    reqId.current++;
    setLoaded(null);
    setPending(null);
    setError('');
  }

  function complete(sg: SegmentDef) {
    if (!progress.completed.includes(sg.id)) setProgress({ ...progress, completed: [...progress.completed, sg.id] });
    if (idx < visible.length - 1) go(idx + 1);
    window.scrollTo({ top: 0 });
  }

  function restartProgress() {
    setProgress({ fingerprint: progress.fingerprint, completed: [], notes: {}, claims: {} });
    go(0);
    setRevealed({});
  }

  const intro =
    stage === null || loaded
      ? null
      : stage <= 2
        ? '你的體檢結果顯示資料這一塊還在起步。這個工作坊會一段一段帶你走，先看清資料能不能信，再做分析。'
        : '你的體檢結果顯示資料基礎已經有了。一段一段往下走，核對 AI 算出來的數字，並整理成你的成果。';

  return (
    <div className="max-w-[820px] mx-auto">
      <div className="text-center mb-6 no-print">
        <h1 className="text-2xl font-extrabold tracking-tight">顧客數據戰情室</h1>
        <p className="text-sm mt-2" style={secondary}>
          一段一段的實作工作坊：用你自己的資料（或示範資料），先自己用 AI 試，再對答案、檢查它有沒有算錯，最後整理成可分享的成果。
        </p>
        {intro && (
          <p className="text-sm mt-3 rounded-xl px-4 py-3 border" style={{ ...card, borderColor: 'var(--color-brand)' }}>
            {intro}
          </p>
        )}
      </div>

      <div className="rounded-xl px-4 py-3 mb-6 border text-sm no-print" style={card}>
        🔒 <b>全部在你的瀏覽器裡計算，資料不會上傳到任何地方。</b>
        <span style={muted}> 不信的話，打開瀏覽器開發者工具的 Network 分頁，再選你的檔案：你會看到沒有任何請求帶著你的資料出去（只有網頁本身的程式與字型下載）。</span>
      </div>

      {!loaded && !pending && (
        <Start
          busy={busy}
          unlocked={unlocked}
          code={code}
          setCode={setCode}
          codeError={codeError}
          error={error}
          errorReport={error && errorFile && errorSource === 'file' ? buildDiagnosticReport({ fileType: errorFile, rowCount: 0, headers: null, note: error }) : ''}
          errorSource={errorSource}
          saveLocal={saveLocal}
          setSaveLocal={setSaveLocal}
          saved={saved}
          onFile={(f) => void onFile(f)}
          onSample={() => void loadCurated('sample')}
          onSunlit={() => void loadCurated('sunlit')}
          onUnlock={() => void unlock()}
          onUseSaved={useSaved}
          onForgetSaved={() => void forgetSaved()}
        />
      )}

      {!loaded && pending && (
        <MappingStep pending={pending} setMapping={(m) => setPending({ ...pending, mapping: m })} onConfirm={() => void confirmMapping()} onCancel={reset} onSample={() => void loadCurated('sample')} error={error} saveLocal={saveLocal} />
      )}

      {loaded && (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap rounded-xl px-4 py-3 mb-4 border text-sm no-print" style={card}>
            <span>
              <b>{loaded.label}</b>
              <span style={muted}> · {loaded.dataset.txns.length.toLocaleString()} 筆交易 · 截至 {dayToString(loaded.dataset.asOf - 1)}</span>
            </span>
            <span className="flex gap-3">
              <button onClick={reset} className="text-xs underline" style={muted}>換一份資料</button>
              <button onClick={restartProgress} className="text-xs underline" style={muted}>從頭開始</button>
            </span>
          </div>

          <Stepper visible={visible} idx={idx} setIdx={go} isOpen={isOpen} completed={progress.completed} ceiling={ceiling} />

          <Slide
            key={visible[idx].id}
            seg={visible[idx]}
            index={idx}
            count={visible.length}
            loaded={loaded}
            progress={progress}
            setProgress={setProgress}
            revealed={!!revealed[visible[idx].id] || progress.completed.includes(visible[idx].id)}
            setRevealed={() => setRevealed({ ...revealed, [visible[idx].id]: true })}
            onComplete={() => complete(visible[idx])}
            onPrev={() => go(idx - 1)}
            onNext={() => isOpen(idx + 1) && go(idx + 1)}
            autoFocus={navCount > 0}
            canNext={idx < visible.length - 1 && isOpen(idx + 1)}
          />
        </>
      )}
    </div>
  );
}

// ── 開始畫面：選資料 ──────────────────────────────────────────
function Start(props: {
  busy: Source | 'file' | null;
  unlocked: boolean;
  code: string;
  setCode: (s: string) => void;
  codeError: string;
  error: string;
  /** 讀檔失敗時可複製給講師的診斷（不含任何資料與欄名） */
  errorReport: string;
  errorSource: 'sunlit' | 'sample' | 'file' | null;
  saveLocal: boolean;
  setSaveLocal: (b: boolean) => void;
  saved: SavedData | null;
  onFile: (f: File | undefined) => void;
  onSample: () => void;
  onSunlit: () => void;
  onUnlock: () => void;
  onUseSaved: () => void;
  onForgetSaved: () => void;
}) {
  const busy = props.busy !== null;
  const download = () => {
    const blob = new Blob(['﻿' + templateCsv()], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '顧客交易資料範本.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className="space-y-4">
      {props.saved && (
        <div className="rounded-2xl p-5 border" style={{ ...card, borderColor: 'var(--color-brand)' }}>
          <h3 className="font-semibold">這台電腦上有你上次存的資料</h3>
          <p className="text-sm mt-1" style={secondary}>
            {props.saved.fileName}（{props.saved.dataset.txns.length.toLocaleString()} 筆交易，{new Date(props.saved.savedAt).toLocaleDateString()} 存的）。只存在這個瀏覽器，沒有上傳。
          </p>
          <div className="mt-3 flex gap-2">
            <button onClick={props.onUseSaved} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--color-brand)' }}>繼續使用</button>
            <button onClick={props.onForgetSaved} className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-surface-lighter)' }}>清除這台電腦上的所有紀錄</button>
          </div>
        </div>
      )}

      <div className="rounded-2xl p-5 border" style={{ ...card, borderColor: 'var(--color-brand)' }}>
        <h3 className="font-semibold">用我自己的資料（建議）</h3>
        <p className="text-sm mt-1" style={secondary}>
          用你真實的顧客交易資料，結果才是你的。上傳 Excel（.xlsx）或 CSV，我會自動偵測欄位，讓你確認後再開始。
        </p>
        <ul className="text-sm mt-3 space-y-1 list-disc pl-5" style={secondary}>
          <li>每一列是一筆交易（或一個商品明細）。至少要有：<b>顧客編號、日期、金額</b>。</li>
          <li>有單號、商品、品類、是否退貨、門市，就能開啟更多分析。</li>
          <li>檔案第一列是欄位名稱；單檔 20 MB、20 萬列以內。</li>
          <li>姓名、電話、email 這類個資，建議先在 Excel 刪掉。分析用不到。</li>
        </ul>
        <div className="mt-3 flex gap-2 flex-wrap items-center">
          <label className="px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer" style={{ backgroundColor: 'var(--color-brand)', opacity: busy ? 0.6 : 1 }}>
            {props.busy === 'file' ? '讀取中…' : '選擇檔案'}
            <input type="file" accept=".csv,.tsv,.txt,.xlsx" hidden disabled={busy} onChange={(e) => props.onFile(e.target.files?.[0])} aria-label="上傳你的資料檔" />
          </label>
          <button onClick={download} className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-surface-lighter)' }}>下載資料範本</button>
        </div>
        <label className="flex items-start gap-2 mt-3 text-xs" style={muted}>
          <input type="checkbox" checked={props.saveLocal} onChange={(e) => props.setSaveLocal(e.target.checked)} className="mt-0.5" />
          <span>把資料存在這台電腦的瀏覽器，下次不用重新上傳。只存在這台電腦、不會上傳，隨時可以清除。<b>共用電腦請不要勾選。</b></span>
        </label>
      </div>

      <div className="rounded-2xl p-5 border" style={card}>
        <h3 className="font-semibold">沒有資料？用示範資料</h3>
        <p className="text-sm mt-1" style={secondary}>
          虛構零售品牌「日晴生活」的資料，保留了真實資料會有的毛病（匿名交易、退貨、日期格式混用…）。
        </p>
        <div className="mt-3 flex gap-2 flex-wrap">
          <button disabled={busy} onClick={props.onSample} className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60" style={{ backgroundColor: 'var(--color-brand)' }}>
            {props.busy === 'sample' ? '載入中…' : '內建小樣本（150 位會員）'}
          </button>
          {props.unlocked && (
            <button disabled={busy} onClick={props.onSunlit} className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60" style={{ backgroundColor: 'var(--color-surface-lighter)' }}>
              {props.busy === 'sunlit' ? '載入中…' : '日晴完整資料（1,200 位會員）'}
            </button>
          )}
        </div>
        {!props.unlocked && (
          <div className="mt-3 flex gap-2 flex-wrap">
            <input
              type="password"
              value={props.code}
              onChange={(e) => props.setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !busy && props.code.trim() !== '' && props.onUnlock()}
              placeholder="日晴後台密碼（完整資料）"
              aria-label="日晴後台密碼"
              className="px-3 py-2 rounded-lg border text-sm"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-lighter)' }}
            />
            <button disabled={busy || props.code.trim() === ''} onClick={props.onUnlock} className="px-4 py-2 rounded-lg text-sm disabled:opacity-60" style={{ backgroundColor: 'var(--color-surface-lighter)' }}>
              解鎖完整資料
            </button>
          </div>
        )}
        {props.codeError && <p className="text-xs mt-2" style={{ color: '#f59e0b' }} role="alert">{props.codeError}</p>}
        <p className="text-xs mt-3" style={muted}>這個密碼只是讓你取得示範資料；資料本身是公開的教學資料，並不是受保護的內容。</p>
      </div>

      {props.error && (
        <div className="rounded-xl px-4 py-3 border space-y-2" style={{ ...card, borderColor: '#f59e0b' }}>
          <p className="text-sm" role="alert">{props.error}</p>
          <div className="flex gap-2 flex-wrap">
            {props.errorSource === 'sunlit' && (
              <button disabled={busy} onClick={props.onSunlit} className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60" style={{ backgroundColor: 'var(--color-brand)' }}>再試一次</button>
            )}
            {props.errorSource !== 'sample' && (
              <button disabled={busy} onClick={props.onSample} className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-surface-lighter)' }}>先用內建小樣本繼續</button>
            )}
            {props.errorReport && <DiagCopyButton text={props.errorReport} label="複製錯誤狀況給講師（不含資料）" />}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 欄位對應 ──────────────────────────────────────────────────
function MappingStep(props: { pending: Pending; setMapping: (m: Mapping) => void; onConfirm: () => void; onCancel: () => void; onSample: () => void; error: string; saveLocal: boolean }) {
  const { table, mapping, fileName, notice } = props.pending;
  const fields = Object.keys(FIELD_LABEL) as FieldKey[];
  const ordered = [...REQUIRED_FIELDS, ...fields.filter((f) => !REQUIRED_FIELDS.includes(f))];
  const missing = requiredMissing(mapping);
  const diagnosis = diagnoseStructure(table.headers, mapping);
  const fileType = /\.xlsx$/i.test(fileName) ? 'xlsx' : 'csv';
  const report = buildDiagnosticReport({ fileType, rowCount: table.rows.length, headers: table.headers, mapping });
  const samples = (ci: number, f: FieldKey) => {
    const out: string[] = [];
    for (const r of table.rows) {
      const v = (r[ci] ?? '').trim();
      if (v) out.push(f === 'customerId' ? mask(v) : v.length > 18 ? `${v.slice(0, 18)}…` : v);
      if (out.length >= 3) break;
    }
    return out.join('、');
  };
  const badge = { sure: { t: '確定', c: '#22c55e' }, guess: { t: '猜的，請確認', c: '#f59e0b' }, none: { t: '沒找到', c: 'var(--color-text-muted)' } } as const;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5 border" style={card}>
        <h3 className="font-semibold">確認欄位對應</h3>
        <p className="text-sm mt-1" style={secondary}>
          {fileName}：{table.rows.length.toLocaleString()} 列、{table.headers.length} 欄。我猜了每個欄位對應到你檔案的哪一欄，請確認或調整。
        </p>
        {notice && <p className="text-xs mt-2" style={muted}>{notice}</p>}
      </div>
      {diagnosis.kind !== 'flat' && (
        <div className="rounded-xl p-4 border space-y-2" style={{ ...card, borderColor: '#f59e0b' }}>
          <p className="font-semibold text-sm">{diagnosis.title}</p>
          <p className="text-sm" style={secondary}>{diagnosis.explain}</p>
          <p className="text-sm"><b>這份資料能做什麼：</b>{diagnosis.canDo}</p>
          <ul className="text-sm list-disc pl-5 space-y-1" style={secondary}>{diagnosis.steps.map((st) => <li key={st}>{st}</li>)}</ul>
        </div>
      )}
      <div className="space-y-2">
        {ordered.map((f) => {
          const g = mapping[f];
          const b = badge[g.confidence];
          const required = REQUIRED_FIELDS.includes(f);
          return (
            <div key={f} className="rounded-xl p-3 border" style={{ ...card, borderColor: required && g.col < 0 ? '#f59e0b' : card.borderColor }}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label htmlFor={`map-${f}`} className="text-sm font-medium">{FIELD_LABEL[f]}{required && <span style={{ color: '#f59e0b' }}> *</span>}</label>
                <span className="text-xs" style={{ color: b.c }}>{b.t}</span>
              </div>
              <select
                id={`map-${f}`}
                value={g.col}
                onChange={(e) => {
                  const col = Number(e.target.value);
                  props.setMapping({ ...mapping, [f]: { col, confidence: col < 0 ? 'none' : 'sure' } });
                }}
                className="mt-2 w-full px-3 py-2 rounded-lg border text-sm"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-lighter)' }}
              >
                <option value={-1}>— 沒有這個欄位 —</option>
                {table.headers.map((h, ci) => <option key={ci} value={ci}>{h || `（第 ${ci + 1} 欄，沒有名稱）`}</option>)}
              </select>
              {g.col >= 0 && <p className="text-xs mt-1" style={muted}>範例：{samples(g.col, f) || '（這欄是空的）'}</p>}
            </div>
          );
        })}
      </div>
      {missing.length > 0 && (
        <p className="text-sm rounded-xl px-4 py-3 border" style={{ ...card, borderColor: '#f59e0b' }} role="alert">
          還缺必要欄位：{missing.map((f) => (f === 'amount' ? '金額（或同時有「數量」與「單價」）' : FIELD_LABEL[f])).join('、')}。沒有它們就無法分析；如果你的檔案真的沒有，請先補上再重新上傳。
        </p>
      )}
      {props.error && <p className="text-sm rounded-xl px-4 py-3 border" style={{ ...card, borderColor: '#f59e0b' }} role="alert">{props.error}</p>}
      <div className="flex gap-2 flex-wrap">
        <button disabled={missing.length > 0} onClick={props.onConfirm} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: 'var(--color-brand)' }}>確認，開始第一段</button>
        <button onClick={props.onCancel} className="px-5 py-2.5 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-surface-lighter)' }}>重新選檔案</button>
        <DiagCopyButton text={report} />
      </div>
      <p className="text-xs" style={muted}>
        卡住超過幾分鐘就別硬撐，不要讓全班等你：
        <button onClick={props.onSample} className="underline ml-1">先用內建小樣本繼續</button>
        ，流程完全一樣，之後再回頭處理自己的資料。
      </p>
      {props.saveLocal && <p className="text-xs" style={muted}>你勾選了「存在這台電腦」，確認後會存進這個瀏覽器。</p>}
    </div>
  );
}

// ── 進度列（依天分組） ─────────────────────────────────────────
function Stepper(props: { visible: SegmentDef[]; idx: number; setIdx: (i: number) => void; isOpen: (i: number) => boolean; completed: string[]; ceiling: number }) {
  const groups = days.filter((d) => d.open && d.day <= props.ceiling).map((d) => ({ d, items: props.visible.map((sg, i) => ({ sg, i })).filter((x) => x.sg.day === d.day) }));
  const comingSoon = days.filter((d) => !d.open && d.day <= props.ceiling);
  return (
    <nav className="mb-5 no-print flex flex-wrap gap-x-5 gap-y-3" aria-label="工作坊進度">
      {groups.map(({ d, items }) => (
        <div key={d.day} className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={muted}>第 {d.day} 天</span>
          {items.map(({ sg, i }) => {
            const done = props.completed.includes(sg.id);
            const open = props.isOpen(i);
            const cur = i === props.idx;
            return (
              <button
                key={sg.id}
                aria-current={cur ? 'step' : undefined}
                aria-label={`第 ${sg.day} 天 段 ${sg.order}：${sg.title}${open ? '' : '（尚未解鎖）'}${done ? '（已完成）' : ''}`}
                disabled={!open}
                onClick={() => props.setIdx(i)}
                className="w-9 h-9 rounded-full text-sm font-semibold border transition-colors disabled:opacity-40"
                style={{
                  backgroundColor: cur ? 'var(--color-brand)' : done ? 'var(--color-surface-lighter)' : 'var(--color-surface)',
                  borderColor: cur || done ? 'var(--color-brand)' : 'var(--color-surface-lighter)',
                  color: cur ? '#fff' : 'var(--color-text-primary)',
                }}
              >
                {done && !cur ? '✓' : sg.order}
              </button>
            );
          })}
        </div>
      ))}
      {comingSoon.length > 0 && <span className="text-xs self-center" style={muted}>第 {comingSoon.map((d) => d.day).join('、')} 天陸續開放</span>}
    </nav>
  );
}

// ── 一張投影片（一段） ────────────────────────────────────────
function Slide(props: {
  seg: SegmentDef;
  index: number;
  count: number;
  loaded: Loaded;
  progress: Progress;
  setProgress: (p: Progress) => void;
  revealed: boolean;
  setRevealed: () => void;
  onComplete: () => void;
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
  autoFocus: boolean;
}) {
  const { seg, loaded, progress } = props;
  const headingRef = useRef<HTMLHeadingElement>(null);
  // 翻到下一段後，把焦點移到新的標題，讀螢幕的人才知道內容換了
  useEffect(() => {
    if (props.autoFocus) headingRef.current?.focus();
  }, [props.autoFocus, seg.id]);
  const dayDef = days.find((d) => d.day === seg.day)!;
  const done = progress.completed.includes(seg.id);
  const exp = useMemo(() => expectedValues(loaded.dataset, loaded.touch, loaded.rfm, { repurchase: loaded.repurchase, basket: loaded.basket }), [loaded]);
  // 算不出標準答案的核對項（例如資料沒有商品欄的「商品關聯」）直接略過
  const checks = (seg.checks ?? []).filter((c) => Number.isFinite(exp[c.id]));
  const prompt = seg.tryPrompt ? fillPrompt(seg.tryPrompt, loaded.columns) : '';
  const isReport = seg.view === 'report';

  return (
    <section className="rounded-2xl border p-5 sm:p-6" style={card} aria-labelledby="seg-title">
      <p className="text-xs font-semibold no-print" style={{ color: 'var(--color-brand-light)' }}>
        第 {seg.day} 天 · {dayDef.title} · 段 {props.index + 1}/{props.count}
      </p>
      <h2 id="seg-title" ref={headingRef} tabIndex={-1} className="text-xl font-extrabold mt-1 no-print outline-none">{seg.title}</h2>
      <p className="sr-only" aria-live="polite">第 {props.index + 1} 段，共 {props.count} 段：{seg.title}</p>
      <p className="text-sm mt-1 no-print" style={secondary}>{seg.goal}</p>

      {!isReport && (
        <>
          <Step n={1} title="任務">
            <p className="text-sm">{seg.task}</p>
          </Step>

          {prompt && (
            <Step n={2} title="先自己試">
              <p className="text-xs mb-2" style={muted}>把下面這段貼到你自己的 AI 工具，再附上你的資料。（提示詞裡只有欄位名稱，沒有任何資料。）</p>
              <PromptBox title="展開提示詞" text={prompt} />
            </Step>
          )}

          {checks.length > 0 && (
            <Step n={prompt ? 3 : 2} title="記下你的 AI 算出的數字（選填，用來對答案）">
              <div className="space-y-2">
                {checks.map((c) => (
                  <label key={c.id} className="block text-sm">
                    {c.label}
                    <input
                      value={progress.claims[`${seg.id}.${c.id}`] ?? ''}
                      onChange={(e) => props.setProgress({ ...progress, claims: { ...progress.claims, [`${seg.id}.${c.id}`]: e.target.value } })}
                      placeholder="例如 1,817 或 63%"
                      className="mt-1 w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-lighter)' }}
                    />
                  </label>
                ))}
              </div>
            </Step>
          )}

          {!props.revealed ? (
            <div className="mt-6 text-center no-print">
              <button onClick={props.setRevealed} className="px-6 py-3 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: 'var(--color-brand)' }}>
                我試過了，對答案
              </button>
              <p className="text-xs mt-2" style={muted}>還沒試也可以直接看，但自己先試過，才看得出 AI 錯在哪。</p>
            </div>
          ) : (
            <Step n="✓" title="對答案">
              {checks.length > 0 && (
                <div className="space-y-2 mb-4">
                  {checks.map((c) => {
                    const r = compareClaim(c, progress.claims[`${seg.id}.${c.id}`], exp[c.id]);
                    return (
                      <div key={c.id} className="rounded-xl p-3 border text-sm" style={{ ...card, borderColor: r.status === 'off' ? '#f59e0b' : card.borderColor }}>
                        <p>{c.label}</p>
                        <p className="mt-1">標準算法：<b>{formatExpected(c, exp[c.id])}</b>
                          {r.status === 'match' && <span style={{ color: '#22c55e' }}>　✅ 你的 AI 算對了</span>}
                          {r.status === 'off' && <span style={{ color: '#f59e0b' }}>　⚠️ 你填的是 {progress.claims[`${seg.id}.${c.id}`]}</span>}
                        </p>
                        {r.status === 'off' && <p className="text-xs mt-1" style={secondary}>{c.hint}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
              {seg.view === 'touchpoints' && <TouchpointView touch={loaded.touch} />}
              {seg.view === 'health' && <HealthView health={loaded.health} />}
              {seg.view === 'rfm' && <RfmView rfm={loaded.rfm} />}
              {seg.view === 'insight' && <InsightView health={loaded.health} rfm={loaded.rfm} />}
              {seg.view === 'repurchase' && <RepurchaseView r={loaded.repurchase} />}
              {seg.view === 'basket' && <BasketView b={loaded.basket} />}
              {seg.view === 'value' && <ValueView v={loaded.value} repeatRevenueShare={loaded.repurchase.repeatRevenueShare} />}
              {seg.view === 'insight2' && <Insight2View repurchase={loaded.repurchase} basket={loaded.basket} value={loaded.value} />}
            </Step>
          )}

          {props.revealed && seg.takeawayLabel && (
            <Step n="✎" title="我學到">
              <label className="block text-sm">
                {seg.takeawayLabel}
                <span className="block text-xs" style={muted}>會出現在你的報告裡，請不要寫顧客個人資料。</span>
                <textarea
                  value={progress.notes[seg.id] ?? ''}
                  onChange={(e) => props.setProgress({ ...progress, notes: { ...progress.notes, [seg.id]: e.target.value } })}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-lighter)' }}
                />
              </label>
            </Step>
          )}
        </>
      )}

      {isReport && <ReportBox loaded={loaded} progress={progress} />}

      <div className="mt-6 flex items-center justify-between gap-3 flex-wrap no-print">
        <button onClick={props.onPrev} disabled={props.index === 0} className="px-4 py-2 rounded-lg text-sm disabled:opacity-40" style={{ backgroundColor: 'var(--color-surface-lighter)' }}>
          ← 上一段
        </button>
        {!isReport && props.revealed && !done && (
          <button onClick={props.onComplete} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: 'var(--color-brand)' }}>
            完成這一段 → 下一段
          </button>
        )}
        {!isReport && props.revealed && done && props.canNext && (
          <button onClick={props.onNext} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: 'var(--color-brand)' }}>下一段 →</button>
        )}
      </div>
    </section>
  );
}

function Step({ n, title, children }: { n: number | string; title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 no-print">
      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs" style={{ backgroundColor: 'var(--color-surface-lighter)' }}>{n}</span>
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}

// ── 成果：一頁報告 ────────────────────────────────────────────
function ReportBox({ loaded, progress }: { loaded: Loaded; progress: Progress }) {
  const [showAmounts, setShowAmounts] = useState(false);
  const [copied, setCopied] = useState<'ok' | 'fail' | null>(null);
  const model = useMemo(
    () =>
      buildReport(
        { sourceLabel: loaded.label, dataset: loaded.dataset, health: loaded.health, rfm: loaded.rfm, touch: loaded.touch, notes: progress.notes, claims: progress.claims, repurchase: loaded.repurchase, basket: loaded.basket, value: loaded.value },
        { showAmounts },
      ),
    [loaded, progress, showAmounts],
  );
  async function copy() {
    const text = reportToText(model);
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      ok = document.execCommand('copy');
      ta.remove();
    }
    setCopied(ok ? 'ok' : 'fail');
    setTimeout(() => setCopied(null), 2200);
  }
  return (
    <div className="mt-5">
      <div className="rounded-xl p-4 border mb-4 no-print" style={card}>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={showAmounts} onChange={(e) => setShowAmounts(e.target.checked)} className="mt-1" />
          <span>在報告中顯示金額（營收、累計消費）<span className="block text-xs" style={muted}>預設只顯示比例與人數。分享出去之前，想清楚哪些數字可以讓別人看到。</span></span>
        </label>
        <div className="mt-3 flex gap-2 flex-wrap">
          <button onClick={() => window.print()} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--color-brand)' }}>存成 PDF（列印）</button>
          <button onClick={() => void copy()} className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-surface-lighter)' }}>
            {copied === 'ok' ? '已複製 ✓' : copied === 'fail' ? '複製失敗，請手動選取' : '複製摘要文字'}
          </button>
        </div>
        <p className="text-xs mt-2" style={muted}>列印時選「另存為 PDF」。報告只有彙總數字、欄位名稱與你自己寫的心得；心得會原樣出現，請不要寫入顧客個人資料。</p>
      </div>
      <ReportView r={model} />
    </div>
  );
}
