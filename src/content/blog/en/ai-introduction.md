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
sourceHash: f381a0079922845f35dd4bab2c12e97b1924940baff85712bcc07ad6d805d6f0
translationStatus: complete
imageStatus: complete
---
When discussing AI Agents today, if you still think of them merely as "editor plugins that can complete code," that perspective is completely inadequate.

What's truly difficult in frontend engineering has never been about getting it to spit out a piece of JSX. The real challenges are threefold:

- It must write according to the project's specifications.
- It must know what to do next.
- It must access the real context, not just make blind guesses.

These three challenges correspond precisely to three layers of capability:

- `Rule`: The Constraint Layer
- `Skill`: The Instruction Layer
- `MCP`: The Protocol Layer

This article breaks down these three layers to clarify what problems they solve in React frontend engineering, how they are best integrated, and where they are most prone to misuse.

<div class="article-callout">
  <p class="article-kicker">Key Takeaways First</p>
  <ul>
    <li><strong>If code often deviates</strong>, start by strengthening <code>Rule</code>.</li>
    <li><strong>If you frequently reinvent the wheel</strong>, start by decomposing <code>Skill</code>.</li>
    <li><strong>If you often rely on guessing the latest info or page state</strong>, then integrate <code>MCP</code>.</li>
  </ul>
</div>

<div class="article-grid">
  <div class="article-card">
    <h3>What Rule Solves</h3>
    <p>Solves the problem of "the AI writing code differently every time in the same project."</p>
  </div>
  <div class="article-card">
    <h3>What Skill Solves</h3>
    <p>Solves the problem of "what exactly to do next and how to stably reuse it."</p>
  </div>
  <div class="article-card">
    <h3>What MCP Solves</h3>
    <p>Solves the problem of "having no real context and having to guess based on impressions."</p>
  </div>
</div>

<div class="article-callout">
  <p class="article-kicker">Want to jump straight to usage?</p>
  <ul>
    <li><a href="/blog/ai-introduction-rule/">How to create, decompose, and write Rules without bloat</a></li>
    <li><a href="/blog/ai-introduction-skill/">How to design Skill inputs/outputs and decompose them into reusable actions</a></li>
    <li><a href="/blog/ai-introduction-mcp/">How to integrate MCP with documentation, browsers, and design systems by scenario</a></li>
  </ul>
</div>

## The Big Picture: How Rule, Skill, and MCP Divide Responsibilities

Many teams start by mixing discussions of Prompts, Tools, and MCP, leading to increasingly messy configurations. A more stable approach is to first firmly define the boundaries.

| Layer | Responsibility | Typical Input | Suitable Problems to Solve | Common Misuse |
| :--- | :--- | :--- | :--- | :--- |
| `Rule` | Constrains the Agent's generation method | Tech stack specifications, directory conventions, boundary rules, output formats | Unifying code style, limiting architectural boundaries, reducing deviations | Stuffing all business docs and ad-hoc requirements into it |
| `Skill` | Breaks down tasks into reusable atomic actions | Structured parameters, tool definitions, input/output contracts | Generating pages, adding tests, encapsulating requests, modifying table columns | Writing it as a "universal Prompt" |
| `MCP` | Enables the Agent to access external context and tool capabilities | Documentation, browser, design system, repository, APIs | Checking the latest docs, viewing the live page, reading design constraints | Connecting everything, causing context pollution |

In a nutshell:

- `Rule` governs *how to write*.
- `Skill` governs *how to do*.
- `MCP` governs *what can be seen*.

CLAUDE.md: Company-wide policies
rules: Departmental supplementary regulations
skill: SOP manual for this type of work
hook: Access control / security check / automated inspection scripts
compact: After a long meeting, tidying up the desktop and minutes

The most easily confused are `Rule` and `MCP`.

`Rule` is the internal rulebook. It determines what boundaries the Agent adheres to when outputting.

`MCP` is the external slot in hand. It determines which external information and tools the Agent can access.

One governs cognitive constraints. The other governs contextual capabilities. They are not the same thing.

## Rule: Shifting Constraints Forward from Lint to Prompt

> **In a nutshell:** `Rule` is not about fixing mistakes after the fact, but about preventing the Agent from writing incorrectly from the very start.

### Underlying Logic

Frontend teams are no strangers to "rules." `ESLint`, `TypeScript`, directory conventions, component agreements—these already exist.

The problem is, most of these rules are applied *after* generation.

That is, the code is already written, then it's checked, errors are reported, and rework begins.

The value of `Rule` lies in moving constraints forward, to *before* generation. It lets the Agent know what can be written and what to avoid *before* it puts pen to paper.

Therefore, it can be understood as the engineering specification layer for the Prompt era:

-   Lint is result validation.
-   Rule is generation constraint.

These two are not a replacement for each other. They work in tandem, one after the other.

Without Rule, the Agent would have to guess the project style from scratch every time. Getting it right is luck; getting it wrong starts polluting the codebase.

### Typical Usage

For example, in a backend management project using `React + Next.js + TypeScript`, Rules are best suited for carrying high-frequency, stable, cross-session rules.

For instance:

- Fixed directories for pages, components, hooks, services, and types.
- Data requests must go through the `services` layer and should not be scattered directly within page components.

A practical `.cursorrules` file might look like this:

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

Rules are not responsible for telling the Agent what the business interfaces look like. Their primary role is to first establish and enforce the engineering boundaries.

### Pitfall Guide

The most common issue with Rules is `Rule Inflation`.

This means cramming everything into Rules, which typically leads to only one outcome: Rules become bloated, instructions become messy, and truly important constraints get buried.

Rules are better suited for these three types of content:

-   Frequently occurring items
-   Long-term stable items
-   Items that need to remain effective across sessions

Temporary requirements, business context, and specific interface details should not be piled into Rules. That's not enhancement; it's noise.

<div class="article-grid">
  <div class="article-card">
    <h3>Suitable for Rules</h3>
    <ul>
      <li>Tech stack constraints</li>
      <li>Directory and layering constraints</li>
      <li>Unified output format</li>
    </ul>
  </div>
  <div class="article-card">
    <h3>Unsuitable for Rules</h3>
    <ul>
      <li>One-off business specifications</li>
      <li>Specific interface field details</li>
      <li>Test accounts and release processes</li>
    </ul>
  </div>
</div>

To learn more about how to create, write, and ensure Rules remain effective in a project long-term, continue reading [《How to Use Rules: First, "Manage" AI Code Writing》](/blog/ai-introduction-rule/).

## Skill: Transforming Agents into Reusable Atomic Operations

> **In a nutshell:** A `Skill` is not a "longer Prompt," but a "smaller, reusable action unit."

### Underlying Logic

If Rule addresses "don't write nonsense," then Skill addresses "what to do next."

A Skill is not essentially a longer prompt.

It's more like an atomic operation manual. Its goal is to break down high-frequency tasks into stable, verifiable, and reusable action units.

Therefore, for the Skill layer, the most important thing is not how elaborately it's described, but having clear boundaries:

-   What is the input?
-   What is the output?
-   Which specific step is it responsible for?

Rule is responsible for direction. Skill is responsible for action. They should not be conflated.

### Typical Usage

For example, in a React admin scenario, the following types of Skills are quite common:

-   `create-list-page`
-   `generate-search-form`
-   `wire-table-columns`
-   `generate-page-test`

Take `create-list-page` for instance. It can be solely responsible for generating a page skeleton containing a filter area, a table area, and a pagination area.

Take `wire-table-columns` for instance. It is only responsible for mapping API fields to column configurations for `TanStack Table` or the project's internal table components.

Take `generate-page-test` for instance. It is only responsible for generating page-level tests, covering initial screen rendering, filter interactions, empty states, and error states.

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
-   Input filter items: order number, status, creation time
-   Input table columns: order number, amount, status, update time
-   Output page skeleton, column configuration, search area component

Scenario two, add a permission button area:
-   Input permission points and button text
-   Output button rendering logic
-   Not responsible for the implementation of the permission service itself

The benefit of this decomposition is stable actions and verifiable results.

### Pitfall Avoidance Guide

The most common misstep with Skills is turning them into a "universal task entry point."

For example, a Skill that attempts to generate pages, fill in APIs, write tests, and even perform performance optimization on the side. The result is often a tool that touches on everything but excels at nothing.
Common red flags include:

-   The Skill's name is grandiose, but its actual scope is vague.
-   The Skill incorporates constraints that should be governed by Rules.
-   The generated output cannot be validated through files, types, or tests.

Skills should not aim for comprehensiveness. Aim for stability. Start by extracting high-frequency actions; that's often sufficient.

<div class="article-callout">
  <p class="article-kicker">When designing a Skill, focus on just three things</p>
  <ol>
    <li>Is the input structured?</li>
    <li>Is the output verifiable?</li>
    <li>Does it handle only one stable action?</li>
  </ol>
</div>

To learn more about how to properly decompose, write, and make Skills reusable for others, continue reading [How to Use Skills: Breaking Down High-Frequency Tasks into AI-Reusable Actions](/blog/ai-introduction-skill/).

## MCP: Bring in External Context, But Don't Turn It into a Hodgepodge

> **In a nutshell:** The focus of `MCP` is not "more tools," but rather "external context can finally be integrated in a standardized way."

### Underlying Logic

MCP stands for `Model Context Protocol`.

Its core value isn't "just having a few more tools," but rather standardizing the way external capabilities are integrated.

Previously, if you wanted an AI to query documentation, read browser state, or connect to a design system, you often had to write a separate set of Tool integrations for different clients. This created heavy coupling and made migration cumbersome.

With MCP, the approach becomes:

-   Developers implement an `MCP Server` once.
-   Any client supporting this protocol can reuse this set of capabilities.

This is the significance of the protocol layer. It solves the problem of decoupling, not just adding single-point functionality.

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

This layer is particularly suitable for joint debugging and troubleshooting phases. Many problems cannot be fully understood by looking at code alone.

#### 3. Design System-based MCP

Ideal for reading design drafts and component constraints.

For instance, visual rules for areas like the search section, action bar, table area, and drawer form in an admin page are often numerous:
-   Field order
-   Spacing hierarchy
-   Primary/secondary button relationships
-   Error and empty states

Without design context, an Agent can only guess based on common sense. After integrating with the design system, it can understand the project's specific UI rules.

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

The key point of this configuration is not the specific command names. It's the three types of context entry points:
-   Documentation
-   Browser
-   Design System

These three categories essentially cover most frontend scenarios.

### Pitfall Avoidance Guide

The most common issue with MCP isn't failure to connect, but connecting *too much*.

This is a classic case of **Context Pollution**.

For example, connecting all of these at once:

- Documentation
- Browser
- Design Mockups
- File System
- Ticketing System
- Monitoring Platform
- Database

In theory, more information is better. In practice, the common consequences are:

- Token consumption skyrockets
- Response speed slows down
- Relevance decreases

The reason isn't complicated. With a larger context, the Agent has to sift through more information to find clues each time, and what it finds may not even be relevant to the current task.

Therefore, the principle for MCP isn't "connect everything possible," but "enable based on the scenario."

To learn more about how to choose scenarios for `MCP`, how to configure it, and how to actually use it in frontend development, you can continue reading [How to Use MCP: Connecting Real Context to AI Based on Scenarios](/blog/ai-introduction-mcp/).

## How to Implement in React Frontend: Three Short Cases

The above discusses the three-layer definition. For actual implementation, we need to look at specific scenarios.

Here, we won't walk through a complete process, but only break down three high-frequency modules.

<div class="article-callout">
  <p class="article-kicker">Recommended Implementation Order</p>
  <ol>
    <li>First, supplement <code>Rule</code> to nail down the engineering boundaries.</li>
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

The second high-frequency scenario in admin pages is the search form.

For example, after switching the order status, certain filter options need to be displayed in linkage; date ranges, keywords, and dropdown states all need to participate in the query together.

The division of labor here can be:

-   `Rule`: Mandates that forms must use shared form encapsulation, not directly scattering field states.
-   `Skill`: Uses `generate-search-form` to generate field structure, default values, and submission parameter mapping.
-   `MCP`: Reads the field order, interaction instructions, required and disabled rules from the design mockups.

Without Rule, such forms can easily end up with a different implementation on every page.

Without MCP, linked fields and design constraints are prone to being guessed incorrectly.

### Scenario 3: API Integration and Page Debugging

The third common scenario is when a page looks mostly complete, but the integration isn't fully working.

For example:

-   The list is empty, but it's unclear if it's a filter parameter issue or an API response problem.
-   A button click yields no feedback; it's uncertain if the event isn't bound or the request failed.
-   A permission-based button isn't displayed; it's unclear if it's a rendering logic or a data issue.

In this case, a more appropriate division of labor is:

-   `Rule`: Mandate that requests must go through `services`, and state logic should not be mixed with UI code.
-   `Skill`: Generate request wrappers, error state handling, and page-level tests.
-   `MCP`: Directly inspect the `Network` tab, `Console`, and DOM state.

In this module, the value of MCP becomes more apparent than pure code generation. Because it supplements on-the-ground information.

## A Decision Table: Which Layer Should I Prioritize Now?

If you've read this far and still wonder, "Which one should I tackle first in my project?", you can directly apply the table below:

| Current Symptom | Priority Layer | Reason |
| --- | --- | --- |
| AI generates code with inconsistent styles each time | `Rule` | First, firmly establish project boundaries and output constraints. |
| Repetitive writing of list pages, forms, tests | `Skill` | First, extract high-frequency actions into reusable units. |
| Constantly needing to check the latest docs, call APIs, or inspect page state | `MCP` | First, supplement with real context to reduce reliance on guesswork. |
| All three problems exist simultaneously | `Rule` → `Skill` → `MCP` | First, stabilize boundaries, then enable reuse, and finally supplement context. |

## Unified Pitfall Checklist

Finally, let's condense the most common issues onto a single page for easy reference.

-   Don't let `Rule` bloat. It's for long-term, stable rules, not for cramming in temporary business context.
-   Don't make `Skill` a Swiss Army knife. One Skill should handle one type of action; clearer boundaries mean greater stability.
-   Don't grant `MCP` excessive permissions indiscriminately. More context doesn't guarantee more accurate results.
-   Don't mix the three layers. Write specifications into Rule, actions into Skill, and delegate external integrations to MCP.
-   Don't aim for full automation from the start. In frontend engineering, it's better to first streamline high-frequency modules, then gradually expand capabilities.

If you clearly delineate the boundaries between these three layers, the role of the AI Agent in frontend engineering becomes much clearer.

It's not just a simple "code generator."

It's more like a layered engineering capability:

-   `Rule` ensures you don't go off track.
-   `Skill` ensures reusability.
-   `MCP` ensures context is available.

Once these three layers are solidly built, many repetitive tasks in React projects can truly be handled effectively, without making the codebase increasingly messy.

<div class="article-callout">
  <p class="article-kicker">Just remember one final thing</p>
  <p>Don't merge the three layers into one "big Prompt." <code>Rule</code> manages boundaries, <code>Skill</code> manages actions, <code>MCP</code> manages context. The clearer the boundaries, the more useful AI becomes in engineering.</p>
</div>
