---
title: '微信网页项目缓存问题'
description: '解决微信网页项目缓存问题。'
pubDate: 2026-03-16
heroImage: '/images/snow.jpg'
tags: ['uniapp', '前端', '微信']
category: '技术'
---

## **微信公众号H5相关问题及解决方案**

微信公众号H5缓存问题描述：每次从公众号链接接入H5页面，还是显示原先内容，需要手动刷新之后才能显示最新的内容。再次进入公众号还是会出现这个问题。

原因：缓存是浏览器的标准，在这里 [www.rfc-editor.org](http://www.rfc-editor.org)

1. 涉及场景：不仅仅是 webview，所有浏览器都有这个问题；

2.根本原因： 绝大部分场景的原因是服务端的默认缓存配置和浏览器标准对于协商缓存处理逻辑不一致导致的。浏览器逻辑如果有 last-modified 但是没有 cache-control，会进入启发式缓存，即默认会有一段时间的强缓存，具体逻辑参考标准。而服务器默认设置协商缓存是不会设置 cache-control 的；

1. 解决方案：最简单的就是服务端对于 html 开启协商缓存的同时，加上 cache-control: no-cache。这样既可以使协商缓存生效，同时禁用了 html 文件的启发式缓存

重点 ：公众号链接加版本号 [www.silergytest.com/app/cv/?version=1https://juejin.cn/post/7098522027291574280](http://www.silergytest.com/app/cv/?version=1)