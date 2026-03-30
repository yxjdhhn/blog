---
title: Skill 怎么用：把高频任务拆成 AI 能复用的动作
description: 从创建、编写、调用到实例设计，讲清楚 Skill 怎么拆、怎么写、怎么避免变成万能 Prompt。
pubDate: '2026-03-30'
tags:
  - AI
  - Agent
  - Skill
  - Prompt
  - 前端工程化
category: 技术
heroImage: ../../../assets/blog/generated/prompt.png
imageStatus: complete
---
很多团队补完 `Rule` 之后，会进入第二个阶段：AI 没那么容易写歪了，但还是不够省事。因为每次做列表页、表单、测试、请求封装，还是要重新描述一遍“你现在应该怎么做”。

这时候该补的，往往不是更多规则，而是 `Skill`。

它的重点不是把 Prompt 写得更长，而是把高频任务拆成可以稳定复用的动作单元。

<div class="article-callout">
  <p class="article-kicker">先记一句话</p>
  <p><code>Skill</code> 解决的是“下一步怎么做”，不是“项目规范是什么”。边界越小，复用越稳。</p>
</div>

## 简短介绍

你可以把 `Skill` 理解成一份“任务说明书”。

它通常会回答下面几件事：

- 这个动作要解决什么问题
- 需要什么输入
- 要产出什么结果
- 中间应该按什么步骤做

所以 `Skill` 更像一个可复用的小流程，而不是一段随手复制的长 Prompt。

它和另外两层的区别也可以顺手记住：

| 层级 | 它负责什么 |
| --- | --- |
| `Rule` | 约束 AI 的默认写法 |
| `Skill` | 规定某类任务该怎么完成 |
| `MCP` | 给 AI 提供外部上下文和工具能力 |

如果一个任务反复出现，而且每次做法大差不差，就很适合抽成 `Skill`。

## 怎么创建

设计 `Skill` 时，第一步不是写内容，而是先选任务。

最适合抽成 Skill 的，一般都是这三类动作：

- 高频出现
- 输入相对固定
- 输出可以检查

在前端项目里，很典型的候选项有：

- 生成列表页骨架
- 生成搜索表单
- 补页面级测试
- 生成表格列配置
- 封装请求层方法

更稳的创建方式是按下面这四步来：

1. 先给 Skill 起一个只描述单一动作的名字。
2. 定义输入参数，不要模糊。
3. 定义输出范围，明确它会产出什么。
4. 写清完成步骤和校验标准。

如果不同客户端支持的载体不同，也没关系。它可能是 `SKILL.md`、命令模板、工作流配置，或者一段结构化定义。关键不是文件名，而是这份定义是否把边界说清楚。

## 怎么编写

一个好用的 `Skill`，通常都能让人很快看清三件事：

- 输入是什么
- 输出是什么
- 它只负责哪一步

你可以直接套这个骨架来写：

```md
# Skill: create-list-page

## Goal
Generate a React admin list page with search area, table area, and pagination.

## Inputs
- pageName
- routePath
- filters
- columns
- serviceName

## Steps
1. Create the page shell.
2. Generate the search form structure.
3. Create the table column config.
4. Wire pagination state to the service layer.

## Output
- page component
- search form component
- table columns config

## Must Follow
- Respect project rules.
- Keep service logic out of reusable UI components.
- Use explicit types.
```

这个结构看起来不复杂，但已经足够实用。因为它把最重要的东西都钉住了。

编写时尤其要注意下面几件事：

- 名字不要太大。`create-list-page` 可以，`build-admin-system` 就明显过头了。
- 输入尽量结构化，不要写成“你看着补完就行”。
- 输出要能验证。最好能对应到文件、类型、测试或清晰的结果清单。
- 不要把项目规范塞进 Skill，那部分应该交给 Rule。

最容易写坏的情况，是一个 Skill 既想生成页面，又想写接口，又想补测试，还想顺手做性能优化。这样边界一散，复用率就会立刻下降。

<div class="article-callout">
  <p class="article-kicker">写 Skill 时只盯三件事</p>
  <ol>
    <li>输入是不是清楚到别人能直接填。</li>
    <li>输出是不是清楚到结果能直接验。</li>
    <li>这个 Skill 是不是只负责一个稳定动作。</li>
  </ol>
</div>

## 怎么用

`Skill` 真正好用的地方，在于你不需要每次都重新组织任务语言。

更顺手的用法通常是：

1. 先用 `Rule` 把项目边界钉住。
2. 遇到重复任务时，把任务描述抽成一个 Skill。
3. 之后只需要补具体参数，而不是每次都重写整段说明。

比如你要生成一个订单列表页，与其每次都手写长 Prompt，不如直接提供：

- 页面名
- 路由
- 搜索字段
- 表格列
- 请求服务名

这样 AI 收到的是结构化任务，而不是模糊愿望。

还有一个很实用的经验：先让 Skill 只负责“产出第一版”。像接口细节、文案微调、联调修补，可以放在后续对话里，不要全部塞进同一个 Skill。

## 实例

下面给一个前端项目里很常见的 Skill：`generate-search-form`。

它适合解决的问题是：搜索表单总在重复写，但每次字段组合不一样。

```json
{
  "name": "generate-search-form",
  "description": "Generate a typed search form for a React admin page.",
  "input_schema": {
    "pageName": "string",
    "fields": "array",
    "defaultValues": "object",
    "submitMapper": "string"
  },
  "output_contract": {
    "files": [
      "search form component",
      "form value types"
    ],
    "must_validate": [
      "respect shared form wrapper",
      "use explicit types",
      "do not inline request logic"
    ]
  }
}
```

这个 Skill 的边界就很清楚：

- 它负责生成搜索表单
- 它不负责实现接口服务
- 它不负责整个页面

所以它特别适合和其他 Skill 组合使用，比如：

- `create-list-page`
- `wire-table-columns`
- `generate-page-test`

拆成这种粒度之后，复用会明显稳定很多。

## 建议的使用流程

如果你想把 Skill 真正沉淀成团队资产，可以直接照这个顺序做：

1. 先统计项目里最常重复的三类任务。
2. 从最稳定的一类开始拆，不要一上来就拆复杂流程。
3. 每个 Skill 只保留一个核心动作。
4. 每次用完后回看结果，补输入项或校验项，不要无脑加步骤。
5. 复用两三次都稳定后，再考虑给团队推广。

最后记一个判断标准：

如果 AI 已经知道“该按什么规范写”，但还是经常不知道“下一步该怎么做”，那就该补 `Skill`。

想继续看外部上下文怎么接，接着读 [《MCP 怎么用》](/blog/ai-introduction-mcp/)。
