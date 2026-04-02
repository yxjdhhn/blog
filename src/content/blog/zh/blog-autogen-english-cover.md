---
title: 这个博客是怎么自动生成英文文档和封面的
description: 拆一下这个 Astro 博客里的自动化发布链路，看看英文稿和文章封面是怎么在提交前被补出来的。
pubDate: '2026-04-02'
tags:
  - Astro
  - 博客
  - 自动化
  - AI
  - 工程实践
category: 技术
---
我挺喜欢这个项目的一点，是它没把“AI 自动化”做成那种很虚的概念展示，而是老老实实塞进了发文流程里。

你写中文稿，`git commit` 之前它会先跑一遍同步脚本。能翻的就补英文稿，能出的就补封面；接口挂了、网络不通、模型超时，也不会把你整条提交流程卡死，而是留下一个 `pending` 结果，后面再补。

这篇文章就顺着代码把这条链路拆开说说。

## 入口其实只有一个

整个自动化的起点不在页面层，也不在 Astro 的构建阶段，而是在 Git hook。

`package.json` 里有这么几个脚本：

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

真正会在提交前触发的是 `posts:sync:staged`。它只扫本次暂存的中文文章，不会一上来把整个 `src/content/blog/zh/` 目录都翻一遍。这点很实用，尤其是你一次只改一两篇文章的时候，速度和心理压力都轻很多。

`scripts/sync-posts.mjs` 本身很薄，主要做三件事：

1. 读 `.env` 和 `.env.local`
2. 找出要处理的中文稿
3. 对每篇中文稿调用 `syncChinesePost`

也就是说，真正的脑子都在 `scripts/lib/autogen.mjs` 里。

## 它先判断这篇英文稿到底归不归自己管

这一步我觉得写得挺工程化。

脚本不会看到 `zh/foo.md` 就不管三七二十一覆盖 `en/foo.md`。它先算一个 `sourceHash`，然后去看英文稿是不是“托管稿件”。

`sourceHash` 取的不是整篇文件原文，而是下面这几个字段：

- `title`
- `description`
- `tags`
- `category`
- `body`

这里有个细节值得注意：`pubDate`、`updatedDate`、`heroImage` 都不在哈希里。换句话说，改发布时间或者补封面，不会触发整篇英文重翻。这是个很务实的取舍。

英文稿如果同时带着 `generatedFrom: zh` 和 `sourceHash`，脚本就把它当成自己维护的文件；如果这些字段都没有，那就按“历史手写稿”处理，正文不会碰，只继续帮你维护共享封面。

这就解决了一个很真实的问题：很多博客不是从第一天开始就全自动的。你总会有一些老英文稿是手写的，或者是以前别的流程产出来的。这个仓库没有强行统一历史，而是给新老内容留了分界线。

## 英文文档不是整篇直译，而是分两步

英文稿生成分成 metadata 和正文两条线。

先说 metadata，也就是标题、摘要、分类、标签这些 frontmatter 字段。脚本会先把这些内容单独发给文本 provider，让模型只回一段 JSON：

```text
Use the exact keys: title, description, category, tags.
The tags field must be an array of strings.
Preserve product names and technical terms where appropriate.
```

这个约束很重要。因为标题和摘要如果跟正文一起翻，模型特别容易顺手改风格、改语气，最后 frontmatter 结构也容易乱。单拆出来，后面写回 Markdown 会稳很多。

正文则是另一套逻辑。`autogen.mjs` 不会直接把整篇中文塞给模型，而是先按 Markdown 结构切块。

它的切法不是简单按字数硬砍，而是先把文档拆成段落、列表、表格、代码块，再按二级和三级标题组织 section，最后控制每块的体积：

- 单块总字符数不超过 `2400`
- 单块中文字符数不超过 `1600`

这样做有两个好处。

第一，代码块和表格不容易被切烂。第二，长文中途如果失败了，不用从头再来。

## 断点续传这块，才是它最像工程代码的地方

翻译过程会把进度写进 `.cache/blog-autogen/translation/<slug>.json`。

这个 checkpoint 里会记两类状态：

- metadata 是否已经翻完
- 每个 chunk 翻到哪了、失败了几次、最后一次报什么错

脚本还给 metadata 和 chunk 分别做了重试，退避时间是 `1s`、`3s`、`8s`。如果模型超时或者接口抽风，它不会立刻判死刑，而是先多试几轮。

真到了还是失败的时候，它会生成一篇 `pending` 英文稿，正文最上面插一段提醒：

```md
## Translation Pending

The AI translation step was unavailable during the last sync attempt.
```

然后把原始中文正文保留下来。这样做有点朴素，但挺对。至少仓库里始终有个对应文件，前端路由、内容集合、后续重试都还能继续工作，不会因为一次 AI 请求挂了就整个流程断掉。

后面你可以用这两个命令补：

```bash
npm run posts:retry -- <slug>
npm run posts:retry -- --pending
```

## 文本 provider 其实很克制

这个仓库的文本 provider 只有两种：

- `deepseek-compatible`
- `openai-compatible`

`deepseek-compatible` 本质上只是对 `openai-compatible` 做了一层默认值包装。真正的请求协议就是传统的 `/chat/completions`。

我比较喜欢它 prompt 写得克制这一点。比如正文翻译只强调几件事：

- 返回 markdown，不要夹带解释
- 保留链接、表格、命令、代码块、文件名、API 名
- 只翻自然语言部分

这种 prompt 不算花哨，但很适合文档翻译。博客文章最怕的不是翻得不够“优雅”，而是命令被改了、链接结构被破坏了、代码注释和正文缠在一起。这个实现明显是冲着“少出事故”去的。

## 封面生成比翻译还多一层保险

封面这条链路也放在 `syncChinesePost` 里，调用的是 `ensureSharedImage`。

名字里的 `shared` 很关键，因为这个项目的中英文文章共用一张封面。只要某一边已经有一张托管中的 `heroImage`，而且状态不是 `pending`，脚本就会优先复用这张图，同步给中英文两边，不会重复生成。

这意味着封面不是“中文一张、英文再来一张”，而是一份资源，多处引用。对博客这种场景很合理，省 token，也省审美翻车次数。

## 图片 provider 怎么选

图片 provider 的选择逻辑在 `scripts/providers/index.mjs`，优先级大概是这样：

1. 如果显式写了 `AI_IMAGE_PROVIDER`，就按它来
2. 如果环境变量里能看出是 SiliconFlow，就走 `siliconflow`
3. 如果有通用图片 key 或 `GOOGLE_API_KEY`，就走 `google-gemini`
4. 都没有，就退回 `procedural-local`

也就是说，本地没有任何图片模型配置，这套流程也不会死。最差情况，它照样给你产一张程序生成的 SVG 封面。

这个兜底思路我很认同。博客发文不是在线推理平台，重点不是“每次都要最强模型出最炫图”，而是你别因为缺一个 key，连文章列表都挂个空白缩略图。

## SiliconFlow 和 Gemini，思路还不太一样

`siliconflow` 这条线有意思的地方，是它故意不直接用文章正文去喂模型。

它先根据 `slug`、分类、标签去判断文章属于哪类主题，比如：

- developer tools
- artificial intelligence
- editorial content
- mobile platform engineering

然后再拼一段比较统一的视觉提示词，强调整站风格一致、不要文字、不要截图拼贴、不要 logo、不要中文英文大字。

这个做法有点像“先定视觉系统，再生成单篇封面”。它牺牲了一些一文一图的贴合度，换来的是整站看起来不会忽左忽右。

Gemini 那条线就更贴正文一点。它会从文章里抽摘要，提几个 proper noun，再让模型围绕文章主题画场景。不过它同样很强调别把标题、按钮文案、水印这些文字直接画进图里。

两条路我都能理解。

如果你更在意站点整体视觉统一，`siliconflow` 这套 preset 更稳；如果你更想让单篇封面有具体语义，Gemini 那套会更贴题。

## 真失败了，也不会给你一片空白

封面生成失败时，脚本会调用 `createFallbackSvg(slug)`。

这个 fallback 很直接：根据 `slug` 算一个色相，然后画渐变背景、几个圆、几条曲线。没有标题文字，也没有复杂元素，但至少能保证：

- 尺寸是对的
- 路径是稳定的
- 页面不会空着
- 中英文文章都能指向同一张图

更关键的是，这种 fallback 会把 `imageStatus` 标成 `pending`。也就是说，系统知道这不是最终结果，只是先顶上。

后面可以用这个命令统一补图：

```bash
npm run posts:images:backfill
```

这点很像翻译链路的设计思路：先保证流程不断，再慢慢把 `pending` 收敛掉。

## 它没有把自动化做成黑箱

我觉得这个项目还有个处理得不错的地方，是它并不假装“AI 已经全自动，不需要人看了”。

如果 pre-commit 阶段真的生成或更新了文件，hook 会故意退出一次，并提示你：

```text
Review the generated files, run `git add`, and commit again.
```

也就是说，这套流程默认把 AI 产物当成“待审核的提交内容”，不是直接偷偷塞进仓库然后帮你提交掉。

这个动作虽然会多一次 `git add`，但我觉得值。因为英文稿和封面这种内容型资源，最大的风险往往不是脚本报错，而是它看起来像成功了，其实细节不对。中断一次，反而是给人留了最后一道闸门。

## 这套实现为什么顺手

如果只看功能点，它无非就是“翻译文章 + 生成封面”。很多项目都能做到。

但这套代码顺手的地方，不在于用了哪个模型，而在于它把失败当成日常情况设计进去了：

- 英文稿有 `pending`
- 封面有 `pending`
- 翻译能断点续传
- 出图失败能回退本地 SVG
- 老手写英文稿不会被误覆盖
- hook 会提醒你重新审一次生成结果

这就让整条链路从“好像很自动化”变成了“真能挂在日常发文流程里跑”。

说到底，博客自动化最怕的不是做不到，而是半自动、半手动、坏了还不知道从哪补。这个仓库把补救路径留得很清楚，所以用起来不别扭。

## 最后看一眼落点

如果你也想在自己的博客里抄这套思路，我觉得最值得借的不是某个 provider，而是这几个设计决定：

1. 中文稿是唯一入口，别让多语言内容互相打架
2. 自动生成的文件要留下托管标记，别误伤手写内容
3. 长文翻译一定要分块，而且要有 checkpoint
4. 图片生成一定要有 fallback，哪怕只是 SVG
5. AI 产物进入提交前，最好让人再看一眼

这些东西看起来不炫，但真到项目里，通常比 prompt 本身更重要。
