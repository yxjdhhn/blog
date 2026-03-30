---
title: >-
  The Three-Tier Capability Evolution of AI Agents in Frontend Engineering:
  Rule, Skill, and MCP
description: >-
  Introduces the responsibility boundaries, adaptation scenarios, recommended
  combinations, and common pitfalls of Rule, Skill, and MCP in React frontend
  engineering.
pubDate: '2026-03-30'
tags:
  - AI
  - Agent
  - MCP
  - Frontend Engineering
  - React
  - Next.js
  - TypeScript
category: Technology
heroImage: ../../../assets/blog/generated/ai-introduction.png
draft: false
generatedFrom: zh
sourceHash: f499c49b3fd1ea7e7f2c8200b7fe1595a7744194f86a44d10ad24144762faeb4
translationStatus: complete
imageStatus: complete
---
When discussing AI Agents today, if you still think of them merely as "editor plugins that can complete code," that perspective is already largely insufficient.

What's truly difficult in frontend engineering has never been about getting it to spit out a piece of JSX. The real challenges are threefold:

-   It must write according to the project's specifications.
-   It must know what to do next.
-   It must have access to the real context, not just make blind guesses.

These three challenges correspond precisely to three layers of capability:

-   `Rule`: The Constraint Layer
-   `Skill`: The Instruction Layer
-   `MCP`: The Protocol Layer

This article isn't about a full chronicle of pitfalls or a product pitch. The focus is on one thing: breaking down these three layers to clearly see what problems they solve in React frontend engineering, how they are best integrated, and where they are most prone to misuse.

<div class="article-callout">
  <p class="article-kicker">Key Takeaways First</p>
  <ul>
    <li>If the output is <strong>often off-spec</strong>, start by adding <code>Rule</code>.</li>
    <li>If you're <strong>often reinventing the wheel</strong>, start by breaking down <code>Skill</code>.</li>
    <li>If it <strong>often relies on guessing the latest info or page state</strong>, then integrate <code>MCP</code>.</li>
  </ul>
</div>

<div class="article-grid">
  <div class="article-card">
    <h3>What Rule Solves</h3>
    <p>Solves the problem of "the AI writing code differently every time for the same project."</p>
  </div>
  <div class="article-card">
    <h3>What Skill Solves</h3>
    <p>Solves the problem of "what exactly to do next, and how to reuse it reliably."</p>
  </div>
  <div class="article-card">
    <h3>What MCP Solves</h3>
    <p>Solves the problem of "having no real context, forced to rely on guesswork."</p>
  </div>
</div>

## The Big Picture: How Rule, Skill, and MCP Divide Responsibilities

Many teams start by mixing discussions of Prompt, Tools, and MCP, leading to increasingly messy configurations. A more stable approach is to first firmly define the boundaries.

| Layer | Responsibility | Typical Input | Suitable Problems to Solve | Common Misuse |
| :--- | :--- | :--- | :--- | :--- |
| `Rule` | Constrains the Agent's generation method | Tech stack standards, directory conventions, boundary rules, output format | Unifying code style, limiting architectural boundaries, reducing deviations | Stuffing all business docs and ad-hoc requirements into it |
| `Skill` | Breaks tasks into reusable atomic actions | Structured parameters, tool definitions, input/output contracts | Generating pages, adding tests, encapsulating requests, modifying table columns | Writing it as a "universal Prompt" |
| `MCP` | Enables the Agent to access external context and tool capabilities | Documentation, browser, design system, repository, APIs | Checking the latest docs, viewing page context, reading design constraints | Connecting everything, causing context pollution |

In a nutshell:

-   `Rule` governs *how to write*.
-   `Skill` governs *how to do*.
-   `MCP` governs *what can be seen*.

The most easily confused pair is `Rule` and `MCP`.

> **Rule of thumb:** If it often deviates, add `Rule` first; if it's often repetitive, break it into `Skill` first; if it often relies on guesswork, connect `MCP` first.

`Rule` is the internal guideline. It determines what boundaries the Agent adheres to when outputting.

`MCP` is the external slot in hand. It determines what external information and tools the Agent can access.

One manages cognitive constraints. The other manages contextual capabilities. They are not the same thing.

## Rule: Shifting Constraints Forward from Lint to Prompt

> **In a nutshell:** `Rule` is not about fixing mistakes after the fact, but about preventing the Agent from writing incorrectly from the very start.

### Underlying Logic

Frontend teams are no strangers to "rules." `ESLint`, `TypeScript`, directory conventions, component agreements—these already exist.

The problem is, most of these rules are applied *after* generation.

That is, the code is already written, then it's checked, errors are reported, and rework begins.

The value of `Rule` lies in moving constraints forward, to *before* generation. It lets the Agent know what can be written and what to avoid before it even starts.

Therefore, it can be understood as the engineering specification layer for the Prompt era:

-   Lint is result validation.
-   Rule is generation constraint.

These two are not a replacement for each other. They work in tandem, one after the other.

Without Rule, the Agent would have to guess the project style from scratch every time. Getting it right is luck; getting it wrong starts polluting the codebase.

### Typical Usage

In a backend management project using `React + Next.js + TypeScript`, Rules are best suited for carrying high-frequency, stable, and cross-session effective conventions.

For example:

-   Unify function components and hooks
-   Default to `Next.js App Router`
-   Use `use client` only when browser capabilities are required
-   `TypeScript strict` mode must be enabled
-   Fixed directory structure for pages, components, hooks, services, and types
-   Data requests must go through the `services` layer and not be scattered directly within page components

A practical `.cursorrules` file might look like this:

```md
# React Admin Baseline

- Use TypeScript only. Assume `strict: true`.
- Use function components and hooks only.
- Use Next.js App Router.
- Add `use client` only when browser APIs, local state, refs, or event handlers are required.

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

This type of Rule is well-suited for constraining daily development tasks such as:

-   Generating page skeletons
-   Creating search form components
-   Splitting page hooks
-   Generating page test files

It is not responsible for telling the Agent what the business API looks like. Its role is to first establish and enforce the engineering boundaries.

### Pitfall Guide

The most common issue with Rules is `Rule Inflation`.

That is, cramming everything into the Rule.

For example, stuffing all these together:

- Business context
- Interface field descriptions
- Special requirements for a particular iteration
- Test accounts
- Release process

The result is usually just one: the Rule becomes bloated, instructions become messy, and the truly important constraints get drowned out.

Rules are better suited for these three types of content:

- Frequently occurring
- Long-term stable
- Need to persist across sessions

Temporary requirements, business context, specific interface details should not be piled into the Rule. That's not enhancement; it's noise.

<div class="article-grid">
  <div class="article-card">
    <h3>Suitable for Writing into Rules</h3>
    <ul>
      <li>Tech stack constraints</li>
      <li>Directory and layering constraints</li>
      <li>Unified output format</li>
    </ul>
  </div>
  <div class="article-card">
    <h3>Not Suitable for Writing into Rules</h3>
    <ul>
      <li>One-off business requirements</li>
      <li>Specific interface field details</li>
      <li>Test accounts and release processes</li>
    </ul>
  </div>
</div>

## Skill: Turning Agents into Reusable Atomic Operations

> **In a nutshell:** A `Skill` is not "a longer Prompt," but rather "a smaller, reusable action unit."

### Underlying Logic

If Rule addresses "don't write nonsense," then Skill addresses "what to do next."

Skill is not essentially a longer prompt.

It's more like an atomic operation manual. The goal is to break down high-frequency tasks into stable, verifiable, and reusable action units.

Therefore, at the Skill level, the most important thing is not how elaborately it's described, but having clear boundaries:

-   What is the input?
-   What is the output?
-   Which specific step is it responsible for?

Rule is responsible for direction. Skill is responsible for action. Don't mix them up.

### Typical Usage

In React admin scenarios, the following types of Skills are quite common:

- `create-list-page`
- `generate-search-form`
- `wire-table-columns`
- `generate-page-test`

For example, `create-list-page` can be responsible solely for generating a page skeleton containing a filter area, a table area, and a pagination area.

For example, `wire-table-columns` is only responsible for mapping API fields to column configurations for `TanStack Table` or the project's internal table components.

For example, `generate-page-test` is only responsible for generating page-level tests, covering initial screen rendering, filter interactions, empty states, and error states.

A structured Skill definition can be written like this:

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

The practical scenarios corresponding to this type of Skill are very straightforward.

Scenario one, quickly scaffold an order list page:
- Input filter items: order number, status, creation time
- Input table columns: order number, amount, status, update time
- Output page skeleton, column configuration, search area component

Scenario two, add a permission button area:
- Input permission points and button text
- Output button rendering logic
- Not responsible for the implementation of the permission service itself

The benefit of this decomposition is stable actions and verifiable results.

### Pitfall Avoidance Guide

The most common misstep with Skills is turning them into a "universal task entry point."

For example, a Skill that attempts to generate pages, fill in APIs, write tests, and even perform performance optimization on the side. The result is often a tool that touches on everything but masters nothing.

To judge if a Skill is over-engineered, consider these three points:

-   Does it perform only one type of action?
-   Are its inputs structured?
-   Can its outputs be validated?

Common red flags include:

-   A Skill with a grandiose name but vague, undefined boundaries.
-   A Skill that incorporates specifications that should be enforced by Rules.
-   Generated results that cannot be verified through files, types, or tests.

Skills should not aim for comprehensiveness. Aim for stability. Start by extracting high-frequency actions; that's often sufficient.

<div class="article-callout">
  <p class="article-kicker">Focus on Three Things When Designing a Skill</p>
  <ol>
    <li>Are the inputs structured?</li>
    <li>Are the outputs verifiable?</li>
    <li>Does it handle only one stable action?</li>
  </ol>
</div>

## MCP: Bring in External Context, But Don't Turn It into a Hodgepodge

> **In a nutshell:** The focus of `MCP` is not "more tools," but rather "external context can finally be integrated in a standardized way."

### Underlying Logic

MCP stands for `Model Context Protocol`.

Its core value isn't "just adding a few more tools," but rather standardizing the way external capabilities are integrated.

Previously, if you wanted an AI to query documentation, read browser state, or connect to a design system, you often had to write a separate set of Tool integrations for different clients. This created heavy coupling and made migration difficult.

With MCP, the approach becomes:

-   Developers implement an `MCP Server` once.
-   Any client supporting this protocol can reuse this set of capabilities.

This is the significance of the protocol layer. It solves decoupling, not single-point functionality.

So, let's reiterate the boundaries here:

-   `Rule` determines how the Agent thinks and writes.
-   `MCP` determines what the Agent can see and connect to.

One is a constraint. The other is capability integration.

### Typical Usage

In React admin projects, the three most common types of MCP integrations are:

-   Documentation-based
-   Browser-based
-   Design System-based

#### 1. Documentation-based MCP

Ideal for looking up the latest documentation and APIs.

For example:
-   Constraints of `Next.js`'s `App Router`
-   Latest patterns for `React` hooks
-   Column definition methods for `TanStack Table`
-   Field linkage implementations for form libraries

In this scenario, the value of MCP is not in generating code for you, but in reducing deviations caused by outdated knowledge.

#### 2. Browser-based MCP

Ideal for inspecting live pages.

For example, the most common types of issues in admin pages:
-   Whether the request was sent
-   What the `Network` tab returns
-   If there are any runtime errors in the `Console`
-   Whether the DOM structure and state match expectations

This layer is particularly suitable for joint debugging and troubleshooting phases, as many issues cannot be fully understood by looking at code alone.

#### 3. Design System-based MCP

Ideal for reading design drafts and component constraints.

For instance, visual rules for areas like the search section, action bar, table area, and drawer form in an admin page are often numerous:
-   Field order
-   Spacing hierarchy
-   Primary/secondary button relationships
-   Error and empty states

Without design context, an Agent can only guess based on common sense. Once integrated with the design system, it can understand the project's specific UI rules.

A lightweight MCP configuration example might look like this:

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

The key point of this configuration is not the specific command names, but the three types of context entry points:
-   Documentation
-   Browser
-   Design System

These three categories essentially cover most frontend scenarios.

### Pitfall Guide

The most common issue with MCP is not failing to connect, but connecting too much.

This is a classic case of `Context Pollution`.

For example, connecting all of these at once:

- Documentation
- Browser
- Design mockups
- File system
- Ticket system
- Monitoring platform
- Database

In theory, more information is better. In practice, the common consequences are:

- Token consumption skyrockets
- Response speed slows down
- Relevance decreases

The reason isn't complicated. With a larger context, the Agent has to search for clues among more information each time. What it finds may not even be relevant to the current task.

Therefore, the principle for MCP is not "connect everything possible," but "enable based on the scenario."

## How to Implement in React Frontend: Three Short Cases

The above discusses the three-layer definition. For actual implementation, we need to look at specific scenarios.

We won't go through the complete workflow here, only break down three high-frequency modules.

<div class="article-callout">
  <p class="article-kicker">Recommended Implementation Order</p>
  <ol>
    <li>First, supplement <code>Rule</code> to firmly establish the engineering boundaries.</li>
    <li>Then, break down <code>Skill</code> to standardize high-frequency actions.</li>
    <li>Finally, integrate <code>MCP</code> to provide real-time context for key scenarios.</li>
  </ol>
</div>

### Scenario 1: List Page Scaffold Generation

The most common starting point for a backend management page is the list page.

For example, product lists, order lists, user lists—they are essentially similar: a filter area + a table area + a pagination area.

In this case, the division of labor across the three layers can be:

-   `Rule`: Constrain the directory, types, `use client` boundaries, and the approach for the data request layer.
-   `Skill`: Use `create-list-page` to generate the page skeleton and column configurations.
-   `MCP`: Look up the documentation for `TanStack Table` or the project's internal table components.

For this type of scenario, an Agent is well-suited for building pages that are highly repetitive and structurally stable.

### Scenario 2: Search Form and Filter Linkage

The second high-frequency scenario in backend management pages is the search form.

For example, after switching the order status, certain filter options need to be displayed in linkage; date ranges, keywords, and dropdown states all need to participate in the query together.

The division of labor here can be:

-   `Rule`: Mandates that forms must use shared form encapsulation, not directly scattering field states.
-   `Skill`: Uses `generate-search-form` to generate field structures, default values, and submission parameter mappings.
-   `MCP`: Reads field order, interaction descriptions, required and disabled rules from design drafts.

Without Rule, such forms can easily end up with a different implementation on every page.

Without MCP, linked fields and design constraints are prone to being guessed incorrectly.

### Scenario 3: API Integration and Page Debugging

The third common scenario is when a page looks mostly complete, but the integration isn't fully working.

For example:

-   The list is empty, but it's unclear if it's a filter parameter issue or an API response problem.
-   A button click yields no feedback; it's uncertain if the event isn't bound or the request failed.
-   A permission button isn't displayed; it's unclear if it's a rendering logic or a data issue.

In this case, a more appropriate division of labor is:

-   `Rule`: Mandate that requests must go through `services`, and state logic should not be mixed with UI code.
-   `Skill`: Generate request wrappers, error state handling, and page-level tests.
-   `MCP`: Directly inspect the `Network` tab, `Console`, and DOM state.

In this module, the value of MCP becomes more apparent than pure code generation. Because it fills in the missing on-site information.

## A Decision Table: Which Layer Should I Prioritize Now?

If you've read this far and still wonder, "Which one should I tackle first in my project?", you can directly apply the table below:

| Current Symptom | Priority Layer | Reason |
| --- | --- | --- |
| AI generates code with inconsistent styles each time | `Rule` | First, firmly establish project boundaries and output constraints. |
| Repetitive writing of list pages, forms, tests | `Skill` | First, extract high-frequency actions into reusable units. |
| Constantly needing to check the latest docs, call APIs, or inspect page state | `MCP` | First, supplement with real context to reduce reliance on guesswork. |
| All three problems exist simultaneously | `Rule` → `Skill` → `MCP` | First, stabilize boundaries, then enable reuse, and finally supplement context. |

## Unified Pitfall Checklist

Finally, we've condensed the most common issues into a single page for easy reference.

-   Don't let `Rule` bloat. It's for long-term, stable rules, not for cramming in temporary business context.
-   Don't make `Skill` a Swiss Army knife. A Skill should handle only one type of action; clearer boundaries mean greater stability.
-   Don't grant `MCP` excessive permissions indiscriminately. More context doesn't guarantee more accurate results.
-   Don't mix the three layers. Write specifications into Rule, actions into Skill, and delegate external integrations to MCP.
-   Don't aim for full automation from the start. In frontend engineering, it's better to first streamline high-frequency modules and then gradually expand capabilities.

By clearly delineating the boundaries between these three layers, the role of AI Agent in frontend engineering becomes much clearer.

It's not just a simple "code generator."

It's more like a layered engineering capability:

-   `Rule` ensures we don't go off track.
-   `Skill` ensures reusability.
-   `MCP` ensures context is available.

Once these three layers are solidly established, many repetitive tasks in React projects can truly be handled effectively, without making the codebase increasingly messy.

<div class="article-callout">
  <p class="article-kicker">Just remember one final thing</p>
  <p>Don't merge the three layers into one "big Prompt." <code>Rule</code> manages boundaries, <code>Skill</code> manages actions, and <code>MCP</code> manages context. The clearer the boundaries, the more useful AI becomes in engineering.</p>
</div>
