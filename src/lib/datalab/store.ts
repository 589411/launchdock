import type { Dataset, HealthReport } from './types';
import type { FieldKey } from './detect';

/**
 * 本機儲存。原則：
 * - 進度與心得（不含任何資料列）放 localStorage，預設就會記。
 * - 「資料本身」只有在使用者勾選「存在這台電腦」才寫進 IndexedDB，只存在這個瀏覽器，不會上傳；
 *   隨時可以清除。沒勾選就一筆都不存。
 * - 欄位對應以「欄名」記住（不含資料），隔天重新上傳同一種格式時自動套用。
 */

const PROGRESS_KEY = 'datalab-progress-v1';
const MAPPING_KEY = 'datalab-mapping-v1';
const DB_NAME = 'launchdock-datalab';
const STORE = 'kv';
const DATA_KEY = 'own-dataset';

export interface Progress {
  /** 這份進度屬於哪一份資料（來源＋筆數＋基準日＋金額合計）；換資料時進度與核對數字要一併重來 */
  fingerprint?: string;
  completed: string[];
  /** segmentId → 學員寫的心得 */
  notes: Record<string, string>;
  /** `${segmentId}.${checkId}` → 學員填的「我的 AI 算出來的數字」 */
  claims: Record<string, string>;
}

const emptyProgress = (): Progress => ({ completed: [], notes: {}, claims: {} });

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return emptyProgress();
    const p = JSON.parse(raw);
    return {
      fingerprint: typeof p.fingerprint === 'string' ? p.fingerprint : undefined,
      completed: Array.isArray(p.completed) ? p.completed : [],
      notes: p.notes && typeof p.notes === 'object' ? p.notes : {},
      claims: p.claims && typeof p.claims === 'object' ? p.claims : {},
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch {
    /* ignore */
  }
}

export type NamedMapping = Partial<Record<FieldKey, string>>;

export function rememberMapping(headers: string[], m: NamedMapping): void {
  try {
    const all = JSON.parse(localStorage.getItem(MAPPING_KEY) ?? '{}');
    all[headers.join('|')] = m;
    localStorage.setItem(MAPPING_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function recallMapping(headers: string[]): NamedMapping | null {
  try {
    const all = JSON.parse(localStorage.getItem(MAPPING_KEY) ?? '{}');
    return all[headers.join('|')] ?? null;
  } catch {
    return null;
  }
}

// ── IndexedDB：只有使用者勾選「存在這台電腦」才會用到 ─────────────

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export interface SavedData {
  dataset: Dataset;
  /** 健檢結果只含統計與已遮罩的範例，不含任何資料列 */
  health: HealthReport;
  /** 欄位名稱（給提示詞用） */
  columns: string[];
  fileName: string;
  savedAt: number;
}

export async function saveData(d: SavedData): Promise<boolean> {
  try {
    const db = await openDb();
    await new Promise<void>((res, rej) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(d, DATA_KEY);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
      tx.onabort = () => rej(tx.error);
    });
    db.close();
    try {
      localStorage.setItem(SAVED_FLAG, '1');
    } catch {
      /* ignore */
    }
    return true;
  } catch {
    return false;
  }
}

/** 是否曾經存過資料：沒存過就不要去開 IndexedDB（開啟本身會在使用者的瀏覽器裡建立一個空資料庫） */
const SAVED_FLAG = 'datalab-has-saved-data';
export function hasSavedFlag(): boolean {
  try {
    return localStorage.getItem(SAVED_FLAG) === '1';
  } catch {
    return false;
  }
}

export async function loadData(): Promise<SavedData | null> {
  if (!hasSavedFlag()) return null;
  try {
    const db = await openDb();
    const v = await new Promise<SavedData | null>((res, rej) => {
      const r = db.transaction(STORE, 'readonly').objectStore(STORE).get(DATA_KEY);
      r.onsuccess = () => res((r.result as SavedData) ?? null);
      r.onerror = () => rej(r.error);
    });
    db.close();
    return v;
  } catch {
    return null;
  }
}

/** 清掉這台電腦上所有紀錄：存起來的資料、欄位對應記憶、進度與心得 */
export async function clearAllLocal(): Promise<void> {
  await clearData();
  clearProgress();
  try {
    localStorage.removeItem(MAPPING_KEY);
    localStorage.removeItem(SAVED_FLAG);
  } catch {
    /* ignore */
  }
}

export async function clearData(): Promise<void> {
  if (!hasSavedFlag()) return;
  try {
    const db = await openDb();
    await new Promise<void>((res, rej) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(DATA_KEY);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
    db.close();
  } catch {
    /* ignore */
  }
}
