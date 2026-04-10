---
title: AI Agent 在前端工程化中的三层能力演进：Rule、Skill 与 MCP
description: 介绍 Rule、Skill、MCP 在 React 前端工程中的职责边界、适配场景、推荐组合与常见坑点。
pubDate: '2026-03-30'
tags:
  - AI
  - Agent
  - MCP
  - 前端工程化
  - React
  - Next.js
  - TypeScript
category: 技术
heroImage: ../../../assets/blog/generated/ai-introduction.png
imageStatus: complete
---
现在聊 AI Agent，如果还只把它当“会补代码的编辑器插件”，已经完全不够了。

前端工程里真正难的，从来不是让它吐一段 JSX。难的是三件事：

- 它要按项目规范来写
- 它要知道下一步该做什么
- 它要拿到真实上下文，而不是闭眼瞎猜

这三件事，刚好对应三层能力：

- `Rule`：约束层
- `Skill`：指令层
- `MCP`：协议层

这篇把这三层拆开，看清它们在 React 前端工程里各自解决什么问题，适合怎么接，以及哪里最容易用歪。

<div class="article-callout">
  <p class="article-kicker">先记结论</p>
  <ul>
    <li><strong>经常写歪</strong>，先补 <code>Rule</code>。</li>
    <li><strong>经常重复造轮子</strong>，先拆 <code>Skill</code>。</li>
    <li><strong>经常靠猜最新信息或页面现场</strong>，再接 <code>MCP</code>。</li>
  </ul>
</div>

<div class="article-grid">
  <div class="article-card">
    <h3>Rule 解决什么</h3>
    <p>解决“同一个项目，AI 每次写法都不一样”的问题。</p>
  </div>
  <div class="article-card">
    <h3>Skill 解决什么</h3>
    <p>解决“下一步到底该怎么做，怎么稳定复用”的问题。</p>
  </div>
  <div class="article-card">
    <h3>MCP 解决什么</h3>
    <p>解决“没有真实上下文，只能凭印象猜”的问题。</p>
  </div>
</div>

<div class="article-callout">
  <p class="article-kicker">想直接看怎么用</p>
  <ul>
    <li><a href="/blog/ai-introduction-rule/">Rule 怎么创建、怎么拆、怎么写才不臃肿</a></li>
    <li><a href="/blog/ai-introduction-skill/">Skill 怎么设计输入输出，怎么拆成可复用动作</a></li>
    <li><a href="/blog/ai-introduction-mcp/">MCP 怎么按场景接入文档、浏览器和设计系统</a></li>
  </ul>
</div>

## 先看全景：Rule、Skill、MCP 到底怎么分工

很多团队一上来就把 Prompt、Tools、MCP 混着聊，结果越配越乱。更稳的做法，是先把边界说死。

| 层级 | 职责 | 典型输入 | 适合解决的问题 | 常见误用 |
| --- | --- | --- | --- | --- |
| `Rule` | 约束 Agent 的生成方式 | 技术栈规范、目录规范、边界规则、输出格式 | 统一代码风格、限制架构边界、减少跑偏 | 把业务文档和临时需求全塞进去 |
| `Skill` | 把任务拆成可复用的原子动作 | 结构化参数、工具定义、输入输出契约 | 生成页面、补测试、封装请求、改表格列 | 写成“万能 Prompt” |
| `MCP` | 让 Agent 接入外部上下文和工具能力 | 文档、浏览器、设计系统、仓库、接口 | 查最新文档、看页面现场、读设计约束 | 什么都接，造成上下文污染 |

一句话概括：

- `Rule` 管怎么写
- `Skill` 管怎么做
- `MCP` 管能看到什么

CLAUDE.md：公司总制度
rules：部门补充规定
skill：这类工作的 SOP 手册
hook：门禁 / 安检 / 自动检查脚本
compact：开会开久了，整理一下桌面和纪要

其中最容易混淆的，是 `Rule` 和 `MCP`。

`Rule` 是脑子里的规矩。它决定 Agent 输出时遵守什么边界。

`MCP` 是手里的外部插槽。它决定 Agent 能访问哪些外部信息和工具。

一个管认知约束。一个管上下文能力。不是一回事。

## Rule：从 Lint 到 Prompt 的约束前移

> **一句话理解：** `Rule` 不是事后纠错，而是让 Agent 一开始就别写歪。

### 底层逻辑

前端团队对“规则”这件事并不陌生。`ESLint`、`TypeScript`、目录规范、组件约定，这些本来就有。

问题是，这些规则大多发生在生成之后。

也就是代码已经出来了，再去检查，再去报错，再去返工。

`Rule` 的价值，在于把约束前移到生成之前。让 Agent 在下笔前，就知道哪些东西能写，哪些东西别碰。

所以可以把它理解成 Prompt 时代的工程规范层：

- Lint 是结果校验
- Rule 是生成约束

这两个不是替代关系。是前后配合。

如果没有 Rule，Agent 每次都会重新猜项目风格。猜对了是运气，猜错了就开始污染代码库。

### 典型用法

举个例子，在 `React + Next.js + TypeScript` 的后台管理项目里，Rule 最适合承载高频、稳定、跨会话生效的规则。

比如：

- 页面、组件、hooks、services、types 目录固定
- 数据请求必须经过 `services` 层，不直接散落在页面组件里

一个可落地的 `.cursorrules` 可以长这样：

```md
# React Admin Baseline

- Use TypeScript only. Assume `strict: true`.

# Project Structure

- Pages live in `src/app`.
- Shared components live in `src/components`.
- Data fetching logic lives in `src/services`.
- Reusable hooks live in `src/hooks`.
- Types live in `src/types`.

# UI Constraints

- Forms should use the shared form wrapper.
- Tables should keep columns in dedicated config files.
- Do not place fetch logic directly inside reusable UI components.

# Output Contract

- Generated code must include explicit prop types.
- Avoid inline large style objects.
- If a page is marked `use client`, explain why.
```

Rule 不负责告诉 Agent 业务接口长什么样。它只负责先把工程边界钉住。

### 避坑指南

Rule 最常见的问题，就是 `Rule Inflation`。

也就是把所有东西都往 Rule 里塞，结果通常只有一个：Rule 变厚，指令变乱，真正重要的约束被淹掉。

Rule 更适合放这三类内容：

- 高频出现的
- 长期稳定的
- 需要跨会话持续生效的

临时需求、业务上下文、具体接口细节，不该堆在 Rule 里。那不是增强，是噪音。

<div class="article-grid">
  <div class="article-card">
    <h3>适合写进 Rule 的</h3>
    <ul>
      <li>技术栈约束</li>
      <li>目录和分层约束</li>
      <li>统一输出格式</li>
    </ul>
  </div>
  <div class="article-card">
    <h3>不适合写进 Rule 的</h3>
    <ul>
      <li>一次性业务口径</li>
      <li>具体接口字段细节</li>
      <li>测试账号和发布流程</li>
    </ul>
  </div>
</div>

想继续看 `Rule` 怎么创建、怎么编写、怎么在项目里长期生效，可以接着读 [《Rule 怎么用：先把 AI 写代码这件事“管起来”》](/blog/ai-introduction-rule/)。

## Skill：把 Agent 变成能复用的原子操作

> **一句话理解：** `Skill` 不是“更长的 Prompt”，而是“更小但可复用的动作单元”。

### 底层逻辑

如果说 Rule 解决的是“别乱写”，那 Skill 解决的就是“下一步怎么做”。

Skill 本质上不是一段更长的 Prompt。

它更像原子化操作说明书。目标是把高频任务拆成稳定、可验证、可复用的动作单元。

所以 Skill 这一层，最重要的不是描述得多花，而是边界清楚：

- 输入是什么
- 输出是什么
- 它只负责哪一步

Rule 负责方向。Skill 负责动作。不要串。

### 典型用法

举例子，在 React 后台管理场景里，下面几类 Skill 很常见：

- `create-list-page`
- `generate-search-form`
- `wire-table-columns`
- `generate-page-test`

比如 `create-list-page`，它可以只负责生成一个带筛选区、表格区、分页区的页面骨架。

比如 `wire-table-columns`，它只负责把接口字段映射成 `TanStack Table` 或项目内表格组件的列配置。

比如 `generate-page-test`，它只负责生成页面级测试，覆盖首屏渲染、筛选交互、空态和错误态。

一个结构化的 Skill 定义可以写成这样：

```json
{
  "name": "create-list-page",
  "description": "Generate a React admin list page with search area, table area, and pagination.",
  "input_schema": {
    "type": "object",
    "properties": {
      "pageName": {
        "type": "string"
      },
      "routePath": {
        "type": "string"
      },
      "filters": {
        "type": "array"
      },
      "columns": {
        "type": "array"
      },
      "serviceName": {
        "type": "string"
      }
    },
    "required": ["pageName", "routePath", "filters", "columns", "serviceName"]
  },
  "output_contract": {
    "files": [
      "page component",
      "table columns config",
      "search form component"
    ],
    "must_validate": [
      "respect project rules",
      "use typed props and response types",
      "do not inline service logic into UI components"
    ]
  }
}
```

这类 Skill 对应的实操场景很直接。

场景一，快速起一个订单列表页：

- 输入筛选项：订单号、状态、创建时间
- 输入表格列：订单号、金额、状态、更新时间
- 输出页面骨架、列配置、搜索区组件

场景二，补一个权限按钮区域：

- 输入权限点和按钮文案
- 输出按钮渲染逻辑
- 不负责权限服务本身的实现

这种拆法的好处，是动作稳定，而且结果能验。

### 避坑指南

Skill 最容易走歪的地方，是把它写成“万能任务入口”。

比如一个 Skill 既想生成页面，又想补接口，又想写测试，还想顺手做性能优化。最后往往哪块都沾一点，哪块都不稳。
常见坏味道包括：

- Skill 名字很大，实际边界很虚
- Skill 里混入了本该由 Rule 约束的规范
- 生成结果没法通过文件、类型、测试来验证

Skill 不求全。求稳。高频动作先拆出来，已经够用了。

<div class="article-callout">
  <p class="article-kicker">设计 Skill 时只看三件事</p>
  <ol>
    <li>输入是不是结构化的。</li>
    <li>输出是不是可验证的。</li>
    <li>它是不是只负责一个稳定动作。</li>
  </ol>
</div>

想继续看 `Skill` 到底该怎么拆、怎么写、怎么让别人也能复用，可以接着读 [《Skill 怎么用：把高频任务拆成 AI 能复用的动作》](/blog/ai-introduction-skill/)。

## MCP：把外部上下文接进来，但别接成大杂烩

> **一句话理解：** `MCP` 的重点不是“工具更多了”，而是“外部上下文终于能标准化接进来了”。

### 底层逻辑

MCP 全称是 `Model Context Protocol`。

它最核心的价值，不是“又多了几个工具”，而是把外部能力的接入方式标准化了。

以前如果要让 AI 去查文档、读浏览器状态、连设计系统，很多时候都要针对不同客户端各写一套 Tool 接法。耦合很重，迁移也麻烦。

有了 MCP 之后，思路变成：

- 开发者实现一次 `MCP Server`
- 支持该协议的客户端都能复用这套能力

这就是协议层的意义。它解决的是解耦，不是单点功能。

### 典型用法

在 React 后台管理项目里，MCP 最常见的三类接法是：

- 文档类
- 浏览器类
- 设计系统类

#### 1. 文档类 MCP

适合查最新文档和 API。

比如：

- `Next.js` 的 `App Router` 约束
- `React` hooks 的最新写法
- `TanStack Table` 的列定义方式
- 表单库的字段联动写法

这个场景下，MCP 的价值不是帮你生成代码，而是减少过期知识带来的偏差。

#### 2. 浏览器类 MCP

适合看页面现场。

比如后台管理页最常见的几类问题：

- 请求有没有发出去
- `Network` 返回了什么
- `Console` 有没有运行时错误
- DOM 结构和状态是不是符合预期

这一层特别适合联调和调试阶段。因为很多问题，光看代码看不全。

#### 3. 设计系统类 MCP

适合读设计稿和组件约束。

比如一个后台管理页里的搜索区、操作栏、表格区、抽屉表单，视觉规则往往很多：

- 字段顺序
- 间距层级
- 按钮主次关系
- 错误态和空态

如果没有设计上下文，Agent 只能按常识猜。接入设计系统之后，它才能知道项目自己的 UI 规则是什么。

一个轻量 MCP 配置示意可以长这样：

```json
{
  "mcpServers": {
    "frontend-docs": {
      "command": "npx",
      "args": ["-y", "official-docs-mcp"]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    },
    "design-system": {
      "command": "npx",
      "args": ["-y", "figma-design-mcp"]
    }
  }
}
```

这段配置的重点，不是具体命令名。重点是三类上下文入口：

- 文档
- 浏览器
- 设计系统

这三类基本已经覆盖大部分前端场景。

### 避坑指南

MCP 最常见的问题，不是接不上，而是接太多。

这就是典型的 `Context 污染`。

比如把这些都一起接进来：

- 文档
- 浏览器
- 设计稿
- 文件系统
- 工单系统
- 监控平台
- 数据库

理论上信息更全。实际上常见后果是：

- token 消耗激增
- 响应速度变慢
- 相关性下降

原因不复杂。上下文一多，Agent 每次都要在更多信息里找线索。找到的东西还不一定和当前任务相关。

所以 MCP 的原则不是“能接就接”，而是“按场景开”。

想继续看 `MCP` 怎么选场景、怎么配置、怎么在前端开发里真正用起来，可以接着读 [《MCP 怎么用：按场景给 AI 接上真实上下文》](/blog/ai-introduction-mcp/)。

## React 前端里怎么落地：三个短案例

上面讲的是三层定义。真正落地，还是得看具体场景。

这里不串完整流程，只拆三个高频模块。

<div class="article-callout">
  <p class="article-kicker">推荐落地顺序</p>
  <ol>
    <li>先补 <code>Rule</code>，把工程边界钉住。</li>
    <li>再拆 <code>Skill</code>，把高频动作标准化。</li>
    <li>最后接 <code>MCP</code>，给关键场景补实时上下文。</li>
  </ol>
</div>

### 场景 1：列表页脚手架生成

一个后台管理页最常见的起手式，就是列表页。

比如商品列表、订单列表、用户列表，本质都差不多：筛选区 + 表格区 + 分页区。

这时候三层的分工可以是：

- `Rule`：限制目录、类型、`use client` 边界、数据请求层写法
- `Skill`：用 `create-list-page` 生成页面骨架和列配置
- `MCP`：去查 `TanStack Table` 或项目内部表格组件的文档

这类场景下，Agent 很适合做重复性高、结构稳定的页面搭建。

### 场景 2：搜索表单和筛选联动

后台管理页第二个高频场景，是搜索表单。

比如订单状态切换后，某些筛选项要联动显示；日期范围、关键字、下拉状态要一起参与查询。

这里的分工可以是：

- `Rule`：规定表单必须走共享表单封装，不直接散写字段状态
- `Skill`：用 `generate-search-form` 生成字段结构、默认值、提交参数映射
- `MCP`：读取设计稿里的字段顺序、交互说明、必填和禁用规则

如果没有 Rule，这类表单很容易一页一个写法。

如果没有 MCP，联动字段和设计约束又很容易猜错。

### 场景 3：接口联调和页面调试

第三个很常见的场景，是页面看着差不多了，但联调没完全通。

比如：

- 列表为空，但不确定是筛选参数问题还是接口响应问题
- 按钮点击后没有反馈，不确定是事件没绑上还是请求失败
- 权限按钮没显示，不确定是渲染逻辑还是数据问题

这时候更合适的分工是：

- `Rule`：限定请求必须走 `services`，状态逻辑不要和 UI 混写
- `Skill`：生成请求封装、错误态处理、页面级测试
- `MCP`：直接看 `Network`、`Console`、DOM 状态

这个模块里，MCP 的价值会比纯代码生成更明显。因为它补的是现场信息。

## 一张决策表：现在到底先补哪一层？

如果你读到这里还想问“那我项目里到底先做哪个”，可以直接套下面这张表：

| 当前症状 | 优先补哪层 | 原因 |
| --- | --- | --- |
| AI 每次生成代码风格都不一样 | `Rule` | 先把项目边界和输出约束钉死 |
| 列表页、表单、测试总在重复写 | `Skill` | 先把高频动作抽成可复用单元 |
| 总要查最新文档、调接口、看页面状态 | `MCP` | 先补真实上下文，减少靠猜 |
| 三个问题同时存在 | `Rule` → `Skill` → `MCP` | 先稳住边界，再做复用，最后补上下文 |

## 统一避坑清单

最后把最常见的问题压成一页，方便直接对照。

- `Rule` 不要膨胀。它适合放长期稳定规则，不适合塞临时业务上下文。
- `Skill` 不要万能化。一个 Skill 只做一类动作，边界越清楚越稳。
- `MCP` 不要滥接权限。上下文越多，不代表结果越准。
- 不要把三层混用。规范写进 Rule，动作写进 Skill，外部接入交给 MCP。
- 不要一开始就追求全自动。前端工程更适合先把高频模块跑顺，再逐步扩能力。

如果把三层边界拆清楚，AI Agent 在前端工程里的角色就会清楚很多。

它不是简单的“代码生成器”。

它更像一套分层的工程能力：

- `Rule` 保证不跑偏
- `Skill` 保证可复用
- `MCP` 保证有上下文

这三层搭稳之后，React 项目里很多重复性工作才真正有机会被接住，而且不会把代码库越写越乱。

<div class="article-callout">
  <p class="article-kicker">最后只记住一句话</p>
  <p>别把三层混成一个“大 Prompt”。<code>Rule</code> 管边界，<code>Skill</code> 管动作，<code>MCP</code> 管上下文。边界越清楚，AI 在工程里越好用。</p>
</div>
