import { ui, defaultLocale, type Locale } from './ui';

export type UIKey = keyof typeof ui[typeof defaultLocale];

/**
 * Detect locale from the URL pathname.
 * /en/... → 'en'
 * anything else → 'zh-tw' (default, no prefix)
 */
export function getLangFromUrl(url: URL): Locale {
  const [, first] = url.pathname.split('/');
  if (first && (first in ui)) return first as Locale;
  return defaultLocale;
}

/**
 * Returns a translation function bound to the given locale.
 * Falls back to default locale if a key is missing.
 *
 * @example
 *   const t = useTranslations('en');
 *   t('nav.home') // → 'Home'
 */
export function useTranslations(lang: Locale) {
  return function t(key: UIKey): string {
    const localeStrings = ui[lang] as Record<string, string>;
    const fallback = ui[defaultLocale] as Record<string, string>;
    return localeStrings[key] ?? fallback[key] ?? key;
  };
}

/**
 * Get the equivalent URL path in the target locale.
 *
 * - zh-tw is the default locale (no prefix): /articles/llm-guide
 * - en has the /en prefix:                   /en/articles/llm-guide
 */
export function getAlternatePath(url: URL, targetLang: Locale): string {
  const path = url.pathname;
  const isCurrentlyEn =
    path === '/en' || path.startsWith('/en/');

  if (targetLang === defaultLocale) {
    if (!isCurrentlyEn) return path;
    const stripped = path.replace(/^\/en/, '') || '/';
    return stripped;
  } else {
    // Adding /en prefix
    if (isCurrentlyEn) return path;
    return '/en' + (path === '/' ? '' : path);
  }
}

/**
 * Returns the base articles path for the given locale.
 * zh-tw → /articles
 * en    → /en/articles
 */
export function articlesPath(lang: Locale): string {
  return lang === defaultLocale ? '/articles' : `/${lang}/articles`;
}
