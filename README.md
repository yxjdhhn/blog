# My Blog

基于 [Astro](https://astro.build) 构建的个人博客网站，支持中英双语、深色模式、全文搜索等功能，用于分享知识与观点。

## 功能特性

- **中英双语** — 基于 Astro i18n 路由，所有页面均有中/英两个版本，一键切换语言
- **深色/浅色模式** — 跟随系统偏好，支持手动切换，使用 localStorage 持久化
- **Markdown / MDX** — 使用 Markdown 撰写文章，支持 MDX 扩展语法
- **代码语法高亮** — 基于 Shiki，支持 `github-light` / `github-dark` 双主题自动切换
- **全文搜索** — 集成 [Pagefind](https://pagefind.app/)，构建时生成静态索引，零服务端依赖，支持中文分词
- **标签和分类** — 文章支持多标签和单分类，可按标签/分类浏览
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
├── package.json
├── tsconfig.json
├── vercel.json                   # Vercel 部署配置
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── images/                   # 静态图片资源
├── src/
│   ├── components/
│   │   ├── BaseHead.astro        # <head> SEO meta tags, Open Graph
│   │   ├── Header.astro          # 导航栏 (导航链接, 搜索, 语言/主题切换)
│   │   ├── Footer.astro          # 页脚 (社交链接, 版权信息)
│   │   ├── ThemeToggle.astro     # 深色/浅色模式切换按钮
│   │   ├── LanguagePicker.astro  # 中/英语言切换器
│   │   ├── Search.astro          # Pagefind 搜索模态框 (⌘K 快捷键)
│   │   ├── PostCard.astro        # 文章预览卡片
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
│   │   ├── translations.ts      # UI 文本翻译 (中/英)
│   │   └── utils.ts             # i18n 工具函数
│   ├── layouts/
│   │   ├── BaseLayout.astro     # 基础 HTML 骨架
│   │   └── PostLayout.astro     # 文章详情页布局 (TOC + 评论)
│   ├── pages/
│   │   ├── index.astro          # 根路径 → 重定向到 /zh/
│   │   ├── 404.astro            # 404 页面
│   │   ├── rss.xml.ts           # RSS 订阅源
│   │   ├── zh/                  # 中文版页面
│   │   │   ├── index.astro              # 首页
│   │   │   ├── about.astro              # 关于我
│   │   │   ├── blog/index.astro         # 文章列表
│   │   │   ├── blog/[...slug].astro     # 文章详情
│   │   │   ├── tags/index.astro         # 标签云
│   │   │   ├── tags/[tag]/index.astro   # 按标签筛选
│   │   │   └── categories/[category]/index.astro  # 按分类筛选
│   │   └── en/                  # 英文版 (与 zh/ 镜像结构)
│   ├── styles/
│   │   └── global.css           # 全局样式 + Tailwind + 文章排版
│   └── utils/
│       ├── posts.ts             # 文章查询/排序/筛选工具函数
│       └── date.ts              # 日期格式化工具
```

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 18.x
- npm >= 9.x

### 安装与运行

```bash
# 克隆项目
git clone <your-repo-url> blog
cd blog

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

## 撰写文章

### 创建新文章

在 `src/content/blog/zh/` (中文) 或 `src/content/blog/en/` (英文) 目录下创建 `.md` 文件：

```markdown
---
title: '文章标题'
description: '文章摘要描述'
pubDate: 2026-03-17
updatedDate: 2026-03-17    # 可选，更新日期
tags: ['Astro', '前端']
category: '技术'
heroImage: '/images/hero.jpg'  # 可选，封面图片
draft: false                   # 设为 true 则不会发布
---

正文内容...
```

### Frontmatter 字段说明

| 字段          | 类型       | 必填 | 说明                              |
| ------------- | ---------- | ---- | --------------------------------- |
| `title`       | string     | 是   | 文章标题                          |
| `description` | string     | 是   | 文章摘要，用于 SEO 和列表展示       |
| `pubDate`     | date       | 是   | 发布日期                          |
| `updatedDate` | date       | 否   | 更新日期                          |
| `tags`        | string[]   | 否   | 标签列表，默认为空                  |
| `category`    | string     | 否   | 分类名称，默认为「未分类」           |
| `heroImage`   | string     | 否   | 封面图片路径 (相对于 public/)       |
| `draft`       | boolean    | 否   | 草稿模式，`true` 时不会出现在列表中  |

### 文章路由

文件名即为 URL slug：

- `src/content/blog/zh/hello-world.md` → `/zh/blog/hello-world`
- `src/content/blog/en/hello-world.md` → `/en/blog/hello-world`

## 个性化配置

### 修改站点信息

1. **站点域名** — 编辑 `astro.config.mjs` 中的 `site` 字段
2. **博客标题和描述** — 编辑 `src/i18n/translations.ts` 中的 `site.title` 和 `site.description`
3. **关于我** — 编辑 `src/pages/zh/about.astro` 和 `src/pages/en/about.astro`
4. **社交链接** — 编辑 `src/components/Footer.astro` 中的链接

### 配置 Giscus 评论

1. 前往 [giscus.app](https://giscus.app/) 生成配置
2. 编辑 `src/components/Comments.astro`，替换以下字段：
   - `data-repo` → 你的 GitHub 仓库 (如 `username/blog`)
   - `data-repo-id` → 仓库 ID
   - `data-category` → Discussion 分类名
   - `data-category-id` → 分类 ID

### 配置搜索

搜索功能基于 Pagefind，在执行 `npm run build` 时自动生成索引。开发环境下搜索功能不可用（会显示提示信息），这是正常行为。

## 页面路由

```
/                       → 重定向到 /zh/
/zh/                    → 中文首页 (最新文章, 标签云)
/zh/blog/               → 中文文章列表
/zh/blog/<slug>         → 中文文章详情 (含 TOC + 评论)
/zh/tags/               → 中文标签云
/zh/tags/<tag>/         → 按标签筛选文章
/zh/categories/<cat>/   → 按分类筛选文章
/zh/about               → 关于我 (中文)
/en/...                 → 英文版 (镜像结构)
/rss.xml                → RSS 订阅源
/404                    → 未找到页面
```

## 部署

### Vercel (推荐)

1. 将项目推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入该仓库
3. Vercel 会自动检测 Astro 框架并配置构建命令
4. 部署完成后，在 Vercel 控制台开启 Analytics 即可启用访问统计

### 其他平台

修改 `astro.config.mjs` 中的 `adapter` 配置即可适配其他平台。移除 Vercel adapter 后默认为纯静态输出，可以部署到任何静态托管服务 (Netlify, Cloudflare Pages, GitHub Pages 等)。

## 许可证

MIT License
