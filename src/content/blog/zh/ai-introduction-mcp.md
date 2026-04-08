---
title: MCP 怎么用：前端该装哪些、怎么接、怎么自己写，一次讲透
description: 从前端常用 MCP 推荐、现成 server 的安装配置，到自己编写 MCP Server 的结构、调用时机和具体实例，讲清楚 MCP 到底怎么落地。
pubDate: '2026-03-30'
tags:
  - AI
  - Agent
  - MCP
  - 前端工程化
  - 调试
category: 技术
heroImage: ../../../assets/blog/generated/hello-world.png
imageStatus: complete
---
前端团队第一次接 `MCP`，最容易卡住的不是“它是什么”，而是这些很实际的问题：

- 前端到底该先装哪些 `MCP`？
- 现成的 `MCP server` 去哪里找？
- 是下载安装到本地，还是直接填一个 URL？
- 配置写在哪里，文件是什么格式？
- 接上之后，AI 会自动调用，还是要我每次手动点？
- 如果团队有自己的设计系统、组件库、接口平台，要怎么自己写一个 `MCP server`？

如果这些问题没讲清，MCP 很容易变成一种“听起来很强，但真正用不上”的概念。

这篇就只做一件事：把前端最常见的 `MCP` 用法拆开，从“现成的怎么接”到“自己的怎么写”，一条能直接上手的路径。

<div class="article-callout">
  <p class="article-kicker">先记一句话</p>
  <p><code>MCP</code> 不等于“多几个工具”。它真正解决的是：让 AI 在需要的时候，拿到真实、最新、可操作的上下文。</p>
</div>

## 简短介绍

你可以把 `MCP` 理解成 AI 连接外部世界的标准接口。

它和 `Rule`、`Skill` 的分工是什么：

| 层级 | 它负责什么 |
| --- | --- |
| `Rule` | 约束 AI 按你的工程规范写 |
| `Skill` | 约束 AI 按你的工作流做 |
| `MCP` | 让 AI 能看到外部信息，并调用外部能力 |

所以 `MCP` 适合解决的，通常不是“写法不统一”，而是下面这些问题：

- AI 不知道最新官方文档
- AI 看不到页面运行现场
- AI 读不到设计稿、组件规范、内部平台
- AI 需要调用真实工具，而不是只靠猜

## 前端先装哪几个 MCP

如果你是前端，不建议一上来就装十几个。先从最常用、最容易见效的四类开始。

<div class="article-grid">
  <div class="article-card">
    <h3>文档类</h3>
    <p><code>Context7</code>，适合补最新框架、库和 API 文档。</p>
  </div>
  <div class="article-card">
    <h3>浏览器调试类</h3>
    <p><code>chrome-devtools-mcp</code> 或 <code>@playwright/mcp</code>，适合查 Console、Network、DOM 和交互流程。</p>
  </div>
  <div class="article-card">
    <h3>设计稿类</h3>
    <p><code>Figma MCP</code>，适合把设计上下文、节点、组件约束带进代码生成。</p>
  </div>
</div>

更实际一点，你可以这样选：

| 你的问题 | 先接什么 |
| --- | --- |
| AI 总是写错最新版 API | `Context7` |
| 页面有 bug，但不知道错在前端逻辑还是浏览器现场 | `chrome-devtools-mcp` |
| 需要跑完整流程、回归表单、自动点页面 | `@playwright/mcp` |
| 设计稿还原总靠猜，组件细节总对不齐 | `Figma MCP` |

这几个里，前端最常见的优先级一般是：

1. `Context7`
2. `chrome-devtools-mcp`
3. `Figma MCP`
4. `@playwright/mcp`

`chrome-devtools-mcp` 和 `@playwright/mcp` 看起来都能“操作浏览器”，但侧重点不一样：

- `chrome-devtools-mcp` 更适合开发态调试，重点是 `Console`、`Network`、DOM、性能现场。
- `@playwright/mcp` 更适合多步骤自动化、回归流程、表单操作和可重复执行的浏览器任务。

如果想要先装一个浏览器类 MCP，前端开发阶段更推荐先装 `chrome-devtools-mcp`。如果想让 AI 稳定重跑一整条用户流程，再补 `@playwright/mcp`。

## 现成的 MCP server 去哪里找

先把一个特别关键的概念讲清楚。

你平时说“找个 MCP 装上”，实际上可能在找三种不同的东西：

1. `server` 的介绍页或仓库
2. 真正可安装的包，比如 `npm` / `PyPI` / `Docker`
3. 一个远程可直接连接的 MCP URL

所以找现成 MCP 时，最稳的顺序是：

1. 先去官方 `MCP Registry` 看有没有这个 server。
2. 再去它自己的官方文档或 GitHub 仓库看安装说明。
3. 确认它到底是“本地启动型”还是“远程 URL 型”。

更直白一点说：

- 本地型 `MCP` 一般需要你本机能跑命令，常见是 `npx xxx`、`uvx xxx`、`python xxx.py`。
- 远程型 `MCP` 一般不需要下载代码，直接在客户端里配置一个 `https://.../mcp` 的 URL。

<div class="article-callout">
  <p class="article-kicker">别一上来就找“下载按钮”</p>
  <p>很多现成的 <code>MCP</code> 根本不是“下载一个压缩包”。你要先确认它是本地 stdio server，还是远程 HTTP server，再决定是装包还是填 URL。</p>
</div>

## 怎么创建：先分清你接的是哪一种

前端接 `MCP`，最实用的分类不是按“文档类 / 浏览器类 / 设计类”，而是按接入方式分成两种：

### 1. 本地 `stdio` server

这是最常见的一类。

特点是：

- 客户端会在本机启动一个子进程
- 这个进程通过 `stdin/stdout` 和客户端通信
- 常见配置长这样：`command + args`

比如：

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

这种方式适合：

- 浏览器调试
- 本地文件、代码库、设计 token
- 依赖你当前机器环境的能力

### 2. 远程 `HTTP` server

这类 server 不需要你在本地跑命令，客户端直接连远程地址。

配置通常像这样：

```json
{
  "mcpServers": {
    "figma-remote": {
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

这种方式适合：

- 官方托管服务
- 需要 OAuth 或服务端鉴权的能力
- 团队统一维护的内部平台能力

如果你接 `Figma MCP`，就会同时遇到这两种：

- 远程版：直接连 `https://mcp.figma.com/mcp`
- 桌面版：本地桌面应用启动后，暴露 `http://127.0.0.1:3845/mcp`

## 配置写在哪里，文件长什么样

不同客户端位置不同，但思路几乎一样：都是告诉客户端“有哪些 server、怎么启动或怎么连接”。

最常见的配置格式是一个 `mcpServers` 对象。

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "figma-remote": {
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

这几个字段分别是什么意思：

| 字段 | 含义 |
| --- | --- |
| `mcpServers` | 这一组 MCP server 的总入口 |
| `context7` / `figma-remote` | 你给 server 起的名字，后面调试和管理都靠它 |
| `command` | 本地启动命令，比如 `npx` |
| `args` | 启动命令的参数，比如包名、模式、端口 |
| `url` | 远程 MCP 的地址 |
| `env` | 给本地 server 注入环境变量，比如 API Key |

如果你用的是 `Codex`，可以直接用 CLI 管理，也可以写配置文件。

CLI 方式更省事：

```bash
codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest
codex mcp add playwright -- npx @playwright/mcp@latest
codex mcp add figma --url https://mcp.figma.com/mcp
```

配完之后可以检查：

```bash
codex mcp list
```

`Codex` 的配置也可以写在：

```text
~/.codex/config.toml
```

一个本地 `stdio` server 的 `TOML` 例子可以写成这样：

```toml
[mcp_servers.playwright]
command = "npx"
args = ["@playwright/mcp@latest"]
```

如果你用的是支持 JSON 配置的客户端，通常是下面这种结构：

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

像 Cursor 这一类客户端，常见是通过设置界面添加，或者写全局 / 项目级 `mcp.json`。如果你的团队希望“只有这个项目才启用某个 MCP”，优先用项目级配置会更稳。

## 怎么使用现成的 MCP server

这里最容易误解的一点是：不是所有 MCP 都按同一种方式触发。

官方协议里，三类能力的调用模型其实不一样：

| 能力类型 | 谁来触发 | 前端里怎么理解 |
| --- | --- | --- |
| `Tools` | 模型主导 | AI 觉得有必要时会主动调，比如查浏览器、调接口、跑动作 |
| `Resources` | 客户端或应用主导 | 你手动附加，或者客户端按上下文帮你附加 |
| `Prompts` | 用户主导 | 更像 slash command，要你明确选择 |

这点很重要，因为它直接决定了“它是自动调用，还是要我手动指定”。

### 1. `Tool` 往往可以自动调用

比如：

- `chrome-devtools-mcp` 去看 `Console`
- `@playwright/mcp` 去点击按钮、读取页面
- `Context7` 去查某个库的文档

这类通常属于 `tools`，模型可以自动决定要不要调。

但注意两件事：

- 自动调用不等于一定会调
- 很多客户端仍然会对危险操作弹确认框

所以更稳的提示方式不是只说“帮我看一下”，而是明确告诉它顺序和目标。

比如：

```text
先用 chrome-devtools MCP 检查当前页面的 Console 和 Network，再告诉我查询按钮为什么没生效。
```

### 2. `Resource` 往往要你附加或让客户端选

比如设计稿节点、内部文档、数据库 schema、日志文件。

这类更像“额外上下文”，有的客户端会让你手动选，有的客户端会在上下文判断后自动带上。

前端里很常见的场景是：

- 你先附加一个 Figma frame 链接
- 再让 AI 根据这个节点实现组件

### 3. `Prompt` 往往要手动选

如果一个 MCP server 暴露的是 prompt 模板，它更像“现成工作流”。

通常要你主动选，或者通过命令式入口触发。它不是那种默认一定会自动调的能力。

所以你可以把调用时机粗暴记成一句话：

- 想让 AI 主动用能力，先暴露 `tool`
- 想给 AI 额外上下文，先暴露 `resource`
- 想给用户一个固定流程入口，暴露 `prompt`

## 什么时候用什么 MCP

如果你还在纠结“这次到底该开哪个”，可以直接按任务选。

| 场景 | 推荐 MCP | 为什么 |
| --- | --- | --- |
| 生成 Next.js、React、TanStack Table 代码时怕 API 写旧 | `Context7` | 补最新版文档和例子 |
| 页面能打开，但按钮没反应、列表没数据 | `chrome-devtools-mcp` | 直接看 `Console`、`Network`、DOM |
| 要跑登录、下单、筛选等一整条流程 | `@playwright/mcp` | 更适合多步骤自动化 |
| 要根据设计稿还原页面或拿组件约束 | `Figma MCP` | 能拿到设计节点、组件、变量和上下文 |
| 有内部设计系统、组件库、BFF 平台 | 自己写一个 MCP | 公共 server 不知道你的私有规则 |

前端里最容易见效的三个闭环是：

1. 写代码前，用 `Context7` 查当前库的最新用法。
2. 页面出问题时，用 `chrome-devtools-mcp` 看真实现场。
3. 对设计稿时，用 `Figma MCP` 提供节点上下文。

这三个加起来，已经能覆盖大部分日常开发。

## 实例 1：前端现成 MCP 怎么接，怎么用

下面直接给一套前端最常见的接法。

### `Context7`

适合：

- React / Next.js / Vite / Tailwind / Supabase 这类库和框架
- 你最怕“AI 按旧版本 API 乱写”的场景

本地接法：

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

怎么用更稳：

- 提示里直接说“先用 Context7 查最新版文档”
- 如果知道具体库，直接把库 ID 说出来会更准

比如：

```text
先用 Context7 查 `/vercel/next.js` 的最新文档，再给我一个 App Router 下的鉴权中间件实现。
```

### `chrome-devtools-mcp`

适合：

- 调页面 bug
- 查请求失败
- 看性能瓶颈

接法：

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

怎么用更稳：

```text
打开 localhost:3000，先看 Console 和 Network，再告诉我为什么点击“查询”后列表没有刷新。
```

如果你想深入看浏览器调试，可以继续读 [《Chrome DevTools MCP 到底有什么用？从安装到上手一次讲清》](/blog/chrome-devtools-mcp/)。

### `@playwright/mcp`

适合：

- 跑多步骤流程
- 做回归重试
- 操作表单、弹窗、登录流

接法：

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

怎么用更稳：

```text
用 Playwright MCP 从首页开始走一遍登录 -> 搜索订单 -> 打开详情的流程，如果失败就在失败步骤停下并告诉我页面状态。
```

### `Figma MCP`

适合：

- 设计稿还原
- 提取 design token、变量、组件结构
- 让 AI 不要再靠经验猜 UI

远程接法：

```json
{
  "mcpServers": {
    "figma-remote": {
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

桌面版接法：

```json
{
  "mcpServers": {
    "figma-desktop": {
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

怎么用更稳：

1. 先在 Figma 里选中 frame 或复制节点链接
2. 再把链接发给 AI
3. 明确告诉它先取设计上下文，再生成代码

比如：

```text
先用 Figma MCP 读取这个 frame 的布局、间距和组件信息，再生成一个 React 搜索表单，不要自己猜字段顺序。
```

## 怎么编写：什么时候该自己写一个 MCP server

你不需要为“所有项目”都自己写 MCP。

更适合自己写的场景通常是：

- 你的团队有私有设计系统
- 你们有内部组件库、脚手架、BFF 平台
- 你们有自己的 CMS、低代码平台、接口平台
- 这些信息对 AI 很重要，但外部公开 MCP 根本拿不到

换句话说，只有当“通用 MCP 不知道你们项目的私有规则”时，才值得自己写。

前端里特别典型的自定义方向有三类：

1. 设计系统 MCP
2. 组件规范 MCP
3. 接口平台 / Mock 平台 MCP

## 自己写一个 MCP server，目录和文件怎么放

如果你用 TypeScript 写一个最小可用的本地 `stdio` server，目录结构完全可以很简单：

```text
frontend-mcp/
  package.json
  tsconfig.json
  src/
    index.ts
```

先装依赖：

```bash
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node
```

`package.json` 可以先写成这样：

```json
{
  "name": "frontend-mcp",
  "type": "module",
  "scripts": {
    "build": "tsc"
  }
}
```

`tsconfig.json` 最小版：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

## 代码结构是什么，每部分是什么意思

如果你第一次写，最推荐先只做 `tool`，不要一上来就同时做 `resources + prompts + tools`。

因为前端里最常见的需求，就是“让 AI 能主动调一个内部能力”。

下面给一个非常实用的例子：做一个内部组件规范 MCP，让 AI 能根据组件名查到你们团队的约束。

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const componentRules: Record<string, string> = {
  SearchForm:
    "必须使用共享表单容器；字段顺序为关键字、状态、日期；提交参数走 mapSearchParams。",
  DataTable:
    "列配置单独放在 columns.ts；不要把请求逻辑写进表格组件；空态使用项目默认 EmptyBlock。",
};

const server = new McpServer({
  name: "frontend-component-rules",
  version: "1.0.0",
});

server.tool(
  "get-component-rule",
  {
    componentName: z.string().describe("组件名，比如 SearchForm 或 DataTable"),
  },
  async ({ componentName }) => {
    const rule =
      componentRules[componentName] ?? "没有找到对应规则，请回退到项目通用规则。";

    return {
      content: [
        {
          type: "text",
          text: rule,
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

这段代码最重要的部分其实就四块：

| 部分 | 它的作用 |
| --- | --- |
| `new McpServer(...)` | 创建 server，并声明名字和版本 |
| `server.tool(...)` | 暴露一个可被模型调用的工具 |
| `zod schema` | 描述这个工具需要什么输入 |
| `server.connect(transport)` | 把 server 真正跑起来，开始通过 stdio 通信 |

再解释得更实一点：

- `name` / `version` 是这个 server 的身份信息
- `tool name` 是客户端看到并调用的能力名
- `z.object` 或参数 schema 是这个工具的入参定义
- `handler` 里的返回值就是工具真正返回给 AI 的内容
- `StdioServerTransport` 说明这是一个本地 `stdio` server

如果你后面还想扩展：

- 让用户手动附加一份设计 token 清单，用 `resource`
- 让用户手动触发“生成 PR 描述”这类固定流程，用 `prompt`

但第一版不用全做。

## 写完了如何生成，如何接入客户端

本地 TypeScript server 并没有什么特殊“发布动作”。

最常见的流程就是：

1. 本地编译
2. 确认产物能运行
3. 把客户端指向这个产物

比如：

```bash
npm run build
node build/index.js
```

如果本地能正常启动，再接到客户端里。

在 `Codex` 里可以这样加：

```bash
codex mcp add component-rules -- node /ABSOLUTE/PATH/frontend-mcp/build/index.js
```

或者写到 `~/.codex/config.toml`：

```toml
[mcp_servers.component-rules]
command = "node"
args = ["/ABSOLUTE/PATH/frontend-mcp/build/index.js"]
```

这里有个很容易踩的坑：

`stdio` server 不能往 `stdout` 乱打日志，不然会把 MCP 消息流打坏。你如果要打印日志，应该打到 `stderr`。

## 实例 2：前端什么时候该自己写 MCP

假设你们团队有一套私有后台组件库，AI 最常犯的错是：

- 表单字段顺序总不对
- 表格列配置总写进页面里
- 弹窗和抽屉的交互约束总写错

如果这些规则只写在文档里，AI 不一定每次都看。

这时候可以这样落地：

1. `Rule` 里写通用约束，比如“请求层不能写进组件”
2. `Skill` 里写高频动作，比如“生成列表页骨架”
3. `MCP` 里暴露组件规范查询工具，比如 `get-component-rule`

这样当 AI 生成一个列表页时：

- `Rule` 负责兜底
- `Skill` 负责流程
- `MCP` 负责把私有规范补进来

这才是前端里比较稳的组合方式。

## 建议的使用流程

如果你准备把 MCP 真正用进前端项目，我更推荐这个顺序：

1. 先只装 1 到 2 个高频 MCP，不要一口气全装。
2. 文档类先补 `Context7`，浏览器类先补 `chrome-devtools-mcp`。
3. 设计稿还原需求明显时，再补 `Figma MCP`。
4. 跑多步骤回归时，再补 `@playwright/mcp`。
5. 通用 server 满足不了项目私有规则时，再自己写一个最小工具型 MCP。

最后还有几条特别实用的建议：

- 不要把每个 MCP 都常开。按任务开，效果通常更稳。
- 给 MCP 起清楚的名字，不然后面排查配置很痛苦。
- 危险能力一定要最小权限，比如文件路径、可访问域名、鉴权范围。
- 如果模型自动调用不稳定，就在提示里明确说“先用哪个 MCP，再做什么”。
- 自己写 server 时，第一版先只做一个 `tool`，不要上来做全家桶。

最后只记一句就够了：

`MCP` 最适合补“AI 原本看不到、但你项目里又真的需要”的那部分上下文。前端里最先装文档、浏览器、设计这三类，几乎不会错。

## 参考链接

- MCP 官方文档：<https://modelcontextprotocol.io/docs/getting-started/intro>
- MCP 本地 server 接入：<https://modelcontextprotocol.io/docs/develop/connect-local-servers>
- MCP 远程 server 接入：<https://modelcontextprotocol.io/docs/develop/connect-remote-servers>
- MCP Server 开发指南：<https://modelcontextprotocol.io/docs/develop/build-server>
- MCP Tools 规范：<https://modelcontextprotocol.io/docs/concepts/tools>
- MCP Resources 规范：<https://modelcontextprotocol.io/docs/concepts/resources>
- MCP Prompts 规范：<https://modelcontextprotocol.io/docs/concepts/prompts>
- Chrome DevTools MCP：<https://github.com/ChromeDevTools/chrome-devtools-mcp>
- Playwright MCP：<https://github.com/microsoft/playwright-mcp>
- Context7：<https://github.com/upstash/context7>
- Figma MCP 指南：<https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server>
