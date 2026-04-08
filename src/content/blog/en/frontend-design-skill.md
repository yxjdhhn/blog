---
title: >-
  How to Use frontend-design: Steps, Results, and Limitations in a Webpage
  Redesign
description: >-
  Using a real homepage redesign, this article explains what the frontend-design
  skill can do, how to use it, how to iterate, and exactly how far it can help.
pubDate: '2026-04-07'
tags:
  - AI
  - Agent
  - Skill
  - Frontend Design
  - Tutorial
category: Technology
heroImage: ../../../assets/blog/generated/frontend-design-skill.png
draft: false
generatedFrom: zh
sourceHash: 74111d3b80ffd286e1a31fed7dc40b066235f2e0d79e25decd074cfea760f138
translationStatus: complete
imageStatus: complete
---
This post isn't about praising how powerful `frontend-design` is, nor is it a broad discussion about "AI doing design." I simply took an existing webpage and ran it through the tool to see how it's actually used and how much it can push a page forward.

My practical takeaway is: it can indeed make a "functional but very plain" page look more polished and offers some worthwhile treatments to learn from. However, if you try to use it on complex sites, brand websites with high demands, or expect it to handle a complete interface design from start to finish, it still falls a bit short.

There's also a very practical issue: repeatedly applying the same design logic can make subsequent pages look increasingly similar. The first glance might be good, but after a few uses, a templated feel starts to emerge.

This article focuses solely on the practical steps: what `frontend-design` can roughly do, how I operated it, how to generate the first version, how to ask follow-up questions, and where the final result actually improved and where it still fell short.

<div class="article-callout">
  <p class="article-kicker">Conclusion First</p>
  <ul>
    <li><code>frontend-design</code> is suitable for page redesigns, visual optimizations, and direction exploration.</li>
    <li>It's more like a tool to push a page forward a step, not a replacement for a complete design process.</li>
    <li>If you want to use it, the key isn't a vague "make it look better," but rather clearly stating your goals, audience, constraints, and style.</li>
  </ul>
</div>

## What `frontend-design` Can Do

Let's clarify its boundaries first.

This skill is primarily suitable for these types of tasks:

-   Reorganizing the visual hierarchy of an already functional page.
-   Giving a landing page, official website page, or campaign page a clearer stylistic direction.
-   Quickly experimenting with a few different interface "vibes" when no design mockup is available.
-   Transforming a layout that feels very "default" into one that looks like a thoughtfully designed version.

How it works isn't particularly complicated. Skills like `frontend-design` don't just focus on "changing a color or increasing the border radius." Instead, they first consider the page's purpose, its users, and the feeling it should convey. Then, they derive elements like typography, color schemes, whitespace, layout, and local micro-interactions.

I think its most valuable aspect isn't a sudden leap to "high-end aesthetics," but rather that it forces you to specify your requirements concretely. What is the page's goal? Who is the audience? What feeling is desired? What style should be avoided? If you don't articulate these clearly, it will likely default to a common AI-generated page look.

However, its less suitable scenarios are also quite clear:

-   Complex brand websites.
-   Product official websites with very high design requirements.
-   Projects already constrained by a strong design system.
-   Large-scale sites requiring long-term expansion and unified maintenance across multiple pages.

The reason isn't mysterious. In complex projects, the real challenge often isn't "how to make this screen look better," but rather establishing a unified language for the entire site, controlling details, and managing long-term evolution.

## What Page Did I Use for This Experiment

This time, I didn't use a temporary demo. I directly worked on the current blog website.

The original homepage wasn't unwatchable, but it was just very ordinary. Dark mode featured a black background, purple highlights, a standard navigation, and standard article cards. The structure was correct, but at first glance, there was nothing memorable. The hero title stood alone, and the article list below felt more like a default blog theme rather than a homepage that had been genuinely considered from a visual perspective.

I chose this project precisely because this situation is most suitable for testing the skill. The structure already exists, the logic is fine—what's missing is that final touch. If the changes are good, the effect is obvious; if not, it's immediately clear it's just a superficial reskin.

<div class="article-card">
  <img src="/images/frontend-design-skill/home-before.png" alt="Homepage before redesign: Dark theme with purple accents in a conventional blog style" loading="lazy" />
  <p>Homepage before redesign: The structure is fine, but the overall feel leans more towards a "default theme."</p>
</div>
<br>
<div class="article-card">
  <img src="/images/frontend-design-skill/home-after.png" alt="Homepage after redesign: Cool cyan-gray UI elements and a more restrained hero section" loading="lazy" />
  <p>Homepage after redesign: Clearer visual hierarchy, looking more like a personal site with character.</p>
</div>

## How I Used It

I'll try to write this section based on the actual process, avoiding those tutorials that look smooth but no one actually uses.

I didn't start by saying "make it look more advanced." That's the easiest but also the most useless approach. If you don't set boundaries, it easily slips into familiar patterns, ending up with a flashy page that looks copied from elsewhere.

My first request to it was actually quite rigid. The core message was just these few lines:

```text
Use $frontend-design to revamp the homepage of the current project, implementing it directly on top of the existing codebase.
The overall vibe should be professional, restrained, and memorable, avoiding the common AI-generated feel and generic SaaS template look.
Preserve all existing functional logic and interactive behaviors; do not break any workflows.
Ensure it adapts to both desktop and mobile.
```

Here, I specifically added a line asking it to first describe the visual concept, target user perception, and design focus in 2 to 4 sentences before starting to code. This requirement was very useful because you can see which direction it intends to go, rather than waiting for it to rewrite all the code only to find the direction was wrong from the start.

After the first round was done, I didn't stop at "Hmm, it looks a bit better than before." Instead, I immediately started chasing specific issues. For example, I didn't like the black and gold combination from the start, so I directly said I disliked the gold and asked to change it to a cooler bluish-gray. This feedback was effective because it wasn't a vague "optimize it further," but clearly told it where the cut was wrong.

At this stage, I already felt a very practical reality: `frontend-design` is truly useful not just when it helps you pick colors or change layouts, but when you use it to drill down on real problems from your project. Style off? Change it. Interaction broken? Fix it. Mobile layout broken? Keep tightening.

Next, I chased several more rounds in a row, with very specific problems:

-   Cards are too big, shrink them a bit; the image area is also too prominent.
-   The top section of the homepage has too much introductory text, taking up space. Shorten the hero section, keeping only the title, one line of description, and two links.
-   Change the title to display over two lines.
-   The hamburger menu button is showing at the wrong size and is unclickable; keep fixing it.
-   The header is misaligned on mobile; keep fixing it.
-   The search results list is functional but the styling is too ugly; needs another round of refinement.

This series of follow-ups might seem fragmented, but it's actually very close to the rhythm of real development. A page is never finished with a single prompt; a lot of the polish comes from grinding through details like this.

## How Did It Turn Out After the Refactoring?

The changes are quite noticeable. Before the refactoring, it resembled a standard dark blog theme—functional and clear, but lacking a distinct personality. After the changes, it at least shows a move towards the "Personal Archive" direction. Navigation, search, language switching, and theme switching are now consolidated into a single set of cool grayish-blue controls. The hero section on the first screen is no longer a large block of description piled on top; instead, it has become a more restrained hero: the title is more solid, the description recedes, and only two essential links remain.

I also really like the article list section. It wasn't a complete overhaul but rather an adjustment of proportions within the existing structure. Month groupings are clearer, cards are tighter, and images have finally retreated to a supporting role, no longer immediately grabbing all the attention. This approach is very practical because it doesn't disrupt your content flow, yet the page's sense of completion improves significantly.

It's worth mentioning that I originally only intended to have it modify the homepage, but it ended up tidying up the styles for the entire website. The reason is simple: the project itself is small, with only a few pages in total. Later, I tried it on another larger project, asking it to refactor just the landing page. That time, it indeed only modified that single page, but the results were relatively mediocre, and I ultimately didn't adopt them.

So my final conclusion remains the same: frontend-design isn't a tool that produces a final draft with a single command; it also requires fine-tuning. But it's excellent for pushing an already functional page a significant step forward.

## How to Use This Skill Effectively and Its Limitations

If you ask me where `frontend-design` is most valuable, I would recommend these scenarios:

-   When an existing page looks too plain, and you want to quickly improve its visual appeal first.
-   When you don't have formal design mockups but don't want to launch a purely development-grade visual version.
-   When you want to quickly prototype and test a few different visual directions.
-   When you want to create a more polished presentation draft first, then refine it further yourself.

In these scenarios, it's very helpful because it helps you get past the hurdle of a "heavily default-looking" state.

However, if you approach it with the following expectations, you'll likely be disappointed:

-   Trying to directly build a complex official website.
-   Planning for long-term, large-scale site expansion while maintaining extremely strong consistency.
-   Expecting it to handle almost all design decisions.

These tasks involve more than just "knowing how to layout or choose colors." They encompass brand language, content strategy, interaction details, and long-term maintenance. This skill can address part of this, but not the whole picture.

Therefore, a more fitting way to position it is: it's a helpful starting point, not the final answer.

## A Minimal-Cost Way to Get Started

If you're interested in trying this after reading, I suggest not jumping straight into the most complex project.

You can proceed directly like this:

1.  Find an existing page that has its structure built but looks visually ordinary.
2.  First, clearly define the page's goal, target audience, and constraints.
3.  Give it a clear stylistic direction, and casually jot down "what you *don't* want."
4.  Let it generate a first draft.
5.  Then, scrutinize the visual hierarchy, typography, key areas, and overall vibe for two or three more rounds of refinement.

This is the easiest way to see its actual scope of help.

It can push a page from "development is done" to "at least it looks like it was designed with some care"—that step alone is actually quite useful. However, if you have high demands for the final result, or if you're working on a whole complex website, you'll ultimately need to rely on more detailed human judgment, or even return to a proper design process.
