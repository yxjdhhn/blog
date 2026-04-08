---
title: WeChat Web Project Cache Issues
description: Solutions for cache problems in WeChat web projects.
pubDate: '2026-03-16'
tags:
  - uniapp
  - Frontend
  - WeChat
category: Technology
heroImage: ../../../assets/blog/generated/wx-cache.png
draft: false
generatedFrom: zh
sourceHash: 0b497d67cd9a144add1dd9152b8021e7109dd6fa65a026e7037ee750744dbb8f
translationStatus: complete
imageStatus: complete
---
## **WeChat Official Account H5 Related Issues and Solutions**

Problem Description: Every time accessing the H5 page via the official account link, the old content is displayed. The latest content only appears after a manual refresh. This issue persists upon re-entering the official account.

Cause: Caching is a browser standard, as defined here: [www.rfc-editor.org](http://www.rfc-editor.org)

Affected Scenarios: This issue is not limited to webviews; it affects all browsers.

Root Cause: In most cases, the issue stems from an inconsistency between the server's default cache configuration and the browser's standard logic for handling negotiated caching. According to browser logic, if a response has a `Last-Modified` header but no `Cache-Control` header, it triggers heuristic caching. This means the resource will be served from a strong cache by default for a certain period. The specific logic can be found in the standard. However, servers typically enable negotiated caching without setting a `Cache-Control` header.

Solution: The simplest fix is for the server to enable negotiated caching for HTML files while also adding the header `Cache-Control: no-cache`. This allows negotiated caching to work while disabling heuristic caching for the HTML file.

Key Point: Add a version number to the official account link.

```
www.silergytest.com/app/cv/?version=1
```

[Reference Link - Juejin Community](https://juejin.cn/post/7098522027291574280)
