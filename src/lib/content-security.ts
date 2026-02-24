/**
 * LaunchDock Content Security Layer
 * 
 * Multi-layered protection against:
 * 1. Prompt injection (LLM-style attacks hidden in UGC)
 * 2. XSS / HTML injection
 * 3. Spam / flooding
 * 4. Abuse / offensive content
 * 5. Rate limiting (client-side + Supabase RLS)
 */

// ============================================
// 1. BROWSER FINGERPRINT (anonymous, no PII)
// ============================================

/**
 * Generate a stable anonymous fingerprint without any PII.
 * Uses canvas + timezone + screen + language. Not 100% unique,
 * but enough to rate-limit per "device" without requiring login.
 */
export function getFingerprint(): string {
  const cached = sessionStorage.getItem('ld-fp');
  if (cached) return cached;

  const parts: string[] = [];

  // Timezone
  parts.push(Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown');

  // Screen dimensions
  parts.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);

  // Language
  parts.push(navigator.language || 'unknown');

  // Platform
  parts.push(navigator.platform || 'unknown');

  // Canvas fingerprint (fast, no visible render)
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(0, 0, 100, 30);
      ctx.fillStyle = '#069';
      ctx.fillText('LaunchDock🚀', 2, 15);
      parts.push(canvas.toDataURL().slice(-50));
    }
  } catch {
    parts.push('no-canvas');
  }

  // Hash into a short fingerprint
  const raw = parts.join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const chr = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  const fp = 'fp_' + Math.abs(hash).toString(36);
  sessionStorage.setItem('ld-fp', fp);
  return fp;
}

// ============================================
// 2. CONTENT SANITIZATION
// ============================================

/**
 * Strip all HTML tags to prevent XSS.
 */
function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

/**
 * Detect and neutralize prompt injection patterns.
 * These are strings that try to manipulate an LLM if our content 
 * is later fed into one (e.g., admin summary dashboard).
 */
const PROMPT_INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?previous\s+(instructions|prompts|rules)/i,
  /ignore\s+above/i,
  /you\s+are\s+now\s+(a|an|the)\s+/i,
  /act\s+as\s+(a|an)\s+/i,
  /system\s*:\s*/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /<<SYS>>/i,
  /\bDAN\b.*\bmode\b/i,
  /jailbreak/i,
  /pretend\s+you\s+(are|can)/i,
  /bypass\s+(your|the)\s+(rules|restrictions|filters)/i,
  /do\s+anything\s+now/i,
  /reveal\s+(your|the)\s+(system|initial)\s+prompt/i,
  /output\s+(your|the)\s+(system|initial)\s+prompt/i,
  /what\s+(is|are)\s+your\s+(instructions|rules|system\s+prompt)/i,
];

function containsPromptInjection(text: string): boolean {
  return PROMPT_INJECTION_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Detect excessive URLs (spam indicator).
 */
function containsExcessiveUrls(text: string): boolean {
  const urlCount = (text.match(/https?:\/\//g) || []).length;
  return urlCount > 2;
}

/**
 * Detect repetitive content (spam indicator).
 */
function isRepetitive(text: string): boolean {
  // Check if the same word repeats > 5 times
  const words = text.toLowerCase().split(/\s+/);
  const counts: Record<string, number> = {};
  for (const w of words) {
    if (w.length < 2) continue;
    counts[w] = (counts[w] || 0) + 1;
    if (counts[w] > 5) return true;
  }
  return false;
}

// Offensive / abuse word list (lightweight, catches obvious cases)
const ABUSE_PATTERNS: RegExp[] = [
  /fuck|shit|damn|ass\b|bastard/i,
  /白痴|智障|低能|廢物|去死|幹你|操你|垃圾/,
];

function containsAbuse(text: string): boolean {
  return ABUSE_PATTERNS.some(p => p.test(text));
}

// ============================================
// 3. MAIN VALIDATION FUNCTION
// ============================================

export interface ValidationResult {
  ok: boolean;
  sanitized: string;
  reason?: string;
}

/**
 * Validate and sanitize user-generated content.
 * Returns { ok, sanitized, reason }.
 * 
 * @param text - The raw user input
 * @param maxLength - Maximum allowed length (default: 500)
 */
export function validateContent(text: string, maxLength = 500): ValidationResult {
  // 1. Basic cleanup
  let sanitized = stripHtml(text).trim();

  // 2. Length check
  if (sanitized.length === 0) {
    return { ok: false, sanitized: '', reason: '內容不能為空' };
  }
  if (sanitized.length > maxLength) {
    return { ok: false, sanitized, reason: `內容不能超過 ${maxLength} 字` };
  }
  if (sanitized.length < 2) {
    return { ok: false, sanitized, reason: '內容太短' };
  }

  // 3. Prompt injection detection
  if (containsPromptInjection(sanitized)) {
    return { ok: false, sanitized, reason: '內容包含不允許的指令格式' };
  }

  // 4. Spam detection
  if (containsExcessiveUrls(sanitized)) {
    return { ok: false, sanitized, reason: '不能包含過多連結' };
  }
  if (isRepetitive(sanitized)) {
    return { ok: false, sanitized, reason: '內容過於重複' };
  }

  // 5. Abuse detection
  if (containsAbuse(sanitized)) {
    return { ok: false, sanitized, reason: '請使用友善的語言 🙏' };
  }

  // 6. Additional: encode angle brackets to prevent residual injection
  sanitized = sanitized.replace(/</g, '＜').replace(/>/g, '＞');

  return { ok: true, sanitized };
}

// ============================================
// 4. RATE LIMITING (client-side)
// ============================================

interface RateLimitConfig {
  maxActions: number;
  windowMs: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  question: { maxActions: 3, windowMs: 10 * 60 * 1000 },   // 3 questions per 10 min
  answer:   { maxActions: 5, windowMs: 10 * 60 * 1000 },   // 5 answers per 10 min
  reaction: { maxActions: 20, windowMs: 5 * 60 * 1000 },   // 20 reactions per 5 min
  helpful:  { maxActions: 10, windowMs: 5 * 60 * 1000 },   // 10 helpful votes per 5 min
};

/**
 * Client-side rate limiting using localStorage.
 * This is NOT a security boundary (can be bypassed),
 * but prevents accidental flooding. Real enforcement is via Supabase RLS.
 */
export function checkRateLimit(action: keyof typeof RATE_LIMITS): { allowed: boolean; retryAfterMs?: number } {
  const config = RATE_LIMITS[action];
  if (!config) return { allowed: true };

  const key = `ld-rate-${action}`;
  const now = Date.now();

  let timestamps: number[] = [];
  try {
    timestamps = JSON.parse(localStorage.getItem(key) || '[]');
  } catch {}

  // Remove expired entries
  timestamps = timestamps.filter(t => now - t < config.windowMs);

  if (timestamps.length >= config.maxActions) {
    const oldestValid = timestamps[0];
    const retryAfterMs = config.windowMs - (now - oldestValid);
    return { allowed: false, retryAfterMs };
  }

  timestamps.push(now);
  localStorage.setItem(key, JSON.stringify(timestamps));
  return { allowed: true };
}

/**
 * Format retry time for user display.
 */
export function formatRetryTime(ms: number): string {
  const minutes = Math.ceil(ms / 60000);
  return minutes <= 1 ? '1 分鐘' : `${minutes} 分鐘`;
}
