---
title: 5 Patterns of AI Application Development
description: >-
  From HTTP APIs, official SDKs, AI development frameworks, low-code platforms
  to AI programming tool SDKs, this article outlines 5 patterns of AI
  application development and a subsequent learning roadmap.
pubDate: '2026-05-06'
tags:
  - AI
  - AI Application Development
  - SDK
  - Agent
  - Engineering
category: Technology
heroImage: ../../../assets/blog/generated/ai-development-mode.png
draft: false
generatedFrom: zh
sourceHash: c7334d8b0ddaa24c3812052e6e05af6fc9122400ade0058adcf9acc03e6c2dae
translationStatus: complete
imageStatus: complete
---
Recently I read an article titled [Programmer Fish Skin - The Interviewer Frowned: "You Claim to Be Proficient in AI Development on Your Resume?" I Confidently Replied: "Isn't It Just Calling an API?" He Couldn't Help but Laugh: "That's It?"](https://mp.weixin.qq.com/s/x3eigelOnJJi-F2qzBxihg?scene=1&click_id=18). I found it insightful and am jotting down my study notes here.

This article presents a clearer layered perspective: **AI application development is not just about "calling an API," but rather a set of capability levels ranging from underlying protocols to Agent automation.**

Understanding these layers first will make it much easier to later explore frameworks, platforms, and tools with a solid foundation.

<div class="article-callout">
  <p class="article-kicker">Key Takeaways</p>
  <ul>
    <li><strong>HTTP API</strong> addresses "how to talk directly to the model."</li>
    <li><strong>Official SDK</strong> addresses "how to write less boilerplate code."</li>
    <li><strong>AI Development Framework</strong> addresses "how to organize complete application capabilities."</li>
    <li><strong>Low-Code Platform</strong> addresses "how to build prototypes faster and deliver workflows."</li>
    <li><strong>AI Programming Tool SDK</strong> addresses "how to integrate Agent capabilities into automated tasks."</li>
  </ul>
</div>

## Why "Calling the API" Is Just the Entry Point

**The complexity of AI application development lies not in "whether you can send a request," but in "how to organize capabilities after sending the request."**

From this perspective, this article serves more as a learning map:

- The lower the level, the closer it is to protocols and request details
- The higher the level, the closer it is to application orchestration and automation
- Each level helps reduce a specific type of complexity

How to determine which approach suits you best: first, identify which layer it belongs to, then understand what that layer actually saves you from.

## Layer 1: HTTP API

This is the most fundamental layer, and the one worth understanding first.

At its core, it's simple: the program sends input to a large model via an HTTP request, then retrieves and processes the response.

The real value here isn't "convenience" — it's "transparency." We can clearly see the request URL, authentication method, message format, response structure, and streaming output — all the basics.

Two common protocol styles are:

- **[OpenAI-compatible format](https://developers.openai.com/api/docs)**: Many providers now align with this format.
- **[Anthropic Messages API](https://platform.claude.com/docs/en/api/messages/create)**: The structure differs from OpenAI's, including where system prompts are placed.

When learning this layer, I think the key terms to focus on are:

- `messages`: The list of conversation messages
- `temperature`: Controls randomness
- `max_tokens`: Controls output length
- `usage`: Tracks token consumption
- `stream` / SSE: Enables streaming responses

Here's a quick example:

```bash
curl https://api.deepseek.com/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [
      { "role": "system", "content": "You are a helpful assistant" },
      { "role": "user", "content": "Explain what AI application development is in one sentence." }
    ]
  }'
```

This layer is suitable for:

- Learning the underlying principles
- Debugging issues obscured by SDK wrappers
- Using languages or interfaces not yet covered by existing SDKs

## Layer 2: Official SDK

The essence of an SDK is not a new set of capabilities—it simply wraps another layer around the HTTP API.

What it saves us from is mainly repetitive work:

- Constructing request headers
- Building JSON payloads
- Parsing responses
- Handling error codes
- Managing streaming data

So the SDK is more like a toolkit that "seals off common pitfalls in advance."

I personally understand this layer as:

**HTTP API is like building your own pipeline; SDK is like using a ready-made faucet.**

For example, OpenAI's Python SDK can complete a chat request in just a few lines. And if the underlying service is compatible with the OpenAI protocol, often you only need to change the `base_url` and model name to switch to another provider.

This layer is best suited for:

- Everyday business development
- Rapid model integration
- When you want to avoid writing too many low-level request details manually

## Layer 3: AI Development Frameworks

If SDKs solve the problem of "how to quickly call a model," frameworks address "how to turn AI into an application."

At this stage, the focus shifts beyond single-turn Q&A to:

- Memory
- RAG
- Tool calling
- MCP integration
- Multi-agent collaboration
- Workflow orchestration

In other words, frameworks handle the challenges of a complete application, not just individual requests.

Key players in this layer include:

- `LangChain`
- `LangGraph`
- `LangChain4j`
- `Spring AI`
- `Vercel AI SDK`

**SDKs make it easier to call models; frameworks make it easier to organize AI applications.**

They are not the same thing, nor are they substitutes for each other.

If you're building an AI application that needs to run long-term, integrate tools, maintain context, and execute step-by-step workflows, you're already thinking at the framework level.

## Layer 4: Low-Code Platforms

While the previous three layers are more engineering-focused, this layer prioritizes speed to market.

The value of low-code platforms is straightforward: **they let us get an AI workflow running first, without needing to fully build out the engineering skeleton.**

Common platforms include:

- `Dify`
- `Coze`
- `Alibaba Cloud Bailian`
- `n8n`

These platforms are well-suited for:

- Rapid idea validation
- Building knowledge base Q&A
- Workflow orchestration
- Use by non-technical roles

But their boundaries are also clear.

Once you start caring about:

- Complex customization
- Engineering governance
- Version management
- Testing and regression
- Code-level controllability

Many capabilities will gradually shift back to code.

So low-code is more of a starting point or temporary stopover, not the final destination for every scenario.

## Layer 5: AI Programming Tool SDK

This is the layer I find most easily overlooked, yet highly worth further exploration.

Standard model SDKs typically "generate text." AI programming tool SDKs, on the other hand, are more about "letting an Agent enter our development environment."

What they can do goes beyond answering questions, including:

- Reading project code
- Modifying files
- Running commands
- Applying project rules
- Accessing context like Skill / MCP

Think of it this way: **We're not calling a chat model, but an AI programmer that can actually get work done.**

Key tools to watch in this category:

- `Cursor SDK`
- `Claude Agent SDK`
- `GitHub Copilot SDK`

Practical use cases include:

- Automatically generating reports
- Code review
- Batch refactoring
- CI/CD assistance
- In-project automation tasks

If you plan to embed AI capabilities into your own products, scripts, or automation workflows, this layer will become increasingly important.

## How to Choose

The table below is my quick reference guide.

| Mode | Problem Solved | Suitable Scenarios | Key Learning Points |
| --- | --- | --- | --- |
| HTTP API | Direct model invocation | Learning fundamentals, debugging, special interfaces | Protocols, parameters, streaming output |
| Official SDK | Reducing boilerplate code | Most daily development tasks | Initialization, call encapsulation, error handling |
| AI Development Framework | Organizing full application capabilities | RAG, tool calling, multi-agent systems | Orchestration, memory, state management |
| Low-Code Platform | Rapid prototyping and workflow delivery | Prototype validation, knowledge bases, workflows | Node configuration, integration methods, boundaries |
| AI Programming Tool SDK | Integrating agents into development environments | Automation tasks, code workflows | File operations, command execution, project context |

My conclusions:

- **For projects**: Solve the current problem with minimal cost first
- **For learning**: Start from HTTP API and work upward, understanding what complexity each layer abstracts away
- **For real development**: These modes are typically used in combination, not as mutually exclusive choices

## My Ongoing Learning Path

This post is more of a starting point. Moving forward, I'll continue to dig deeper along these five directions:

1. Large model API protocols and streaming output
2. SDK encapsulation and provider design
3. RAG, tool calling, and MCP
4. Workflow design with Dify / Coze
5. Automation with Agent SDKs like Cursor / Claude Code

If I keep writing this series, I hope the end result won't be a pile of scattered terms, but an architectural map of AI application development.
