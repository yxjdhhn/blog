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

不过在写内容之前，最好先把“Skill 到底放在哪里”这件事讲清楚。

和 `Rule` 不一样，`Skill` 更像一份可复用的任务能力，所以它通常不会写进 `.cursor/rules/` 这种规则目录里，而是放在客户端约定的 `skills` 目录、插件目录，或者直接做成平台里的工作流配置。

最常见的几种放法是：

- 全局 skill：放在客户端自己的 `skills/` 目录
- 项目 skill：跟项目一起放在仓库里，方便团队共享
- 平台 skill：写在某个 Agent 平台、插件系统或工作流后台里

如果你用的是基于 `SKILL.md` 的方式，一个很常见的结构会长这样：

```text
skills/
  create-list-page/
    SKILL.md
  generate-search-form/
    SKILL.md
```

如果是项目内共享，也可以这样放：

```text
.ai/
  skills/
    create-list-page/
      SKILL.md
    generate-page-test/
      SKILL.md
```

关键不是一定要叫这个目录名，而是你所在的客户端或平台能不能识别它。你可以把它理解成：`Skill` 需要放在“客户端会加载的技能目录”里，而不是随便放一个 Markdown 文件就会自动生效。

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

如果你第一次建，推荐这样起步：

1. 先选一个高频动作，比如“生成列表页骨架”
2. 建一个单独目录，比如 `create-list-page/`
3. 在目录里放一份 `SKILL.md`
4. 先只做最小版本，能被稳定复用就够了

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

如果你的客户端支持结构化 skill，也可能会把同样的信息写成 JSON、YAML 或平台表单。无论外层载体怎么变，核心结构其实都差不多：

| 部分 | 它的作用 |
| --- | --- |
| `name` | Skill 的唯一名字，后面调用和识别都靠它 |
| `description` | 告诉 Agent 这个 Skill 解决什么问题 |
| `inputs` | 说明你调用它时要补哪些参数 |
| `steps` | 说明它内部应该按什么顺序完成 |
| `output` | 规定它应该产出什么 |
| `constraints` / `must follow` | 补充必须遵守的边界 |

如果写成最常见的 `SKILL.md`，本质上就是一份结构化 Markdown。也就是说：

- 文件格式通常是 Markdown
- 文件名常见是 `SKILL.md`
- 文件内容要尽量固定成“目标、输入、步骤、输出、约束”这几个区块

一个更完整一点的目录示意可以是：

```text
generate-search-form/
  SKILL.md
  examples/
    basic.md
```

其中：

- `SKILL.md` 放技能定义本身
- `examples/` 放示例输入、参考输出或补充说明

如果你的平台不支持 `SKILL.md` 目录扫描，也可以把 Skill 直接登记到平台配置里。但就文章落地性来说，最容易理解的仍然是“一个 skill 一个目录，一份 `SKILL.md`”。

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

但它也不是“写完就一定自动用上”。`Skill` 和 `Rule` 最大的差别之一，就是它通常更接近“被选用的工作流”，而不是“默认挂上的约束”。

所以你问“Skill 是自动调用还是手动指定”，更准确的答案是：

- 有些客户端会在理解到任务意图后自动选 Skill
- 有些平台需要你手动点选或显式提到 Skill 名
- 还有些是命令式触发，比如 slash command、模板命令或工作流按钮

它不像 `Rule` 那样天然偏“常驻”，而更像“当前任务该不该切这套动作”。

先把触发时机分清楚：

| Skill 类型 | 什么时候触发 | 前端里怎么理解 |
| --- | --- | --- |
| 自动匹配型 | Agent 识别出任务和 skill 描述匹配时 | 你说“生成订单列表页”，它自动选 `create-list-page` |
| 手动指定型 | 你显式点名 skill 名字时 | 你直接说“用 generate-search-form 处理” |
| 命令型 | 通过 slash command 或工作流入口触发 | 像 `/create-list-page` 这种 |
| 平台工作流型 | 你在界面里点按钮启动 | 更像“执行一个模板化任务” |

这里要特别说明一下：

这四种并不是“Skill 文件里必须先写一个 type 字段”才能成立。更准确地说，它们是 **Skill 的触发方式**，通常由下面三件事共同决定：

1. 客户端或平台本身支不支持哪种触发方式
2. 这个 Skill 是怎么被注册进去的
3. 你在当前任务里是让 Agent 自己选，还是手动点名

也就是说，`SKILL.md` 本身更常负责这些内容：

- 这个 Skill 叫什么
- 它解决什么问题
- 需要什么输入
- 要产出什么结果
- 中间按什么步骤完成

至于它最终是“自动匹配型”还是“命令型”，很多时候不只看文件内容，还看平台怎么加载它。

比如：

- 如果平台支持根据 `name + description` 自动做意图匹配，那它就可能表现成“自动匹配型”
- 如果平台把这个 Skill 挂成 `/create-list-page`，那它就会表现成“命令型”
- 如果平台要求你在界面里点一个按钮启动，它就更像“平台工作流型”

所以更稳的理解是：

- **Skill 内容** 决定“它能不能被识别、适不适合被选中”
- **平台接入方式** 决定“它是自动触发、手动触发，还是命令触发”

如果某个平台支持在 Skill metadata 里补更多信息，比如命令名、分类、标签、描述权重，那这些字段会影响触发方式。但这不是所有客户端都有的统一标准。

### 常用平台怎么决定触发方式

为了避免这段太抽象，可以直接看几个常见平台的做法。

> 下面这部分是按 2026 年 3 月 31 日查到的官方文档来写的。不同平台这块变化很快，后面如果产品更新，触发逻辑也可能跟着调整。

#### 1. Claude Code

Claude Code 是目前“Skill”概念最完整、最明确的平台之一。

它的区分方式很清楚：

- `.claude/skills/<skill-name>/SKILL.md` 这一类，属于真正的 `Skill`
- `.claude/commands/*.md` 这一类，属于 slash command，不是 Skill

它们的触发方式也不一样：

- `Skill`：Claude 会根据 `SKILL.md` 里的 `name` 和 `description` 自动发现，并在任务相关时自动使用
- `slash command`：你要显式输入 `/command-name`，属于手动触发

也就是说，在 Claude Code 里：

- 如果你想让它自动判断“这次该不该用这个能力”，就做成 `Skill`
- 如果你想完全手动控制什么时候执行，就做成 `slash command`

所以在这个平台上，“类型”很大程度上不是你在正文里写一句说明，而是你把它放进了 `.claude/skills/` 还是 `.claude/commands/`。

#### 2. Codex

Codex 的官方说法更接近“两种使用方式并存”：

- 你可以显式要求 Codex 使用某个 Skill
- 也可以让 Codex 根据任务自动决定是否使用它

所以在 Codex 里，Skill 更像一个“可自动选，也可点名调用”的能力包。

这意味着：

- 如果你在 prompt 里直接点名 skill，表现就更像“手动指定型”
- 如果你只是提任务目标，让 Codex 自己选，表现就更像“自动匹配型”

换句话说，Codex 这边更少强调“先给 skill 定一个固定类型”，而更强调“同一个 skill 可以同时支持自动选择和显式调用”。

#### 3. Cursor

Cursor 官方目前并没有一个和 Claude Code 完全对应的、稳定的一等 `Skill` 概念。

它更接近三类东西：

- `Rules`
- `Commands`
- `Custom Modes`

这三类里，最像 Skill 的其实是后两者：

- `.cursor/commands/*.md`：更像手动触发型，输入 `/` 选择命令后执行
- `Custom Modes`：更像平台工作流型，你切到某个 mode 后再开始任务

所以如果你在 Cursor 里说“我写了一个 skill”，很多时候实际上是在做下面两种之一：

- 一个手动 slash command
- 一个带特定工具和指令的自定义 mode

也就是说，在 Cursor 里，触发方式主要不是由 `SKILL.md` 这种标准文件决定，而是由你到底用的是 `Commands` 还是 `Custom Modes` 决定。

#### 4. Claude.ai

Claude.ai 也支持 Skill，但它和 Claude Code 的载体不完全一样。

官方文档里提到：

- 预置 Skill 会在相关任务里直接工作
- 自定义 Skill 可以上传后供 Claude 使用

所以在 Claude.ai 里，Skill 的使用方式也偏向：

- 平台先加载
- 模型再按相关性自动决定是否使用

它不像 slash command 那样必须每次手动敲命令，更偏“平台内自动发现 + 按相关性触发”。

把这几个平台放一起看，你会发现一个更稳的判断：

| 平台 | 更像哪种触发逻辑 |
| --- | --- |
| Claude Code `Skill` | 自动匹配型 |
| Claude Code slash command | 手动指定型 |
| Codex `Skill` | 自动匹配型 + 手动指定型都支持 |
| Cursor `Commands` | 手动指定型 |
| Cursor `Custom Modes` | 平台工作流型 |
| Claude.ai `Skill` | 平台加载后按相关性自动触发 |

所以如果你要问“常用平台怎么决定 skill 的执行类型”，更准确的答案是：

- 有的平台靠 **目录和载体** 决定，比如 Claude Code
- 有的平台靠 **功能入口** 决定，比如 Cursor 的 Commands 和 Modes
- 有的平台允许 **同一个 Skill 同时支持自动和手动**，比如 Codex

这也是为什么前面一直强调：不要把“Skill 类型”理解成一个所有平台统一的 `type` 字段。

更顺手的用法通常是：

1. 先用 `Rule` 把项目边界钉住。
2. 遇到重复任务时，把任务描述抽成一个 Skill。
3. 之后只需要补具体参数，而不是每次都重写整段说明。

### 什么时候自动触发

如果你的客户端支持意图识别，那下面这类 Skill 很适合自动匹配：

- 生成列表页骨架
- 生成搜索表单
- 补页面测试
- 生成表格列配置

因为这些任务特征很明显，Agent 比较容易判断“现在该用哪个 Skill”。

比如你说：

```text
帮我起一个订单列表页，要有筛选区、表格区和分页。
```

如果平台已经加载了 `create-list-page`，它就有可能自动把这类 Skill 选出来。

### 什么时候更适合手动指定

如果两个 Skill 的边界很接近，或者任务本身比较复杂，手动指定会更稳。

比如：

- `create-list-page`
- `generate-search-form`
- `wire-table-columns`

你这次如果只是想让 AI 先补搜索表单，那最好直接说：

```text
用 generate-search-form 这个 skill，先生成订单列表页的搜索区，不要生成整页。
```

这种明确点名，会比让 Agent 自己猜更稳。

### 什么时候不该做成 Skill

还有一种情况要反着判断。

如果一个需求：

- 只出现一次
- 步骤不稳定
- 输入输出每次差异很大

那它更适合写在当前对话里，不适合沉淀成 Skill。

因为 Skill 的前提就是“复用”。一次性需求写成 Skill，维护成本通常大于收益。

比如你要生成一个订单列表页，与其每次都手写长 Prompt，不如直接提供：

- 页面名
- 路由
- 搜索字段
- 表格列
- 请求服务名

这样 AI 收到的是结构化任务，而不是模糊愿望。

还有一个很实用的经验：先让 Skill 只负责“产出第一版”。像接口细节、文案微调、联调修补，可以放在后续对话里，不要全部塞进同一个 Skill。

## 写完了如何生效

这一段也特别容易被忽略。

`Skill` 写完之后，通常要满足下面几件事，客户端或平台才会真的把它当成一个可用技能：

1. 文件放在客户端支持扫描的位置
2. 文件格式符合它支持的约定
3. Skill 名称、描述、输入输出写得足够清楚
4. 重新加载技能列表，或者新开会话

更直白一点说：

- 你只是随手把一个 `SKILL.md` 放在仓库角落里，客户端未必会认
- 你把它放进技能目录、插件目录或平台配置里，客户端才知道“这里有个 skill”
- 很多客户端不会在当前会话里热更新刚新增的 skill

所以更稳的做法是：

1. 保存 `SKILL.md`
2. 确认它在技能目录下
3. 重启客户端，或者新开一个会话
4. 用一个非常典型的任务试它一次

比如你刚写完 `create-list-page`，那就不要立刻去测一个抽象任务，而是直接测：

```text
帮我生成一个订单列表页，包含筛选、表格和分页。
```

如果平台支持技能列表查看，也可以先确认它有没有被识别出来。

常见的“不生效”原因一般有这些：

- Skill 文件放错位置
- Skill 名和描述太模糊，Agent 不知道什么时候该选它
- 输入输出边界没写清，导致自动匹配失败
- 新 skill 加进去后没有重新加载会话

<div class="article-callout">
  <p class="article-kicker">判断 Skill 有没有真的生效</p>
  <ul>
    <li>先用一个最典型、最标准的任务试它，不要一开始就上复杂需求。</li>
    <li>如果它总选不出来，先补 description 和输入输出定义。</li>
    <li>如果它总被误用，说明边界还不够清楚，应该继续拆小。</li>
  </ul>
</div>

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
4. 先把 Skill 放进客户端能识别的目录或配置里，再用真实任务试跑。
5. 每次用完后回看结果，补输入项或校验项，不要无脑加步骤。
6. 复用两三次都稳定后，再考虑给团队推广。

最后再给一个简单判断：

- 想让 AI “默认遵守”，写 `Rule`
- 想让 AI “按这套步骤做”，写 `Skill`
- 想让 AI “看见外部上下文”，接 `MCP`

最后记一个判断标准：

如果 AI 已经知道“该按什么规范写”，但还是经常不知道“下一步该怎么做”，那就该补 `Skill`。

想继续看外部上下文怎么接，接着读 [《MCP 怎么用》](/blog/ai-introduction-mcp/)。
