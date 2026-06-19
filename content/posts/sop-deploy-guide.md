---
title: "SOP 指南：零成本个人博客从零到上线"
date: 2026-06-19
tags:
  - blog
  - tutorial
  - hugo
categories:
  - 技术
---
# SOP 指南：零成本个人博客从零到上线

> 版本：v1.0 | 适用：技术型个人博客 | 平台：Windows
> 前置条件：一台能上网的 Windows 电脑，无需任何付费

---

## 目录

```
SOP-01: 注册账号
SOP-02: 安装 Hugo
SOP-03: 创建站点 & 安装主题
SOP-04: 写第一篇文章
SOP-05: 本地预览
SOP-06: 初始化 Git & 推送到 GitHub
SOP-07: 部署到 Vercel
SOP-08: 部署到 Netlify
SOP-09: 部署到 Cloudflare Pages
SOP-10: 三站验证
SOP-11: R2 核弹备份
SOP-12: 日常维护流程
```

---

## SOP-01: 注册账号

### 步骤

| # | 操作 | 目标 | 预估时间 |
|---|------|------|---------|
| 1 | 打开 https://github.com/signup | GitHub 账号 | 5 分钟 |
| 2 | 打开 https://vercel.com/signup → Continue with GitHub | Vercel 账号 | 2 分钟 |
| 3 | 打开 https://app.netlify.com/signup → GitHub 登录 | Netlify 账号 | 2 分钟 |
| 4 | 打开 https://dash.cloudflare.com/signup → 输入邮箱 + 密码 | Cloudflare 账号 | 3 分钟 |

### 验证点

```
✅ GitHub: 登录后能看到 Dashboard
✅ Vercel: 登录后在 Overview 页面能看到 "Import Git Repository" 按钮
✅ Netlify: 登录后看到 "Import from Git" 按钮
✅ Cloudflare: 登录后能看到 "Websites" 和 "Pages" 菜单
```

### ⚠️ 常见问题

```
Q: 注册 Vercel 时 "Continue with GitHub" 点了没反应？
A: 可能是浏览器弹窗拦截，允许弹出窗口后重试。

Q: GitHub 注册弹出 "Unable to verify your captcha"？
A: 国内访问 GitHub 的 reCAPTCHA 可能加载不出来。尝试:
   1. 开代理后刷新
   2. 或使用手机热点连接
   3. 或装浏览器插件 "nocaptcha"

Q: 需要手机号验证？
A: GitHub 注册可能需要手机验证，用国内手机号即可。
```

### Plan B 分支

```
如果 GitHub 注册不了:
  └─ 改用 Gitee（国内，无需翻墙）
  └─ Vercel/Netlify/CF Pages 仍然支持 Gitee 导入
  └─ 后面步骤中的 git push 地址改为 gitee.com

如果 Vercel 注册不了:
  └─ 跳过 Vercel，主站改为 Netlify
  └─ 步骤 SOP-07 跳过，SOP-08 作为主站

如果 Cloudflare 注册不了:
  └─ R2 备份改用 阿里云盘 / 百度网盘（免费）
  └─ 不影响三平台部署
```

---

## SOP-02: 安装 Hugo

### 步骤

```
1. 确认 Windows 系统类型（64 位）
   开始菜单 → 设置 → 系统 → 关于 → 系统类型: 64 位操作系统

2. 下载 Hugo Extended 版
   打开 https://github.com/gohugoio/hugo/releases
   找到最新版本（如 v0.145.0）
   下载 hugo_extended_0.145.0_windows-amd64.zip
   ⚠️ 必须带 extended 字样，不能下标准版

3. 解压安装
   在 D:\AI 目录下创建 hugo 文件夹（D:\AI\hugo\）
   将 zip 里的 hugo.exe 解压进去

4. 加入系统 PATH
   右键"此电脑"→ 属性 → 高级系统设置 → 环境变量
   系统变量 → Path → 编辑 → 新建 → 输入 D:\AI\hugo
   确定 → 确定 → 确定

5. 验证安装
   打开新终端（必须重启终端，不能用旧的）
   输入: hugo version
   预期输出: hugo v0.145.0+extended windows/amd64 BuildDate=...
```

### 验证点

```
✅ hugo version 命令可执行
✅ 输出中有 extended 字样
✅ 版本号不低于 0.120.0（否则部分主题不兼容）
```

### ⚠️ 常见问题

```
ERROR: 'hugo' is not recognized as an internal or external command
  原因1: PATH 未生效
  解决: 重启终端；如果不行，重启电脑
  原因2: 解压路径不对
  解决: 确认 hugo.exe 在 D:\AI\hugo\ 下面，不在子文件夹里

ERROR: 下载速度极慢
  原因: GitHub Releases 国内下载慢
  解决: 使用代理下载；或从 Gitee 镜像获取

ERROR: 下载了标准版（非 extended）
  症状: 安装主题后 hugo server 报错 "SCSS processing failed"
  解决: 重新下载 extended 版覆盖即可
```

### Plan B 分支

```
如果 Hugo 无法安装（PATH 反复不生效等）:
  └─ 使用 Hugo 的 Windows 安装包 winget:
      winget install Hugo.Hugo.Extended

如果所有安装方式都失败:
  └─ 切换到 Astro（Node.js 生态，不需要单独下载）
  └─ 前提: 安装 Node.js（https://nodejs.org/），LTS 版即可
  └─ 后续命令: npm create astro@latest 代替 hugo new site
```

---

## SOP-03: 创建站点 & 安装主题

### 3.1 创建站点骨架

```bash
# 在个人网站目录下创建项目
cd F:\gog安装版游戏\个人网站
hugo new site myblog --format yaml
```

预期输出: `Congratulations! Your new Hugo site was created in F:\gog安装版游戏\个人网站\myblog`

### 3.2 验证骨架

```bash
cd myblog
dir
```

预期看到:
```
archetypes/
content/
data/
layouts/
static/
themes/
hugo.yaml
```

### 3.3 安装主题（以 PaperMod 为例）

```bash
# 初始化 Git（主题需要用 submodule 安装）
git init

# 添加主题（如果用 PaperMod）
git submodule add https://github.com/adityatelange/hugo-PaperMod themes/PaperMod

# 或者用 Hugo Theme Stack（备选）
# git submodule add https://github.com/CaiJimmy/hugo-theme-stack themes/stack
```

### 3.4 启用主题

编辑 `hugo.yaml`，写入:

```yaml
baseURL: '/'
languageCode: zh-CN
title: 我的博客
theme: PaperMod
paginate: 10
enableEmoji: true
```

### 3.5 验证主题安装

```bash
hugo server
```

打开浏览器访问 `http://localhost:1313`。应该能看到一个带着默认内容的博客页面。

### ⚠️ 常见问题

```
ERROR: git submodule 下载失败
  原因: GitHub 被阻断或网络超时
  解决:
    方案 A: 开代理后重试
    方案 B: 手动下载主题:
      1. 浏览器打开 https://github.com/adityatelange/hugo-PaperMod
      2. 点 "Code" → "Download ZIP"
      3. 解压到 themes/PaperMod 目录
      4. 注意: 手动安装后无法自动更新，下次手动替换

ERROR: hugo server 报错 "failed to resolve element in Page"
  原因: Hugo 版本太低或主题兼容性问题
  解决: 确认 hugo version 显示 extended + 版本号 >= 0.120.0

ERROR: 页面空白
  原因: 主题没有示例内容
  解决: 别担心，下一步写文章后就会有内容
```

### Plan B 分支

```
如果 PaperMod 安装失败且手动下载也不行:
  └─ 改用 Hugo Theme Stack（备选）
      git submodule add https://github.com/CaiJimmy/hugo-theme-stack themes/stack
      然后在 hugo.yaml 中 theme: stack

如果 Stack 也不行:
  └─ 试试更简单的 LoveIt 主题
      git submodule add https://github.com/dillonzq/LoveIt themes/LoveIt

如果所有主题都下载失败（网络彻底不行）:
  └─ 临时用 Hugo 内置的默认主题（无样式，但能验证构建流程正常）
      hugo.yaml 中 theme: "" （空字符串即可）
```

---

## SOP-04: 写第一篇文章

### 4.1 生成文章模板

```bash
hugo new posts/my-first-post.md
```

### 4.2 编辑文章

用任意文本编辑器打开 `content/posts/my-first-post.md`，内容结构:

```markdown
---
title: 我的第一篇文章
date: 2026-06-18T20:00:00+08:00
draft: false
tags:
  - hello
  - blog
categories:
  - 随笔
---

这是我的第一篇博客文章。

用 **Markdown** 写内容，支持:
- **粗体**、*斜体*
- 列表
- `代码`
- [链接](https://example.com)
- ![图片](image.jpg)
```

**关键**: 把 `draft: true` 改为 `draft: false`，否则文章不会显示。

### 4.3 验证文章

```bash
hugo server -D   # -D 表示显示草稿
```

打开 `http://localhost:1313`，确认文章出现在首页。

### ⚠️ 常见问题

```
Q: 文章不显示
  A1: 检查 frontmatter 中 draft: false
  A2: 如果没有 -D 参数，草稿不会显示
  A3: 确认文件在 content/posts/ 下面，不在子目录

Q: 中文乱码
  A: 用 UTF-8 无 BOM 编码保存文件
  VSCode: 右下角编码 → Save with Encoding → UTF-8
  记事本: 另存为 → 编码选 UTF-8
```

---

## SOP-05: 本地预览

```bash
# 不带草稿的正常预览
hugo server

# 带草稿的预览（开发时用）
hugo server -D

# 绑定到所有网卡（局域网其他设备可访问）
hugo server --bind=0.0.0.0 --baseURL=http://你电脑的IP:1313
```

### 验证点

```
✅ http://localhost:1313 能正常打开
✅ 文章列表显示
✅ 文章内容、标题、日期正确
✅ RSS 链接存在（通常显示为 /index.xml）
```

### 停止预览

在终端按 `Ctrl+C` 停止服务器。

---

## SOP-06: 初始化 Git & 推送到 GitHub

### 6.1 创建 .gitignore

在 `myblog/` 目录下创建 `.gitignore` 文件:

```
# Hugo 构建产物
/public/
/resources/_gen/
.hugo_build.lock

# 编辑器
.vscode/
.idea/
*.swp
*.swo

# 系统
Thumbs.db
.DS_Store
```

### 6.2 首次提交

```bash
# 确认在 myblog 目录下
cd F:\gog安装版游戏\个人网站\myblog

# 查看当前状态（确认没有意外包含大文件）
git status

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Hugo blog with PaperMod theme"

# 重命名分支
git branch -M main
```

### 6.3 GitHub 建仓库

```
1. 打开 https://github.com/new
2. Repository name: myblog（或你喜欢的名字）
3. Description: 我的个人博客
4. 选 Public（免费部署必须公开）
5. 不要勾选任何初始化选项（README/LICENSE/.gitignore）
6. 点 Create repository
```

创建后会看到一段命令，复制 SSH 或 HTTPS 方式:

```bash
# 方式 A: HTTPS（推荐，简单）
git remote add origin https://github.com/你的用户名/myblog.git

# 方式 B: SSH（国内更稳定）
git remote add origin git@github.com:你的用户名/myblog.git
```

### 6.4 推送

```bash
git push -u origin main
```

### 验证点

```
✅ GitHub 仓库页面上能看到刚刚推送的文件
✅ content/posts/my-first-post.md 在仓库里
✅ themes/ 目录存在（如果是 submodule 会显示为带箭头的文件夹）
✅ public/ 目录不在仓库中
```

### ⚠️ 常见问题

```
ERROR: fatal: repository 'https://github.com/...' not found
  原因: 仓库名或用户名打错了
  解决: git remote remove origin 后重新添加正确的地址

ERROR: git push 卡住不动 / timeout
  原因: 国内连接 GitHub 网络不稳定
  解决:
    方案 A（推荐）: 切换为 SSH 方式
      git remote set-url origin git@github.com:用户名/仓库名.git
      需要先到 GitHub 添加 SSH Key

    方案 B: 开系统代理
      git config --global http.proxy http://127.0.0.1:7890
      git config --global https.proxy http://127.0.0.1:7890
      如果代理端口不是 7890，替换为你的代理端口

    方案 C: 更换 DNS
      ping github.com 看看是不是解析到国内 IP
      Windows 修改 C:\Windows\System32\drivers\etc\hosts
      加入: 140.82.113.3 github.com

ERROR: git push 被拒绝 "failed to push some refs"
  原因: 远程仓库有本地没有的提交（比如你创建仓库时勾了 README）
  解决: git pull --rebase origin main 再 push

ERROR: 提交了 public/ 目录（仓库里有大量静态文件）
  原因: 忘记写 .gitignore 或写错了
  解决: git rm -r --cached public/
        确认 .gitignore 文件里有 /public/
        git commit -m "Remove public/ from tracking"
```

### Plan B 分支

```
HTTPS push 反复失败:
  └─ 方案 A: SSH key
      ssh-keygen -t ed25519 -C "你的邮箱"
      cat ~/.ssh/id_ed25519.pub
      复制到 GitHub: Settings → SSH and GPG keys → New SSH key
      git remote set-url origin git@github.com:用户名/仓库名.git
      git push

  └─ 方案 B: Gitee（国内 Git 平台）
      注册 gitee.com → 创建仓库 → 推送到 Gitee
      注意: 后续 Vercel/Netlify/CF Pages 的 Git Import 步骤需改为选 Gitee

  └─ 方案 C: GitLab
      注册 gitlab.com → 创建仓库 → 推送
      三平台支持 GitLab 集成
```

---

## SOP-07: 部署到 Vercel（主站 A）

### 步骤

```
1. 登录 vercel.com
2. Dashboard → Add New → Project
3. Import Git Repository → 选择你的 myblog 仓库
4. Configure Project:
   - Framework Preset: Hugo（自动识别）
   - Build Command: hugo（自动填充，保留即可）
   - Output Directory: public（自动填充，保留即可）
   - Environment Variables → Add:
     - Name: HUGO_VERSION
     - Value: 0.145.0（与本地版本一致）
5. Deploy（等待 ~1-2 分钟）
```

### 验证点

```
✅ Deploy 页面看到绿色 "Congratulations!" 或 "Production Deployment"
✅ 点击 Visit 打开的页面显示你的博客
✅ 站点的每一篇文章都能正常访问
```

### ⚠️ 常见问题

```
ERROR: Build Failed!
  打开 Deploy 日志，查看具体错误:

  错误1: "Current version is too old, please upgrade"
    原因: Vercel 默认的 Hugo 版本太低
    解决: 上一步骤中 Environment Variables 添加 HUGO_VERSION

  错误2: "hugo: not found"
    原因: Framework Preset 没选 Hugo，Vercel 不知道用什么命令构建
    解决: Project Settings → Build & Development Settings → 改为 Hugo

  错误3: "Error building site: process: ...
          Failed to get resolved config in path"
    原因: Hugo 版本与主题不兼容
    解决: 确保 HUGO_VERSION 与你本地版本一致

ERROR: Deploy 成功但页面空白
  原因: 构建后的 public/ 为空
  解决: 本地运行 hugo 确认能正常生成 public/index.html

ERROR: Deploy 成功但 404
  原因: Output Directory 配置错误
  解决: 确认填的是 public 而不是 /public/ 或 ./public
```

### Plan B 分支

```
如果 Vercel 构建始终失败:
  └─ 改用本地构建 + CLI 上传（跳过 CI 构建）
      npm i -g vercel
      hugo
      vercel deploy --prebuilt --prod ./public

如果 Vercel + CLI 都失败:
  └─ 放弃 Vercel，主站改为 Netlify（SOP-08）
```

---

## SOP-08: 部署到 Netlify（备用站 B）

### 步骤

```
1. 登录 app.netlify.com
2. Sites → Add new site → Import an existing project
3. Connect to Git provider → GitHub → 选择 myblog 仓库
4. Build settings（Netlify 会自动检测为 Hugo）:
   - Build command: hugo
   - Publish directory: public
5. Advanced → Environment variables → Add:
   - HUGO_VERSION = 0.145.0
6. Deploy site
```

### 验证点

```
✅ Deploy 成功后显示 Site published at https://xxx.netlify.app
✅ 点击域名能正常显示博客
✅ 内容与 Vercel 站一致
```

### ⚠️ 常见问题

```
ERROR: Build 日志中 "hugo" 命令不存在
  原因: Netlify 默认镜像不包含 Hugo
  解决: Netlify 会自动安装 Hugo，如果失败则在 Environment variables
       中添加 HUGO_VERSION 即可触发自动安装

ERROR: 部署后样式丢失
  原因: 主题的 CSS 路径是绝对路径
  解决: 检查 hugo.yaml 中 baseURL 是否设置为 '/'（相对路径）
       baseURL: '/'
       如果是绝对路径如 https://xxx.netlify.app，换到 Vercel 后会错
```

### Plan B 分支

```
Vercel 和 Netlify 都失败:
  └─ 主站和备用站全用 Cloudflare Pages（SOP-09）
```

---

## SOP-09: 部署到 Cloudflare Pages（备用站 C）

### 步骤

```
1. 登录 dash.cloudflare.com
2. 左侧菜单 → Pages
3. Create a project → Connect to Git
4. 选择 myblog 仓库（首次需要授权 GitHub）
5. Set up builds and deployments:
   - Framework preset: Hugo
   - Build command: hugo
   - Build output directory: public
   - Environment variables (Advanced):
     - HUGO_VERSION = 0.145.0
6. Save and Deploy
```

### 验证点

```
✅ 部署成功后显示 your-project.pages.dev
✅ 访问正常
✅ 内容和前两个站一致
```

### ⚠️ 常见问题

```
ERROR: "Could not find a Hugo version matching ..."
  原因: Cloudflare 的 Hugo 安装器没找到对应版本
  解决: 在 Environment variables 中设置 HUGO_VERSION = 0.145.0
        或改为 HUGO_VERSION = 0.121.2（CF 默认支持的版本）

ERROR: 每月构建次数超过 500 次
  几乎不可能，除非你一天 push 17 次。如果真超了:
  下个月自动恢复。

ERROR: 构建成功但访问 404
  原因: Output directory 配置错了，确认是 public（没有斜杠）
```

---

## SOP-10: 三站验证（关键步骤）

### 手动验证清单

部署完成后，逐个打开并检查:

```bash
# 记录三个地址
你的三个站应该是:
  A: https://myblog.vercel.app     # Vercel
  B: https://myblog.netlify.app    # Netlify
  C: https://myblog.pages.dev      # Cloudflare Pages

# 检查项（每站逐一验证）
□ 首页能打开
□ 文章列表显示
□ 文章内容排版正常
□ 图片正常加载
□ 页面切换不报 404
□ 文章日期、标签显示正常
□ RSS 链接可达 (/index.xml)
```

### 内容一致性验证

写一篇测试文章推送到 GitHub，确认三站同步:

```bash
# 1. 写一篇测试文章
hugo new posts/sync-test.md

# 2. 编辑添加标记性内容（方便识别版本）
# 在文章中写: "同步测试: 部署于 2026-06-18"

# 3. 发布 & 推送
git add .
git commit -m "test: sync verification"
git push

# 4. 等待 1-2 分钟后刷新三个站点
# 确认新文章在三站都已出现
```

### 故障模拟测试（建议上线前做一次）

```bash
# 模拟 Vercel 不可用
# 不访问 Vercel 地址，只访问 Netlify 和 Cloudflare Pages
# 确认内容可用且一致

# 模拟 git push 后某平台构建失败
# 故意在 Vercel 的环境变量中填错 HUGO_VERSION
# 确认 Vercel 构建失败，但 Netlify 和 CF Pages 不受影响
# 改正 HUGO_VERSION 后 Vercel 重新构建恢复
```

### 多地址管理

创建 `F:\gog安装版游戏\个人网站\访问地址.txt`:

```
=== 我的博客 ===

主站（推荐优先访问）:
  https://myblog.vercel.app

备用站 1（Vercel 不可用时）:
  https://myblog.netlify.app

备用站 2（前两个都不行时）:
  https://myblog.pages.dev

更新时间: 每次 git push 后三站自动同步
```

同时在每个站点的博客页脚或关于页面加上:

```yaml
# 在 hugo.yaml 中（如果主题支持自定义 footer）
params:
  footer_text: |
    本博客部署于三平台备用 | 
    <a href="https://myblog.vercel.app">Vercel</a> | 
    <a href="https://myblog.netlify.app">Netlify</a> | 
    <a href="https://myblog.pages.dev">Cloudflare</a>
```

---

## SOP-11: R2 核弹备份

### 步骤

```bash
# 1. 本地构建最新版本
cd F:\gog安装版游戏\个人网站\myblog
hugo

# 2. 压缩 public/
# 用 7z（推荐，压缩率高）:
7z a public-backup-2026-06-18.zip .\public\*

# 或用 PowerShell（Windows 自带）:
Compress-Archive -Path public\* -DestinationPath public-backup-2026-06-18.zip

# 3. 登录 Cloudflare → R2
# 创建存储桶: myblog-backup
# 上传压缩包

# 4. 同时复制一份到 U 盘
```

### R2 启用静态托管（紧急情况）

如果三个平台全挂，启用 R2 静态托管作为临时访问入口:

```
1. Cloudflare R2 → myblog-backup 存储桶
2. Settings → Public Access → "Allow access"
3. 记下公开 URL（格式: https://pub-xxxxx.r2.dev）
4. 上传 public/ 内容（不是压缩包，是解压后的文件）
5. 访问 https://pub-xxxxx.r2.dev 确认网站可访问
```

### 验证点

```
✅ R2 存储桶中有最新的压缩包
✅ U 盘中有同样的压缩包
✅ 压缩包解压后能看到 index.html
✅ R2 静态托管 URL 能访问博客
```

---

## SOP-12: 日常维护流程

### 写新文章

```bash
# 1. 拉取最新代码（如果换了电脑）
git pull

# 2. 创建新文章
hugo new posts/文章标题.md

# 3. 编辑文章内容

# 4. 本地预览
hugo server -D

# 5. 确认无误后构建
hugo

# 6. 推送
git add .
git commit -m "新文章: 文章标题"
git push
# 三平台自动构建部署
```

### 更新主题

```bash
# 如果是 submodule 安装的主题
git submodule update --remote --merge

# 如果是手动安装的主题
# 重新下载最新版覆盖 themes/目录
```

### 更换主题

```bash
# 1. 安装新主题
git submodule add https://github.com/XXX/YYY themes/YYY

# 2. 修改 hugo.yaml, 改 theme: YYY

# 3. 本地预览检查效果
hugo server

# 4. 满意后推送
git add .
git commit -m "更换主题为 YYY"
git push
```

### 恢复：从 GitHub 克隆到新电脑

```bash
# 1. 在新电脑上安装 Hugo
# 2. 克隆仓库（带 submodule）
git clone --recurse-submodules https://github.com/用户名/myblog.git

# 3. 进入目录
cd myblog

# 4. 本地预览
hugo server

# 5. 正常写文章、推送
```

### 恢复：从 U 盘完全重建

```bash
# 如果 GitHub 和所有部署站都丢失了
# 1. 从 U 盘拷贝 myblog 源码目录到新电脑
# 2. 安装 Hugo（SOP-02）
# 3. 安装主题（如果主题文件夹不存在，重新下载）
# 4. 本地预览
hugo server

# 5. 重新创建 GitHub 仓库并推送
git remote add origin https://github.com/用户名/新仓库名.git
git push -u origin main

# 6. 重新在 Vercel/Netlify/Cloudflare Pages 部署
```

---

## 附录 A: 完整命令速查表

| 命令 | 用途 |
|------|------|
| `hugo new site myblog` | 创建新站点 |
| `hugo new posts/xxx.md` | 创建新文章 |
| `hugo server -D` | 本地预览（含草稿）|
| `hugo server` | 本地预览（仅已发布）|
| `hugo` | 构建静态文件到 public/ |
| `git add .` | 暂存所有变更 |
| `git commit -m "message"` | 提交 |
| `git push` | 推送到 GitHub |
| `git pull` | 拉取最新代码 |
| `git clone --recurse-submodules 地址` | 克隆含主题的仓库 |

## 附录 B: 关键文件路径速查

| 路径 | 说明 |
|------|------|
| `F:\gog安装版游戏\个人网站\myblog\` | 博客源码根目录 |
| `F:\gog安装版游戏\个人网站\myblog\content\posts\` | 文章存放目录 |
| `F:\gog安装版游戏\个人网站\myblog\themes\` | 主题目录 |
| `F:\gog安装版游戏\个人网站\myblog\hugo.yaml` | 博客配置文件 |
| `F:\gog安装版游戏\个人网站\访问地址.txt` | 三站地址记录 |
| `F:\gog安装版游戏\个人网站\myblog\.gitignore` | Git 忽略规则 |

## 附录 C: 边界情况与补救措施速查

| 边界情况 | 补救措施 | 参考 |
|---------|---------|------|
| 本地电脑硬盘损坏 | 在新电脑 git clone 仓库 | SOP-12 |
| 本地 + GitHub 同时丢失 | 从 U 盘重建，重新 push | SOP-12 |
| 所有线上 + 本地全丢 | 从 R2 下载备份压缩包 | SOP-11 |
| Vercel 宕机 | 用户访问 Netlify 或 CF Pages | SOP-10 |
| Vercel 取消免费 | Netlify 升为主站 | 白皮书 F-04 |
| GitHub 被墙 | SSH 协议 / Gitee 镜像 | SOP-06 Plan B |
| 三平台全挂 | R2 静态托管临时恢复 | SOP-11 |
| Hugo 版本不兼容 | 锁定 HUGO_VERSION 环境变量 | SOP-07 |
| 主题报错 | 换备用主题 | SOP-03 Plan B |
| 文章发布后不显示 | 检查 draft: false | SOP-04 |
| 图片加载不出来 | 检查路径大小写 / 文件是否存在 | 本地检查 |
| 推送后平台没构建 | 检查 GitHub Webhook 状态 | 各平台 Git 设置页 |

---

*本 SOP 随系统变更持续更新。遇到本文档未覆盖的情况，先查白皮书中的 FMEA 表，找到对应的故障编号和恢复程序。*
