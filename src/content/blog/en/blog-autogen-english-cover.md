---
title: >-
  How This Website Automatically Generates English Documentation and Cover
  Images
description: >-
  Deconstructing the automated publishing pipeline of this site to reveal how
  English drafts and article covers are generated before submission.
pubDate: '2026-04-02'
tags:
  - Astro
  - Blog
  - Automation
  - AI
  - Engineering Practices
category: Technology
heroImage: ../../../assets/blog/generated/blog-autogen-english-cover.png
draft: false
generatedFrom: zh
sourceHash: fa594c01e9bd540d41f7e251b6684c6b63841dce75051a932cff7906c8b32290
translationStatus: complete
imageStatus: complete
---
[Link to the GitHub project](https://github.com/yxjdhhn/blog)

One thing I really like about this project is how it integrates "AI automation" into the publishing workflow.

After writing a Chinese draft, before `git commit`, you can run a sync script. It can generate an English translation if possible and create a cover image if feasible. If an API is down, the network fails, or the model times out, it won't block your entire commit process. Instead, it leaves a `pending` result to be completed later.

This article will break down this pipeline by following the code.

<div class="article-callout">
  <p class="article-kicker">First, the Conclusion</p>
  <ul>
    <li><strong>The entry point is a Git hook</strong>, not at the page layer or during the build phase.</li>
    <li><strong>Both translation and cover generation are designed to "fail gracefully without breaking the flow"</strong>, hence the use of <code>pending</code>, checkpoints, and fallbacks.</li>
    <li><strong>AI-generated content is reviewed by default</strong> and not silently pushed directly into the repository.</li>
  </ul>
</div>

## Where Exactly Is the Entry Point?

The starting point for the entire automation isn't at the page layer, nor during Astro's build phase, but rather in a Git hook.

The `package.json` file contains these scripts:

```json
{
  "scripts": {
    "posts:sync": "node scripts/sync-posts.mjs",
    "posts:sync:staged": "node scripts/sync-posts.mjs --staged --hook",
    "posts:images:backfill": "node scripts/backfill-images.mjs",
    "posts:retry": "node scripts/retry-posts.mjs"
  }
}
```

The script that actually triggers before a commit is `posts:sync:staged`.

It only scans the Chinese posts staged for the current commit, avoiding the need to traverse the entire `src/content/blog/zh/` directory from the get-go. This is very practical, especially when you're only modifying one or two articles at a time—it's faster and reduces mental overhead.

The `scripts/sync-posts.mjs` file itself is quite lean, primarily doing three things:

1.  Read `.env` and `.env.local`
2.  Identify the Chinese posts to be processed
3.  For each Chinese post, call `syncChinesePost`

In other words, the real core logic resides in `scripts/lib/autogen.mjs`.

## It First Determines Whether the English Post Falls Under Its Management

I think this step is quite well-engineered.

The script doesn't blindly overwrite `en/foo.md` upon seeing `zh/foo.md`. It first calculates a `sourceHash` and then checks if the English post is a "managed post."

The `sourceHash` is not derived from the entire raw file but from the following fields:

- `title`
- `description`
- `tags`
- `category`
- `body`

One detail worth noting here: `pubDate`, `updatedDate`, and `heroImage` are not included in the hash. In other words, changing the publication date or adding a cover image won't trigger a complete retranslation of the English post. This is a very pragmatic trade-off.

If an English post contains both `generatedFrom: zh` and a `sourceHash`, the script treats it as a file it maintains.

If these fields are absent, it's handled as a "legacy manually-written post." The script won't touch the main content and will only continue to help maintain the shared cover image.

This solves a very real problem: many blogs aren't fully automated from day one. You'll always have some old English posts that were written manually or produced by other previous workflows. This repository doesn't force a unification of history but instead draws a boundary between new and old content.

## Why Split English Draft Generation into Two Steps

English draft generation is divided into two parallel tracks: metadata and main content.

First, metadata—which includes frontmatter fields like title, description, category, and tags. The script first sends this content separately to the text provider, instructing the model to return only a JSON segment:

```text
Use the exact keys: title, description, category, tags.
The tags field must be an array of strings.
Preserve product names and technical terms where appropriate.
```

This constraint is crucial. If the title and description are translated together with the main content, the model tends to casually alter the style and tone, and the frontmatter structure can easily become messy. Extracting them separately ensures much more stability when writing back to the Markdown later.

The main content follows a different logic. `autogen.mjs` does not feed the entire Chinese article directly to the model. Instead, it first segments the content based on the Markdown structure.

Its segmentation method isn't a simple brute-force split by character count. It first breaks the document into paragraphs, lists, tables, and code blocks, then organizes sections based on level-2 and level-3 headings, and finally controls the size of each chunk:

- Total characters per chunk do not exceed `2400`
- Chinese characters per chunk do not exceed `1600`

This approach offers two immediate benefits:

- Code blocks and tables are less likely to be split incorrectly
- If a failure occurs midway through a long article, the process doesn't need to restart from the beginning

## Why the Resume Upload Feature Feels Most Like Production Code

The translation process writes progress to `.cache/blog-autogen/translation/<slug>.json`.

This checkpoint records two types of status:

- Whether the metadata has been translated
- For each chunk: how far it's been translated, how many times it has failed, and the last error message

The script also implements retries for both metadata and chunks, with backoff times of `1s`, `3s`, and `8s`. If the model times out or the API is unstable, it doesn't immediately give up but tries a few more rounds.

If it ultimately fails, it generates a `pending` English draft, inserting a notice at the top of the body:

```md
## Translation Pending

The AI translation step was unavailable during the last sync attempt.
```

It then preserves the original Chinese body. This approach is a bit simple but relatively stable. At the very least, there's always a corresponding file in the repository, so frontend routing, content collections, and subsequent retries can continue to function. The entire workflow won't break just because a single AI request fails.

Later, you can use these two commands to retry:

```bash
npm run posts:retry -- <slug>
npm run posts:retry -- --pending
```

## Why the Text Provider Is Written with Restraint

The text generation in this repository currently follows a single path: it defaults directly to `deepseek-compatible`.

It no longer retains a generic provider wrapper for "casual compatibility with other AI APIs"; the actual request protocol is fixed as `/chat/completions`.

I particularly appreciate the restraint in its prompt design. For instance, the prompt for body translation emphasizes only a few key points:

- Return markdown only, do not include explanations
- Preserve links, tables, commands, code blocks, filenames, API names
- Translate only the natural language portions

This prompt isn't fancy, but it's well-suited for document translation. The biggest fear when translating blog posts isn't a lack of "elegance" in the translation, but rather commands being altered, link structures being broken, or code comments getting tangled with the main text. This implementation aims for "fewer accidents."

## What Variables Need to Be Configured First for This Automation

This part isn't as complicated as it might seem.

When the script starts, it first reads `.env` and `.env.local`. If you usually develop locally and only occasionally modify configurations, I'd recommend directly writing things into `.env.local`. It's more convenient and less likely to accidentally commit keys to the repository.

Based on the current implementation, the most common set of configurations would look something like this:

```env
AI_TEXT_PROVIDER=deepseek-compatible
AI_TEXT_API_BASE_URL=https://api.deepseek.com
AI_TEXT_API_KEY=your_text_key
AI_TEXT_MODEL=deepseek-chat

AI_IMAGE_PROVIDER=siliconflow
AI_IMAGE_API_BASE_URL=https://api.siliconflow.cn/v1
AI_IMAGE_MODEL=Qwen/Qwen-Image
SILICONFLOW_API_KEY=your_image_key

SKIP_BLOG_AUTOGEN=0
```

From my own experience, there are really only two things you need to pay attention to here:

1.  Whether you have a key for text translation.
2.  Whether you want image generation to use an online model or simply use a local SVG.

Most of the other variables are just about clearly specifying the addresses and model names, so the script doesn't have to guess.

## How to Configure the Text Provider

The text side is now very straightforward.

`AI_TEXT_PROVIDER` only recognizes `deepseek-compatible`. If you don't specify it, this is the default; if you write any other value, the current script will directly throw an error.

Currently, there are only four core variables on the text side:

- `AI_TEXT_PROVIDER`
- `AI_TEXT_API_BASE_URL`
- `AI_TEXT_API_KEY`
- `AI_TEXT_MODEL`

If you're just following the default setup, you basically don't need to tinker. The one most easily missed is actually `AI_TEXT_API_KEY`. If this isn't configured, the translation pipeline will directly fall into a `pending` draft.

## Why the Cover Pipeline Has an Extra Layer of Insurance

The cover pipeline is also placed within `syncChinesePost`, calling `ensureSharedImage`.

The `shared` in the name is crucial because the Chinese and English articles in this project share a single cover image. As long as one side already has a hosted `heroImage` and its status is not `pending`, the script will prioritize reusing this image, synchronizing it to both the Chinese and English sides, and will not regenerate it.

This means the cover is not "one for Chinese, another for English," but rather a single resource referenced in multiple places. This is very reasonable for a blog scenario, saving tokens and also reducing the chances of aesthetic mishaps.

## How to Choose an Image Provider

1. Defaults to `siliconflow`.
2. If `AI_IMAGE_PROVIDER=procedural-local` is explicitly set, it forces the use of local SVG generation.

In other words, online image generation is the primary path, while a fallback path for purely programmatic generation exists locally. Even without an image API key, this workflow won't fail; at worst, it will still produce a local SVG cover for you.

How to configure the online model:

- `AI_IMAGE_PROVIDER=siliconflow`
- `AI_IMAGE_API_BASE_URL`
- `AI_IMAGE_MODEL`
- `SILICONFLOW_API_KEY`

If you're just writing an article offline temporarily and don't want the process to get stuck due to a missing key, it's even simpler:

```env
AI_IMAGE_PROVIDER=procedural-local
```

This way, the cover will be generated directly via local SVG, without requesting any external APIs.

What I really like about this design is that it doesn't hide the "local fallback" as an unexpected result after an error. Instead, it allows you to explicitly state: "This time, I don't want online image generation; let's just get the process running smoothly first."

## Why the SiliconFlow Pipeline Feels Smoother

The interesting aspect of the `siliconflow` pipeline is that it intentionally avoids feeding the raw article body directly to the model.

It first determines the article's thematic category based on the `slug`, category, and tags, such as:

- developer tools
- artificial intelligence
- editorial content
- mobile platform engineering

Then, it constructs a more unified visual prompt, emphasizing consistent site-wide style, no text, no screenshot collages, no logos, and no large Chinese or English characters.

This approach is somewhat like "defining the visual system first, then generating individual covers." It sacrifices some degree of one-to-one fit between article and image but gains a site-wide look that doesn't feel erratic or inconsistent.

## If It Fails, the Page Won't Be Empty

When cover generation fails, the script calls `createFallbackSvg(slug)`.

This fallback is straightforward: it calculates a hue based on the `slug`, then draws a gradient background, a few circles, and some curves. There's no title text or complex elements, but it at least guarantees:

-   The dimensions are correct
-   The path is stable
-   The page won't be empty
-   Both Chinese and English articles can point to the same image

More importantly, this fallback marks the `imageStatus` as `pending`. This means the system knows this isn't the final result; it's just a temporary placeholder.

Later, you can use this command to uniformly backfill the images:

```bash
npm run posts:images:backfill
```

This is very similar to the design philosophy of the translation pipeline: first, ensure the process isn't broken, then gradually converge the `pending` status.

## It Doesn't Treat Automation as a Black Box

The generation of the English version and cover images in this project does not follow the philosophy of "AI is fully automated, no human review needed."

If files are actually generated or updated during the pre-commit stage, the hook intentionally fails once and prompts you:

```text
Review the generated files, run `git add`, and commit again.
```

In other words, this workflow treats AI-generated content as "submissions pending review" by default, rather than silently pushing it into the repository and committing it for you.

While this action requires an extra `git add`, I believe it's worthwhile. For content resources like English drafts and cover images, the biggest risk often isn't a script error, but rather that it *appears* successful while the details are actually wrong. Interrupting the process once serves as a final checkpoint for human oversight.

## Why This Implementation Can Actually Be Integrated into Daily Workflow

If you only look at the features, it's essentially just "translate articles + generate covers." Many projects can do that.

But the convenience of this code isn't about which model it uses; it's that it's designed with failure as a normal part of the process:

-   English drafts have a `pending` state
-   Covers have a `pending` state
-   Translation supports resumable transfers
-   Image generation failures can fall back to local SVG
-   Manually written English drafts won't be accidentally overwritten
-   Hooks remind you to review the generated results

This transforms the entire pipeline from "seemingly automated" to "something that can genuinely run within the daily publishing workflow."

Ultimately, the biggest fear in blog automation isn't inability, but rather a half-automated, half-manual process where you don't know how to recover when it breaks. This repository clearly defines the recovery paths, making it comfortable to use.

## A Final Look at the Most Worthwhile Takeaways

If you want to adapt this approach for your own blog, I believe the most valuable things to borrow aren't specific providers, but these design decisions:

1.  **The Chinese draft is the single source of truth.** Don't let multilingual content fight each other.
2.  **Auto-generated files must carry a hosting marker** to avoid accidentally overwriting manually written content.
3.  **Long-form translation must be chunked**, and checkpoints are essential.
4.  **Image generation must have a fallback**, even if it's just an SVG.
5.  **AI-generated content should ideally get a human review** before being committed.

These points might not seem flashy, but in a real project, they're often more critical than the prompt itself.
