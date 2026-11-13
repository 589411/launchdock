/**
 * 藍鴨快報 — shared show links and the latest episode.
 *
 * Daily update: change `latestKuaibaoEpisode` only (date + youtubeId).
 * The homepage promo and both /kuaibao/ pages import this file.
 */
export const kuaibaoShow = {
  youtubePlaylist: 'https://www.youtube.com/playlist?list=PLOEkqRg9_ZDk',
  spotify: 'https://open.spotify.com/show/6tSd8u5FX9XhHRZEUzvMvO',
  rss: 'https://podcast.launchdock.app/feed.xml',
  youtubeChannel: 'https://www.youtube.com/@跟著Joseph學AI',
  contactEmail: 'podcast@launchdock.app',
} as const;

/** Bump `date` (YYYY-MM-DD) and `youtubeId` when the new daily episode goes live. */
export const latestKuaibaoEpisode = {
  date: '2026-11-13',
  youtubeId: 'H7tk0zcjDko',
} as const;

export function kuaibaoYoutubeWatchUrl(id = latestKuaibaoEpisode.youtubeId) {
  return `https://youtu.be/${id}`;
}

export function kuaibaoPodcastEpisodeUrl(date = latestKuaibaoEpisode.date) {
  return `https://podcast.launchdock.app/episodes/${date}/`;
}

export function kuaibaoThumbnailUrl(id = latestKuaibaoEpisode.youtubeId) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function formatKuaibaoDate(date: string, lang: 'zh-tw' | 'en') {
  const [y, m, d] = date.split('-');
  return lang === 'en' ? `${y}-${m}-${d}` : `${y}/${Number(m)}/${Number(d)}`;
}
