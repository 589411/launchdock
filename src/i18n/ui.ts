// ============================================================
// i18n UI String Translations
// Add new locales here; keep keys in sync across all locales.
// ============================================================

export const languages = {
  'zh-tw': '繁中',
  en: 'EN',
} as const;

export type Locale = keyof typeof languages;

export const defaultLocale: Locale = 'zh-tw';

export const ui = {
  'zh-tw': {
    // Navigation
    'nav.home': '首頁',
    'nav.articles': '場景教學',
    'nav.events': '活動',
    'nav.about': '關於',
    'nav.discussion': '討論區',

    // Site identity
    'site.name': '藍鴨 LaunchDock',
    'site.tagline': '弄髒雙手，但不孤單',

    // Difficulty levels
    'difficulty.beginner': '入門',
    'difficulty.intermediate': '中級',
    'difficulty.advanced': '進階',

    // Scene names (also used as breadcrumb labels)
    'scene.intro': '認識 OpenClaw',
    'scene.env-setup': '環境準備',
    'scene.install': '安裝與部署',
    'scene.basics': '基礎使用',
    'scene.core': '核心功能',
    'scene.integration': '整合與自動化',
    'scene.advanced': '知識與進階',
    'scene.blog': '鴨編的碎碎念',

    // Article page UI
    'article.archived.warning': '此文章已封存',
    'article.archived.reason': '內容可能已過時',
    'article.stuck.hint': '卡住很正常——點段落旁的',
    'article.stuck.button': '😵 卡關',
    'article.stuck.suffix': '讓我們知道，或直接往下滾到問答區發問。也可以用',
    'article.stuck.ok': '👍 看懂',
    'article.stuck.notok': '😢 看不懂',
    'article.stuck.feedback': '告訴我們哪裡寫得好、哪裡要改。',
    'article.breadcrumb.home': '藍鴨 LaunchDock',

    // Articles list page
    'articles.title': '所有教學文章',
    'articles.filter.all': '全部',
    'articles.minutes': '分鐘',

    // Home page sections
    'home.hero.title': '歡迎來到藍鴨 LaunchDock',
    'home.hero.cta': '開始學習',
    'home.sections.newbie': '新手養蝦',
    'home.sections.basics': '基礎知識',
    'home.sections.application': '應用實戰',
    'home.sections.architecture': '龍蝦架構',
    'home.sections.advanced': '知識進階',
    'home.sections.blog': '鴨編的碎碎念',
  },

  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.articles': 'Tutorials',
    'nav.events': 'Events',
    'nav.about': 'About',
    'nav.discussion': 'Discuss',

    // Site identity
    'site.name': 'LaunchDock',
    'site.tagline': 'Get your hands dirty, but not alone',

    // Difficulty levels
    'difficulty.beginner': 'Beginner',
    'difficulty.intermediate': 'Intermediate',
    'difficulty.advanced': 'Advanced',

    // Scene names
    'scene.intro': 'About OpenClaw',
    'scene.env-setup': 'Environment Setup',
    'scene.install': 'Installation & Deployment',
    'scene.basics': 'Basic Usage',
    'scene.core': 'Core Features',
    'scene.integration': 'Integration & Automation',
    'scene.advanced': 'Knowledge & Advanced',
    'scene.blog': "Duck Editor's Notes",

    // Article page UI
    'article.archived.warning': 'This article is archived',
    'article.archived.reason': 'Content may be outdated',
    'article.stuck.hint': "It's normal to get stuck — click",
    'article.stuck.button': '😵 Stuck',
    'article.stuck.suffix': 'next to a section to let us know, or scroll down to the Q&A. You can also use',
    'article.stuck.ok': '👍 Got it',
    'article.stuck.notok': '😢 Confused',
    'article.stuck.feedback': 'to give feedback.',
    'article.breadcrumb.home': 'LaunchDock',

    // Articles list page
    'articles.title': 'All Tutorials',
    'articles.filter.all': 'All',
    'articles.minutes': 'min',

    // Home page sections
    'home.hero.title': 'Welcome to LaunchDock',
    'home.hero.cta': 'Start Learning',
    'home.sections.newbie': 'Getting Started',
    'home.sections.basics': 'Fundamentals',
    'home.sections.application': 'Hands-on Practice',
    'home.sections.architecture': 'OpenClaw Architecture',
    'home.sections.advanced': 'Knowledge & Advanced',
    'home.sections.blog': "Duck Editor's Notes",
  },
} as const;

// ── Scene key mapping ─────────────────────────────────────────
// Maps neutral English key → scene label for the given locale.
// Used when `scene` frontmatter is a neutral key (English articles).
export const sceneKeyToLabel: Record<Locale, Record<string, string>> = {
  'zh-tw': {
    intro: '認識 OpenClaw',
    'env-setup': '環境準備',
    install: '安裝與部署',
    basics: '基礎使用',
    core: '核心功能',
    integration: '整合與自動化',
    advanced: '知識與進階',
    blog: '鴨編的碎碎念',
  },
  en: {
    intro: 'About OpenClaw',
    'env-setup': 'Environment Setup',
    install: 'Installation & Deployment',
    basics: 'Basic Usage',
    core: 'Core Features',
    integration: 'Integration & Automation',
    advanced: 'Knowledge & Advanced',
    blog: "Duck Editor's Notes",
  },
};

// Maps neutral English difficulty key → locale-specific label.
export const difficultyKeyToLabel: Record<Locale, Record<string, string>> = {
  'zh-tw': {
    beginner: '入門',
    intermediate: '中級',
    advanced: '進階',
    // zh-tw articles already store the Chinese label directly
    '入門': '入門',
    '中級': '中級',
    '進階': '進階',
  },
  en: {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  },
};
