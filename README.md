# 元霄节快乐的博客 | allegria's Blog

基于 [Astro](https://astro.build) 构建的个人博客网站，支持中英双语、深色模式、全文搜索等功能，用于分享知识与观点。

## 功能特性

- **中英双语** — 基于 Astro i18n 路由，所有页面均有中/英两个版本，一键切换语言
- **中文单源自动翻译** — 以 `src/content/blog/zh/` 为唯一内容源，提交时自动生成对应英文稿
- **自动封面图** — 提交时自动生成封面；优先调用 SiliconFlow 真实出图，失败时回退本地封面并标记 `pending`
- **深色/浅色模式** — 跟随系统偏好，支持手动切换，使用 localStorage 持久化
- **Markdown / MDX** — 使用 Markdown 撰写文章，支持 MDX 扩展语法
- **代码语法高亮** — 基于 Shiki，支持 `github-light` / `github-dark` 双主题自动切换
- **全文搜索** — 集成 [Pagefind](https://pagefind.app/)，构建时生成静态索引，零服务端依赖，支持中文分词
- **标签和分类** — 文章支持多标签和可选分类，可按标签/分类浏览
- **文章目录 (TOC)** — 文章详情页侧边固定目录，使用 Intersection Observer 高亮当前章节
- **评论系统** — 集成 [Giscus](https://giscus.app/)（基于 GitHub Discussions），自动跟随主题和语言
- **RSS 订阅** — 自动生成 `/rss.xml` 订阅源
- **SEO 优化** — Open Graph、Twitter Card meta tags、自动生成 Sitemap
- **访问统计** — 支持 Vercel Analytics，部署后自动生效
- **响应式设计** — 移动端汉堡菜单，全设备自适应
- **404 页面** — 中英双语友好提示

## 技术栈

| 用途       | 技术方案                                    |
| ---------- | ------------------------------------------- |
| 框架       | Astro v5 (SSG 静态站点生成)                  |
| 样式       | Tailwind CSS v4                             |
| 内容管理   | Astro Content Collections + Markdown / MDX  |
| 代码高亮   | Shiki (Astro 内置)                           |
| 全文搜索   | Pagefind                                    |
| 评论       | Giscus (GitHub Discussions)                 |
| 国际化     | Astro 内置 i18n 路由                         |
| 访问统计   | Vercel Analytics                            |
| 部署       | Vercel                                      |

## 项目结构

```
blog/
├── astro.config.mjs              # Astro 配置 (i18n, Shiki, integrations)
├── .env.example                  # AI provider 配置模板
├── .husky/
│   └── pre-commit                # 提交前自动同步英文稿与封面
├── package.json
├── tsconfig.json
├── vercel.json                   # Vercel 部署配置
├── public/
│   ├── favicon.svg               # 站点图标
│   ├── logo.svg                  # 站点 Logo
│   └── robots.txt                # 搜索引擎爬虫规则
├── src/
│   ├── assets/
│   │   └── blog/generated/       # 自动生成/占位封面
│   ├── components/
│   │   ├── BaseHead.astro        # <head> SEO meta tags, Open Graph
│   │   ├── Header.astro          # 导航栏 (首页/标签/关于, 搜索, 语言/主题切换)
│   │   ├── Footer.astro          # 页脚 (社交链接, 版权信息)
│   │   ├── ThemeToggle.astro     # 深色/浅色模式切换按钮
│   │   ├── LanguagePicker.astro  # 中/英语言切换器
│   │   ├── Search.astro          # Pagefind 搜索模态框 (⌘K 快捷键)
│   │   ├── CompactPostListItem.astro # 文章预览卡片
│   │   ├── Pagination.astro      # 分页导航
│   │   ├── TableOfContents.astro # 文章侧边目录 (滚动高亮)
│   │   ├── TagCloud.astro        # 标签云
│   │   └── Comments.astro        # Giscus 评论组件
│   ├── content/
│   │   ├── config.ts             # Content Collection schema 定义
│   │   └── blog/
│   │       ├── zh/               # 中文文章 (Markdown)
│   │       └── en/               # 英文文章 (Markdown)
│   ├── i18n/
│   │   ├── translations.ts       # UI 文本翻译 (中/英)
│   │   └── utils.ts              # i18n 工具函数
│   ├── layouts/
│   │   ├── BaseLayout.astro      # 基础 HTML 骨架
│   │   └── PostLayout.astro      # 文章详情页布局 (TOC + 评论)
│   ├── pages/
│   │   ├── index.astro           # 中文首页（默认语言根路径）
│   │   ├── about.astro           # 中文关于页
│   │   ├── blog/                 # 中文博文路由
│   │   ├── tags/                 # 中文标签路由
│   │   ├── categories/           # 中文分类路由
│   │   ├── 404.astro             # 404 页面
│   │   ├── rss.xml.ts            # RSS 订阅源
│   │   ├── zh/                   # 旧中文路径兼容跳转页
│   │   └── en/                   # 英文版 (与 zh/ 镜像结构)
│   ├── styles/
│   │   └── global.css            # 全局样式 + Tailwind + 文章排版
│   └── utils/
│       ├── posts.ts              # 文章查询/排序/筛选工具函数
│       └── date.ts               # 日期格式化工具
├── scripts/
│   ├── sync-posts.mjs            # 中文稿 -> 英文稿自动同步
│   ├── retry-posts.mjs           # pending 稿件重试
│   ├── backfill-images.mjs       # 历史文章封面回填
│   └── setup-hooks.mjs           # 安装本地 git hook
```

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 18.x
- npm >= 9.x

### 安装与运行

```bash

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

开发服务器默认运行在 `http://localhost:4321`。

### 常用命令

| 命令              | 说明                                         |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | 启动开发服务器 (热重载)                        |
| `npm run build`   | 构建生产版本并生成 Pagefind 搜索索引            |
| `npm run preview` | 本地预览生产构建结果                            |
| `npm run posts:sync` | 同步全部中文文章并补英文稿/封面               |
| `npm run posts:images:backfill` | 为历史文章批量回填封面            |
| `npm run posts:retry -- <slug>` | 重试单篇 `pending` 文章           |
| `npm run posts:retry -- --pending` | 重试全部 `pending` 文章      |

## AI 自动生成工作流

### 1. 配置 AI Provider

复制 `.env.example` 为 `.env.local`，填写你的 DeepSeek 配置：

```bash
cp .env.example .env.local
```

推荐的 `.env.local` 模板如下：

```env
AI_TEXT_PROVIDER=deepseek-compatible
AI_TEXT_API_BASE_URL=https://api.deepseek.com
AI_TEXT_API_KEY=你的_deepseek_api_key
AI_TEXT_MODEL=deepseek-chat
AI_IMAGE_PROVIDER=siliconflow
AI_IMAGE_API_BASE_URL=https://api.siliconflow.cn/v1
AI_IMAGE_MODEL=Qwen/Qwen-Image
SILICONFLOW_API_KEY=你的_siliconflow_api_key
SKIP_BLOG_AUTOGEN=0
```

可用变量：

- `AI_TEXT_PROVIDER`：默认 `deepseek-compatible`
- `AI_TEXT_API_BASE_URL`：默认 `https://api.deepseek.com`
- `AI_TEXT_API_KEY`：你的 DeepSeek API Key
- `AI_TEXT_MODEL`：默认 `deepseek-chat`，也可切换为 `deepseek-reasoner`
- `AI_IMAGE_PROVIDER`：可选 `siliconflow` / `google-gemini` / `procedural-local`
- `AI_IMAGE_API_BASE_URL`：默认 `https://api.siliconflow.cn/v1`
- `AI_IMAGE_MODEL`：默认 `Qwen/Qwen-Image`
- `AI_IMAGE_API_KEY`：通用图片 provider API Key
- `SILICONFLOW_API_KEY`：SiliconFlow API Key
- `SILICONFLOW_API_BASE_URL`：可选，自定义 SiliconFlow 兼容网关
- `GOOGLE_API_KEY`：Google Gemini API Key（仅 `google-gemini` provider）

当前推荐配置是：**DeepSeek 负责翻译，SiliconFlow 负责真实封面出图**。  
如果没有配置图片 key，系统会默认回退为本地程序化封面。

### 2. 新文章只写中文

在 `src/content/blog/zh/` 目录下创建 `.md` 文件：

```markdown
---
title: '文章标题'
description: '文章摘要描述'
pubDate: 2026-03-17
updatedDate: 2026-03-17    # 可选
tags: ['Astro', '前端']
category: '技术'
draft: false                   # 设为 true 则不会发布
---

正文内容...
```

不要手动填写 `heroImage`。提交时会自动生成英文稿和封面图。

### 3. 提交时会发生什么

- `pre-commit` 会检查本次暂存的中文文章
- 若英文稿不存在或已过期，自动生成/更新 `src/content/blog/en/<slug>.md`
- 若封面不存在，自动生成 `src/assets/blog/generated/<slug>.<ext>`
- 生成了新文件时，本次 commit 会被中断；你需要先 review，再执行一次 `git add && git commit`

### 4. AI 不可用时的降级

如果 DeepSeek 翻译失败：

- 自动生成英文占位稿
- `translationStatus` 标记为 `pending`
- 图片链路不受影响
- 长文章会按块翻译，失败时保存本地恢复进度到 `.cache/`

如果 SiliconFlow / Gemini 图片生成失败：

- 自动回退为本地程序化封面
- `imageStatus` 标记为 `pending`
- 中文与英文仍共用同一张封面
- 后续可通过 `posts:retry` 或 `posts:images:backfill` 重新触发真实出图

此时第二次 `git add && git commit` 允许通过，不会反复重试 AI。

### 5. 如何重新触发 AI

- 重试单篇文章：`npm run posts:retry -- <slug>`
- 重试全部 `pending`：`npm run posts:retry -- --pending`

重试成功后重新 `git add` 并提交即可。

说明：

- `npm run posts:retry -- <slug>` 主要用于重试 `translationStatus: pending` 的英文稿
- 重试时会优先复用本地 checkpoint，从失败的块继续，而不是整篇从头翻译
- SiliconFlow 封面默认优先生成真实图片；失败时才回退本地程序化封面
- 因为中英文共用同一张封面，图片 prompt 会尽量避免语言相关文字；若必须出现文字，只允许少量专有名词

### 6. 临时跳过自动生成

开发者修改入口：

- 项目根目录 `.env`
- 项目根目录 `.env.local`

修改方法：

```env
SKIP_BLOG_AUTOGEN=1
```

作用：

- 离线开发
- API 不可用
- 临时跳过自动翻译和自动配图

恢复方式：

- 删除该变量，或改回 `SKIP_BLOG_AUTOGEN=0`

### Frontmatter 字段说明

| 字段          | 类型       | 必填 | 说明                              |
| ------------- | ---------- | ---- | --------------------------------- |
| `title`       | string     | 是   | 文章标题                          |
| `description` | string     | 是   | 文章摘要，用于 SEO 和列表展示       |
| `pubDate`     | date       | 是   | 发布日期                          |
| `updatedDate` | date       | 否   | 更新日期                          |
| `tags`        | string[]   | 否   | 标签列表，默认为空数组              |
| `category`    | string     | 否   | 分类名称，未设置时不显示分类        |
| `draft`       | boolean    | 否   | 草稿模式，`true` 时不会出现在列表中  |
| `generatedFrom` | string   | 否   | 自动生成英文稿时写入 `zh`           |
| `sourceHash`  | string     | 否   | 自动同步时用于判断英文稿是否过期     |
| `translationStatus` | string | 否 | 英文稿翻译状态，`complete/pending` |
| `imageStatus` | string     | 否   | 封面生成状态，`complete/pending`    |

### 文章路由

文件名即为 URL slug：

- `src/content/blog/zh/hello-world.md` → `/blog/hello-world`
- `src/content/blog/en/hello-world.md` → `/en/blog/hello-world`

## 个性化配置

### 配置搜索

搜索功能基于 Pagefind，在执行 `npm run build` 时自动生成索引。开发环境下搜索功能不可用（会显示提示信息），这是正常行为。

## 页面路由

```
/                       → 中文首页（文章列表）
/blog/                  → 重定向到 /
/blog/<slug>            → 中文文章详情 (含 TOC + 评论)
/tags/                  → 中文标签云
/tags/<tag>/            → 按标签筛选文章
/categories/<cat>/      → 按分类筛选文章
/about                  → 关于我 (中文)
/zh/...                 → 永久重定向到对应的中文无前缀路径
/en/...                 → 英文版 (镜像结构)
/rss.xml                → RSS 订阅源
/404                    → 未找到页面
```

## 部署
### 其他平台

修改 `astro.config.mjs` 中的 `adapter` 配置即可适配其他平台。移除 Vercel adapter 后默认为纯静态输出，可以部署到任何静态托管服务 (Netlify, Cloudflare Pages, GitHub Pages 等)。

## 许可证

MIT License
