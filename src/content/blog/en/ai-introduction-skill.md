---
title: 'How to Use Skill: Breaking Down High-Frequency Needs into AI-Reusable Tasks'
description: >-
  A comprehensive guide from creation, writing, and invocation to
  implementation, explaining how to break down, write, and avoid turning Skill
  into a universal Prompt.
pubDate: '2026-03-30'
tags:
  - AI
  - Agent
  - Skill
  - Prompt
  - Frontend Engineering
category: Technology
heroImage: ../../../assets/blog/generated/ai-introduction-skill.png
draft: false
generatedFrom: zh
sourceHash: 113382219aaf1e5e78436077499e6c15db22d6f51631e3d2d01154293e99e2fa
translationStatus: complete
imageStatus: complete
---
After many teams complete the `Rule` phase, they enter a second stage: AI is less likely to go off track, but it's still not efficient enough. Because every time they create a list page, form, test, or request wrapper, they have to re-describe "how you should do this now."

What's often needed at this point isn't more rules, but `Skill`.

The key isn't to write longer prompts, but to break down high-frequency tasks into stable, reusable action units.

<div class="article-callout">
  <p class="article-kicker">Remember this first</p>
  <p><code>Skill</code> addresses "what to do next," not "what are the project specifications." The smaller the scope, the more stable the reuse.</p>
</div>

## Brief Introduction

You can think of a `Skill` as a "task instruction manual."

It typically answers the following questions:

-   What problem does this action solve?
-   What inputs are required?
-   What results should be produced?
-   What steps should be followed in between?

Therefore, a `Skill` is more like a reusable mini-workflow, rather than a long prompt you copy and paste on the fly.

It's also helpful to remember how it differs from the other two layers:

| Layer | What It's Responsible For |
| :---- | :------------------------ |
| `Rule` | Constrains the AI's default writing style |
| `Skill` | Defines how a certain type of task should be completed |
| `MCP` | Provides the AI with external context and tool capabilities |

If a task occurs repeatedly and the approach is largely the same each time, it's a prime candidate to be abstracted into a `Skill`.

## How to Create

When designing a `Skill`, the first step is not to write the content, but to first select the task.

However, before writing the content, it's best to clarify "where exactly the Skill should be placed."

Unlike `Rule`, a `Skill` is more like a reusable task capability. Therefore, it is typically not placed in a rules directory like `.cursor/rules/`. Instead, it is placed in a client-agreed `skills` directory, a plugin directory, or directly configured as a workflow within a platform.

The most common placement methods are:

-   **Global Skill**: Placed in the client's own `skills/` directory.
-   **Project Skill**: Placed in the repository alongside the project for easy team sharing.
-   **Platform Skill**: Written within an Agent platform, plugin system, or workflow backend.

If you are using the `SKILL.md` based approach, a common structure looks like this:

```text
skills/
  create-list-page/
    SKILL.md
    examples/
      basic.md
  generate-search-form/
    SKILL.md
    examples/
      basic.md
```

For sharing within a project, it can also be placed like this:

```text
.ai/
  skills/
    create-list-page/
      SKILL.md
      examples/
        basic.md
    generate-page-test/
      SKILL.md
      examples/
        basic.md
```

Where:

-   `SKILL.md` contains the skill definition itself.
-   `examples/` contains sample inputs, reference outputs, or supplementary instructions.

If your platform does not support directory scanning for `SKILL.md`, you can also register the Skill directly in the platform configuration. However, for practical understanding in the context of this article, the easiest approach is still "one skill per directory, one `SKILL.md` file."

The most suitable tasks to extract into a Skill are generally these three types:

-   High frequency of occurrence
-   Relatively fixed input
-   Verifiable output

In frontend projects, typical candidates include:

-   Generating a list page skeleton
-   Generating a search form
-   Adding page-level tests
-   Generating table column configurations
-   Encapsulating API request layer methods

A more reliable creation method is to follow these four steps:

1.  First, give the Skill a name that describes a single action.
2.  Define the input parameters clearly, avoiding ambiguity.
3.  Define the output scope, specifying what it will produce.
4.  Write clear completion steps and validation criteria.

If different clients support different formats, that's fine. It could be a `SKILL.md` file, a command template, a workflow configuration, or a piece of structured definition. The key is not the filename, but whether this definition clearly states the boundaries.

If you are creating one for the first time, it is recommended to start like this:

1.  First, select a high-frequency action, such as "generate list page skeleton."
2.  Create a separate directory, e.g., `create-list-page/`.
3.  Place a `SKILL.md` file inside the directory.
4.  Start with a minimal version; it just needs to be stably reusable.

## How to Write

A useful `Skill` typically allows one to quickly understand three things:

-   What are the inputs
-   What are the outputs
-   Which specific step does it handle

You can directly use this skeleton to write one:

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

If your client supports structured skills, the same information might be written as JSON, YAML, or a platform form. Regardless of the outer format, the core structure is essentially the same:

| Part | Its Purpose |
| --- | --- |
| `name` | The unique name of the Skill, used for calling and identifying it later. |
| `description` | Tells the Agent what problem this Skill solves. |
| `inputs` | Specifies which parameters you need to provide when calling it. |
| `steps` | Describes the internal order in which tasks should be completed. |
| `output` | Defines what it should produce. |
| `constraints` / `must follow` | Adds boundaries that must be adhered to. |

If written as the most common `SKILL.md`, it is essentially a piece of structured Markdown. That is to say:

-   The file format is typically Markdown.
-   The filename is commonly `SKILL.md`.
-   The file content should be structured into fixed sections like "Goal, Inputs, Steps, Output, Constraints".

Pay special attention to the following when writing:

-   **Keep the name focused.** `create-list-page` is good; `build-admin-system` is clearly too broad.
-   **Structure inputs clearly.** Avoid vague instructions like "just fill in what's needed."
-   **Make outputs verifiable.** They should ideally correspond to files, types, tests, or a clear list of results.
-   **Don't embed project-specific conventions in the Skill.** That part should be handled by Rules.

The easiest way to write a poor Skill is to have it try to generate a page, write an API, add tests, and also do performance optimization all at once. When boundaries become this blurred, reusability drops immediately.

## How to Use

The real power of `Skill` lies in not having to rephrase the task instructions every time.

However, it's not a case of "write it once and it's automatically used forever."

First, clarify the triggering mechanisms:

| Skill Type | When It Triggers | How to Understand It in the Frontend Context |
| :--- | :--- | :--- |
| Auto-Match | When the Agent identifies a match between the task and the skill description | You say "generate an order list page", it automatically selects `create-list-page` |
| Manual Specification | When you explicitly mention the skill name | You directly say "use `generate-search-form` to handle this" |
| Command Type | Triggered via slash command or workflow entry point | Like `/create-list-page` |
| Platform Workflow Type | You initiate it by clicking a button in the interface | More like "executing a templated task" |

As for whether it ultimately behaves as an "Auto-Match" or "Command" type, it often depends not just on the file content, but also on how the platform loads it.

So, if you ask "Is a Skill invoked automatically or specified manually?", a more accurate answer is:

- Some clients will automatically select a Skill after understanding the task intent.
- Some platforms require you to manually select or explicitly mention the Skill name.
- Others are triggered imperatively, such as via slash commands, template commands, or workflow buttons.

If a platform supports adding more information in the Skill metadata—like command names, categories, tags, description weights—these fields can influence the triggering method. However, this is not a unified standard implemented by all clients.

### How Popular Platforms Determine Trigger Methods

To avoid making this section too abstract, let's directly examine the approaches of several common platforms.

> The following section is written based on official documentation retrieved on March 31, 2026. This area changes rapidly across different platforms, and trigger logic may be adjusted if products are updated later.

#### 1. Claude Code

Claude Code is currently one of the platforms with the most complete and explicit concept of "Skill."

Its distinction is very clear:

- Items like `.claude/skills/<skill-name>/SKILL.md` belong to true `Skill`s.
- Items like `.claude/commands/*.md` belong to slash commands, not Skills.

Their trigger methods are also different:

- `Skill`: Claude automatically discovers it based on the `name` and `description` in `SKILL.md` and uses it automatically when the task is relevant.
- `slash command`: You must explicitly type `/command-name`, which is a manual trigger.

In other words, within Claude Code:

- If you want it to automatically judge "whether to use this capability this time," make it a `Skill`.
- If you want complete manual control over when it executes, make it a `slash command`.

Therefore, on this platform, the "type" is largely not determined by a statement you write in the content, but by whether you place it in `.claude/skills/` or `.claude/commands/`.

#### 2. Codex

Codex's official stance is closer to "both usage modes coexist":

- You can explicitly request Codex to use a specific Skill.
- You can also let Codex automatically decide whether to use it based on the task.

Thus, in Codex, a Skill is more like a "capability package that can be automatically selected or explicitly called."

This means:

- If you directly name the skill in your prompt, it behaves more like a "manually specified" type.
- If you only state the task objective and let Codex choose, it behaves more like an "automatic matching" type.

In other words, Codex places less emphasis on "first assigning a fixed type to a skill" and more on "the same skill can simultaneously support both automatic selection and explicit invocation."

#### 3. Cursor

Cursor's official documentation currently does not have a stable, first-class `Skill` concept that directly corresponds to Claude Code's.

It is closer to three categories of things:

- `Rules`
- `Commands`
- `Custom Modes`

Among these three, the ones most resembling Skills are actually the latter two:

- `.cursor/commands/*.md`: More like a manual trigger type; you type `/` to select and execute a command.
- `Custom Modes`: More like a platform workflow type; you switch to a specific mode before starting a task.

So, if you say "I wrote a skill" in Cursor, you are often actually doing one of the following two:

- A manual slash command.
- A custom mode with specific tools and instructions.

That is to say, in Cursor, the trigger method is primarily not determined by a standard file like `SKILL.md`, but by whether you are using `Commands` or `Custom Modes`.

Looking at these platforms together, you can see a more stable pattern:

| Platform | Closer to Which Trigger Logic |
| --- | --- |
| Claude Code `Skill` | Automatic Matching Type |
| Claude Code slash command | Manual Specification Type |
| Codex `Skill` | Supports Both Automatic Matching & Manual Specification |
| Cursor `Commands` | Manual Specification Type |
| Cursor `Custom Modes` | Platform Workflow Type |

Therefore, if you ask "how do popular platforms determine the execution type of a skill?", a more accurate answer is:

- Some platforms decide based on **directory and carrier**, like Claude Code.
- Some platforms decide based on **functional entry point**, like Cursor's Commands and Modes.
- Some platforms allow **the same Skill to support both automatic and manual** modes, like Codex.

This is also why it has been emphasized earlier: do not understand "Skill type" as a unified `type` field across all platforms.

### When to Trigger Automatically

If your client supports intent recognition, the following types of Skills are well-suited for automatic matching:

- Generate list page skeleton
- Generate search form
- Complete page testing
- Generate table column configuration

These tasks have distinct characteristics, making it easier for the Agent to determine "which Skill to use now."

For example, if you say:

```text
Help me create an order list page with a filter area, a table area, and pagination.
```

If the platform has already loaded `create-list-page`, it may automatically select this type of Skill.

### When Is Manual Specification More Appropriate

If the boundaries between two skills are very close, or the task itself is relatively complex, manual specification tends to be more reliable.

For example:

- `create-list-page`
- `generate-search-form`
- `wire-table-columns`

If this time you only want the AI to first complete the search form, it's better to directly say:

```text
Use the `generate-search-form` skill to first generate the search area for the order list page. Do not generate the entire page.
```

This kind of explicit naming is more reliable than letting the Agent guess on its own.

### When Not to Create a Skill

There’s another scenario that requires the opposite judgment.

If a requirement:

- Occurs only once
- Has unstable steps
- Varies significantly in inputs and outputs each time

Then it’s more suitable to be written in the current conversation rather than solidified into a Skill.

Because the premise of a Skill is “reusability.” Turning a one-off need into a Skill usually incurs maintenance costs that outweigh the benefits.

Another practical tip: initially, let the Skill only be responsible for “producing the first draft.” Details like interface specifics, copy refinements, and integration fixes can be handled in subsequent conversations—don’t cram everything into the same Skill.

## How to Make It Take Effect

This step is also particularly easy to overlook.

After writing a `Skill`, it typically needs to meet the following conditions before the client or platform will actually recognize it as an available skill:

1.  The file is placed in a location the client supports scanning.
2.  The file format complies with its supported conventions.
3.  The Skill's name, description, and input/output are written clearly enough.
4.  Reload the skill list or start a new session.

Therefore, a more reliable approach is:

1.  Save `SKILL.md`.
2.  Confirm it's in the skill directory.
3.  Restart the client or start a new session.
4.  Test it once with a very typical task.

For example, if you just finished writing `create-list-page`, don't immediately test it with an abstract task. Instead, test directly with:

```text
Help me generate an order list page, including filters, a table, and pagination.
```

If the platform supports viewing the skill list, you can also first confirm whether it has been recognized.

<div class="article-callout">
  <p class="article-kicker">Determining if a Skill is Really Working</p>
  <ul>
    <li>First, test it with the most typical, standard task; don't start with complex requirements.</li>
    <li>If it's never selected, first improve the description and input/output definitions.</li>
    <li>If it's frequently misused, it means the boundaries are still not clear enough, and it should be broken down further.</li>
  </ul>
</div>

## Suggested Workflow

If you want to truly solidify Skills as team assets, you can directly follow this sequence:

1.  First, identify the three most frequently repeated types of tasks in your project.
2.  Start by breaking down the most stable type first; don't begin with complex workflows.
3.  Keep only one core action per Skill.
4.  First, place the Skill into a directory or configuration that the client can recognize, then test it with real tasks.
5.  After each use, review the results to add missing input items or validation steps; avoid adding steps mindlessly.
6.  After it has been reused stably two or three times, then consider promoting it to the team.

Finally, here's a simple guideline:

-   If you want the AI to "adhere by default," write a `Rule`.
-   If you want the AI to "follow this set of steps," write a `Skill`.
-   If you want the AI to "see external context," connect an `MCP`.

Remember this criterion:

If the AI already knows "what standards to write by" but still frequently doesn't know "what to do next," then you should add a `Skill`.

To learn more about connecting external context, continue reading [How to Use MCP](/blog/ai-introduction-mcp/).

Here are some recommended Skill resources: [40 Selected Agent Skills Resources - Recommended by Yupi](https://juejin.cn/post/7605422894052605967).
