---
title: 'AI Writes Code Too Fast: How Can Documentation Keep Up?'
description: >-
  When AI-generated code logic reveals bugs days later, and you can't
  immediately spot the issue or even understand your own work, how do you
  optimize the development process? The approach: first align with the current
  state, then modify the code, and finally review and document decisions.
pubDate: '2026-04-20'
tags:
  - AI
  - Agent
  - Skill
  - Claude Code
  - Engineering
category: Tools
heroImage: ../../../assets/blog/generated/doc-first-dev-review.png
draft: false
generatedFrom: zh
sourceHash: 75e61e761986504dd0a1cb99eb077fa9ae3cfc6ce646e8127938d29ca4e58542
translationStatus: complete
imageStatus: complete
---
AI writing code quickly is no longer news these days.

What's truly headache-inducing is another matter: the speed at which code races ahead and the pace at which documentation gets updated are simply not on the same scale. You say "add a filter condition to the list," and the Agent might have already modified the Controller, Service, and Mapper. It looks satisfying. A few weeks later, when you come back, the spec is outdated, the interface descriptions don't match, database fields are unmentioned, and reading your own project feels like archaeology.

So the main focus of this article isn't about how to install a certain skill or how to execute a specific command, but a more practical question: **In the era of AI Coding, how should the documentation process be reformed so that we don't end up confusing ourselves while writing?**

<div class="article-callout">
  <p class="article-kicker">Conclusion First</p>
  <p>The key isn't the phrase "automatically generate documentation," but rather changing the process to: <strong>first organize the current state, then modify the code; after changes, have verification and records</strong>. This way, documentation won't always lag half a step behind the code.</p>
</div>

## Where Exactly Does the Problem Lie?

Many people think the issue with AI Coding is that "the code can be wrong."

In reality, a more common headache is: **The code isn't exactly wrong, but the project context becomes increasingly messy.**

Consider these scenarios:

- The spec still says "supports filtering by status," but the code already supports 8 filter conditions.
- New fields are added to the database, but the API documentation hasn't been updated at all.
- Two solutions were clearly discussed a month ago, but now no one can remember why the current one was chosen.
- An Agent misunderstands the requirements, modifies a bunch of files, and you only realize later, "That's not what I meant at all."

To put it bluntly, the biggest side effect of AI isn't that it "can't write code," but that **it's too eager to start coding immediately.**

This isn't a big issue for small demos—you can just write and discard them. But once a project needs continuous iteration, the debts of lagging documentation, diverging requirements, and vague acceptance criteria will eventually come due, and you'll likely be the one paying them off late at night.

## A More Reliable Approach, Actually Not Complicated

If you understand "documentation generation" as "AI helping me write a description on the side," it will likely still be inaccurate.

A more reliable approach is to put documentation back *into* the process, not *after* it. My understanding can be summarized in four points:

-   First, organize the current state, then modify the code.
-   Documentation records "what it is like now."
-   Decisions are recorded separately as "why it was done this way."
-   Acceptance must be executable; don't just write "functionality is normal."

These four points sound simple, but they are actually sufficient.

### 1. Document First, Code Later

Much of the rework isn't due to AI's lack of capability, but because the direction was off from the start.

So, before modifying the code, it's best to have the AI do something less flashy but highly valuable: **first, organize what this change will impact.**

For example:

- Which module is being modified
- What the current interface looks like
- What database fields exist
- Which methods will be affected
- Which areas must be re-validated after the change

This aligns with the Plan mode supported by most current models: plan first, then proceed to development. It brings a lot more peace of mind.

### 2. Document Only "What It Is Now"

Many documents become increasingly difficult to read because they cram together the current state, history, debates, and discarded proposals.

A better approach is to split them into two parts:

- The spec only describes the current state.
- A separate decision log explains why it was designed this way.

This way, when you open the spec later, you don't have to wade through a long history lesson first; you can immediately understand what to rely on now.

### 3. Don't Write Acceptance Criteria as Vague Promises

Phrases like "function works," "interface is fine," or "export successful" are more comforting than they are useful.

Acceptance criteria are best written as executable items. For example:

- What parameters to pass
- Which interface to call
- What fields are expected in the response
- What results should appear in the database

After making these changes, both AI and humans will at least know how to prove "this change is truly correct," rather than relying on a gut feeling.

### 4. For Cross-Service Requirements, Start with a Roadmap

Requirements for a single module are manageable. The most chaotic situations arise from changes that span multiple services.

For example, the frontend initiates an export, the backend creates a task, the data service generates the file, and finally, the frontend displays the progress. In such cases, if you directly ask the AI to modify several parts simultaneously, you risk a familiar disaster: everyone makes changes, but the workflow still doesn't connect.

A more stable approach is to first map out the call chain:

```text
frontend → backend → data-service
```

First, confirm the entry point, the dependencies between services, and which service should be modified first. With a roadmap in place, subsequent code changes won't feel like drawing the map while driving.

## A Practical Documentation Process Could Look Like This

If you don't want to overcomplicate things, a minimal viable process is often sufficient:

1.  **Input Requirements**: First, clearly state what needs to be changed.
2.  **Locate Module or Service**: Identify which module or which cross-service chain is affected.
3.  **Generate or Update Current Spec**: Organize the interfaces, fields, code locations, and impact scope.
4.  **Manual Confirmation**: Confirm the direction first, then let the AI start modifying the code.
5.  **AI Executes by Task**: Break down the changes into clear tasks; avoid the vague "help me change everything."
6.  **Run Acceptance Tests**: Have at least a few executable assertions; don't rely on "it should be fine."
7.  **Record Decisions**: Note down why the change was made this way.

It might sound like an extra step, but it actually prevents detours.

You can think of it as adding a "pre-departure check" for the AI. It's a bit more trouble, but it avoids many "finished the changes only to realize it wasn't what was meant" moments.

## A Typical Small Example

Suppose you want to add an author filter to the article list.

The most straightforward way to describe it would be:

```text
Add an `author` parameter to the article list API endpoint to support fuzzy search.
```

However, a more robust approach would be:

1.  First, identify which module this requirement belongs to.
2.  Check what parameters the current API endpoint actually accepts.
3.  Examine how the database and query logic correspond.
4.  Update the current specification.
5.  Write clear acceptance criteria, e.g., "When `author=张三` is passed, all returned results should contain '张三'."
6.  *Then* have the AI modify the code.

The core of this step is not "writing an extra document," but **first aligning the context**.

Because what AI struggles with most isn't complexity; it's when you *think* you've been clear, but you haven't.

## When Is This Approach Worthwhile?

This approach is particularly well-suited for the following scenarios:

- The project will undergo continuous iteration and is not a one-off effort.
- Maintenance involves more than one person, and others will need to take over later.
- Requirements change frequently, and interfaces or fields are often modified.
- The project spans multiple modules or even multiple services.
- You're already starting to feel that "the code is moving much faster than the documentation."

If you find yourself in this stage, the benefits of optimizing the documentation process are usually quite evident.

## When Not to Take It Too Seriously

Don't treat it as a universal process.

If you're just:

-   Writing a one-off script
-   Building a quick prototype
-   Trying out a small idea over the weekend
-   Working on a project you'll abandon in a couple of days

Then don't burden yourself with the full setup.

It's like going downstairs to buy a bottle of water—you don't need a full backpacking kit. Processes are for complex projects, not for adding ceremony to simple tasks.

## A Reference Implementation at the End

If you don't want to build the workflow from scratch, you can check out the [`doc-first-dev`](https://github.com/zzusp/doc-first-dev) repository.

I find it valuable not because it's some "ultimate solution," but because it breaks down the approach mentioned above into several more concrete actions:

-   `/spec-first`: Update the spec first, then proceed with development and acceptance.
-   `/spec-multi`: For cross-service requirements, trace the call chain first, then plan the modification order.
-   `/whylog-record`: Record "why this change was made" separately.

If you want to create your own internal rules, skills, or workflow, you can certainly refer to its breakdown method rather than copying it verbatim.

## A Final, More Practical Note

`doc-first-dev` is essentially a personally maintained skill set at this moment. Frankly speaking, its completeness, stability, general applicability, and whether its documentation standards can withstand real-world projects in the long run—all remain to be tested.

Therefore, the main point of this article is **not** to recommend that you immediately start using this repository itself.

What I want to emphasize more is: **The underlying philosophy is worth learning from.**

Namely:
-   First, clearly write down the requirements and the current state.
-   Then, let the AI work on the code.
-   After making changes, perform traceable verification.
-   Finally, document the "why" behind the decisions separately.

You can first take a look at this project and then decide whether to use it; or, you could simply write a set of rules that better fits your own team.

Whether the repository can be used directly varies from person to person; but I find it hard to say this approach is useless.
