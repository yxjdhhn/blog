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
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (lang === defaultLang) {
    return normalizedPath;
  }

  return normalizedPath === '/' ? `/${lang}/` : `/${lang}${normalizedPath}`;
}

export function switchLang(currentUrl: URL, targetLang: Lang): string {
  const segments = currentUrl.pathname.split('/').filter(Boolean);
  const hasLocalePrefix = segments.length > 0 && segments[0] in ui;
  const rest = hasLocalePrefix ? segments.slice(1) : segments;

  let path = `/${rest.join('/')}`;
  if (rest.length === 0) {
    path = '/';
  } else if (currentUrl.pathname.endsWith('/')) {
    path += '/';
  }

  return `${getLocalizedUrl(targetLang, path)}${currentUrl.search}${currentUrl.hash}`;
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
