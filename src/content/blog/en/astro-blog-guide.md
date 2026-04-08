---
title: How I Chose My Tech Stack Before Building a Blog
description: >-
  As a frontend developer, I initially considered Vue and React. By breaking
  down the requirements for a blog site, I gradually identified the solution
  that best fit my needs.
pubDate: '2026-03-16'
tags:
  - Astro
  - Blog
  - Tech Stack Selection
  - Frontend
category: Technology
heroImage: ../../../assets/blog/generated/astro-blog-guide.png
draft: false
generatedFrom: zh
sourceHash: f3343e6441f78e95bd768bccee9ce1028366fd9503847a378dad960ed060042f
translationStatus: complete
imageStatus: complete
---
As a frontend developer, when I first considered building a blog, the technologies that immediately came to mind weren't `Astro`, but rather `Vue` and `React`.

This is perfectly normal. In daily business development, we're mostly focused on components, state, routing, and tooling. When thinking about building a website, the first instinct is naturally: why not just use the familiar frontend stack?

That's exactly what I thought at first.

But when I was truly ready to start, I realized the order of thinking was a bit backwards.

Of course, a blog can be built directly with `Vue` or `React`. It's not just possible; it's genuinely doable.

The issue isn't "can it be done," but rather "is it worth it."

A blog isn't a backend admin system or a highly interactive web application. Its core concerns are actually quite simple: how to write content, whether pages should be fast, whether it will be difficult to maintain later, and whether adding features in the future might require a complete rewrite.

So this article isn't about "how to build a blog from scratch," but about the step before that: **how to choose the right technology stack for a blog website before you even start building.**

<div class="article-callout">
  <p class="article-kicker">The principle I settled on</p>
  <p>First, consider what the website is, then consider what I'm familiar with. `Vue` and `React` can certainly build a blog, but for a content-focused website, publishing experience, performance, and maintenance cost should be prioritized.</p>
</div>

## Before Choosing a Framework, Answer These 4 Questions

If you haven't thought these through clearly, it's easy to end up in a situation where "you just wanted to build a blog, but the project turned into half a content platform."

1.  **Is Content the Main Character?**
    If 80% of your website consists of articles, archives, tags, tables of contents, and cover images, then it's essentially a content site. The biggest fear for a content site isn't a lack of features, but an overly heavy development chain.

2.  **How Much Interactivity is Needed Initially?**
    If it's just things like highlighting the table of contents, code copying, search, and comments, this type of interactivity isn't heavy. There's no need to introduce complex client-side rendering for the entire site from the get-go.

3.  **How Will Articles Be Produced?**
    Will you write `Markdown` yourself, or plan to connect a `CMS`? If the initial phase relies mainly on local writing and Git management, a static content solution will be much easier.

4.  **What Might Be Added in Six Months?**
    If you're certain you'll later add a membership system, subscriptions, a backend editor, personalized recommendations, then your technology selection should lean towards application-type frameworks. Conversely, if you'll just be publishing articles steadily for the next six months, don't overcomplicate your stack.

## Blog Tech Stack Can Be Broken Down into 6 Decisions

I later realized that "choosing a tech stack" can be both a big and a small deal. When you break it down, it essentially comes down to the following parts:

| Layer | What I Need to Decide |
| :--- | :--- |
| Framework | How pages are generated, what the development experience is like |
| Content Solution | Where articles are stored, how they are organized, whether validation is possible |
| Styling Solution | How comfortable writing styles is, how much maintenance effort is required later |
| Search | Whether to self-host site search |
| Comments | Whether to integrate a third-party service, how high the maintenance cost is |
| Deployment | Whether publishing is simple, whether static assets are stable |

Breaking it down like this makes things much clearer. You're not "picking sides" among a few major frameworks; you're assembling a combination that's just sufficient for your blog.

## Why I Didn't Settle on Vue or React Alone

I later hesitated for two main reasons.

First, `Vue` and `React` are more like foundational capabilities, not a complete blog solution in themselves.

You can certainly build with them, but when creating a blog, you'd still need to figure out:

-   Where does the content come from?
-   How is Markdown organized?
-   How are routes defined?
-   How are article fields validated?
-   How is the static build pipeline consolidated?

In other words, choosing `Vue` or `React` directly often just pushes the problem one step back. You still have to decide: should you go with `VitePress`, `Next.js`, `Nuxt Content`, `Astro`, or piece things together yourself?

Second, the focus of a blog is quite different from that of a business system.

In business projects, I care more about component reusability, state management, and interaction consistency. For a content site like a blog, I'm more concerned with:

-   Is article maintenance smooth?
-   Are the pages lightweight enough?
-   Is building and deploying a hassle?
-   Will adding features like a table of contents, search, or archives later on make the site increasingly bloated?

When I started evaluating based on these criteria, my perspective gradually shifted from "choosing a frontend framework" to "choosing a content site solution."

## Why I Ultimately Leaned Towards Astro

After laying out my requirements, `Astro` almost naturally emerged as the solution.

The reasons aren't complicated, mainly these points:

-   **A blog is a content site, making static generation a natural fit.** Most pages can be generated at build time, eliminating the need for on-the-fly computation during visits.
-   **It sends less to the browser by default.** This is very practical for a blog, resulting in a lighter initial load and reduced page overhead.
-   **It's not a dead end when you need interactivity.** Features like a table of contents, search box, comment section, or local components can be added as needed without bloating the entire site.
-   **Content organization feels intuitive.** The `Content Collections` system is quite friendly for blogs; it allows for field constraints on articles, making them harder to mess up during maintenance.

The more crucial point is this: it freed me from having to first commit to either `Vue` or `React` and then patch in a bunch of content-site capabilities. Instead, I could start directly from the premise of "I want to build a content site."

At the time, I didn't need login functionality, payment systems, complex APIs, or a heavy server-side capability. Given that, there was no need to shoulder the overhead of an application-focused framework from the get-go.

## Why Not Other Solutions in the Vue or React Ecosystem?

It's not that they are bad, but rather it depends on what problem you are trying to solve with them.

If you have been writing `Vue` for a long time, you would likely look at `Nuxt` or `VitePress` first. If you have been writing `React` for a long time, you would probably look at `Next.js` first. This path is natural, and I completely understand it myself.

When are these solutions more suitable? Usually when you plan to develop your blog into a more complete product, such as:

- Having a user account system
- Having a backend management interface
- Having a large amount of personalized content
- Having relatively heavy server-side logic

Then `Next.js` or `Nuxt` are both reasonable choices, as they handle such requirements more conveniently.

But if the immediate goal is to get the blog stable and online first, with easy article writing, fast pages, and hassle-free deployment, then I prefer to choose a lighter solution first. **Getting the website published is more important than prematurely acquiring a bunch of capabilities that "might be useful later."**

## Beyond the Framework: How I Chose Supporting Tools

After settling on the framework, the remaining choices became less of a struggle. My guiding principle has always been: **reduce complexity wherever possible.**

Ultimately, I prioritized this combination:

| Requirement | Solution | What I Value |
| :--- | :--- | :--- |
| Content Management | `Markdown` + `Content Collections` | Direct writing, version tracking, field validation |
| Styling | `Tailwind CSS` | Fast page iteration, flexible enough for a blog |
| Search | `Pagefind` | Static-site friendly, no rush for external services |
| Comments | `Giscus` | Avoids the maintenance overhead of a self-built system |
| Deployment | `Vercel` or `Cloudflare Pages` | Simple publishing, mature static site support |

My primary concern wasn't "the most features," but rather "once it's running, I shouldn't constantly feel the need to refactor it."

Take comments, for example. Building my own offers more freedom, but I knew upfront I wouldn't spend time on spam prevention, moderation, notifications, and user systems. A third-party solution was more fitting.

The same logic applies to search. When a blog is new with few articles, a static search solution is perfectly adequate. When the content volume genuinely grows, there will be time to consider a more robust solution.

## Some Things I Intentionally Leave for Later

The biggest pitfall in early-stage tech stack selection isn't choosing wrong, but trying to add too much at once.

Here's what I typically postpone:

-   Self-hosted `CMS`
-   Self-hosted commenting system
-   Adding a database prematurely "just in case I might need it later"
-   Integrating a heavy search service when there's little content
-   Building a complex component system before establishing a consistent publishing cadence

These solutions aren't off the table; they're simply better suited for *after* the site is up and running with a steady content flow. In the early stages, the most valuable asset often isn't how far ahead you've architected, but whether you can consistently publish articles.

## If You're Also Building a Blog, You Can Make Decisions in This Order

I would personally follow this sequence now:

1.  First, confirm if the blog is a typical content site.
2.  Then, confirm if there are any heavy server-side requirements within the next six months.
3.  If not, prioritize considering a static generation solution.
4.  Next, add content management, styling, search, comments, and deployment.
5.  Finally, consider those "might need in the future" extensibility features.

This order has an advantage: you'll more easily create a site that's just sufficient, rather than a project with a very complete configuration that never truly gets written.

## Summary

Looking back, the most important thing in the early-stage selection for a blog website isn't "`Vue` or `React`", nor is it "which framework is the strongest", but rather **what kind of website you actually want to build**.

If its essence is a content site, then I would prioritize these aspects: Is the article creation process smooth? Are the pages lightweight enough? Is future maintenance troublesome? Is deployment hassle-free? Following this line of thinking, solutions like `Astro` easily become candidates.

But this doesn't mean `Vue` or `React` are unsuitable for building blogs. More accurately, they certainly can be used. It's just that, for the stage I was in at the time, I preferred to first choose a solution model that was closer to the problem of a content site, rather than starting from familiar frontend technologies and then gradually patching in blog capabilities.

Get the content publishing process running smoothly first, then add more complex features later. For a blog, this order is usually more reliable.
