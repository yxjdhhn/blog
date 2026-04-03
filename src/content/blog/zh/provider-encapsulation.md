---
title: 这个项目是怎么封装 AI provider 的
description: 拆一下这个项目里 provider 这一层到底是怎么写的，为什么没有走很重的抽象，以及文本和图片链路分别是怎么收口的。
pubDate: '2026-04-03'
tags:
  - AI
  - 工程实践
  - 博客
  - 自动化
  - Astro
category: 技术
---

[Github项目指路](https://github.com/yxjdhhn/blog)

项目里一旦开始接第三方 AI 接口，代码很容易往两个方向跑偏。

一种是**完全不封装**。脚本里到处都是 `fetch`、到处拼 prompt、到处判断响应结构，短期看着快，后面自己都不想碰。

另一种是**封装过头**。上来就是 `BaseProvider`、`AbstractProviderFactory`、`ProviderRegistry`，名字一个比一个响，结果真正干活的代码只有十几行，剩下全在给抽象服务。

这个博客项目现在走的是中间那条路：**有 provider 层，但不重；有统一入口，但没有演成框架。**

<div class="article-callout">
  <p class="article-kicker">先看结论</p>
  <ul>
    <li><strong>入口层只负责选 provider</strong>，不顺手把请求细节也塞进去。</li>
    <li><strong>抽象只覆盖当前真正在用的能力</strong>，没有为了“以后可能会扩展”先堆一层体系。</li>
    <li><strong>fallback 被当成正式设计的一部分</strong>，不是失败后临时补丁。</li>
  </ul>
</div>

你大概花几分钟就能看明白：文本在哪发请求，图片在哪切 provider，失败时怎么回退，为什么有些东西放进 `shared.mjs`，有些东西故意不共用。

## 入口层到底做了什么

整个 provider 入口就在 `scripts/providers/index.mjs`。

它做的事情很单纯：

- 暴露一个 `createProviders(env)`
- 返回 `{ textProvider, imageProvider }`
- 文本和图片各自选一次实现

说白了，这一层只负责“选谁”，不负责“怎么请求”。

这点很重要。很多项目会把选择逻辑和执行逻辑缠在一起，最后一个文件里既判断环境变量，又拼请求体，又处理超时，又做 fallback。文件越写越长，出了问题也很难切。

这里就清楚很多：

- 想知道当前项目到底用哪个文本 provider，就去看 `createTextProvider`
- 想知道图片为什么会回退到本地 SVG，就去看 `createImageProvider` 和图片 provider 自己的实现

入口很薄，但边界是清楚的。

## 为什么没有走重抽象

文本 provider 需要提供的方法很明确：

- `generateTranslationMetadata`
- `generateTranslationChunk`

图片 provider 更简单：

- `generateHeroImage`

就这些。

博客自动化不是模型中台。它现在只有一条中文转英文链路，和一条封面生成链路。

所以现在这个实现更像一句很老实的话：**我只抽象我现在真的在用的接口，剩下的以后再说。**

## 文本 provider 是怎么收口的

文本侧现在默认就是 `deepseek-compatible`。

`deepseek-compatible.mjs` 做的事情很直接：

1. 读 `AI_TEXT_API_BASE_URL`、`AI_TEXT_API_KEY`、`AI_TEXT_MODEL`
2. 用统一的 `/chat/completions` 发请求
3. 对 metadata 和正文 chunk 分别构造 prompt
4. 把响应解析成上层需要的格式

这层封装的价值，不是“看起来整洁”，而是上层根本不需要知道 DeepSeek 的请求细节。

`autogen.mjs` 只关心一件事：给你标题、摘要、正文 chunk，你能不能按约定吐回结果。

至于底下是怎么发请求的，温度是多少，返回内容要不要先过 `extractJson` 或 `normalizeMarkdownTranslation`，都留在 provider 自己内部。

## 为什么 shared 里只放少数东西

`shared.mjs` 放进去的是那种**确实跨 provider 共用**、而且**放一起更顺手**的东西，比如：

- HTTP JSON 请求包装
- 错误类型归一化
- 响应正文提取
- JSON 解析
- Markdown 结果清洗

反过来说，prompt、请求参数、响应映射这些更贴近具体 provider 的东西，还是留在各自文件里。

现在这种写法很朴素，但有个实际好处：请求、prompt、响应解析，基本都在一个 provider 文件里收口，读的时候不用来回跳太多层。

## 为什么图片链路和文本链路不一样

图片侧更有意思一点。

它现在保留了两条实现：

- `siliconflow`
- `procedural-local`

默认走 `siliconflow`。如果你显式设置 `AI_IMAGE_PROVIDER=procedural-local`，就直接走本地 SVG。

这个设计背后其实有个很现实的判断：**图片链路和文本链路不一样，它不只是“能不能生成”，还涉及站点风格稳不稳。**

这个项目没有把图片 provider 做成一个开放式大集市，而是留下一个主链路，再配一个确定可用的本地实现。这个取舍很像博客项目会做的决定，重点不是“选择尽可能多”，而是“输出尽可能稳”。

## SiliconFlow 这条线，收的不只是接口

`siliconflow.mjs` 里最值得注意的，不只是请求地址和重试逻辑。

反而是它怎么构造 prompt。

它不是把整篇文章正文一股脑塞进去，然后期待模型“自己理解主题”。它会先根据 `slug`、分类和标签判断文章属于哪类主题，再给出相对稳定的视觉方向。

这其实是在强行收审美。

听起来不那么自由，但对博客特别有用。因为你真的不希望首页封面一张像 UI 截图，一张像赛博海报，一张像 stock photo，再来一张像壁纸站随机图。

这里的 provider 封装，已经不只是技术接口层了。它还顺手把一部分视觉策略包进去了。

## fallback 为什么应该算正式设计

`siliconflow` 请求失败，不是简单抛错结束，而是会回退到 `procedural-local`。

这个本地 provider 也不是随便拿一张占位图糊上去。它会根据 `slug`、分类、标签算配色，再生成一张有固定尺寸和基本视觉结构的 SVG。

这意味着：

- 你今天没配图片 key，文章照样能过
- SiliconFlow 一时抽风，卡片照样有图
- 之后想补正式图片，也不会卡住整条流程

这种思路放到 provider 封装里，其实很值钱。它让 provider 不只是“请求第三方服务”，而是“对上层承诺一个尽量稳定的能力”。

## 上层代码为什么能保持干净

provider 层封得住，最直接的结果就是 `autogen.mjs` 这种上层编排文件不用关心太多细节。

上层只需要知道：

- 文本 provider 能翻 metadata
- 文本 provider 能翻正文 chunk
- 图片 provider 能生成 hero image

如果失败了，会抛规范化后的错误，或者返回 fallback 结果。

这就够了。

它不用知道 SiliconFlow 的响应字段叫 `images[0].url`，也不用知道本地 SVG 是怎么画三条 ribbon 的，更不用知道 DeepSeek 的 prompt 里到底写了哪几句约束。

这一层一旦守住，整个自动化链路读起来会轻很多。你看 `syncChinesePost` 的时候，会更像在看业务流程，而不是在看一堆第三方平台 SDK 的混合体。

## 这套封装我最喜欢的，不是“通用”，而是克制

很多人一说 provider 封装，第一反应都是“以后能不能方便扩展更多家”。

这当然重要，但我现在更在意另一件事：它有没有因为预留未来，而把今天的代码搞复杂。

这里我比较喜欢的是：

- 它有统一入口，但没有过度抽象
- 它有 `shared`，但 `shared` 没长成杂物间
- 它允许 fallback，但 fallback 不是偷偷摸摸藏在异常分支里
- 它给未来留了一点接口，比如 `AI_TEXT_PROVIDER`、`AI_IMAGE_PROVIDER` 这些名字还在，但当前支持范围很收

这种写法最大的优点，是你现在回来看，不会觉得项目在跟自己斗智斗勇。

你大概能一眼看懂：

- 该在哪加新 provider
- 该在哪改 prompt
- 该在哪调图片默认策略
- 该在哪看失败后的退路

## 最后

以后随着模型能力和价格继续变化，这一层大概率还会换实现，甚至会换默认 provider。

不过这正是现在这套封装的价值所在：未来要换，可以换；今天先别为了那个未来，把代码写重了。
