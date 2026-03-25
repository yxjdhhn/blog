import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '@/i18n/translations';

export type BlogPost = CollectionEntry<'blog'>;
export interface PostsByMonthGroup {
  key: string;
  date: Date;
  posts: BlogPost[];
}

export async function getPostsByLang(lang: Lang): Promise<BlogPost[]> {
  const allPosts = await getCollection('blog', ({ data, id }) => {
    return id.startsWith(`${lang}/`) && !data.draft;
  });
  return allPosts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getAllTags(lang: Lang): Promise<Map<string, number>> {
  const posts = await getPostsByLang(lang);
  const tags = new Map<string, number>();
  posts.forEach((post) => {
    post.data.tags.forEach((tag) => {
      tags.set(tag, (tags.get(tag) || 0) + 1);
    });
  });
  return new Map([...tags.entries()].sort((a, b) => b[1] - a[1]));
}

export async function getPostsByTag(lang: Lang, tag: string): Promise<BlogPost[]> {
  const posts = await getPostsByLang(lang);
  return posts.filter((post) => post.data.tags.includes(tag));
}

export async function getAllCategories(lang: Lang): Promise<Map<string, number>> {
  const posts = await getPostsByLang(lang);
  const categories = new Map<string, number>();
  posts.forEach((post) => {
    const cat = post.data.category;
    if (cat) {
      categories.set(cat, (categories.get(cat) || 0) + 1);
    }
  });
  return new Map([...categories.entries()].sort((a, b) => b[1] - a[1]));
}

export async function getPostsByCategory(lang: Lang, category: string): Promise<BlogPost[]> {
  const posts = await getPostsByLang(lang);
  return posts.filter((post) => post.data.category === category);
}

export function groupPostsByMonth(posts: BlogPost[]): PostsByMonthGroup[] {
  const groups = new Map<string, PostsByMonthGroup>();

  posts.forEach((post) => {
    const year = post.data.pubDate.getFullYear();
    const month = post.data.pubDate.getMonth();
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        date: new Date(year, month, 1),
        posts: [],
      });
    }

    groups.get(key)!.posts.push(post);
  });

  return [...groups.values()].sort((a, b) => b.date.valueOf() - a.date.valueOf());
}

export function getSlug(post: BlogPost): string {
  const parts = post.id.split('/');
  const slug = parts.slice(1).join('/');
  return slug.replace(/\.(md|mdx)$/, '');
}
