---
title: '使用 Astro 构建个人博客'
description: '详细介绍如何使用 Astro 框架从零开始搭建一个功能完善的个人博客网站。'
pubDate: 2026-03-16
heroImage: '/images/snow.jpg'
tags: ['Astro', '前端', '教程']
category: '技术'
---

## 为什么选择 Astro？

Astro 是一个以内容为中心的 Web 框架，特别适合构建博客、文档等内容型网站。它有几个显著的优势：

### 性能优先

Astro 默认生成零 JavaScript 的静态 HTML，只在需要交互的地方才加载 JS。这意味着你的博客加载速度会非常快。

```astro
---
// 这段代码只在构建时运行，不会发送到浏览器
const posts = await getCollection('blog');
---

<ul>
  {posts.map(post => <li>{post.data.title}</li>)}
</ul>
```

### 内容集合

Astro 的 Content Collections 功能让你可以用类型安全的方式管理 Markdown 内容：

```typescript
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()),
  }),
});
```

### 灵活的集成

你可以轻松集成各种工具：

| 功能 | 工具 |
|------|------|
| 样式 | Tailwind CSS |
| 搜索 | Pagefind |
| 评论 | Giscus |
| 部署 | Vercel |

## 项目结构

一个典型的 Astro 博客项目结构如下：

```
blog/
├── src/
│   ├── content/    # Markdown 文章
│   ├── components/ # UI 组件
│   ├── layouts/    # 页面布局
│   └── pages/      # 路由页面
└── public/         # 静态资源
```

## 小结

Astro 是构建个人博客的绝佳选择。它简单、快速，且拥有丰富的生态系统。如果你正在考虑搭建自己的博客，不妨试试 Astro！
