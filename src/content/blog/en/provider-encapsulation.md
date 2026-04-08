---
title: How This Project Encapsulates AI Providers
description: >-
  A breakdown of how the provider layer is implemented in this project,
  explaining why heavy abstraction was avoided and how the text and image
  pipelines are consolidated.
pubDate: '2026-04-03'
tags:
  - AI
  - Engineering Practices
  - Blog
  - Automation
  - Astro
category: Technology
heroImage: ../../../assets/blog/generated/provider-encapsulation.png
draft: false
generatedFrom: zh
sourceHash: f33527108ee83d1f458179a92907e9eea67b6a9d2960a4f089ca1128264b22e2
translationStatus: complete
imageStatus: complete
---
[Link to the GitHub project](https://github.com/yxjdhhn/blog)

Once a project starts integrating third-party AI APIs, the code can easily veer off in two undesirable directions.

One is **no encapsulation at all**. Scripts are littered with `fetch` calls, prompt concatenation everywhere, and scattered checks for response structures. It might seem fast in the short term, but later you won't even want to touch it yourself.

The other is **over-encapsulation**. You start with `BaseProvider`, `AbstractProviderFactory`, `ProviderRegistry`—names that sound more impressive than the last. The result is that the actual working code is only about a dozen lines, with the rest serving the abstraction.

This blog project is taking a middle path: **there is a provider layer, but it's not heavy; there is a unified entry point, but it hasn't evolved into a framework.**

<div class="article-callout">
  <p class="article-kicker">Conclusion First</p>
  <ul>
    <li><strong>The entry layer is only responsible for choosing a provider</strong>; it doesn't conveniently stuff request details in there as well.</li>
    <li><strong>Abstractions only cover capabilities currently in actual use</strong>; there's no pre-built system layer for "what might be needed later."</li>
    <li><strong>Fallback is treated as a formal part of the design</strong>, not a temporary patch applied after failure.</li>
  </ul>
</div>

You can probably understand it in a few minutes: where text requests are sent, where image providers are switched, how to fall back on failure, and why some things are placed in `shared.mjs` while others are intentionally not shared.

## What Does the Entry Layer Actually Do?

The entire provider entry point is located at `scripts/providers/index.mjs`.

Its job is straightforward:

- Exposes a `createProviders(env)` function
- Returns `{ textProvider, imageProvider }`
- Selects an implementation for text and image separately

In essence, this layer is only responsible for "choosing who," not for "how to make the request."

This is crucial. Many projects intertwine selection logic with execution logic, ending up with a single file that checks environment variables, constructs request bodies, handles timeouts, and implements fallbacks. The file grows longer and longer, making it difficult to isolate issues when they arise.

Here, it's much clearer:

- To find out which text provider the current project is actually using, look at `createTextProvider`.
- To understand why images fall back to local SVGs, examine `createImageProvider` and the image provider's own implementation.

The entry point is thin, but its boundaries are clear.

## Why We Didn't Go for Heavy Abstraction

The methods required for a text provider are very clear:

- `generateTranslationMetadata`
- `generateTranslationChunk`

The image provider is even simpler:

- `generateHeroImage`

That's it.

Blog automation is not a model platform. Currently, it only has one Chinese-to-English translation pipeline and one cover image generation pipeline.

Therefore, the current implementation is more like a very pragmatic statement: **I only abstract the interfaces I'm actually using right now; the rest can wait.**

## How the Text Provider is Encapsulated

The text side currently defaults to `deepseek-compatible`.

What `deepseek-compatible.mjs` does is straightforward:

1.  Reads `AI_TEXT_API_BASE_URL`, `AI_TEXT_API_KEY`, and `AI_TEXT_MODEL`.
2.  Sends requests using the unified `/chat/completions` endpoint.
3.  Constructs prompts separately for metadata and content chunks.
4.  Parses the response into the format required by the upper layer.

The value of this layer of encapsulation is not just "looking neat," but that the upper layer doesn't need to know any of DeepSeek's request details at all.

`autogen.mjs` only cares about one thing: given a title, summary, and content chunk, can you return a result according to the agreed-upon format.

As for how the underlying request is made, what the temperature is, or whether the returned content needs to go through `extractJson` or `normalizeMarkdownTranslation` first—all of that stays within the provider's own internal logic.

## Why Only a Few Things Are Placed in Shared

`shared.mjs` contains items that are **truly shared across providers** and are **more convenient to keep together**, such as:

- HTTP JSON request wrappers
- Error type normalization
- Response body extraction
- JSON parsing
- Markdown result cleaning

Conversely, elements that are more closely tied to specific providers—like prompts, request parameters, and response mappings—remain in their respective files.

The current approach is straightforward, but it offers a practical benefit: request handling, prompts, and response parsing are largely encapsulated within a single provider file, minimizing the need to jump between many layers when reading the code.

## Why Image and Text Pipelines Differ

The image side is more interesting.

It currently retains two implementations:

- `siliconflow`
- `procedural-local`

By default, it uses `siliconflow`. If you explicitly set `AI_IMAGE_PROVIDER=procedural-local`, it directly uses the local SVG generation.

Behind this design lies a very practical judgment: **The image pipeline differs from the text pipeline; it's not just about "can it generate," but also involves "is the site style stable."**

This project didn't turn the image provider into an open-ended marketplace. Instead, it keeps one primary pipeline and pairs it with a guaranteed, usable local implementation. This trade-off is very characteristic of decisions a blog project would make. The focus isn't on "offering as many choices as possible," but on "ensuring output is as stable as possible."

## SiliconFlow's Approach: More Than Just Interfaces

What's most noteworthy in `siliconflow.mjs` isn't just the request URL and retry logic.

It's how it constructs the prompt.

It doesn't just dump the entire article body in and hope the model "figures out the theme itself." First, it determines the article's topic category based on the `slug`, category, and tags, then provides a relatively stable visual direction.

This is essentially enforcing aesthetic consistency.

It might sound less free, but it's particularly useful for blogs. Because you really don't want your homepage cover images to be a mix of something that looks like a UI screenshot, a cyberpunk poster, a stock photo, and a random wallpaper site image.

The provider encapsulation here has already gone beyond just the technical interface layer. It has also conveniently bundled in part of the visual strategy.

## Why Fallback Should Be Considered Formal Design

When a `siliconflow` request fails, it doesn't simply throw an error and stop. Instead, it falls back to `procedural-local`.

This local provider isn't just slapping on a random placeholder image. It calculates a color scheme based on the `slug`, category, and tags, then generates an SVG with a fixed size and basic visual structure.

This means:

-   If you haven't configured an image key today, the article can still pass.
-   If SiliconFlow has a temporary hiccup, the card will still have an image.
-   If you want to add a formal image later, it won't block the entire workflow.

Applying this thinking to provider encapsulation is actually quite valuable. It elevates the provider from merely "requesting a third-party service" to "promising a relatively stable capability to the upper layer."

## Why the Upper-Level Code Can Stay Clean

The most direct result of a well-encapsulated provider layer is that high-level orchestration files like `autogen.mjs` don't need to worry about too many details.

The upper layer only needs to know:

*   The text provider can translate metadata.
*   The text provider can translate content chunks.
*   The image provider can generate a hero image.

If something fails, it will throw a standardized error or return a fallback result.

That's enough.

It doesn't need to know that SiliconFlow's response field is called `images[0].url`, nor how a local SVG draws three ribbons, and certainly not which specific constraints are written in the prompt for DeepSeek.

Once this layer is held firm, the entire automation pipeline becomes much easier to read. When you look at `syncChinesePost`, it feels more like reading a business process rather than a jumbled mix of third-party platform SDKs.

## What I Love Most About This Abstraction Isn't "Generality," but Restraint

When many people talk about abstracting AI providers, their first thought is often, "Will it be easy to add more providers in the future?"

That's certainly important, but what I care more about now is something else: has it complicated today's code by trying to reserve for the future?

Here's what I particularly like about this approach:

-   It has a unified entry point, but without excessive abstraction.
-   It has a `shared` module, but `shared` hasn't become a junk drawer.
-   It allows for fallback, but fallback logic isn't sneakily hidden in exception handling branches.
-   It leaves a small interface for the future—names like `AI_TEXT_PROVIDER` and `AI_IMAGE_PROVIDER` are still there, but the current supported scope is intentionally limited.

The biggest advantage of this style is that when you look back at the project now, it doesn't feel like it's playing mind games with itself.

You can probably understand at a glance:
-   Where to add a new provider.
-   Where to modify a prompt.
-   Where to adjust the default image generation strategy.
-   Where to see the fallback path after a failure.

## Finally

As model capabilities and pricing continue to evolve, this layer will likely see implementation changes in the future, and may even switch its default provider.

However, this is precisely the value of the current encapsulation: when the time comes to make a change, it can be changed. For now, don't over-engineer the code today for a future that hasn't arrived.
