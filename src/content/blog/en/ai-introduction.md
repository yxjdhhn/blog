---
title: 'AI-Related Concepts'
description: 'Detailed introduction to some related terminology in the AI field.'
pubDate: '2026-03-20'
tags: ['AI', 'Agent', 'Blog']
category: 'Technology'
heroImage: '../../../assets/blog/generated/ai-introduction.svg'
draft: false
generatedFrom: 'zh'
sourceHash: '75063065d87bcd240c51f92dea866c62d2e0d698eb0149d126dc19d6534cc5f7'
translationStatus: 'complete'
imageStatus: 'complete'
---

## What are Cursor Rules?

Cursor Rules, essentially, are a set of "development guidelines/constraint prompts" that tell the AI what rules to follow when helping you write code or generate files. It's similar to writing a prompt, but it's persistent and globally effective.

There are two types of Cursor Rules: Global Rules (User Rules) and Project Rules. Global rules apply to all projects, while project rules only apply to the specified one.

## Use Cases

*   Unifying code style (indentation, naming, commenting habits)
*   Constraining the tech stack (e.g., the project specifies React 18, but the AI writes code using React 19 syntax)
*   Fixing project structure (e.g., components must be placed in the `/components` directory, API requests must go in `api.ts`, but the AI accidentally writes them elsewhere)
*   Setting security rules or team standards (e.g., sensitive information must not appear in the code, ESLint rules must be followed)

## How It Works

Large language models do not retain memory between completion operations. Rules provide persistent, reusable context at the prompt level.

When a rule is applied, its content is included at the beginning of the model's context. This provides consistent guidance for the AI when generating code, explaining edits, or assisting with workflows.

## Types of Rules

You can set User Rules, Project Rules, Team Rules, and Agent Rules.

*   **Project Rules:** Stored in your code repository under `.cursor/rules`, version-controlled, and scoped to your codebase.
*   **User Rules:** Applied globally to your Cursor environment. Used by the Agent (chat).
*   **Team Rules:** Team-level rules can be managed via the dashboard. Available for Team and Enterprise plans.
*   **Agent.md:** Agent instructions in Markdown format. A simple alternative to `.cursor/rules`.

You can add global rules in User Rules, for example, setting responses to be in Chinese. Or, configure rules for a single project in Project Rules, such as setting project writing conventions. After creation, Cursor generates a `.cursor/rules` folder in the project root, where you can write syntax rules in Markdown format.

## How to Set Up

Each rule is a Markdown file, and you can name it freely. Cursor supports `.markdown`, `.md`, and `.mdc` extensions. Using `.mdc` files with frontmatter allows for more precise control over when a rule takes effect by specifying `description` and `globs` conditions.

```
.cursor/rules/
  react-patterns.mdc       # Rule with frontmatter (description, globs)
  api-guidelines.md        # Simple markdown rule
  frontend/                # Organize rules in folders
    components.md
```

You can use the Agent to intelligently write rules during the process.

*   **In chat: Type `/create-rule` in Agent and describe what you want.** The Agent generates the rule file with proper frontmatter and saves it to `.cursor/rules`.
*   **From settings: Open Cursor Settings > Rules, Commands and click + Add Rule.** This creates a new rule file in `.cursor/rules`. From settings you can see all rules and their status.

### Rule Application Modes

| Rule Type | Description |
| :--- | :--- |
| Always Apply | Applies to every chat session |
| Apply Intelligently | When the agent deems it relevant based on the description |
| Apply to Specific Files | When files match the specified glob pattern |
| Apply Manually | When mentioned with @ in chat (e.g., @my-rule) |

### How to Create

There are two ways to create rules:

1.  **In the chat window: Type `/create-rule` in Agent and describe your needs.** The Agent generates a rule file with the correct frontmatter and saves it to `.cursor/rules`.
2.  **In settings: Open Cursor Settings > Rules, Commands and click + Add Rule.** This creates a new rule file in `.cursor/rules`. In settings, you can view all rules and their status.

### Writing Considerations

*   Keep rule length under 500 lines.
*   Split large rules into multiple composable ones.
*   Provide concrete examples or reference files.
*   Avoid vague guidelines. Write rules like clear internal documentation.
*   Reuse rules when repeating prompts in chat.
*   Reference files instead of copying their content—this keeps rules concise and prevents them from becoming outdated as code changes.

Commit rules to Git so the entire team can benefit. Update rules when you notice the Agent making mistakes. You can even tag `@cursor` in GitHub issues or PRs to have the Agent update rules for you.

Team admins can create and manage rules directly via the Cursor dashboard: Once team rules are created, they are automatically applied to all team members and displayed in the dashboard.

## Rule Priority

*   **Content:** Team rules are in free-text format and do not use the folder structure of project rules.
*   **Glob Patterns:** Team rules support file-level glob patterns. When a glob pattern is set (e.g., `<filename> **/*.py`), the rule only takes effect when matching files are in the context. Rules without a glob pattern apply to all sessions.
*   **Scope:** When a team rule is enabled (unless the user disables it, unless it's enforced), it is included in the Agent (chat) model context for all repositories and projects of that team.
*   **Priority:** Rules are applied in the following order: Team Rules → Project Rules → User Rules. All applicable rules are merged; when conflicts exist between rules, the rule published earlier takes precedence.

## Recommendations

You can import rules from external sources, such as some open-source rules on GitHub.

```md
# Project Background
This is an online travel guide sharing platform. The frontend uses React + TypeScript + TailwindCSS,
and the backend provides a RESTful API. The goal is to allow users to quickly share and browse travel diaries.

# Coding Standards
- All code must use TypeScript; JavaScript is not allowed.
- Variable naming must use camelCase.
- React components must use PascalCase.
- Custom Hooks must start with `use`.

# Library and Framework Constraints
- Must use React 18; do not use React 19 new features.
- Styling must use TailwindCSS; do not write inline styles.
- Network requests must use `fetch`; axios is not allowed.

# File Structure
- Business components are placed under `src/components`.
- API calls must be encapsulated under `src/api`.
- All page files are placed under `src/pages`.
- Public utility functions are placed under `src/utils`.

# Documentation Standards
- Exported API methods must have JSDoc comments.
- Complex logic Hooks must have comments explaining parameters and return values.
- Each page component file must have a module description comment at the top.

# Security Standards
- Do not write plaintext API Keys or tokens in the code.
- All configurations should be read from `.env` and used via `process.env`.
```

```md
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()),
  }),
});
```

### Flexible Integration

You can easily integrate various tools:

| Feature | Tool |
| :--- | :--- |
| Styling | Tailwind CSS |
| Search | Pagefind |
| Comments | Giscus |
| Deployment | Vercel |

## Project Structure

A typical Astro blog project structure is as follows:

```
blog/
├── src/
│   ├── content/    # Markdown articles
│   ├── components/ # UI components
│   ├── layouts/    # Page layouts
│   └── pages/      # Routing pages
└── public/         # Static assets
```

## Summary

Astro is an excellent choice for building personal blogs. It's simple, fast, and has a rich ecosystem. If you're considering building your own blog, why not give Astro a try!
