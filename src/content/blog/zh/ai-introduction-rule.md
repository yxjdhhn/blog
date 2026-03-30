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

第一版不要写太多。能先把最容易出错的三五条钉住，就已经很有价值。

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

更顺手的使用方式通常是：

1. 新项目启动时，先写一份最小基线规则。
2. 让 AI 先在几个高频任务里跑一轮，比如列表页、表单、接口封装。
3. 看它稳定犯错的地方，再回头补规则，而不是一开始就想写满。
4. 临时需求不要塞进 Rule，放在当次对话里说清楚就行。

你可以这样判断该不该加 Rule：

- 这个错误是不是反复出现
- 这个约束是不是长期有效
- 这个规则是不是跨多个任务都适用

如果三个答案都是“是”，就值得写进 Rule。

如果只是一次性要求，比如“这周活动页按钮颜色先改成橙色”，那更适合放在当前任务里，不要写进长期规则。

还有一个很好用的判断标准：Rule 适合约束“默认做法”，不适合承载“例外说明”。

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
