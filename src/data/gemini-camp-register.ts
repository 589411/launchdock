/**
 * 藍鴨Gemini陪跑營報名表的選項與價格（前端顯示用）。
 * 價格與折扣的正式計算在 supabase/functions/gemini-camp-register/index.ts，
 * 兩邊的數字與 key 要保持一致；改價格時兩處都要改。
 */

export type GeminiPlanKey = 'basic' | 'advanced' | 'bundle';

export const GEMINI_PLANS: Record<GeminiPlanKey, { price: number; zh: string; en: string }> = {
  basic: { price: 3000, zh: '基本月（W1–W4）', en: 'Basic month (W1–W4)' },
  advanced: { price: 3000, zh: '進階月（W5–W8）', en: 'Advanced month (W5–W8)' },
  bundle: { price: 5700, zh: '兩個月一起報（基本＋進階）', en: 'Both months (Basic + Advanced)' },
};

export const GEMINI_BACKGROUNDS = [
  { value: 'social_welfare', zh: '社福團體工作人員', en: 'Social welfare organization staff' },
  { value: 'church', zh: '教會工作人員', en: 'Church staff' },
  { value: 'disability', zh: '身障團體工作人員', en: 'Disability organization staff' },
  { value: 'fulltime_staff', zh: '全職同工', en: 'Full-time staff' },
  { value: 'corporate_admin', zh: '企業行政人員', en: 'Corporate admin staff' },
  { value: 'public_admin', zh: '公部門或學校行政人員', en: 'Government or school admin staff' },
  { value: 'other', zh: '其他', en: 'Other' },
] as const;

export const GEMINI_ADMIN_TASKS = [
  { value: 'mail', zh: '收信、分類與回信', en: 'Email triage and replies' },
  { value: 'meeting', zh: '會議紀錄與文件歸檔', en: 'Meeting notes and filing' },
  { value: 'sheets', zh: '試算表整理與報表', en: 'Spreadsheet cleanup and reports' },
  { value: 'calendar', zh: '行程安排與會前準備', en: 'Scheduling and meeting prep' },
  { value: 'forms', zh: '表單、申請與採購流程', en: 'Forms, applications, and purchasing' },
  { value: 'other', zh: '其他', en: 'Other' },
] as const;
