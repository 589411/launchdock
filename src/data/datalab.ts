// ============================================================
// 顧客數據戰情室 — 唯一策展點（客群名稱與建議、資料來源、解鎖設定）
// 維護方式：改文案或新增客群定義直接改本檔；計算邏輯在 src/lib/datalab/。
// ============================================================
import type { SegmentKey } from '../lib/datalab/types';

export interface SegmentInfo {
  name: string;
  /** 這群人長什麼樣子 */
  blurb: string;
  /** 對這群人，第一件該做的事 */
  action: string;
}

export const segmentInfo: Record<SegmentKey, SegmentInfo> = {
  champion: {
    name: '冠軍',
    blurb: '最近才買、買得頻繁、花得也多。',
    action: '不用打折留人，給專屬感：優先體驗、感謝、邀請口碑介紹。',
  },
  loyal: {
    name: '忠誠',
    blurb: '穩定回來的熟客，頻次與金額都在中上。',
    action: '把他們往冠軍推：交叉推薦其他品類、會員升級的明確門檻。',
  },
  newPotential: {
    name: '新客潛力',
    blurb: '最近才第一次買，還沒有第二次。',
    action: '第二次購買是關鍵：首購後 2 至 4 週內，給一個具體的回購理由。',
  },
  atRiskBig: {
    name: '高價值快流失',
    blurb: '以前買得多、花得多，但已經有一陣子沒來。',
    action: '最該搶救的一群：個別關心（誰、買過什麼、為什麼不來），而不是群發折扣。',
  },
  attention: {
    name: '需關注',
    blurb: '最近消費落在中間，熱度正在變淡。',
    action: '在他們變成沉睡之前，用新品或回購提醒拉一把。',
  },
  dormant: {
    name: '沉睡',
    blurb: '很久沒買了。',
    action: '低成本喚醒就好，並且留一組不聯絡的對照組，檢驗喚醒到底有沒有用。',
  },
  lost: {
    name: '流失',
    blurb: '最久沒有消費。',
    action: '除非有新的理由（新品、新店），否則別投入大成本。',
  },
};

// ── 資料來源 ──────────────────────────────────────────────────
/** 日晴生活（虛構零售品牌）公開教學資料，由瀏覽器即時抓取，本站不另存一份 */
export const sunlit = {
  baseUrl: 'https://sunlit.launchdock.app/data/',
  files: ['members', 'transactions', 'txn_items'] as const,
};

/** 內建小樣本（由 scripts/build-datalab-sample.mjs 抽樣產生，個資已改成假值） */
export const sample = {
  baseUrl: '/datalab/sample/',
  files: ['members', 'transactions', 'txn_items'] as const,
};

/**
 * 日晴完整資料的解鎖碼（SHA-256）。
 * 這只是介面上的軟性門檻：資料本身在日晴網站是公開可下載的，**不是**安全機制，
 * 頁面與文件都不得暗示資料受到保護。用雜湊存放只是不把碼明文寫進原始碼。
 * 新增一組碼：`printf '%s' '<碼>' | sha256sum`，把結果加進陣列。
 */
export const unlockCodeHashes: string[] = ['7ba6de8b74a1751302131909116affb1ef205843f654190346be26ee8a9177da'];

export const UNLOCK_STORAGE_KEY = 'datalab-sunlit-unlocked';
