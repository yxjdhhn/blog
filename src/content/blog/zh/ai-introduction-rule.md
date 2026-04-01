---
title: Rule 怎么用：先把 AI 写代码这件事“管起来”
description: 从创建、拆分、编写到落地，讲清楚 Rule 该放哪里、写什么、怎么让 AI 长期稳定遵守。
pubDate: '2026-03-30'
tags:
  - AI
  - Agent
  - Rule
  - 前端工程化
  - Prompt
category: 技术
heroImage: ../../../assets/blog/generated/ai-introduction.png
imageStatus: complete
---
如果你已经发现一件事：同一个需求，AI 今天这么写，明天那么写，问题往往不在模型够不够聪明，而在项目边界没被提前说清。

`Rule` 这一层，就是把这些边界前移。它不负责讲业务背景，也不负责代替接口文档。它只负责一件事：让 AI 在开始写之前，先知道这个项目里什么能做，什么不能做。

<div class="article-callout">
  <p class="article-kicker">先记一句话</p>
  <p><code>Rule</code> 是长期有效的项目约束，不是临时需求收纳箱。你写得越清楚，AI 越不容易跑偏。</p>
</div>

## 简短介绍

你可以把 `Rule` 理解成 AI 开发场景里的“工程默认值”。

它最适合承载这些内容:

- 技术栈约束
- 目录和分层规范
- 组件、Hooks、请求层的写法边界
- 输出格式要求

它不太适合承载这些内容:

- 一次性业务口径
- 某个接口本周刚改的临时说明
- 只会在一个任务里出现的细节

更直白一点说，`Rule` 解决的是“写法不稳”的问题，不是“上下文不够”的问题。

| 适合写进 Rule | 更适合放别处 |
| --- | --- |
| 技术栈和目录约束 | 业务背景 |
| 输出格式要求 | 接口字段说明 |
| 通用禁用项 | 当前迭代临时口径 |
| 长期有效的团队规范 | 测试账号和发布信息 |

## 怎么创建

不同客户端对 `Rule` 的叫法不完全一样，但落地思路差不多：分清全局规则和项目规则，然后把高频、稳定的约束放到合适位置。

先把“规则到底写在哪里”说清楚。

如果你用的是 Cursor 这一类支持项目规则的客户端，最常见的放法有三种：

- 项目规则：写在项目里的 `.cursor/rules/`
- 用户规则：写在客户端设置里，全局生效
- `AGENTS.md`：放在项目根目录，适合简单、直接的项目说明

还有一个历史写法是：

- `.cursorrules`：老格式，很多客户端还兼容，但已经不推荐继续新建了

如果你只想记一个结论：

- 想跟代码一起走、跟团队一起版本管理，用 `.cursor/rules/`
- 想写你自己的全局偏好，比如“默认中文回复”，用用户规则
- 想先用一份简单 Markdown 说明项目约束，可以用根目录的 `AGENTS.md`

更稳的做法是这样：

1. 先写一份项目级基线规则，跟代码一起版本管理。
2. 再补一份个人级规则，只放语言习惯、输出偏好这类不影响团队协作的内容。
3. 如果规则已经明显分成多个主题，就拆成多份，不要堆成一大坨。

如果你用的是支持项目规则目录的编辑器，可以参考这种组织方式：

```text
.cursor/
  rules/
    project-baseline.md
    react-components.md
    api-boundary.md
```

这几份文件的职责也要尽量清楚：

- `project-baseline.md` 放项目通用约束
- `react-components.md` 放组件和 hooks 约束
- `api-boundary.md` 放请求层和数据流边界

如果你希望用结构化规则，通常会写成 `.mdc` 文件。它本质上还是 Markdown，只是前面多了一段 metadata。

比如：

```text
.cursor/
  rules/
    project-baseline.mdc
    react-components.mdc
```

一个最小的 `.mdc` 长这样：

```md
---
description: React 组件和 hooks 规范
globs: ["src/components/**/*.tsx", "src/hooks/**/*.ts"]
alwaysApply: false
---

- Use function components only.
- Shared components must not contain page-specific request logic.
- Hooks should start with `use`.
```

这里每一部分的含义可以这样理解：

| 部分 | 作用 |
| --- | --- |
| `description` | 告诉 Agent 这条规则大概管什么 |
| `globs` | 指定它在哪些文件范围里更容易被挂上 |
| `alwaysApply` | 是否每次都强制带进上下文 |
| 正文内容 | 真正给 AI 的规则说明 |

如果你不需要这些 metadata，也可以直接写普通 Markdown，比如根目录的 `AGENTS.md`：

```md
# Project Instructions

## Code Style
- Use TypeScript for all new files.
- Prefer React function components.

## Architecture
- Keep fetch logic in `src/services`.
- Keep shared UI components free of page-specific business logic.
```


第一版不要写太多。能先把最容易出错的三五条钉住，就已经很有价值。

如果你是第一次建，推荐顺序是：

1. 先在项目里建 `.cursor/rules/project-baseline.mdc`
2. 先写最小规则集
3. 真正用一两轮之后，再拆成 `components`、`api-boundary` 这种主题文件

这样比一开始就铺十几个文件稳得多。

## 怎么编写

写 `Rule` 最关键的，不是字多，而是让 AI 一眼就知道要遵守什么。

一个更容易生效的 Rule，通常会包含四块内容：

1. 项目背景
2. 结构约束
3. 输出要求
4. 禁止事项

比如前端项目里，第一版可以直接按下面这个框架写：

```md
# Project Baseline

- Use TypeScript only.
- Use function components and hooks only.
- Keep data fetching in `src/services`.
- Reusable UI components must not contain page-specific request logic.

# Directory Rules

- Pages live in `src/app`.
- Shared components live in `src/components`.
- Hooks live in `src/hooks`.
- Types live in `src/types`.

# Output Contract

- New components must define explicit prop types.
- Prefer small components over long page files.
- Explain why `use client` is needed when adding it.

# Avoid

- Do not mix mock data into production pages.
- Do not inline large request blocks inside JSX files.
```

这里有几个很实用的编写原则：

- 一条规则只表达一个意思，不要一段话里塞三层转折。
- 多写明确动作，少写模糊判断。比如“必须走 `src/services`”就比“注意抽离请求逻辑”更稳。
- 尽量写“该做什么”和“不要做什么”两面，边界会更清楚。
- 规则里如果要举例，优先引用真实目录、真实文件名和真实组件约定。

最容易踩坑的是把 Rule 写成百科全书。你一旦把业务背景、接口说明、发布说明全塞进去，真正该被遵守的约束反而会被冲淡。

<div class="article-callout">
  <p class="article-kicker">更稳的写法</p>
  <ul>
    <li>先写最小规则集，只覆盖最常见的错误。</li>
    <li>AI 连续两三次犯同一种错，再补一条新规则。</li>
    <li>规则超过一屏还看不清重点时，就该拆文件了。</li>
  </ul>
</div>

## 怎么用

`Rule` 不是写完就结束，它真正的价值在于“持续生效”。

但“持续生效”不等于“每条规则都会无脑带进去”。不同类型的 Rule，触发时机是不一样的。

先把这个讲清楚，读者就不容易误会：

| Rule 类型 | 什么时候生效 | 更像什么 |
| --- | --- | --- |
| 用户规则 | 每次会话都生效 | 你的全局偏好 |
| Always Rule | 每次相关对话都带上 | 项目基线 |
| Auto Attached Rule | 命中文件或路径时带上 | 文件范围规则 |
| Agent Requested Rule | Agent 判断相关时带上 | 可选补充规则 |
| Manual Rule | 只有你明确指定时才带上 | 手动插卡 |
| `AGENTS.md` | 项目级持续生效 | 简化版项目说明 |

所以你问“Rule 是自动调用还是手动指定”，更准确的答案是：

- 有些是自动生效的
- 有些是命中文件后自动附加的
- 有些要你显式指定
- 还有些是 Agent 自己决定要不要用

它不是一个单一开关，而是一组不同触发方式的规则载体。

这里还要特别说明一下：

这些“Rule 类型”并不一定都是你在规则文件里手动写一个 `type` 字段来决定。更准确地说，不同平台决定 Rule 类型和触发方式的方式不一样：

- 有的平台有明确的类型下拉框或 metadata，比如 Cursor
- 有的平台没有“规则类型”这个字段，而是靠文件位置和层级来决定，比如 Claude Code
- 有的平台更接近 `AGENTS.md` 作用域模型，不提供显式类型切换，比如 Codex

也就是说，判断一个 Rule 是“常驻型”“自动附加型”还是“手动指定型”，不能只看文件正文，还要看你所在的平台怎么加载它。

### 常用平台怎么设置 Rule 类型和触发方式

为了避免这部分太抽象，可以直接看几个最常见的平台。

> 下面这部分是按 2026 年 3 月 31 日我查到的官方文档整理的。规则系统变化比较快，后面如果产品更新，具体入口和命名也可能调整。

#### 1. Cursor

Cursor 是这件事里最“显式”的平台。

它的项目规则放在：

```text
.cursor/rules/
```

每条项目规则通常是一个 `.mdc` 文件，而且官方文档明确说了：**Rule 类型是从规则编辑器里的 type dropdown 决定的**。这个选择会对应到 frontmatter 里的几个字段，比如：

- `description`
- `globs`
- `alwaysApply`

Cursor 的四种项目规则类型分别是：

| Cursor 类型 | 怎么设置 | 怎么触发 |
| --- | --- | --- |
| `Always` | 在规则编辑器里选 `Always`，或让 `alwaysApply: true` | 每次相关会话都带上 |
| `Auto Attached` | 选 `Auto Attached`，并写 `globs` | 引用命中的文件时自动附加 |
| `Agent Requested` | 选 `Agent Requested`，并补 `description` | Agent 判断相关时主动带上 |
| `Manual` | 选 `Manual` | 只有你显式 `@ruleName` 时才带上 |

也就是说，在 Cursor 里，“Rule 类型”就是一个明确可设置的属性，不是纯靠你自己约定。

它还有两种补充载体：

- 用户规则：在 `Cursor Settings > Rules` 里设置，始终全局生效
- `AGENTS.md`：作为简单的项目说明替代方案，偏自动加载

所以如果你在 Cursor 里问“Rule 类型在哪里设置”，最准确的回答就是：

- 项目规则：在 `.cursor/rules/*.mdc` 对应的规则编辑器里设置类型
- 用户规则：在设置里写，没有项目规则那种四分类
- `AGENTS.md`：没有 type 选项，靠文件位置和平台默认逻辑生效

#### 2. Claude Code

Claude Code 的思路和 Cursor 不一样。

它官方主打的是 `CLAUDE.md` 这套 memory / instruction 文件体系，而不是给每条规则一个下拉类型。

常见位置有：

```text
~/.claude/CLAUDE.md
./CLAUDE.md
./.claude/CLAUDE.md
```

Claude Code 官方文档给出的区分方式，主要是按“位置和层级”来分：

| 位置 | 作用 | 怎么触发 |
| --- | --- | --- |
| `~/.claude/CLAUDE.md` | 用户级偏好 | 所有项目自动生效 |
| `./CLAUDE.md` 或 `./.claude/CLAUDE.md` | 项目级规则 | 当前项目自动生效 |
| 更深层目录里的 `CLAUDE.md` | 更细作用域规则 | 读到对应子树文件时生效 |

所以在 Claude Code 里：

- 没有 Cursor 那种 `Always / Manual / Agent Requested` 的统一 type dropdown
- “规则类型”更多是由文件位置决定的
- “触发方式”更多是由目录作用域和文件读取路径决定的

比如根目录的 `CLAUDE.md` 更像项目级自动规则，而某个子目录里的 `CLAUDE.md` 更像局部自动规则。

如果你想在 Claude Code 里做“完全手动触发”的东西，通常不会继续用 `CLAUDE.md`，而是改用 slash command。

#### 3. Codex

Codex 目前更接近 `AGENTS.md` 作用域模型。

官方说明里强调的是：

- `AGENTS.md` 可以出现在多个目录
- 每个 `AGENTS.md` 的作用域是它所在目录及其子树
- 更深层的 `AGENTS.md` 优先级更高

也就是说，Codex 并没有一个官方统一的“Rule 类型选择器”。

它更像这样：

| 位置 | 作用 | 怎么触发 |
| --- | --- | --- |
| `~/AGENTS.md` 或家目录附近 | 个人级指令 | 在对应环境里自动生效 |
| 仓库根目录 `AGENTS.md` | 项目级指令 | 当前仓库自动生效 |
| 子目录 `AGENTS.md` | 子树范围指令 | 修改或读取该子树文件时生效 |

所以在 Codex 里：

- 没有显式 rule type 字段
- 也没有 Cursor 那种 `Manual` 类型
- 触发方式主要靠目录作用域和嵌套优先级

如果你一定要实现“这次才临时加一条要求”，通常更适合直接写在当前 prompt 里，而不是指望 AGENTS 体系切成手动规则。

把这三个平台放一起看，结论就会清楚很多：

| 平台 | Rule 类型怎么定 | 触发方式怎么定 |
| --- | --- | --- |
| Cursor | 有显式类型设置 | 看 `Always` / `globs` / `description` / `@ruleName` |
| Claude Code | 靠文件位置和层级 | 看 `CLAUDE.md` 所在位置与目录作用域 |
| Codex | 靠 `AGENTS.md` 作用域 | 看目录树和更深层规则优先级 |

所以如果你问“Rule 类型是在哪里设置的”，更准确的答案是：

- 在 Cursor 里，**是在规则编辑器和 `.mdc` metadata 里设置的**
- 在 Claude Code 和 Codex 里，**更多是由文件放在哪里来决定的**

更顺手的使用方式通常是：

1. 新项目启动时，先写一份最小基线规则。
2. 让 AI 先在几个高频任务里跑一轮，比如列表页、表单、接口封装。
3. 看它稳定犯错的地方，再回头补规则，而不是一开始就想写满。
4. 临时需求不要塞进 Rule，放在当次对话里说清楚就行。

再往下说得更实操一点：

### 什么时候自动生效

下面这几类，通常不需要你每次手动点：

- 用户规则
- `alwaysApply: true` 的项目规则
- 命中 `globs` 的自动附加规则
- 根目录 `AGENTS.md`

比如你打开 `src/components/SearchForm.tsx`，如果有一条规则的 `globs` 命中了 `src/components/**/*.tsx`，那它通常会跟着上下文自动进来。

### 什么时候要手动指定

如果一条规则不是项目基线，而是“只在某类任务里偶尔需要”，更适合做成手动规则。

比如：

- 只有在生成测试时才需要的测试规范
- 只有在重构老模块时才需要的迁移约束
- 只有在接支付模块时才需要的安全要求

这类规则不适合常驻，否则会污染所有会话。

更稳的做法是：需要时再显式提一下规则名，或者在聊天里明确说“这次按某条 rule 来做”。

### 什么时候让 Agent 自己判断

还有一类规则比较适合 `Agent Requested`：

- 不是每次都需要
- 但确实可能在某些任务里有帮助
- 又不值得你每次手动点

比如：

- “生成 RPC service 时使用内部模板”
- “修改表格列配置时参考 columns 约定”

这类规则更像候选能力。Agent 觉得相关，就会把它带进来。

你可以这样判断该不该加 Rule：

- 这个错误是不是反复出现
- 这个约束是不是长期有效
- 这个规则是不是跨多个任务都适用

如果三个答案都是“是”，就值得写进 Rule。

如果只是一次性要求，比如“这周活动页按钮颜色先改成橙色”，那更适合放在当前任务里，不要写进长期规则。

还有一个很好用的判断标准：Rule 适合约束“默认做法”，不适合承载“例外说明”。

## 写完了如何生效

这部分特别容易被忽略，但其实很关键。

`Rule` 写完之后，通常不是“运行一条命令生成”，而是满足下面几个条件后就会生效：

1. 文件放在客户端能识别的位置
2. 文件格式正确
3. 规则类型和作用范围设置正确
4. 重新打开会话，或者让客户端重新加载规则

更直白一点说：

- `.cursor/rules/*.mdc` 放对了位置，客户端就会识别
- `AGENTS.md` 放在项目根目录，客户端就会把它当项目说明
- 用户规则写在设置里，保存后通常就会全局生效

但有个很常见的坑：

**很多客户端不会把你刚改完的规则立刻热更新到当前对话。**

所以更稳的做法是：

1. 保存规则文件
2. 新开一个 Agent 会话
3. 再让 AI 执行相关任务

如果你已经在一个旧会话里聊了很久，再改规则，模型未必会完整拿到新版本上下文。这时候直接开新会话通常最稳。

还有几种“看起来写了，其实没生效”的典型原因：

- `.mdc` frontmatter 写错了
- `globs` 没命中实际文件
- 规则放错目录了
- 把临时需求写进 Rule，结果你以为它该一直生效

<div class="article-callout">
  <p class="article-kicker">判断 Rule 有没有真的生效</p>
  <ul>
    <li>新开一个会话后，让 AI 先复述项目约束。</li>
    <li>给它一个高频任务，看它会不会自动遵守目录和分层规则。</li>
    <li>如果没有生效，先查目录、文件格式和 globs，而不是先怀疑模型。</li>
  </ul>
</div>

## 实例

下面给一个 React 管理后台项目的最小可用 Rule。它不求面面俱到，但足够把高频跑偏点压住。

```md
# React Admin Rules

- Use TypeScript with strict typing.
- Use function components only.
- Keep page files focused on orchestration, not data access details.

# Structure

- Pages live in `src/app`.
- Shared components live in `src/components`.
- Data fetching lives in `src/services`.
- Shared hooks live in `src/hooks`.

# UI

- Search forms should use the shared form wrapper.
- Table columns should live in dedicated config files.
- Do not place fetch logic inside reusable components.

# Output

- Add explicit prop types for exported components.
- Prefer named types over broad `any`.
- If a page uses `use client`, explain the reason briefly.
```

这份规则特别适合接住下面几类任务：

- 生成列表页骨架
- 生成搜索表单
- 拆 hooks
- 补测试文件

它的特点很明确：不讲业务，只讲工程边界。这样 AI 在不同任务里都能复用。

## 建议的使用流程

如果你想把 `Rule` 真正用起来，可以直接照这个顺序走：

1. 先写一份 10 到 20 行的项目基线规则。
2. 先覆盖最容易跑偏的三件事：技术栈、目录分层、输出要求。
3. 先在高频任务里试用，不要一上来就追求全覆盖。
4. 遇到重复错误再增量补充，不要把一次性需求写进长期规则。
5. 规则明显变厚时，按主题拆分成多份。

最后只记一个判断就够了：

如果你想解决的是“AI 每次写法都不一样”，先补 `Rule`。如果你想解决的是“AI 不知道下一步该怎么做”，那就该去补 `Skill` 了。

想继续看可复用动作怎么设计，可以接着读 [《Skill 怎么用》](/blog/ai-introduction-skill/)。
