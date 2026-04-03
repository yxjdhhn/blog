---
name: markdown-readability-polish
description: Improve the readability of Markdown articles and blog posts. Use when a user says a `.md` article is hard to read, wants better article structure, stronger scanability, cleaner Markdown formatting, or wants to polish rendered article prose styles. Supports source-level content polish and render-level prose/CSS checks for blog repositories, including Chinese and bilingual Markdown posts.
---

# Markdown Readability Polish

Use this skill when the task is to make Markdown articles easier to read.

Prefer minimal, high-leverage edits. First decide whether the real problem is:

- the Markdown source structure
- the rendered article style
- both

## Repo Fit

In this repo, check these paths first:

- `src/content/blog/zh/*.md`
- `src/content/blog/en/*.md`
- `src/layouts/PostLayout.astro`
- `src/styles/global.css`

This repo already supports several article helpers. Prefer existing patterns before inventing new ones:

- `.article-callout`
- `.article-kicker`
- `.article-grid`
- `.article-card`
- `.collapsible-code-details`

## Modes

### 1. Content polish

Use when the article source is the main problem.

Typical signals:

- opening paragraphs are long and slow
- headings do not help scanning
- lists are dense or misused
- code blocks appear without setup or takeaway
- tables carry too much text
- sections repeat the same idea

### 2. Render polish

Use when the Markdown content is acceptable but the page is still tiring to read.

Typical signals:

- line length or spacing feels off
- heading rhythm is weak
- lists, blockquotes, code blocks, or tables blend into body copy
- callouts are not distinct enough
- mobile reading is cramped

### 3. Hybrid

Use when both layers contribute. Diagnose first, then make the smallest useful changes in each layer.

## Workflow

1. Inspect one or more target articles and the current prose styles.
2. Name the primary bottleneck: `content`, `render`, or `hybrid`.
3. Make the smallest edits that materially improve reading flow.
4. Preserve facts, links, code correctness, and frontmatter fields.
5. Verify the result still renders cleanly and keeps the original language.

## Content Polish Rules

- Preserve frontmatter keys, slug behavior, links, code, and factual meaning.
- Keep the intro short. Aim for a quick setup plus a clear promise or takeaway.
- Use headings to answer reader questions, not just to label topics.
- Do not skip heading levels.
- Prefer short paragraphs with one main idea each.
- Break oversized paragraphs before they become visual walls.
- Use lists for steps, parallel points, and summaries. Do not force lists where prose reads better.
- When a list item gets long, rewrite it as `short label + explanation`.
- Use `**bold**` for conclusions and `` `inline code` `` for commands, paths, APIs, identifiers, and config keys.
- Add a short lead-in before a code block and a brief takeaway after it when needed.
- Trim or split very long code blocks unless full length is necessary.
- Use tables only for comparison or structured reference. If the table is text-heavy, convert it to a list or subsections.
- Add one lightweight recap block when the article benefits from an early summary or mid-article reset.
- Remove repetitive transition phrases and empty filler.

## Render Polish Rules

- Prefer adjusting existing `.prose` rules over adding one-off article hacks.
- Work with existing theme tokens and color variables.
- Prioritize readable measure, vertical rhythm, heading spacing, list spacing, and code/table clarity.
- Make callouts, blockquotes, and cards visually distinct without overpowering the page.
- Check mobile behavior for tables, code overflow, and dense padding.
- Preserve dark-mode compatibility if the repo already supports it.

## Repo-Specific Guidance

For this repo:

- Prefer `div.article-callout` for short summary or warning blocks.
- Prefer `div.article-grid` and `div.article-card` only when content is naturally chunked into cards.
- Prefer `details.collapsible-code-details` only for optional or advanced code, not for core steps.
- Keep article HTML helpers sparse. If normal Markdown is enough, use normal Markdown.

## Guardrails

- Do not rewrite the article into a different voice unless the user asks.
- Do not add decorative markup that creates maintenance cost without improving reading.
- Do not change facts to make prose smoother.
- Do not expand the article just to sound fuller.
- If the user asks for a reusable skill only, create or update the skill without silently rewriting articles.

## Success Criteria

The result should make the article easier to scan, easier to follow, and easier to finish.

Signs of success:

- the structure is visible from headings and callouts
- paragraphs feel lighter
- key points stand out without visual noise
- code and tables have enough context
- rendered prose feels deliberate on desktop and mobile
