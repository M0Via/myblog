---
title: "从零搭建一个三栏 SPA 博客：全过程与踩坑记录"
date: 2026-06-19
tags:
  - blog
  - hugo
  - tutorial
  - vercel
  - cloudflare
categories:
  - 技术
---

## 前言

这篇记录了我搭建个人博客的完整过程——从一个设计稿开始，到自己写 Hugo 主题，再到三平台全球容灾部署。算不上教程，更像是一份踩坑档案，希望对同样在折腾的人有帮助。

---

## 第一阶段：设计

最初拿到的是一份墨刀设计稿：三栏布局、SPA 切换、深色/浅色模式、导航栏搜索框、右侧栏弹入弹出。

需求整理出来就是：

- 左栏：文章列表（可点击切换，不刷新页面）
- 中栏：文章正文（异步加载）
- 右栏：个人简介 + 标签云 + 归档（可折叠）
- 顶部导航：站名 + 搜索框 + 主题切换
- 纯静态，零后端

这个需求 PaperMod 等现成主题无法满足，决定自己写。

---

## 第二阶段：Hugo 自定义主题

### 2.1 主题结构

```
themes/custom/
├── theme.toml
├── layouts/
│   ├── index.html          ← 首页（三栏 SPA）
│   ├── 404.html
│   └── _default/
│       ├── single.html     ← 独立文章页
│       └── list.html       ← 标签/分类列表
└── assets/
    └── css/style.css       ← 完整样式
```

首页 `index.html` 是整个博客的核心。它在构建时把所有文章的 metadata 写入页面数据，浏览器加载后直接在前端做 SPA 切换，无需请求后端。

### 2.2 SPA 原理

Hugo 构建时生成两个 JSON 文件：

- `/index.json` — 所有文章的 metadata（标题、日期、摘要、标签），几百字节
- `/search.json` — 全文搜索索引，只在用户触发搜索时按需加载

首页首次加载只拉 `index.json`，点击文章时通过 `fetch` 获取完整 HTML 页面，用 `DOMParser` 提取正文内容插入当前页面。

这样避免了在首页里嵌入所有文章的全部 HTML——文章多了之后首页依然轻量。

---

## 第三阶段：踩过的坑

### 3.1 CSS 一个多余的 } 崩了整站

`style.css` 中 `search-btn-icon:hover` 后面多了一个 `}`。后果是这个括号之后的所有 CSS（包括布局、主题切换、文章样式）全部失效。

教训：写完 CSS 检查括号配对。花不了 10 秒，省半小时排错。

### 3.2 移动端侧边栏死锁

手机屏幕下，左侧栏（文章列表）变成全屏浮层盖在内容上。但“收起左侧栏”按钮在浮层后面，被挡住点不到——一旦打开列表就再也关不掉了。

修复：在左栏内部加了一个关闭按钮，点击文章时自动收起。

### 3.3 归档出现 0001 年

右侧栏归档里多了一个"0001 年 (1)"。原因是：搜索索引页面（`search-index.md`）的默认日期是 Hugo 零值 `0001-01-01`，被 `GroupByDate` 算成了一篇有效文章。

修复：用 `(where .Site.RegularPages "Type" "posts")` 过滤，只统计 `content/posts/` 下的文章。

### 3.4 外链 CDN 是单点故障

最初用了 `iconify-icon` 的 CDN 做图标。但如果这个 CDN 被墙或挂掉，整个页面的图标都加载不出来。在极端断网场景（白皮书中定义的 F-09 故障模式）下，R2 备份站会白屏。

修复：改为纯 emoji，零外部依赖。切换主题的代码也从 iconify API 改成了直接改 `textContent`。

---

## 第四阶段：架构重构

### 4.1 内联数据 → 外置 JSON

第一版在首页 `index.html` 里用 Hugo 模板把全部文章的 HTML 内容嵌入 JavaScript 变量。首页体积迅速膨胀到十几 KB，且不管用户看不看文章，所有内容都得下载。

重构方案：

```
之前: index.html 内嵌全量 JSON (含全文)
之后: index.html 仅 SPA 骨架
       → /index.json    页面加载时异步拉取 (metadata, 几百字节)
       → /search.json   用户搜索时按需加载 (全文索引)
```

### 4.2 主题切换模块化

之前每个页面（首页 / 文章页 / 标签页 / 404）都重复定义了同一套 `toggleTheme()` 函数，改了首页忘了改文章页，主题代码不一致。

重构：抽离成 `assets/js/common.js`，所有页面统一引用，修改一处全站生效。

### 4.3 竞态条件修复

快速点击左侧文章列表时，旧请求还没返回，新请求已经发出。如果旧请求后返回，会覆盖新内容。

修复：引入 `AbortController`，每次切换前取消上一个未完成的请求。

---

## 第五阶段：部署三平台

### 5.1 Git 推送

```bash
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/xxx/myblog.git
git push -u origin master
```

### 5.2 Vercel 部署（主站）

**第一步**就撞坑：Vercel 默认的 Hugo 版本是 **0.58.2**（2019 年版），远低于本地使用的版本。新模板语法（`resources.Get`、`resources.Fingerprint` 等）全部不识别，构建日志里一堆 "found no layout file"。

修复：在 Vercel 项目 Settings → Environment Variables 里加 `HUGO_VERSION = 0.121.2`。

然后是模板找不到的问题。即使指定了 Hugo 版本，Vercel 仍然报找不到 `index.html`。原因是模板放在 `themes/custom/layouts/` 下时，Vercel 构建环境的模板查找路径与本地不同。

修复：把 `layouts/` 和 `assets/` 复制到项目根目录，脱离主题目录依赖。

还有 RSS 输出的问题。Hugo 默认在根目录同时生成 `index.html` 和 `index.xml`（RSS），Vercel 优先返回了 XML。浏览器访问首页看到的是 RSS feed 而不是页面。

修复：在 `hugo.yaml` 中移除 RSS 输出。

最后是访问权限问题。Vercel 默认开启部署保护（Deployment Protection），非团队成员访问需要登录验证。

修复：在 Settings → Deployment Protection 中关闭 Vercel Authentication。

### 5.3 Cloudflare Pages 部署（中国友好）

Cloudflare Pages 对中国用户访问更友好，部署过程最顺利：

1. Workers & Pages → Create → Pages → Connect to Git
2. Framework preset 选 Hugo
3. 添加环境变量 `HUGE_VERSION = 0.121.2`
4. Save and Deploy

唯一需要注意：Cloudflare 的 "Create application" 页面默认显示 Workers 标签，记得切换到 Pages 标签。

### 5.4 Netlify 部署（备用）

Netlify 的自动检测能识别 Hugo 项目，填入 `hugo` 和 `public`。关键也是加 `HUGO_VERSION` 环境变量。

---

## 最终架构

```
文章 (Markdown)
  → Hugo 构建
  → git push GitHub
  → 三平台自动部署

Vercel       → https://myblog.vercel.app          (主站)
Netlify      → https://myblog.netlify.app          (备用)
Cloudflare   → https://myblog.pages.dev            (中国可用)
```

日常写文章只需要：`git add` → `git commit` → `git push`。三个平台自动更新，不用登录任何后台。

---

## 总结

搭这个博客花了一天时间，其中真正写主题用了不到一半，剩下的全在修各种"想都想不到"的问题。列几个最值的：

1. **Hugo 版本不一致**是最坑的——本地能跑不代表云端能跑，务必锁定版本号
2. **零外部依赖**是最值的重构——去掉 CDN 后页面加载快了一截，且极端情况下不会白屏
3. **异步加载**是最关键的架构决定——如果不做这一步，文章多了首页会越来越重

这篇本身也是用这套系统写的。写完 `git push`，三个站自动更新，所有流程自洽。
