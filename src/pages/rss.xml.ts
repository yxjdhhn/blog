import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const allPosts = await getCollection('blog', ({ data }) => !data.draft);
  const sortedPosts = allPosts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  return rss({
    title: '元霄节快乐的博客 | allegria\'s Blog',
    description: '分享知识与观点 | Share knowledge and insights',
    site: context.site!,
    items: sortedPosts.map((post) => {
      const lang = post.id.startsWith('zh/') ? 'zh' : 'en';
      const slug = post.id.replace(/^(zh|en)\//, '').replace(/\.(md|mdx)$/, '');
      return {
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `/${lang}/blog/${slug}`,
        categories: post.data.tags,
      };
    }),
    customData: '<language>zh-cn</language>',
  });
}
