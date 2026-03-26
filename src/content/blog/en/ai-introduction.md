---
title: AI-Related Concepts
description: >-
  A detailed introduction to key terminology in the field of artificial
  intelligence.
pubDate: '2026-03-20'
tags:
  - AI
  - Agent
  - Blog
category: Technology
heroImage: ../../../assets/blog/generated/ai-introduction.png
draft: false
generatedFrom: zh
sourceHash: 482fcf7275125442981398ae1e2801d9322bb7af0361334fae3fcdf8b1470b12
translationStatus: complete
imageStatus: complete
---
## What are Cursor Rules?

Cursor Rules, essentially, are a set of "development guidelines/constraint prompts" that instruct the AI on what rules to follow when helping you write code or generate files. It's similar to writing a prompt, but it's persistent and applies globally.

There are two types of Cursor Rules: Global Rules (User Rules) and Project Rules. Global Rules apply to all projects, while Project Rules only take effect for the specified project.

## Use Cases

Unifying code style (indentation, naming, comment conventions)
Constraining the tech stack (e.g., the project mandates React 18, but the AI writes code using React 19 syntax)
Enforcing project structure (e.g., components must be placed in the `/components` directory, API requests should go in `api.ts`, but the AI might inadvertently write them elsewhere)
Setting security rules or team standards (e.g., preventing sensitive information from appearing in code, enforcing ESLint rules)

## Application Principles

Large language models do not retain memory between completion operations. Rules provide persistent, reusable context at the prompt level.

When a rule is applied, its content is included at the beginning of the model's context. This provides consistent guidance for the AI to generate code, explain edits, or assist with workflows.

## Rule Categories

You can set user rules, project rules, team rules, and agent rules.

**Project Rules**: Stored in your repository at `.cursor/rules`, version-controlled, and scoped to your codebase.

**User Rules**: Globally applied to your Cursor environment. Used by agents (chat).

**Team Rules**: Team-level rules manageable via the dashboard. Available for Team and Enterprise plans.

**agent.md**: Agent instructions in Markdown format. A simpler alternative to `.cursor/rules`.

Add global rules in User Rules, for example, setting responses in Chinese. Or configure for a single project in Project Rules, such as setting project coding standards. After creation, Cursor will generate a `.cursor/rules` folder in the project root, where you can write syntax rules in Markdown format.

## How to Set Up

Each rule is a Markdown file, and you can name them freely. Cursor supports `.markdown.md` and `.mdc.markdown` extensions. Using `.mdc` files with frontmatter allows for more precise specification of when a rule takes effect via `description` and `globs`, providing better control over the rule's execution timing.

```
.cursor/rules/
  react-patterns.mdc       # Rule with frontmatter (description, globs)
  api-guidelines.md        # Simple markdown rule
  frontend/                # Organize rules in folders
    components.md
```

You can use the agent to intelligently write rules during the creation process.
**In chat: Type `/create-rule` in Agent and describe what you want.** The Agent generates the rule file with proper frontmatter and saves it to `.cursor/rules`.
**From settings: Open Cursor Settings > Rules, Commands and click + Add Rule.** This creates a new rule file in `.cursor/rules`. From settings you can see all rules and their status.

### Rule Application Modes
Rule Type | Description
:--- | :---
Always Apply | Applies to every chat session
Apply Intelligently | When the agent deems it relevant based on the description
Apply to Specific Files | When a file matches the specified pattern
Apply Manually | When mentioned with @ in chat (e.g., @my-rule)

### How to Create
There are two ways to create a rule:

1.  **In the chat window: Type `/create-rule` and describe your requirement to the Agent.** The Agent will generate a rule file with the correct frontmatter and save it to `.cursor/rules`.
2.  **In settings: Open Cursor Settings > Rules, Commands and click + Add Rule.** This creates a new rule file in `.cursor/rules`. In settings, you can view all rules and their status.

### Writing Considerations:
*   Keep rule length under 500 lines.
*   Split large rules into multiple composable rules.
*   Provide concrete examples or reference files.
*   Avoid vague guidelines. Write rules as clear internal documentation.
*   Reuse rules when prompting repeatedly in chat.
*   Reference files instead of copying their content—this keeps rules concise and prevents them from becoming outdated as code changes.

Commit rules to Git so the entire team can benefit. Update rules when you notice the Agent making mistakes. You can even tag `@cursor` in GitHub issues or PRs to have the Agent update rules for you.
Team admins can create and manage rules directly via the Cursor dashboard: Once a team rule is created, it will automatically apply to all team members and appear in the dashboard.

## Rule Priority

Content: Team rules are in free-text format and do not use the folder structure of project rules.
Global Pattern: Team rules support file-level global patterns. After setting a global pattern (e.g., `<filename> **/*.py`), the rule only takes effect when matching files are present in the context. Rules without a set global pattern apply to all sessions.
Scope: When a team rule is enabled (unless the user has disabled it, except when enforced), it will be included in the agent (chat) model context for all repositories and projects within that team.
Priority: Rules are applied in the following order: Team Rules → Project Rules → User Rules. All applicable rules are merged; in case of conflicts between rules, the rule published earlier takes precedence.

Recommendation
Rules can be imported from external sources, such as some open-source rules on GitHub.

```md
# Project Background
This is an online travel guide sharing platform. The frontend uses React + TypeScript + TailwindCSS, and the backend provides a RESTful API. The goal is to allow users to quickly share and browse travel diaries.

# Coding Standards
- All code must use TypeScript; JavaScript is not allowed.
- Variable naming must use camelCase uniformly.
- React components must use PascalCase.
- Custom Hooks must start with `use`.

# Library and Framework Constraints
- Must use React 18; do not use new features from React 19.
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
- All configurations must be read from `.env` and used via `process.env`.

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
|------|------|
| Styling | Tailwind CSS |
| Search | Pagefind |
| Comments | Giscus |
| Deployment | Vercel |

## Project Structure

A typical Astro blog project structure looks like this:

```
blog/
├── src/
│   ├── content/    # Markdown articles
│   ├── components/ # UI components
│   ├── layouts/    # Page layouts
│   └── pages/      # Route pages
└── public/         # Static assets
```

## Summary

Astro is an excellent choice for building personal blogs. It's simple, fast, and boasts a rich ecosystem. If you're considering setting up your own blog, why not give Astro a try!
