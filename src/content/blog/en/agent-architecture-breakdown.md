---
title: >-
  Deconstructing Agent Architecture: Why It Must Include Planner, Memory, and
  Tools
description: >-
  This article focuses on one task: breaking down the Harness Agents/Agent
  architecture into core components, responsibility boundaries, and execution
  flows, making it easier to quickly regain a holistic understanding in the
  future.
pubDate: '2026-04-21'
tags:
  - AI Agent
  - Agent Architecture
  - Harness
  - LLM
  - Tool Calling
  - Engineering
category: Technology
heroImage: ../../../assets/blog/generated/agent-architecture-breakdown.png
draft: false
generatedFrom: zh
sourceHash: 0ecbf7f12702226b13b1d7a01299bd5b3653d2843cccafcf8677d33778d7ba71
translationStatus: complete
imageStatus: complete
---
These days, when people talk about `Agent`, it's easy to immediately dive into model capabilities, tool calling, and prompt engineering techniques. But once you actually start building one, or even just carefully examine a few implementations, you quickly realize: **the truly difficult part of an `Agent` isn't just the model.**

The model is only part of the brain. An `Agent` capable of continuous work also needs to know what to do now, what to do next, which results to remember, which actions can be executed, and how to handle errors. Without these, it's more like a large chatbot that can call tools, not quite a system that can run complete tasks.

So in this article, I won't focus on a specific framework or an integration tutorial. I just want to break down the `Agent` architecture into several layers, leaving behind notes that I can quickly pick up again later.

<div class="article-callout">
  <p class="article-kicker">Key Takeaways First</p>
  <ul>
    <li><strong><code>LLM</code> is not equal to <code>Agent</code></strong>. The model is only responsible for understanding, judging, and generating; it doesn't run the entire task.</li>
    <li><strong>What truly supports the system</strong> are typically layers like <code>Planner</code>, <code>Executor</code>, <code>Memory</code>, and <code>Tool</code>.</li>
    <li><strong>Advanced-sounding capabilities</strong> like multi-agent systems, streaming output, parallelism, and retries ultimately come down to the combination and orchestration of this execution chain.</li>
  </ul>
</div>

## Why Focusing Only on Models and Tool Calls Will Keep Your Understanding Incomplete

Many people, when first encountering `Agent`, default to a mental image:

1. The user asks a question.
2. The model decides whether to call a tool.
3. The tool returns a result.
4. The model generates an answer.

This picture isn't wrong, but it's only sufficient to explain a very short demo.

As soon as the task becomes slightly more complex, problems immediately arise. For example:

- Should this task be broken down into steps first?
- In what order should the decomposed steps run?
- If a step fails midway, should it retry, take an alternative path, or stop directly?
- Should information found earlier be remembered, and for how long?
- Should results be returned incrementally during execution?
- Can multiple subtasks run in parallel?

You'll find that these are not questions of "whether the model can talk," but rather questions of **how the system organizes execution**.

I now prefer to think of an `Agent` as an execution system with reasoning capabilities. The `LLM` is the decision-maker within this system, but it is not the system itself. Once this premise is clear, the subsequent division of components becomes natural.

## What Layers Are Typically Included in a Minimum Viable Agent?

If you were to design an `Agent` from scratch, you would likely break it down into the following layers:

-   `Agent`: The unified entry point, responsible for receiving requests, managing the process flow, and providing a stable interface to the outside world.
-   `Planner`: Translates goals into steps or adjusts steps mid-execution.
-   `Executor`: Actually runs the steps, handling success, failure, retries, and termination conditions.
-   `Tool`: Interacts with the external world, such as querying data, sending requests, modifying files, or calling APIs.
-   `Memory`: Stores conversation history, task context, intermediate results, and long-term memory.
-   `LLM`: Responsible for understanding intent, selecting actions, organizing results, and generating responses.
-   `Callback` / `Observer`: Provides cross-cutting capabilities like logging, monitoring, auditing, rate limiting, and tracing.

If you ever forget, you can remember this shortest summary: **The `Planner` thinks of steps, the `Executor` runs steps, the `Tool` interacts with the external world, and the `Memory` ensures nothing is forgotten.**

Let's break it down layer by layer.

### Agent: Entry Point and Central Coordinator

The `Agent` is the layer you see from the outside. Users typically don't directly call the `Planner` or `Executor`; instead, they pass a sentence, a task object, or a piece of context to the `Agent`.

Its most important job is not "doing the work itself," but organizing the collaboration of other components. To put it plainly, the `Agent` is more like a central controller.

- Input is usually a user request, session information, or runtime configuration.
- Output is usually the final answer, execution result, or intermediate streaming events.
- A common pitfall is cramming too much business logic into the `Agent`, turning it into a massive entry point that knows a little about everything but is extremely difficult to extend.

If this layer is designed to be too heavy, many future capabilities will be locked in. For example, if you want to add parallel execution, switch to a different `Memory` system, or change the response to a streaming output, you'll ultimately end up having to refactor the entry point.

### Planner: Translating Goals into Steps

The `Planner` exists because many tasks cannot be tackled head-on with just a single instruction.

When a user says, "Help me check why this order didn't sync successfully," what the system actually needs to do might involve reading logs first, then querying the database, checking the message queue status, and finally compiling a conclusion. This isn't a single tool call, but a sequence of actions.

The `Planner` is responsible for translating a "goal" into "executable steps." Sometimes it provides a complete plan upfront; other times, it only gives the next step and adapts the plan on the fly based on execution results.

- **Inputs**: Goal, context, historical state, and sometimes constraints.
- **Outputs**: A list of steps, subtasks, dependencies, or suggestions for the next action.
- **A common pitfall** is expecting the `Planner` to be too clever, trying to plan everything in advance. In reality, many tasks have incomplete information, so plans often must be made one step at a time.

I personally think of the `Planner` as a layer that "compresses a vague goal into a clear sequence of actions." It doesn't determine the answer, but rather the route to get there.

### Executor: Actually Executing the Steps

Having a plan doesn't mean the system actually runs. The component that truly executes the steps, chains results, and decides whether to continue is the `Executor`.

It solves the problem of action, not understanding.

For example, if a step requires calling a weather API, another step requires writing a file, and yet another requires waiting for the result of a previous step before proceeding—these all fall within the `Executor`'s responsibility. It must handle step order, dependencies, exceptions, retries, timeouts, and sometimes even decide which steps can run concurrently.

- **Inputs**: Plan, current step, toolset, runtime state.
- **Outputs**: Step result, state changes, signal for the next execution step.
- **Common Pitfall**: Implementing it as a mere "sequential caller." This approach quickly becomes insufficient once retries, rollbacks, parallelism, or interruptions are involved.

Many `Agent` demos appear functional, but that's often because the `Executor` hasn't yet encountered the messy, real-world work.

### Tool: Connecting to the External World

Without `Tool`, an `Agent` is essentially stuck at "sounding plausible."

The value of `Tool` is simple: it enables the system to not only generate text but also truly interact with the external world. It can query databases, call search APIs, read/write files, send HTTP requests, operate a browser, or trigger other business capabilities.

- The input is structured parameters, not a vague sentence of natural language.
- The output is structured results, status codes, error messages—ideally not just a large chunk of ambiguous text.
- A common pitfall is writing tool descriptions that are too abstract or defining parameters too loosely, which often leads the model to call the wrong tool or assemble parameters incorrectly.

If we think of `Tool` as the system's "hands," then a very practical issue arises: hands cannot just have names; they must also know what they can grasp, how to grasp it, and what happens if they grasp incorrectly.

### Memory: Preserving Context and State

The `Memory` layer is often underestimated. Many people think of it as just "saving chat history," but its role in actual task execution goes far beyond that.

For a moderately long task, the system needs to remember at least several types of information:

- Facts already confirmed in previous conversations
- The current step or progress of the task
- What a tool just returned
- Which results are worth retaining long-term for future use

Therefore, `Memory` can encompass both short-term conversational state and long-term knowledge retention. The former is more like runtime context, while the latter resembles a retrievable experience repository. These two are often mentioned together, but they address different problems.

- Inputs include: dialogue, step results, state changes, externally retrieved content
- Outputs include: current context, supplementary facts, hits from long-term memory
- A common pitfall is stuffing everything into memory, resulting in a long and cluttered context where truly useful information gets buried.

Many issues where "the Agent gets dumber the longer it chats" often stem not from the model suddenly failing, but from the memory layer becoming disorganized.

### LLM: Responsible for Understanding, Selection, and Generation

The `LLM` remains the core, but it functions more like the system's decision-maker and language interface.

It is responsible for at least several tasks:

-   Understanding what the user actually wants to do
-   Determining the next action based on context
-   Deciding whether to call a tool and which tool to call
-   Organizing execution results into user-friendly language

However, a crucial distinction must be made: the `LLM` is powerful, but that doesn't mean it should directly take over the entire workflow.

Whenever a system forces planning, execution, state control, and external calls all into a single model output, stability typically degrades. This is because the model excels at reasoning and generation, not at acting as your entire runtime.

-   **Inputs**: Prompts, context, tool definitions, current task state
-   **Outputs**: Reasoning results, action selections, structured calls, or final natural language responses
-   A common pitfall is placing all control logic on the prompt. While this seems convenient in the short term, it becomes very difficult to maintain long-term.

### Callback / Observer: Connecting the System to Production

The previous layers determine if the system can run; `Callback` or `Observer` determines if the system can be managed effectively once it's running.

This layer is often discussed last, but it's crucial from an engineering perspective. You always need to know when a task starts, which tools were called, which step took the longest, where errors occurred, whether retries were triggered, and if there were any unauthorized calls.

These concerns shouldn't be hardcoded into the `Planner` and `Executor`, as that would increasingly clutter the main workflow. A more reasonable approach is to provide unified event hooks or observation points, allowing logging, monitoring, auditing, tracing, rate limiting, and security policies to attach alongside.

- **Input**: Execution events, state changes, tool call records, exception information.
- **Output**: Logs, metrics, distributed tracing, security audits, or control results after interception.
- **Common Pitfall**: Completely lacking this layer. It's not noticeable during the demo phase, but problems will surface all at once when moving to a real environment.

## How a Task Flows from Start to Finish

If you only want to remember one main flow, I would remember this:

```text
User Input → Read Context → Determine Task Type → Generate/Revise Plan → Select Tool → Execute Step → Write Back State → Decide Whether to Continue → Generate Final Answer
```

Expanding it out, it looks roughly like this.

### Step 1: Receive Input and Assemble the Context

The system first receives the user's input and then retrieves relevant information from `Memory` to complete the context for the current session. The key here is not "dumping all historical data into the model as-is," but rather organizing the context that is genuinely needed for the current task.

If this step is done poorly, the subsequent layers will all be affected accordingly.

### Step 2: Determine if it's a Q&A or a Task

Not every request warrants going through the full `Agent` pipeline.

Some questions can be answered directly, some require a single tool call, while others are clearly multi-step tasks. The system typically performs an initial classification to decide whether to take a simple path or a more complex, planning-involved path.

This step is often accomplished by the `Agent` in conjunction with an `LLM`.

### Step 3: Generate a Plan, or Only the Next Step if Necessary

If the system determines this is not a problem that can be resolved in a single step, it proceeds to the `Planner`.

It's not always necessary to output a complete plan all at once. Often, a more stable approach is to first generate the next step, then adjust the subsequent path based on the execution results. The more uncertain the task, the more practical this approach typically is.

### Step 4: Select and Execute Tools

At this layer, the `Executor` takes over the current step. It decides which `Tool` to call, what parameters to use for the call, and how to handle the result once it's obtained.

If the tool returns an error, empty data, a timeout, or a return value that doesn't match expectations, the `Executor` must also decide whether to retry, switch to an alternative path, or simply throw the failure state back to the upper layer.

### Step 5: Write the Result Back to State and Decide Whether to Continue

After each step is executed, the system must update its state.

It's best to distinguish which results should be written to short-term context, which should be kept as long-term memory, and which are merely temporary intermediate products. Otherwise, after a few rounds, the `Memory` can easily become cluttered and disorganized.

After updating the state, the system then determines whether the task is already complete. If not, it returns to the planning or execution stage to continue the next round.

### Step 6: Compile the Final Answer

When the system confirms the task is complete or has obtained sufficient results, the `LLM` will compile the previously generated information into a final output.

This step may seem most like a simple chat, but it is actually just the final link in the entire chain. The quality of the preceding execution system directly determines whether this step is a "summary of results" or an attempt to "use language to cover up the chaos in the process."

## How Those Seemingly Advanced Abilities Are Actually Assembled

Many articles introducing `Agent` like to highlight certain capabilities in isolation, making them seem like extra superpowers. In reality, when broken down within the architecture, they appear much more straightforward.

### Multi-Agent: Distributing Tasks Among Coordinated Units

The so-called multi-`Agent` approach typically doesn't involve the sudden emergence of some mysterious new entity. Rather, it's about distributing the responsibilities originally handled by a single central controller among multiple sub-`Agents`.

For example, one might be responsible for retrieval, another for code modification, and a third for validation. A higher-level coordinator then decides the execution order and how results are passed between them. At its core, it's still about task decomposition and result aggregation.

### Streaming Output: Changing the Return Method, Not the Core Pipeline

The most direct change with streaming output is that the system no longer waits until the final step to return everything at once.

It can output tokens while thinking, or stream back events while executing, such as "checking logs," "tool call successful," or "starting to generate conclusion." The underlying main pipeline remains unchanged; what changes is how the results are organized and exposed externally.

### Retry: Fault Tolerance Strategy at the Execution Layer

Retry logic should typically not be improvised by the model on the spot; it should be part of the `Executor` or runtime strategy.

Decisions such as which errors can be retried, how many retry attempts, the interval between retries, whether to switch tools, or if a fallback is needed—these are more akin to execution framework concerns rather than matters of prompt inspiration.

### Parallelism: Scheduling Capability at the Planning or Execution Layer

If two subtasks are independent of each other, such as querying the status of two systems simultaneously, they can theoretically be executed in parallel.

This can be achieved either by marking dependencies during the `Planner` stage or by scheduling based on the current step type during the `Executor` stage. Ultimately, it's an optimization for throughput and latency, not a new source of intelligence.

## Leaving Behind a Mental Model to Pick Up Later

If I ever forget all this again, I'll probably start by recalling these key points.

-   `Agent` is the main entry point, responsible for orchestrating the entire pipeline.
-   `Planner` is responsible for deciding what to do first and what to do next.
-   `Executor` is responsible for actually carrying out the steps.
-   `Tool` is responsible for allowing the system to interact with the external world.
-   `Memory` is responsible for retaining context and state.
-   `LLM` is responsible for understanding, judging, choosing, and expressing.
-   `Callback` / `Observer` is responsible for making the system observable, auditable, and governable.

To compress it further, it's essentially two layers:

-   The upper layer solves "what to think": understanding the task, planning steps, deciding the next move.
-   The lower layer solves "how to do it": executing actions, preserving state, controlling the run.

I think the biggest pitfall when trying to understand `Agent` architecture is mystifying it.

It certainly has its complexities, but most of the difficulties are not arcane. Often, it's just about integrating reasoning, execution, state, tools, and engineering governance into a single pipeline. Breaking it down makes things much clearer.
