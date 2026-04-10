---
title: 'How to Use Rule: First, ''Manage'' AI Code Writing'
description: >-
  From creation and breakdown to writing and implementation, clarify where to
  place Rule, what to write, and how to ensure AI consistently adheres to it
  over time.
pubDate: '2026-03-30'
tags:
  - AI
  - Agent
  - Rule
  - Frontend Engineering
  - Prompt
category: Technology
heroImage: ../../../assets/blog/generated/ai-introduction-rule.png
draft: false
generatedFrom: zh
sourceHash: 6c88e409dfc579ae00b1f287a6965fb9ee82e94384589bff5a5acbfce1bfcb99
translationStatus: complete
imageStatus: complete
---
If you've noticed one thing: for the same requirement, AI writes it one way today and another way tomorrow, the problem often isn't whether the model is smart enough, but that the project boundaries weren't clarified upfront.

The `Rule` layer is about moving these boundaries forward. It's not responsible for explaining business context, nor for replacing interface documentation. It's responsible for one thing only: letting the AI know, before it starts writing, what can and cannot be done in this project.

<div class="article-callout">
  <p class="article-kicker">Remember this first</p>
  <p><code>Rule</code> is a long-term, effective project constraint, not a temporary requirement catch-all. The clearer you write it, the less likely the AI is to go off track.</p>
</div>

## Brief Introduction

You can think of `Rule` as the "engineering defaults" for AI-assisted development scenarios.

It's best suited for carrying this type of content:
-   Tech stack constraints
-   Directory and layering specifications
-   Writing boundaries for components, Hooks, and request layers
-   Output format requirements
-   General prohibitions
-   Long-term team conventions

It's less suitable for carrying this type of content:
-   One-off business requirements
-   Temporary notes about an interface that just changed this week
-   Details that will only appear in a single task

To put it more bluntly, `Rule` addresses the problem of "unstable coding practices," not the problem of "insufficient context."

## How to Create

Different clients may refer to `Rule` with slightly different names, but the implementation approach is similar: distinguish between global rules and project rules, then place frequent, stable constraints in the appropriate locations.

First, let's clarify "where exactly to write the rules."

If you are using a client like Cursor that supports project rules, the most common placement methods are three:

- **Project Rules**: Written in the project's `.cursor/rules/` directory.
- **User Rules**: Written in the client settings, effective globally.
- **`AGENTS.md`**: Placed in the project root directory, suitable for simple, direct project instructions.

There is also a legacy format:

- **`.cursorrules`**: An old format, still compatible with many clients, but no longer recommended for new creation.

If you just want to remember one conclusion:

- To keep rules with the code and version-managed with the team, use `.cursor/rules/`.
- To write your own global preferences, like "reply in Chinese by default," use User Rules.
- To start with a simple Markdown document outlining project constraints, you can use `AGENTS.md` in the root directory.

For the project rules directory, you can refer to this organizational structure:

```text
.cursor/
  rules/
    project-baseline.md
    react-components.md
    api-boundary.md
```

Note ⚠️: The responsibilities of these files should also be as clear as possible:

- `project-baseline.md` holds general project constraints.
- `react-components.md` holds constraints for components and hooks.
- `api-boundary.md` holds constraints for the request layer and data flow boundaries.

Besides writing `.md` files, you can also write structured rules, typically as `.mdc` files. They are essentially still Markdown, just with a metadata section added at the front.

For example:

```text
.cursor/
  rules/
    project-baseline.mdc
    react-components.mdc
```

A minimal `.mdc` file looks like this:

```md
---
description: React component and hook specifications
globs: ["src/components/**/*.tsx", "src/hooks/**/*.ts"]
alwaysApply: false
---

- Use function components only.
- Shared components must not contain page-specific request logic.
- Hooks should start with `use`.
```

The meaning of each part can be understood as follows:

| Part | Purpose |
| --- | --- |
| `description` | Tells the Agent what this rule is roughly about. |
| `globs` | Specifies the file patterns where it's more likely to be applied. |
| `alwaysApply` | Whether to force it into the context every time. |
| Body Content | The actual rule instructions for the AI. |

If you don't need this metadata, you can also write plain Markdown, like the root directory's `AGENTS.md`:

```md
# Project Instructions

## Code Style
- Use TypeScript for all new files.
- Prefer React function components.

## Architecture
- Keep fetch logic in `src/services`.
- Keep shared UI components free of page-specific business logic.
```

A more robust approach is this:

1.  First, write a project-level baseline rule, version-controlled with the code.
2.  Then, add a personal-level rule, containing only language habits, output preferences, etc., that don't affect team collaboration.
3.  If the rules are clearly divided into multiple topics, split them into separate files; don't pile them into one large chunk.

## How to Write

The key to writing a `Rule` is not verbosity, but making it instantly clear to the AI what must be followed.

A more effective Rule typically consists of four parts:

1.  Project Context
2.  Structural Constraints
3.  Output Requirements
4.  Prohibitions

For example, in a frontend project, the first version can be written directly using the following framework:

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

Here are several practical writing principles:

*   One rule should express one idea; avoid packing three layers of nuance into a single sentence.
*   Use clear, actionable statements over vague judgments. For example, "Must go through `src/services`" is more reliable than "Pay attention to extracting request logic."
*   Whenever possible, write both "what to do" and "what not to do" to define clearer boundaries.
*   If you need to include examples in a rule, prioritize referencing real directories, real filenames, and real component conventions.

The most common pitfall is turning the Rule into an encyclopedia. If you cram business context, API descriptions, and release notes into it, the actual constraints that need to be followed will get diluted.

<div class="article-callout">
  <p class="article-kicker">A More Reliable Approach</p>
  <ul>
    <li>Start with a minimal rule set, covering only the most frequent mistakes.</li>
    <li>Add a new rule only after the AI makes the same type of error two or three times in a row.</li>
    <li>If the rules exceed one screen and the key points are still unclear, it's time to split them into separate files.</li>
  </ul>
</div>

## How to Use

`Rule` is not something you write and then forget; its true value lies in "continuous effectiveness."

However, "continuous effectiveness" does not mean "every rule is mindlessly applied every time." Different types of Rules have different trigger conditions.

It is not a single on/off switch, but rather a set of rule carriers with different triggering mechanisms.

- Some are automatically applied.
- Some are automatically attached when a specific file is matched.
- Some require you to explicitly specify them.
- Others are decided by the Agent itself whether to use or not.

Here's an important clarification:

These "Rule types" are not necessarily determined by manually writing a `type` field in the rule file. More accurately, different platforms decide the Rule type and trigger mechanism in different ways:

- Some platforms have explicit type dropdowns or metadata, like Cursor.
- Some platforms don't have a "rule type" field; instead, they rely on file location and hierarchy, like Claude Code.
- Some platforms are closer to the `AGENTS.md` scoping model and don't provide explicit type switching, like Codex.

In other words, determining whether a Rule is "always-on," "auto-attach," or "manually-specified" cannot be done by looking at the file content alone; you also need to consider how your specific platform loads it.

### How to Set Rule Types and Trigger Methods on Common Platforms

To avoid making this section too abstract, let's look directly at a few of the most common platforms.

> The following section is organized based on official documentation I reviewed as of March 31, 2026. Rule systems evolve quickly, so specific entry points and naming may change with future product updates.

#### 1. Cursor

Cursor is the most "explicit" platform in this regard.

Its project rules are located in:

```text
.cursor/rules/
```

Each project rule is typically a `.mdc` file, and the official documentation clearly states: **The Rule type is determined by the type dropdown in the rule editor.** This selection corresponds to several fields in the frontmatter, such as:

- `description`
- `globs`
- `alwaysApply`

Cursor's four project rule types are:

| Cursor Type | How to Set | How it Triggers |
| --- | --- | --- |
| `Always` | Select `Always` in the rule editor, or set `alwaysApply: true` | Included in every relevant session |
| `Auto Attached` | Select `Auto Attached` and specify `globs` | Automatically attached when referencing matching files |
| `Agent Requested` | Select `Agent Requested` and provide a `description` | Actively included by the Agent when deemed relevant |
| `Manual` | Select `Manual` | Only included when you explicitly use `@ruleName` |

In other words, in Cursor, the "Rule type" is an explicitly configurable property, not just a convention you define yourself.

It also has two supplementary carriers:

-   User Rules: Set in `Cursor Settings > Rules`, always apply globally.
-   `AGENTS.md`: Serves as a simple alternative for project instructions, leaning towards auto-loading.

So, if you ask "Where do I set the Rule type in Cursor?", the most accurate answer is:

-   Project Rules: Set the type in the rule editor corresponding to `.cursor/rules/*.mdc`.
-   User Rules: Written in settings; they don't have the four-category classification of project rules.
-   `AGENTS.md`: No type option; takes effect based on file location and platform default logic.

#### 2. Claude Code

Claude Code's approach differs from Cursor's.

It officially emphasizes the `CLAUDE.md` system of memory/instruction files, rather than assigning a dropdown type to each rule.

Common locations are:

```text
~/.claude/CLAUDE.md
./CLAUDE.md
./.claude/CLAUDE.md
```

The distinction method provided by Claude Code's official documentation is primarily based on "location and hierarchy":

| Location | Purpose | How it Triggers |
| --- | --- | --- |
| `~/.claude/CLAUDE.md` | User-level preferences | Automatically applies to all projects |
| `./CLAUDE.md` or `./.claude/CLAUDE.md` | Project-level rules | Automatically applies to the current project |
| `CLAUDE.md` in deeper directories | Rules for finer scopes | Takes effect when files in the corresponding subtree are read |

Therefore, in Claude Code:

-   There is no unified type dropdown like Cursor's `Always / Manual / Agent Requested`.
-   The "rule type" is more determined by the file's location.
-   The "trigger method" is more determined by the directory scope and file reading path.

For example, the `CLAUDE.md` in the root directory functions more like a project-level auto-rule, while a `CLAUDE.md` in a subdirectory acts more like a local auto-rule.

If you want to implement something "completely manually triggered" in Claude Code, you typically wouldn't continue using `CLAUDE.md` but would switch to using a slash command instead.

#### 3. Codex

Codex currently aligns more closely with the `AGENTS.md` scope model.

Its official documentation emphasizes:

-   `AGENTS.md` can appear in multiple directories.
-   The scope of each `AGENTS.md` is its containing directory and its subtree.
-   Deeper `AGENTS.md` files have higher priority.

In other words, Codex does not have an official unified "Rule type selector."

It operates more like this:

| Location | Purpose | How it Triggers |
| --- | --- | --- |
| `~/AGENTS.md` or near the home directory | Personal-level instructions | Automatically applies in the corresponding environment |
| Repository root `AGENTS.md` | Project-level instructions | Automatically applies to the current repository |
| Subdirectory `AGENTS.md` | Subtree-scoped instructions | Takes effect when modifying or reading files in that subtree |

So, in Codex:

-   There is no explicit `rule type` field.
-   There is also no `Manual` type like in Cursor.
-   The trigger method relies mainly on directory scope and nested priority.

If you absolutely need to implement "temporarily add a requirement just for this time," it's usually more suitable to write it directly in the current prompt rather than expecting the AGENTS system to switch to a manual rule.

Looking at these three platforms together makes the conclusion much clearer:

| Platform | How Rule Type is Determined | How Trigger Method is Determined |
| --- | --- | --- |
| Cursor | Has explicit type settings | Based on `Always` / `globs` / `description` / `@ruleName` |
| Claude Code | Based on file location and hierarchy | Based on the location of `CLAUDE.md` and directory scope |
| Codex | Based on `AGENTS.md` scope | Based on directory tree and deeper rule priority |

To summarize:

- In Cursor, **it's configured in the rule editor and `.mdc` metadata**
- In Claude Code and Codex, **it's more often determined by where the file is placed**

A more reliable approach is: explicitly mention the rule name when needed, or clearly state in the chat "follow a specific rule this time."

## Pitfall Guide

**Many clients do not immediately hot-reload your newly modified rules into the current conversation.**

Therefore, a more reliable approach is:

1.  Save the rule file.
2.  Start a new Agent session.
3.  Then have the AI perform the relevant task.

If you have been chatting in an old session for a long time and then modify the rules, the model may not fully receive the new version of the context. In this case, starting a new session is usually the safest bet.

There are several typical reasons why rules might "look like they're written but aren't actually taking effect":

-   Incorrect `.mdc` frontmatter.
-   `globs` not matching the actual files.
-   Rules placed in the wrong directory.

<div class="article-callout">
  <p class="article-kicker">Determining if a Rule is Actually Effective</p>
  <ul>
    <li>After starting a new session, first ask the AI to reiterate the project constraints.</li>
    <li>Give it a high-frequency task to see if it automatically adheres to directory and layering rules.</li>
    <li>If it's not effective, first check the directory, file format, and globs before suspecting the model.</li>
  </ul>
</div>

## Suggested Workflow

If you want to put `Rule` into practice, you can follow this sequence directly:

1.  First, write a 10 to 20-line project baseline rule set.
2.  Initially, cover the three areas most prone to deviation: tech stack, directory structure, and output requirements.
3.  Start by trialing it on high-frequency tasks; don't aim for complete coverage from the outset.
4.  Incrementally add rules when you encounter repeated mistakes; avoid writing one-off requirements into long-term rules.
5.  When the rule set becomes noticeably large, split it into multiple files by topic.

In the end, just remember one simple guideline:

If the problem you're trying to solve is "the AI's output is inconsistent each time," start by adding `Rule`. If the problem is "the AI doesn't know what to do next," then you should look into adding `Skill`.

To learn more about designing reusable actions, you can continue reading [How to Use Skill](/blog/ai-introduction-skill/).
