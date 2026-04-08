# YY 的博客 | allegria's Blog

基于 [Astro](https://astro.build/) 构建的双语静态博客，当前包含中文默认站点和英文镜像站点。项目除了常规的文章发布、标签分类、搜索、评论和 RSS 之外，还带有一套“中文稿为主，英文稿与封面自动补全”的提交前工作流。

## 当前能力

- 中英双语路由：默认中文无前缀，英文使用 `/en/*`
- 首页按月份归档文章
- 标签云、标签页、分类页
- 文章阅读时长、目录高亮、封面图展示
- 深色 / 浅色主题切换
- 基于 Pagefind 的静态全文搜索
- Giscus 评论系统
- RSS、Sitemap、Open Graph、Twitter Card
- Vercel Insights 脚本注入
- 提交前自动同步英文稿与文章封面
- AI 不可用时自动降级为 `pending` 稿件或本地 SVG 封面

## 技术栈

| 用途 | 方案 |
| --- | --- |
| 站点框架 | Astro 5 |
| 内容系统 | Astro Content Collections |
| 内容格式 | Markdown / MDX |
| 样式 | Tailwind CSS 4（通过 `@tailwindcss/vite`） |
| 代码高亮 | Shiki |
| 搜索 | Pagefind |
| 评论 | Giscus |
| 部署适配 | `@astrojs/vercel` |

## 项目结构

```text
blog/
├── astro.config.mjs
├── package.json
├── vercel.json
├── public/
│   ├── favicon.svg
│   ├── logo.svg
│   └── robots.txt
├── src/
│   ├── assets/blog/generated/     # 自动生成或降级生成的封面图
│   ├── components/                # Header / Search / TOC / Comments 等组件
│   ├── content/
│   │   ├── config.ts
│   │   └── blog/
│   │       ├── zh/                # 中文文章源
│   │       └── en/                # 英文文章
│   ├── i18n/                      # 语言与路由工具
│   ├── layouts/
│   ├── pages/                     # 中英文页面与 RSS 路由
│   ├── plugins/                   # rehype 可折叠代码块插件
│   ├── styles/
│   └── utils/
└── scripts/
    ├── setup-hooks.mjs
    ├── sync-posts.mjs
    ├── retry-posts.mjs
    ├── backfill-images.mjs
    ├── lib/
    └── providers/
        ├── text/
        └── image/
```

## 开发

### 环境要求

- Node.js 18+
- npm 9+

### 安装与启动

```bash
npm install
npm run dev
```

开发服务器默认运行在 `http://localhost:4321`。

`npm install` 会触发 `prepare` 脚本，自动把 Git hook 指向项目内的 `.husky/`。

### 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 构建站点，并为 `dist/` 生成 Pagefind 索引 |
| `npm run preview` | 预览生产构建结果 |
| `npm run posts:sync` | 扫描全部中文文章，同步英文稿和封面 |
| `npm run posts:sync:staged` | 只处理已暂存的中文文章，供 pre-commit 使用，且如果封面已经存在，不会再更新封面 |
| `npm run posts:retry -- <slug>` | 重试单篇自动化，若只有中文稿荐，则自动生成英文稿和封面，若英文稿为complete，则只更新封面 |
| `npm run posts:retry -- --pending` | 重试全部 `pending` 文章 |
| `npm run posts:images:backfill` | 为缺失封面的文章补图 |

### 历史稿件更新

更新中文稿件之后，想要同步更新历史稿件的英文稿件和封面，可以在对应的英文稿件中加入generatedFrom: zh，再执行命令会出发自动化流程

## 内容发布

### 写文章

中文文章放在 `src/content/blog/zh/`，支持 `.md` 和 `.mdx`。文件名就是文章 `slug`。

示例：

```md
---
title: '文章标题'
description: '文章摘要'
pubDate: 2026-04-01
updatedDate: 2026-04-01
tags: ['Astro', 'Blog']
category: '技术'
draft: false
---

正文内容
```

### Frontmatter 字段

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 标题 |
| `description` | 是 | 摘要，用于列表和 SEO |
| `pubDate` | 是 | 发布时间 |
| `updatedDate` | 否 | 更新时间 |
| `tags` | 否 | 标签数组，默认空数组 |
| `category` | 否 | 分类 |
| `heroImage` | 否 | 封面图；可由脚本自动补全 |
| `draft` | 否 | `true` 时不出现在文章列表与 RSS 中 |
| `generatedFrom` | 否 | 自动生成英文稿时会写入 `zh` |
| `sourceHash` | 否 | 自动同步时用于判断英文稿是否过期 |
| `translationStatus` | 否 | `complete` / `pending` |
| `imageStatus` | 否 | `complete` / `pending` |

## AI 自动化工作流

### 提交前会做什么

`.husky/pre-commit` 当前只执行一条命令：

```sh
npm run posts:sync:staged
```

它会扫描本次暂存的中文文章，并尝试：

- 生成或更新对应英文稿 `src/content/blog/en/<slug>.*`
- 生成或更新共享封面 `src/assets/blog/generated/<slug>.*`
- 在 AI 不可用时写入 `pending` 状态，保留可继续提交的结果

如果本次 hook 生成了新文件或更新了文件，提交会中断一次，目的是让你先 review 并重新 `git add`。

### English 稿件策略

- 中文稿是自动化入口
- 如果英文稿带有 `generatedFrom` 和 `sourceHash`，脚本会把它当作托管稿件继续维护
- 如果英文稿是历史手写稿，没有这些字段，脚本不会覆盖正文，只会继续处理共享封面

### 供应商与环境变量

 `.env.local`，自动化脚本会读取这两个文件里尚未在当前环境中定义的变量；为避免歧义，建议同名变量只保留一处。

文本翻译支持：

- `deepseek-compatible`

图片生成支持：

- `siliconflow`
- `procedural-local`

常用变量如下：

| 变量 | 说明 |
| --- | --- |
| `AI_TEXT_PROVIDER` | 文本 provider，默认 `deepseek-compatible` |
| `AI_TEXT_API_BASE_URL` | 文本接口地址 |
| `AI_TEXT_API_KEY` | 文本接口密钥 |
| `AI_TEXT_MODEL` | 文本模型名 |
| `AI_IMAGE_PROVIDER` | 图片 provider，默认 `siliconflow`；设为 `procedural-local` 可强制走本地 SVG |
| `AI_IMAGE_API_BASE_URL` | 图片接口地址 |
| `AI_IMAGE_MODEL` | 图片模型名 |
| `SILICONFLOW_API_KEY` | SiliconFlow 专用密钥 |
| `SKIP_BLOG_AUTOGEN` | 设为 `1` 时跳过自动翻译和自动配图 |

示例：DeepSeek 文本翻译 + SiliconFlow 出图

```env
AI_TEXT_PROVIDER=deepseek-compatible
AI_TEXT_API_BASE_URL=https://api.deepseek.com
AI_TEXT_API_KEY=your_text_key
AI_TEXT_MODEL=deepseek-chat

AI_IMAGE_PROVIDER=siliconflow
AI_IMAGE_API_BASE_URL=https://api.siliconflow.cn/v1
AI_IMAGE_MODEL=Qwen/Qwen-Image
SILICONFLOW_API_KEY=your_image_key

SKIP_BLOG_AUTOGEN=0
```

如果没有可用的图片密钥，图片链路会自动回退到本地生成的 SVG 封面。
如果你想完全离线生成封面，可显式设置 `AI_IMAGE_PROVIDER=procedural-local`。

### 重试与跳过

- 重试单篇：`npm run posts:retry -- <slug>`
- 重试全部 pending：`npm run posts:retry -- --pending`
- 批量补封面：`npm run posts:images:backfill`
- 临时跳过自动化：在 `.env` 或 `.env.local` 中设置 `SKIP_BLOG_AUTOGEN=1`

## 路由概览

| 路由 | 说明 |
| --- | --- |
| `/` | 中文首页 |
| `/blog/` | 重定向到 `/` |
| `/blog/<slug>/` | 中文文章详情 |
| `/tags/` | 中文标签云 |
| `/tags/<tag>/` | 中文标签页 |
| `/categories/<category>/` | 中文分类页 |
| `/about` | 中文关于页 |
| `/zh/*` | 兼容路径，重定向到对应中文无前缀路由 |
| `/en/` | 英文首页 |
| `/en/blog/` | 重定向到 `/en/` |
| `/en/blog/<slug>/` | 英文文章详情 |
| `/en/tags/` | 英文标签云 |
| `/en/categories/<category>/` | 英文分类页 |
| `/en/about` | 英文关于页 |
| `/rss.xml` | 全站 RSS |

## 部署与维护

当前配置使用 Vercel adapter，`astro.config.mjs` 中的站点地址为 `https://blog.yyykit.com`。如果你 fork 这个项目，通常至少需要同步调整下面两处：

- [astro.config.mjs](/Users/allegria/Project/blog/astro.config.mjs) 中的 `site`
- [src/components/Comments.astro](/Users/allegria/Project/blog/src/components/Comments.astro) 中的 Giscus 仓库配置

如果不使用 Vercel，也可以替换 adapter，继续以静态站点方式部署到其他平台。
