import { getLocalizedUrl } from '@/i18n/utils';
import type { Lang } from '@/i18n/translations';
import { getPostsByLang, getSlug } from '@/utils/posts';

export interface SearchItem {
  title: string;
  description: string;
  url: string;
  tags: string[];
  category: string;
  date: string;
  content: string;
}

function compactText(value: string): string {
  return value
    .replace(/[`*_>#-]/g, ' ')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function getSearchItems(lang: Lang): Promise<SearchItem[]> {
  const posts = await getPostsByLang(lang);

  return posts.map((post) => ({
    title: post.data.title,
    description: post.data.description ?? '',
    url: getLocalizedUrl(lang, `/blog/${getSlug(post)}`),
    tags: post.data.tags ?? [],
    category: post.data.category ?? '',
    date: post.data.pubDate.toISOString(),
    content: compactText(post.body || '').slice(0, 360),
  }));
}
