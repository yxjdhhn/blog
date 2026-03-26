---
title: WeChat Web Project Cache Issues
description: Resolving cache issues in WeChat web projects.
pubDate: '2026-03-16'
tags:
  - uniapp
  - frontend
  - WeChat
category: Technology
heroImage: ../../../assets/blog/generated/wx-cache.png
draft: false
generatedFrom: zh
sourceHash: 038cd2781c662f44602e58c0a265cd02f44f92c9f9b6c5cda65ea0b4777b5462
translationStatus: complete
imageStatus: complete
---
## **Related Issues and Solutions for WeChat Official Account H5**

Description of the WeChat Official Account H5 cache issue: Each time accessing the H5 page via the official account link, the old content is displayed, requiring a manual refresh to show the latest content. This problem persists upon re-entering the official account.

Cause: Caching is a browser standard, detailed here [www.rfc-editor.org](http://www.rfc-editor.org).

1. **Scenarios Involved**: This issue is not limited to webviews; all browsers encounter it.

2. **Root Cause**: In most cases, the issue arises from inconsistencies between the server's default cache configuration and the browser's standard handling logic for negotiated caching. If the browser logic encounters `last-modified` but no `cache-control`, it triggers heuristic caching, meaning a period of strong caching is applied by default. Refer to the standard for specific logic. Servers typically do not set `cache-control` when configuring negotiated caching by default.

3. **Solution**: The simplest approach is for the server to enable negotiated caching for HTML files while adding `cache-control: no-cache`. This allows negotiated caching to take effect while disabling heuristic caching for HTML files.

**Key Point**: Add a version number to the official account link: [www.silergytest.com/app/cv/?version=1https://juejin.cn/post/7098522027291574280](http://www.silergytest.com/app/cv/?version=1)
