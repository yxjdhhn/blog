---
title: Markdown Writing Tips and Best Practices
description: >-
  Master advanced Markdown writing techniques to make your blog posts more
  professional and visually appealing.
pubDate: '2026-03-15'
tags:
  - Markdown
  - Writing
  - Tools
  - Blogging
category: Tools
heroImage: ../../../assets/blog/generated/markdown-tips.png
draft: false
generatedFrom: zh
sourceHash: 61a945aed8bdd141590283ab4597315214f4ae169e65c8d6963fa7044bde3ec6
translationStatus: complete
imageStatus: complete
---
Slug: markdown-tips
Article title: Markdown Writing Tips and Best Practices
Section heading:
Previous heading:
Chunk: 1/27

Chunk markdown:
For writing blogs, study notes, or `README` files, Markdown is essentially the default writing language. This article goes beyond just "what Markdown syntax exists" and focuses on answering three key questions:

- What are the most commonly used syntax elements in standard Markdown?
- When writing blogs and notes, which writing styles are most worth prioritizing?
- What enhanced styles can be used to make articles more readable?

First, remember a core principle: **The most important aspect of Markdown is not fancy syntax, but making information easier for readers to scan, understand, and reuse.**

<div class="article-callout">
  <p class="article-kicker">Key Takeaways First</p>
  <ul>
    <li><strong>For structuring content</strong>, prioritize using headings, lists, and horizontal rules.</li>
    <li><strong>For technical content</strong>, prioritize using inline code, code blocks, and tables.</li>
    <li><strong>For readability enhancements</strong>, prioritize using blockquotes, callout blocks, and appropriate emojis, rather than piling on fancy formatting.</li>
  </ul>
</div>

## Standard Markdown High-Frequency Syntax

This section covers general Markdown capabilities.

### Headers: Start by Structuring Information

Headers are best suited for solving one problem: allowing readers to quickly scan the structure.

```md
# Level 1 Header
## Level 2 Header
### Level 3 Header
```

Recommended scenarios:

- Main sections of a blog post
- Subsection breakdowns in notes
- Fixed modules like FAQ, Installation, Summary

Common misuses:

- Skipping header levels too quickly, e.g., going from `##` directly to `####`
- Having only headers without a clear structural relationship
- Creating too many hierarchical levels in a very short article

A writing style more suitable for blog reading:

```md
## Installation
## Usage
## Frequently Asked Questions
```

A less recommended writing style:

```md
## Installation
### Pre-usage Preparation
#### Local Environment Check
##### Node Version Verification
```

If the article itself is not long, overly deep hierarchies can actually increase the reading burden.

### Emphasis: Highlight the Key Points

The four most common emphasis syntaxes are:

```md
**Bold**
*Italic*
~~Strikethrough~~
`Inline Code`
```

Recommended use cases:

- `**Bold**`: Mark conclusions, keywords, or important notes.
- `` `Inline Code` ``: Mark commands, variable names, filenames, or API paths.
- `~~Strikethrough~~`: Document deprecated solutions or incorrect approaches.

Common misuses:

- Applying bold formatting to an entire paragraph.
- Not wrapping commands, paths, or API names in inline code.
- Overloading a single paragraph with too many different emphasis styles.

In blogs and notes, the most useful are often just two:

- **Key conclusions and points**
- `` `Technical objects` ``

### Lists: The Most Convenient Way to Write Steps and Parallel Items

Unordered lists are suitable for writing parallel information:

```md
- Supports syntax highlighting
- Supports tables
- Supports task lists
```

Ordered lists are suitable for writing steps:

```md
1. Install dependencies
2. Start the project
3. Check the page output
```

Recommended scenarios:

- Installation steps
- Notes and considerations
- Feature lists
- Conclusion summaries

Common misuses:

- Writing steps as an unordered list
- Writing parallel conclusions as a forced sequence
- List items are too long, making it hard to see the key points on one screen

If a single list item exceeds two or three lines, it's usually advisable to break it down into a "short heading + explanation".

### Links and Images: Enhancing Traceability

```md
[Markdown Official Guide](https://www.markdownguide.org/)
![Homepage Screenshot](../../../assets/blog/generated/markdown-tips.png)
```

Recommended Use Cases:

-   Linking to official documentation, repositories, PRs, online demos
-   Images showing page effects, flowcharts, terminal output screenshots

Common Misuses:

-   Using link text like "click here"
-   Images lacking descriptive alt text explaining their purpose
-   Incorrect paths leading to broken images after build

Better Link Writing:

-   `[Astro Content Collections Documentation](https://docs.astro.build/)`

### Blockquotes: Separating Notes from Main Text

```md
> Tip: Write the structure first, then fill in the details.
```

Recommended Use Cases:

-   A one-sentence note or reminder
-   A summary at a stage
-   Original descriptions or quoted content

Common Misuses:

-   Using a blockquote for an entire paragraph of main text
-   Using it merely for visual variation without adding informational value

The value of a blockquote lies not in being "visually appealing," but in signaling to the reader: "This is a piece of information that should be seen separately."

### Code Blocks: The Most Important Syntax in Technical Articles

Code blocks are arguably the most crucial reading tool in developer-focused articles.

The most basic way to write them is:

````md
```js

const greet = (name) => {
  console.log(`Hello, ${name}`);
};

```
````

Recommended use cases:

- Demonstrating command-line operations
- Showing configuration snippets
- Presenting code logic
- Displaying API request examples

Common misuses:

- Not specifying the programming language
- Code blocks being too long without necessary trimming
- Lack of explanation before or after the code

A sequence often better suited for blog readability is:

1.  First, explain what problem this code solves.
2.  Then, present the code block.
3.  Finally, add a concluding remark highlighting the key point.

### Tables: Ideal for Horizontal Comparisons

```md
| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| title | string | Yes | Article title |
| tags | string[] | No | Article tags |
```

Recommended Use Cases:

- API parameter descriptions
- Configuration option comparisons
- Horizontal comparison of multiple solutions

Common Misuses:

- Writing lengthy explanations within a single cell
- Confusing the dimensions across different columns
- Forcing sequential steps into a table structure

Tables are suited for "aligning information," not for "telling a story."

### Task Lists: State Directly

```md
- [x] Add installation steps
- [x] Include code examples
- [ ] Add FAQ section
```

Recommended Use Cases:

- Pre-release checklists
- Learning trackers
- Article content to-do lists

Common Misuses:

- Using task list syntax for regular bullet points without status
- Excessively long lists without logical grouping

### Separators: For Pacing Transitions

```md
---
```

Recommended Use Cases:

- Between main text and supplementary materials
- Between the main tutorial body and the FAQ section
- Between the primary conclusion and reference links

Common Misuses:

- Placing a separator between every single subsection
- Using a separator redundantly when a heading alone would suffice

Separators are suitable for "shifting phases," not for "decorating the layout."

## Recommended Writing Styles for Technical Blogs and Study Notes

What truly enhances the reading experience is often not new syntax, but the way syntax elements are combined.

### Let Readers Quickly Scan the Structure

Recommended combinations:

- `Heading + Short Paragraph`
- `Heading + List`
- `Heading + Concluding Sentence`

For example:

```md
## Why Does a 401 Error Occur?

Conclusion first: In most cases, it's because the request lacks a token.

- Requesting an API endpoint directly without being logged in
- The token has expired but the frontend hasn't refreshed it
- The request header was not constructed correctly
```

This writing style is more suitable for blogs and notes than a single long paragraph.

### Making Technical Content More Readable

Recommended combinations:

- `Inline code + Code blocks`
- `Tables + Brief explanations`
- `Step-by-step lists + Request examples`

For example:

```md
Execute `npm run dev` to start the project.

```bash
npm install
npm run dev
```
```

The key points here are simple:

- Inline code is suitable for naming specific objects
- Code blocks are suitable for showcasing complete actions
- Using both together is clearer than just pasting large blocks of code

### Making Key Points Stand Out

Recommended combinations:

- `Blockquote + one-sentence reminder`
- `Task list + status`
- `Horizontal rule + new phase`

For example:

```md
> Note: Just because a local image displays correctly doesn't guarantee its path will be correct after the build.
```

These types of lightweight reminders are very common in blogs and notes.

### Organizing a Study Note

A solid note structure typically includes:

1. What is the problem?
2. What is the conclusion?
3. What are the solution steps?
4. What else can be referenced?

In Markdown, this can be written as:

```md
## Problem

Why does the API return a 401?

## Conclusion

In most cases, it's due to a missing or expired token.

## Steps to Resolve

1. Check the local token.
2. Check the request headers.
3. Check the API status code.

## References

- [Authentication Documentation](https://example.com)
```

## Light Styling Suggestions for Enhanced Readability

This section does not introduce "new syntax," but rather expression habits more suitable for blogs and notes.

### emoji

Suitable placements:

- As light indicators before headings, such as "Recommendation," "Note," or "Pitfall"
- As status markers in summary or list sections
- To create a sense of categorization in study notes

Examples:

- `## Recommended Practices ✅`
- `## Notes ⚠️`
- `- Note 📒`
- `- Example 🌰`

Less recommended usages:

- Adding an emoji to every heading
- Crowding a paragraph with multiple consecutive emojis
- Using emojis that distract from the focus when the technical explanation itself is already complex

A better approach: **Treat emojis as labels, not structure. First, clarify the structure, then use emojis to enhance recognizability.**

### Consistent Prompt Prefixes

Instead of improvising language each time, a more stable approach is to standardize a set of prompt prefixes:

- Tip
- Note
- Recommendation
- Pitfall
- Conclusion

For example:

```md
> Note: An image path working locally does not guarantee it will be correct after publishing.

> Recommendation: Short paragraphs combined with lists are more suitable for tutorial articles than long blocks of text.
```

Using consistent prefixes helps maintain a steady reading rhythm throughout the entire article.

### Using Blockquotes and Horizontal Rules to Control Pacing

Many people, wanting to add "stylistic flair", immediately think of adding lots of colors or fancy structures. In reality, the most effective tools for controlling pacing in Markdown are often just:

- `blockquote`
- `hr`
- Short paragraphs
- Lists

Ordinary approach:

```md
This section covers installation, the next covers configuration, and finally common issues.
```

A more blog-friendly approach:

```md
## Installation

First, complete the local dependency installation.

---

## Configuration

Next, check the environment variables and configuration files.
```

## Enhanced Styling Supported on This Site

This section covers **additional enhanced capabilities supported by the current blog project**, not standard Markdown itself.

### Callout Blocks: `article-callout`

This project supports embedding a small amount of HTML directly within Markdown, with callout blocks being one of the most practical uses.

How to write it:

```html
<div class="article-callout">
  <p class="article-kicker">Key Takeaway First</p>
  <p>Titles, lists, and code blocks are the three most essential formatting techniques to master first in technical writing.</p>
</div>
```

Ideal use cases:

- One-sentence summaries
- Important notes
- Interim conclusions
- Key reminders at the beginning of an article

### Card Grid: `article-grid` and `article-card`

If you want to display several capabilities, types of writing, or pieces of advice side-by-side, you can use a card grid.

How to write it:

```html
<div class="article-grid">
  <div class="article-card">
    <h3>Title</h3>
    <p>Brief description</p>
  </div>
  <div class="article-card">
    <h3>Code Block</h3>
    <p>Show a complete example</p>
  </div>
</div>
```

## Back to the Topic: Common Markdown Pitfalls and Recommended Practices

### Common Pitfalls

- Treating Markdown as a syntax showcase, trying to add everything
- Using style to replace structure, resulting in articles that are still hard to read
- Code blocks are long but lack explanations of key points
- Over-mixing tables, lists, and blockquotes, disrupting the reading flow
- Using too many emojis, which dilutes truly important information

## Common Syntax Quick Reference

| Purpose | Syntax |
| --- | --- |
| Heading | `## Heading` |
| Bold | `**Important**` |
| Inline Code | `` `npm run dev` `` |
| Unordered List | `- Item` |
| Ordered List | `1. Step` |
| Link | `[Document Name](https://example.com)` |
| Image | `![Description](image.png)` |
| Blockquote | `> Note: Explanation text` |
| Code Block | ` ```js ` |
| Table | `| Field | Description |` |
| Task List | `- [x] Completed` |
| Horizontal Rule | `---` |

## Readability Enhancement Quick Reference

| Goal | Recommended Approach |
| --- | --- |
| Quick structure scanning | Headings + Short paragraphs |
| Presenting steps | Ordered lists |
| Making reminders | Blockquotes / `article-callout` |
| Presenting parallel overviews | Tables / `article-grid` |
| Adding light hints | Appropriate emojis |
| Changing pace | Horizontal rules |
