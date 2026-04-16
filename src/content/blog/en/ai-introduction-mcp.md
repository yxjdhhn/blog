---
title: >-
  How to Use MCP: A Complete Guide for Frontend Developers on Installation,
  Integration, and Custom Development
description: >-
  From recommending commonly used MCPs for frontend, configuring ready-made
  servers, to structuring, invoking, and implementing custom MCP Servers, this
  guide clarifies how to effectively implement MCP in practice.
pubDate: '2026-03-30'
tags:
  - AI
  - Agent
  - MCP
  - Frontend Engineering
  - Debugging
category: Technology
heroImage: ../../../assets/blog/generated/ai-introduction-mcp.png
draft: false
generatedFrom: zh
sourceHash: 07daccc8dab5fc8c616ebc94e460ab2407a175e4138ca14aea492370c345038d
translationStatus: complete
imageStatus: complete
---
When a frontend team first integrates `MCP`, the biggest hurdles aren't "what it is," but these very practical questions:

- Which `MCP` tools should the frontend install first?
- Where can I find ready-made `MCP servers`?
- Do I download and install it locally, or just fill in a URL?
- Where do I write the configuration, and what is the file format?
- After connecting, will the AI call it automatically, or do I need to manually trigger it each time?
- If our team has its own design system, component library, or API platform, how do we write our own `MCP server`?

If these questions aren't clarified, MCP can easily become a concept that "sounds powerful but is practically unusable."

This article does just one thing: break down the most common `MCP` usage for frontend, from "how to connect existing ones" to "how to write your own," providing a clear, actionable path.

<div class="article-callout">
  <p class="article-kicker">Remember this first</p>
  <p><code>MCP</code> is not about "having a few more tools." What it truly solves is: enabling AI to access real, up-to-date, and actionable context when needed.</p>
</div>

## Brief Introduction

You can think of `MCP` as a standard interface for AI to connect to the external world.

What is its division of labor compared to `Rule` and `Skill`:

| Layer | What It Is Responsible For |
| --- | --- |
| `Rule` | Constrains AI to write according to your engineering standards |
| `Skill` | Constrains AI to operate according to your workflow |
| `MCP` | Enables AI to see external information and invoke external capabilities |

Therefore, what `MCP` is suitable for solving is typically not "inconsistent writing style," but rather the following types of problems:

- AI doesn't know the latest official documentation
- AI cannot see the live page runtime
- AI cannot read design drafts, component specifications, or internal platforms
- AI needs to call real tools, not just rely on guessing

## Which MCPs Should Frontend Developers Install First

If you're a frontend developer, it's not advisable to install a dozen MCPs right away. Start with the three most commonly used and immediately impactful categories.

<div class="article-grid">
  <div class="article-card">
    <h3>Documentation</h3>
    <p><code>Context7</code> is suitable for supplementing the latest framework, library, and API documentation.</p>
  </div>
  <div class="article-card">
    <h3>Browser Debugging</h3>
    <p><code>chrome-devtools-mcp</code> or <code>@playwright/mcp</code> are suitable for checking the Console, Network, DOM, and interaction flows.</p>
  </div>
  <div class="article-card">
    <h3>Design Mockups</h3>
    <p><code>Figma MCP</code> is suitable for bringing design context, nodes, and component constraints into code generation.</p>
  </div>
</div>

To be more practical, you can choose like this:

| Your Problem | What to Connect First |
| --- | --- |
| AI always writes the latest API incorrectly | `Context7` |
| There's a bug on the page, but you don't know if it's in the frontend logic or the browser environment | `chrome-devtools-mcp` |
| Need to run complete workflows, regression tests for forms, or automate page clicks | `@playwright/mcp` |
| Design mockup implementation relies on guesswork, and component details never align | `Figma MCP` |

Among these, the typical priority for frontend developers is generally:

1. `Context7`
2. `chrome-devtools-mcp`
3. `Figma MCP`
4. `@playwright/mcp`

While `chrome-devtools-mcp` and `@playwright/mcp` both seem to "operate the browser," their focuses differ:

- `chrome-devtools-mcp` is better suited for debugging during development, focusing on the `Console`, `Network`, DOM, and performance context.
- `@playwright/mcp` is better suited for multi-step automation, regression workflows, form operations, and repeatable browser tasks.

If you want to install a browser-related MCP first, `chrome-devtools-mcp` is more recommended during the frontend development phase. If you want the AI to reliably re-run an entire user flow, then add `@playwright/mcp` later.

## Where to Find Ready-Made MCP Servers

First, let's clarify a crucial concept.

When you usually say "find an MCP to install," you might actually be looking for three different things:

1.  The `server`'s introduction page or repository
2.  The actual installable package, such as from `npm` / `PyPI` / `Docker`
3.  A remote MCP URL that can be connected to directly

Therefore, the most reliable order for finding a ready-made MCP is:

1.  First, check the official `MCP Registry` to see if this server is listed there.
2.  Then, go to its own official documentation or GitHub repository to read the installation instructions.
3.  Confirm whether it is a "local startup type" or a "remote URL type."

To put it more plainly:

-   Local-type `MCP`s generally require your local machine to be able to run commands, commonly like `npx xxx`, `uvx xxx`, `python xxx.py`.
-   Remote-type `MCP`s generally don't require downloading code; you just configure a `https://.../mcp` URL directly in the client.

<div class="article-callout">
  <p class="article-kicker">Don't Immediately Look for a "Download Button"</p>
  <p>Many ready-made <code>MCP</code>s are not about "downloading a zip file." You need to first confirm whether it's a local stdio server or a remote HTTP server, then decide whether to install a package or fill in a URL.</p>
</div>

## How to Create: First Identify Which Type You Are Connecting To

Frontend integration with `MCP` can be divided into two types based on the connection method:

### 1. Local `stdio` Server

This is the most common type.

Its characteristics are:

- The client starts a child process on the local machine.
- This process communicates with the client via `stdin/stdout`.
- A typical configuration looks like this: `command + args`.

For example:

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

This method is suitable for:

- Browser debugging
- Local files, code repositories, design tokens
- Capabilities that depend on your current machine's environment

### 2. Remote `HTTP` Server

This type of server does not require you to run commands locally; the client connects directly to a remote address.

The configuration typically looks like this:

```json
{
  "mcpServers": {
    "figma-remote": {
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

This approach is suitable for:

- Officially hosted services
- Capabilities requiring OAuth or server-side authentication
- Internal platform capabilities maintained uniformly by a team

If you integrate with `Figma MCP`, you will encounter both of these types:

- Remote version: Connect directly to `https://mcp.figma.com/mcp`
- Desktop version: After the local desktop application starts, it exposes `http://127.0.0.1:3845/mcp`

## Where to Write Configuration and What the File Looks Like

Different clients have different locations, but the approach is almost the same: they all tell the client "which servers are available and how to start or connect to them."

The most common configuration format is an `mcpServers` object.

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

Here's what each of these fields means:

| Field | Meaning |
| --- | --- |
| `mcpServers` | The main entry point for this group of MCP servers |
| `context7` / `figma-remote` | The name you give to the server, used later for debugging and management |
| `command` | The local startup command, e.g., `npx` |
| `args` | Arguments for the startup command, e.g., package name, mode, port |
| `url` | The address of the remote MCP server |
| `env` | Environment variables to inject into the local server, e.g., API Key |

If you're using `Codex`, you can manage it directly via CLI or write a configuration file.

The CLI method is more convenient:

```bash
codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest
codex mcp add playwright -- npx @playwright/mcp@latest
codex mcp add figma --url https://mcp.figma.com/mcp
```

After configuration, you can check:

```bash
codex mcp list
```

`Codex` configuration can also be written in:

```text
~/.codex/config.toml
```

An example of a local `stdio` server configuration in `TOML` can be written like this:

```toml
[mcp_servers.playwright]
command = "npx"
args = ["@playwright/mcp@latest"]
```

If you're using a client that supports JSON configuration, it typically follows this structure:

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

For clients like Cursor, it's common to add them via the settings interface or by writing a global/project-level `mcp.json`. If your team wants "only this project to enable a specific MCP," using project-level configuration is more reliable.

## How to Use an Installed and Configured MCP Server

The most common misunderstanding here is that not all MCPs are triggered in the same way.

In the official protocol, the invocation models for the three types of capabilities are actually different:

| Capability Type | Who Triggers | How to Understand It in the Frontend |
| --- | --- | --- |
| `Tools` | Model-led | The AI actively calls it when deemed necessary, e.g., to query a browser, call an API, or execute an action. |
| `Resources` | Client or Application-led | You attach it manually, or the client attaches it for you based on context. |
| `Prompts` | User-led | More like a slash command, requiring you to explicitly select it. |

This is crucial because it directly determines whether "it's called automatically, or if I need to specify it manually."

### 1. `Tool` Often Supports Automatic Invocation

For example:

- `chrome-devtools-mcp` to inspect the `Console`
- `@playwright/mcp` to click buttons or read page content
- `Context7` to look up documentation for a specific library

These typically fall under `tools`, and the model can automatically decide whether to call them.

But note two things:

- Automatic invocation capability does not guarantee it will always be called
- Many clients will still show a confirmation dialog for potentially risky operations

Therefore, a more reliable prompting approach is not just saying "help me check," but explicitly telling it the sequence and goal.

For example:

```text
First, use the chrome-devtools MCP to inspect the current page's Console and Network, then tell me why the query button isn't working.
```

### 2. `Resource` Often Requires You to Attach or Let the Client Choose

Examples include design mockup nodes, internal documents, database schemas, and log files.

These are more like "additional context." Some clients will ask you to select them manually, while others will automatically include them based on context.

A very common scenario in frontend development is:

-   You first attach a link to a Figma frame.
-   Then, you ask the AI to implement a component based on that node.

### 3. `Prompt` Often Requires Manual Selection

If an MCP server exposes prompt templates, it's more like a "ready-made workflow."

It typically requires you to actively select it or trigger it through a command-style entry point. It's not the kind of capability that is automatically invoked by default.

Therefore, you can roughly remember the timing for invoking these as follows:

- If you want the AI to actively use a capability, expose a `tool`.
- If you want to provide the AI with additional context, expose a `resource`.
- If you want to give the user a fixed workflow entry point, expose a `prompt`.

## When to Use Which MCP

If you're still stuck wondering "Which one should I open this time?", you can simply choose based on the task.

| Scenario | Recommended MCP | Why |
| --- | --- | --- |
| Worried about writing outdated APIs when generating code for Next.js, React, or TanStack Table | `Context7` | Provides the latest documentation and examples |
| Page loads, but buttons don't respond or lists have no data | `chrome-devtools-mcp` | Directly inspect `Console`, `Network`, and DOM |
| Need to run an entire flow like login, placing an order, or filtering | `@playwright/mcp` | Better suited for multi-step automation |
| Need to recreate a page from a design mockup or extract component constraints | `Figma MCP` | Can access design nodes, components, variables, and context |
| Have an internal design system, component library, or BFF platform | Write your own MCP | Public servers don't know your private rules |

## Example 1: How to Connect and Use Existing MCPs for Frontend

Here is a direct set of the most common connection methods for frontend.

### `Context7`

Ideal for:

- Libraries and frameworks like React / Next.js / Vite / Tailwind / Supabase
- Scenarios where you most fear "the AI writing code based on outdated API versions"

Local connection method:

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

How to use it more reliably:

- Directly instruct in the prompt: "First, use Context7 to look up the latest documentation"
- If you know the specific library, stating its library ID will yield more accurate results

For example:

```text
First, use Context7 to look up the latest documentation for `/vercel/next.js`, then give me an implementation of an authentication middleware under the App Router.
```

### `chrome-devtools-mcp`

Ideal for:

- Debugging page issues
- Investigating failed requests
- Identifying performance bottlenecks

How to connect:

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

How to use it effectively:

```text
Open localhost:3000, first check the Console and Network tabs, then tell me why the list doesn't refresh after clicking the "Query" button.
```

If you want to dive deeper into browser debugging, you can continue reading [What is Chrome DevTools MCP Good For? A Complete Guide from Installation to Getting Started](/blog/chrome-devtools-mcp/).

### `@playwright/mcp`

Ideal for:

-   Running multi-step workflows
-   Performing regression retries
-   Handling forms, pop-ups, and login flows

How to connect:

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

How to use it more reliably:

```text
Use Playwright MCP to walk through the flow from the homepage: login -> search for an order -> open details. If it fails, stop at the failed step and tell me the page state.
```

### `Figma MCP`

Ideal for:

-   Design-to-code implementation
-   Extracting design tokens, variables, and component structures
-   Preventing AI from guessing UI based on past experience

Remote Connection Method:

```json
{
  "mcpServers": {
    "figma-remote": {
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

Desktop App Connection Method:

```json
{
  "mcpServers": {
    "figma-desktop": {
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

How to Use More Effectively:

1.  First, select a frame or copy the node link within Figma.
2.  Then, send the link to the AI.
3.  Explicitly instruct it to first retrieve the design context before generating code.

For example:

```text
First, use the Figma MCP to read the layout, spacing, and component information from this frame. Then, generate a React search form. Do not guess the field order on your own.
```

## How to Write: When Should You Build Your Own MCP Server

You don't need to build an MCP for "every project."

Scenarios more suitable for building your own typically include:

-   Your team has a private design system.
-   You have internal component libraries, scaffolding tools, or BFF platforms.
-   You have your own CMS, low-code platform, or API platform.
-   This information is crucial for the AI, but publicly available MCPs simply cannot access it.

In other words, it's only worth building your own when "generic MCPs don't know your project's private rules."

Within frontend development, there are three particularly typical categories for customization:

1.  Design System MCP
2.  Component Specification MCP
3.  API Platform / Mock Platform MCP

## Writing Your Own MCP Server: Directory and File Structure

If you're writing a minimal, functional local `stdio` server in TypeScript, the directory structure can be quite simple:

```text
frontend-mcp/
  package.json
  tsconfig.json
  src/
    index.ts
```

First, install the dependencies:

```bash
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node
```

Your `package.json` can initially look like this:

```json
{
  "name": "frontend-mcp",
  "type": "module",
  "scripts": {
    "build": "tsc"
  }
}
```

A minimal `tsconfig.json`:

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

## Code Structure Explained: What Each Part Means

If you're writing this for the first time, it's highly recommended to start with just `tool` functionality. Don't try to implement `resources + prompts + tools` all at once from the get-go.

Because the most common need on the frontend is to "enable the AI to actively call an internal capability."

Here's a very practical example: create an internal component specification MCP, allowing the AI to look up your team's constraints based on a component name.

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const componentRules: Record<string, string> = {
  SearchForm:
    "Must use the shared form container; field order is keyword, status, date; submission parameters go through mapSearchParams.",
  DataTable:
    "Column configuration is placed separately in columns.ts; do not write request logic into the table component; empty states use the project's default EmptyBlock.",
};

const server = new McpServer({
  name: "frontend-component-rules",
  version: "1.0.0",
});

server.tool(
  "get-component-rule",
  {
    componentName: z.string().describe("Component name, e.g., SearchForm or DataTable"),
  },
  async ({ componentName }) => {
    const rule =
      componentRules[componentName] ?? "No corresponding rule found, please fall back to the project's general rules.";

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

The most important parts of this code are essentially four blocks:

| Part | Its Purpose |
| --- | --- |
| `new McpServer(...)` | Creates the server and declares its name and version. |
| `server.tool(...)` | Exposes a tool that can be called by the model. |
| `zod schema` | Describes what input this tool requires. |
| `server.connect(transport)` | Actually runs the server, starting communication via stdio. |

To explain in more concrete terms:

- `name` / `version` are the identity information for this server.
- `tool name` is the capability name seen and called by the client.
- `z.object` or the parameter schema is the input definition for this tool.
- The return value inside the `handler` is the actual content returned to the AI by the tool.
- `StdioServerTransport` indicates this is a local `stdio` server.

If you want to expand later:

- To let users manually attach a design token list, use `resource`.
- To let users manually trigger fixed workflows like "generate PR description," use `prompt`.

But you don't need to do everything in the first version.

## How to Generate and Connect to a Client

There is no special "publish action" for a local TypeScript server.

The most common workflow is:

1.  Compile locally
2.  Verify the build output can run
3.  Point the client to this output

For example:

```bash
npm run build
node build/index.js
```

If it starts successfully locally, then connect it to the client.

In `Codex`, you can add it like this:

```bash
codex mcp add component-rules -- node /ABSOLUTE/PATH/frontend-mcp/build/index.js
```

Or write it to `~/.codex/config.toml`:

```toml
[mcp_servers.component-rules]
command = "node"
args = ["/ABSOLUTE/PATH/frontend-mcp/build/index.js"]
```

Here's a common pitfall to watch out for:

An `stdio` server must not log arbitrarily to `stdout`, as this will corrupt the MCP message stream. If you need to print logs, they should be directed to `stderr`.

## Recommended Workflow

If you're planning to integrate MCP into a real frontend project, I recommend following this order:

1.  Start by installing only 1 or 2 high-frequency MCPs. Don't install them all at once.
2.  For documentation, start with `Context7`. For browser-related tasks, start with `chrome-devtools-mcp`.
3.  Add the `Figma MCP` when you have a clear need for design-to-code translation.
4.  Add `@playwright/mcp` when you need to run multi-step regression tests.
5.  Only write your own minimal, tool-specific MCP when the generic servers can't meet your project's private rules.

Here are a few more practical tips:

-   Don't keep every MCP running all the time. Turn them on per task for more stable results.
-   Give your MCPs clear names. Troubleshooting configurations later is painful otherwise.
-   For dangerous capabilities (like file paths, accessible domains, auth scopes), always use the principle of least privilege.
-   If the model's automatic calls are unstable, explicitly state in your prompt: "First use [which MCP], then do [what]."
-   When writing your own server, make the first version implement just one `tool`. Don't try to build the whole suite from the start.

In the end, just remember this one principle:

`MCP` is best for providing the context that "the AI can't see on its own, but your project genuinely needs." For frontend, starting with documentation, browser, and design MCPs is almost always the right move.

## Reference Links

- MCP Official Documentation: <https://modelcontextprotocol.io/docs/getting-started/intro>
- Connecting Local MCP Servers: <https://modelcontextprotocol.io/docs/develop/connect-local-servers>
- Connecting Remote MCP Servers: <https://modelcontextprotocol.io/docs/develop/connect-remote-servers>
- MCP Server Development Guide: <https://modelcontextprotocol.io/docs/develop/build-server>
- MCP Tools Specification: <https://modelcontextprotocol.io/docs/concepts/tools>
- MCP Resources Specification: <https://modelcontextprotocol.io/docs/concepts/resources>
- MCP Prompts Specification: <https://modelcontextprotocol.io/docs/concepts/prompts>
- Chrome DevTools MCP: <https://github.com/ChromeDevTools/chrome-devtools-mcp>
- Playwright MCP: <https://github.com/microsoft/playwright-mcp>
- Context7: <https://github.com/upstash/context7>
- Figma MCP Guide: <https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server>
