---
title: 'AI 相关概念'
description: '详细介绍AI领域的一些相关术语。'
pubDate: 2026-03-20
heroImage: '/images/snow.jpg'
tags: ['AI', 'Agent', '博客']
category: '技术'
---

## 什么是Cursor Rules？

Cursor Rules也就是Cursor规则，本质上就是一组“开发规范/约束提示”，告诉 AI 在帮你写代码、生成文件时要遵守的规则。类似于你在写 prompt，但它是持久的，全局生效
Cursor Rules 有两种类型：全局规则（User Rules）、项目规则（Project Rules），全局适用于所有项目，项目则只对指定的生效

## 使用场景
统一代码风格（缩进、命名、注释习惯）
约束技术栈（项目规定只能用 React18，结果 AI 给你写了 React19 新语法）
固定项目结构（组件必须放在 /components 目录，API 请求要放到 api.ts，但 AI 一不小心就写到别的地方）
设置安全规则或团队规范（敏感信息不能出现在代码里，要遵守 ESLint 规则）

## 应用原理
大型语言模型不会在补全操作之间保留内存。规则在提示级别提供持久的、可重用的上下文。

应用规则时，规则内容会包含在模型上下文的开头。这为人工智能生成代码、解释编辑或辅助工作流程提供了一致的指导。

## rules分分类
可以设置user rules、project rules、team rules、 agent rules
项目规则:存储在您的代码库中.cursor/rules，进行版本控制，并限定在您的代码库范围内。

用户规则:全局应用于您的光标环境。由代理（聊天）使用。

团队规则:团队级规则可通过控制面板进行管理。适用于团队版和企业版套餐。

代理商.md:Markdown 格式的代理指令。一种简单的替代方案 .cursor/rules。

在 User Rules 里添加全局规则，例如，设置用中文回答，或者在 Project Rules 里为单个项目配置，例如设置项目编写规则，创建之后Cursor会在项目根目录下生成一个.cursor/rules文件夹，可以在这个文件夹中编写Mardown格式的语法规则。

## 如何设置
每条规则都是一个 Markdown 文件，您可以随意命名。Cursor 支持 .markdown.md和.mdc.markdown 扩展名。使用.mdc带有 frontmatter 的文件可以更精确地指定规则的生效时间description和生效条件，globs从而更好地控制规则的执行时机。

```
.cursor/rules/
  react-patterns.mdc       # Rule with frontmatter (description, globs)
  api-guidelines.md        # Simple markdown rule
  frontend/                # Organize rules in folders
    components.md
```

编写的过程中可以用agent进行智能写rules./create-rule in chat: Type /create-rule in Agent and describe what you want. Agent generates the rule file with proper frontmatter and saves it to .cursor/rules.
From settings: Open Cursor Settings > Rules, Commands and click + Add Rule. This creates a new rule file in .cursor/rules. From settings you can see all rules and their status.

rule应用模式
规则类型	描述
Always Apply	适用于每次聊天会话
Apply Intelligently	当代理人根据描述判断其相关性时
Apply to Specific Files	当文件与指定模式匹配时
Apply Manually	在聊天中提及 @ 时（例如，@my-rule）


如何创建
创建规则有两种方法：

/create-rule在聊天窗口中：输入/create-ruleAgent 并描述您的需求。Agent 会生成带有正确 frontmatter 的规则文件并将其保存到指定位置.cursor/rules。
在设置中：打开Cursor Settings > Rules, Commands并点击+ Add Rule。这将在指定位置创建一个新的规则文件.cursor/rules。在设置中，您可以查看所有规则及其状态。

编写注意事项：
规则长度控制在 500 行以内
将大型规则拆分成多个可组合的规则
请提供具体示例或参考文件
避免使用模糊的指导方针。将规则写得像清晰的内部文件一样。
在聊天中重复提示时重用规则
引用文件而不是复制其内容——这样可以保持规则简洁，并防止规则随着代码更改而失效。


将规则提交到 Git，这样整个团队都能受益。当发现 Agent 出错时，请更新规则。您甚至可以@cursor在 GitHub 问题或 PR 中添加标签，让 Agent 为您更新规则。
团队管理员可以直接通过 Cursor 控制面板创建和管理规则：团队规则创建完成后，将自动应用于所有团队成员，并在控制面板中显示：

## 规则优先级
内容：团队规则是自由文本格式，不使用项目规则的文件夹结构。
全局模式：团队规则支持文件级全局模式。设置全局模式（例如 `<filename> **/*.py`）后，规则仅在匹配的文件位于上下文中时生效。未设置全局模式的规则将应用于所有会话。
适用范围：当团队规则启用时（除非强制执行，否则用户未禁用），该规则将包含在该团队所有存储库和项目的代理（聊天）模型上下文中。
优先级：规则按以下顺序应用：团队规则 → 项目规则 → 用户规则。所有适用的规则都会合并；当规则之间存在冲突时，以较早发布的规则为准。

推荐
可以从外部引入rules，例如github上的一些开源rules,

```md
# 项目背景
这是一个在线旅游攻略分享平台，前端使用 React + TypeScript + TailwindCSS，
后端提供 RESTful API。目标是让用户能快速分享和浏览旅游日记。

# 编码标准
- 所有代码必须使用 TypeScript，不允许使用 JavaScript。
- 变量命名统一使用 camelCase。
- React 组件必须使用 PascalCase。
- 自定义 Hooks 必须以 `use` 开头。

# 库和框架约束
- 必须使用 React 18，不要用 React 19 新特性。
- 样式必须使用 TailwindCSS，不要写内联 style。
- 网络请求必须使用 `fetch`，不允许用 axios。

# 文件结构
- 业务组件放在 `src/components` 下。
- API 调用必须封装在 `src/api` 下。
- 所有页面文件放在 `src/pages` 下。
- 公共工具函数放在 `src/utils` 下。

# 文档规范
- 导出的 API 方法必须写 JSDoc 注释。
- 复杂逻辑的 Hooks 必须写注释，说明参数和返回值。
- 每个页面组件文件顶部必须有模块说明注释。

# 安全规范
- 不要把明文 API Key、token 写在代码里。
- 所有配置从 `.env` 里读取，通过 `process.env` 使用。

```


```md
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
