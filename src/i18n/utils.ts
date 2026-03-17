import { ui, defaultLang, type Lang } from './translations';

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as Lang;
  return defaultLang;
}

export function t(lang: Lang, key: keyof (typeof ui)[typeof defaultLang]): string {
  return ui[lang][key] || ui[defaultLang][key];
}

export function getLocalizedUrl(lang: Lang, path: string): string {
  return `/${lang}${path.startsWith('/') ? path : `/${path}`}`;
}

export function switchLang(currentUrl: URL, targetLang: Lang): string {
  const [, , ...rest] = currentUrl.pathname.split('/');
  return `/${targetLang}/${rest.join('/')}`;
}

export function formatDate(date: Date, lang: Lang): string {
  return date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const charsPerMinute = 500;

  const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = content
    .replace(/[\u4e00-\u9fff]/g, '')
    .split(/\s+/)
    .filter(Boolean).length;

  const minutes = chineseChars / charsPerMinute + englishWords / wordsPerMinute;
  return Math.max(1, Math.ceil(minutes));
}
