---
title: "部署计划书：个人博客全球容灾部署"
date: 2026-06-19
tags:
  - blog
  - plan
  - deployment
categories:
  - 技术
---
# 个人博客部署计划书

> 基于 Hugo / Astro + GitHub + Vercel + Cloudflare Pages 双平台架构
> 当前时间：2026-06-18 | 适用场景：技术型个人博客，中国/海外双访问场景

---

## 决策树（先确认基调）

```
你有自己的域名吗？
├─ 有（如 guishuziran.com）
│   ├─ DNS 托管在 Cloudflare  → 走方案 A（双平台 DNS 手动切）
│   └─ DNS 在别处             → 方案 A，多一步迁移 DNS
└─ 没有
    ├─ 愿意花 ~50-100 元/年买一个？
    │   └─ 先买域名，走方案 A
    └─ 不想花钱
        └─ 走方案 B（无域名，用平台自带二级域名）
```

---

## 方案 A：自有域名 + 双平台冗余（推荐）

### 架构总览

```
┌─────────────────────────────────────────────────────┐
│                      本地电脑                         │
│  Markdown 文章 → Hugo build → public/ 静态文件       │
│  git push 到 GitHub                                  │
└──────────┬──────────────────────────────────────────┘
           │ git push
           ▼
┌──────────────────────┐
│    GitHub 仓库        │  ← 唯一数据源
│    (private/public?)  │
└─────┬─────────┬──────┘
      │         │
      ▼         ▼
┌─────────┐  ┌──────────────┐
│ Vercel  │  │ Cloudflare   │
│ (主站)  │  │ Pages (备用) │
└────┬────┘  └──────┬───────┘
     │              │
     └──────┬───────┘
            ▼
     ┌──────────────┐
     │ Cloudflare   │
     │ DNS          │  ← 域名解析入口
     │ CNAME Flatten│
     └──────┬───────┘
            │
            ▼
     用户访问你的域名
```

---

### 第一阶段：注册账号

| 平台 | 用途 | 注册方式 | 注意事项 |
|------|------|---------|---------|
| GitHub | 代码托管 | github.com | 已有可跳过 |
| Vercel | 主站部署 | vercel.com，GitHub 一键登录 | ✅ |
| Cloudflare | DNS + Pages 备用 | cloudflare.com | 域名 DNS 必须在这里 |

**⚠️ 可能出问题的地方：**
- Vercel 注册后需要验证邮箱，没验证前无法部署
- Cloudflare 注册后激活 DNS 需要修改域名的 NS 记录（域名注册商处操作）
- 如果已有 GitHub 账号但绑了其他服务，不影响

**B 计划：**
- Vercel 注册不通过 → 改用 Netlify 作为主站（功能对等，操作流程几乎一样）
- Cloudflare DNS 迁移失败 → 保留原 DNS 服务商，只用 Vercel 单站模式（丧失冗余能力）

---

### 第二阶段：本地环境搭建

#### 选择：Hugo vs Astro

| 维度 | Hugo | Astro |
|------|------|-------|
| 安装 | 下载单个 exe，放 PATH 即可 | 需要 Node.js 18+ |
| 构建速度 | ~毫秒级（Go 语言编译） | ~秒级（Node.js） |
| 主题数量 | 300+（大部分免费） | ~100+ |
| 灵活度 | 模板语法（Go 模板） | 组件化（可内嵌 Vue/React） |
| 学习曲线 | 低（纯博客够用） | 中等 |
| 依赖 | 零依赖 | npm 生态 |

**推荐 Hugo**——你的场景是纯博客，Hugo 更轻更稳。

#### 安装 Hugo

```
方式一（推荐）：从 GitHub Releases 下载 hugo_extended 版本
  https://github.com/gohugoio/hugo/releases
  下载 Windows 版 .zip → 解压到 F:\gog安装版游戏\hugo\ → 加入系统 PATH

方式二（winget）：
  winget install Hugo.Hugo.Extended

验证：hugo version
```

**⚠️ 可能出问题的地方：**
1. **hugo_extended 与标准版的区别**：部分主题（如 PaperMod）需要 extended 版本处理 SCSS/SASS，下错标准版会导致 `hugo server` 时报错 `error: failed to transform resource`。必须下 `hugo_extended_*` 版本。
2. **PATH 没生效**：Win 系统改完 PATH 需要重启终端或重启电脑
3. **防火墙/代理挡 GitHub Releases 下载**：国内下载 GitHub 资源可能很慢或被阻断

**B 计划：**
- GitHub Releases 被墙 → 使用 hugo 国内镜像（gitee 上有同步），或让 AI 下载后传给你
- Hugo 主题 SCSS 报错 → 确认下载的是 `hugo_extended` 版本，运行 `hugo version` 看输出里有 `extended` 字样
- 如果 Hugo 反复出问题 → 切到 Astro（npm create astro@latest，无需额外下载）

#### 初始化站点

```bash
# 在你想放项目的目录执行
cd F:\gog安装版游戏\个人网站
hugo new site myblog --format yaml
```

这会在 `F:\gog安装版游戏\个人网站\myblog` 下生成骨架：

```
myblog/
├── archetypes/     # 文章模板
├── assets/         # CSS/JS 资源
├── content/        # Markdown 文章（核心）
├── data/           # 数据文件（可选）
├── layouts/        # 自定义布局（可选，通常主题自带）
├── static/         # 静态文件（图片等）
├── themes/         # 主题（稍后放进去）
├── hugo.yaml       # 站点配置
└── hugo.toml       # 旧版配置文件名
```

**⚠️ 可能出问题的地方：**
- `hugo new site` 失败 → 检查 `hugo version` 是否正常输出
- 目标目录已存在文件 → Hugo 不会覆盖，但会报 `already exists` 错误
- `--format yaml` 可选，默认 toml，新手建议 yaml（更清晰）

#### 安装主题

以 PaperMod 为例（最流行的 Hugo 博客主题）：

```bash
cd F:\gog安装版游戏\个人网站\myblog
git init
git submodule add https://github.com/adityatelange/hugo-PaperMod themes/PaperMod
```

然后在 `hugo.yaml` 中写入：

```yaml
theme: PaperMod
```

**⚠️ 可能出问题的地方：**
1. **git submodule 下载失败**（国内网络问题）
2. **部分主题需要 scss 编译**（需要 hugo_extended）
3. **主题配置极其复杂**：PaperMod 有 200+ 可配置参数，盲目抄网上配置可能不兼容版本

**B 计划：**
- git submodule 被墙 → 从 GitHub Releases 下载主题 zip 手动解压到 themes/ 目录
- PaperMod 配置太难 → 换更简单的主题：Hugo Theme Stack（功能完整，配置相对简单）
- 所有主题都不满意 → 用 Astro + AstroPaper 主题（更现代但依赖 Node.js）

#### 写第一篇测试文章 & 本地预览

```bash
hugo new posts/hello.md
# 编辑 content/posts/hello.md，去掉 draft: true 才能显示
hugo server -D    # -D 显示草稿
```

打开浏览器访问 `http://localhost:1313`

**⚠️ 可能出问题的地方：**
- `hugo server` 端口被占用 → 自动换端口，看终端输出里的新端口号；或用 `hugo server -p 4000` 强制指定
- 文章不显示 → 检查 frontmatter 中 `draft: true`，改为 `draft: false`
- SCSS 编译报错 → 确认用的是 `hugo_extended` 版本
- 中文乱码 → 编辑器的编码问题，确保文件保存为 UTF-8（无 BOM）

---

### 第三阶段：生成 & 推送到 GitHub

#### 生成静态文件

```bash
hugo
# 输出到 public/ 目录
```

#### 创建 .gitignore

```
# Hugo 生成的静态文件（由 CI 构建生成，不提交）
/public/

# Hugo 缓存
/resources/_gen/
.hugo_build.lock

# 编辑器
.vscode/
.idea/
*.swp
*.swo
```

> **为什么忽略 public/？** 因为 Vercel 和 Cloudflare Pages 会从源码重新构建，不需要提交构建产物。如果提交了 public/，会导致 git 仓库臃肿、diff 混乱、CI 构建可能双重覆盖。

#### 推送 GitHub

```bash
# 在 myblog 目录下
git add .
git commit -m "Initial commit"
git branch -M main

# 先在 GitHub 创建空仓库（不要勾选 README/LICENSE/.gitignore）
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

**⚠️ 可能出问题的地方：**

| 问题 | 现象 | 解决方案 |
|------|------|---------|
| GitHub push 超时 | `Failed to connect to github.com port 443` | 开代理；或换 SSH 方式（`git remote add origin git@github.com:...`） |
| GitHub 仓库设为 Private | 免费部署要求 Public 仓库 | 改为 Public；或使用 GitLab（免费版支持 Private 仓库部署） |
| git 初次 `add` 卡住 | public/ 下文件太多（已构建过） | 先确认 .gitignore 已写好再 add |
| 中文文件名乱码 | git status 显示 `\346\226\207\345\255\227` | 执行 `git config --global core.quotepath false` |

**B 计划：**
- GitHub 被墙 → 推送失败 → 用 SSH 协议（`git@github.com:` 开头）绕过，或开系统代理
- GitHub 仓库 Public 有隐私顾虑 → 用 GitLab Pages（免费版支持 Private 仓库 + CI/CD 部署）
- 整个 GitHub 不可用 → 临时方案：本地 `hugo` 生成后手动上传到 Vercel/Cloudflare 的 CLI

---

### 第四阶段：部署到 Vercel & Cloudflare Pages

#### Vercel 部署（主站）

1. 登录 vercel.com
2. Import Git Repository → 选你的 GitHub 仓库
3. 配置：
   - Framework Preset: Hugo
   - Build Command: `hugo`（自动填充）
   - Output Directory: `public`（自动填充）
4. **关键设置**：Environment Variables → 添加
   - `HUGO_VERSION` = `0.145.0`（与你本地版本一致，或当前最新）
   - 不设置这个变量可能导致 Vercel 用默认低版本 Hugo 构建出错
5. Deploy

部署成功后获得域名：`your-project.vercel.app`

#### Cloudflare Pages 部署（备用站）

1. 登录 cloudflare.com → Pages
2. Create a project → Connect to Git → 选同一个仓库
3. 配置：
   - Framework preset: Hugo
   - Build command: `hugo`
   - Build output: `public`
   - Environment variables (advanced):
     - `HUGO_VERSION` = `0.145.0`
4. 注意：Cloudflare Pages 每月的构建次数限制是 500 次，个人博客完全够用
5. Save and Deploy

部署成功后获得域名：`your-project.pages.dev`

**⚠️ 可能出问题的地方：**

| 问题 | 原因 | 解决 |
|------|------|------|
| Vercel 构建失败 | 默认 Hugo 版本太低（0.x 旧版），不支持新主题语法 | 设置 `HUGO_VERSION` 环境变量 |
| Cloudflare 构建超时 | 免费版构建限时 5 分钟，Hugo 一般 10 秒搞定，不会被超时 | 如果真超时，检查主题模块下载有网络问题 |
| 构建日志中找不到 `hugo` | Framework Preset 选错了 | 改为 Other 手动填 build commmand |
| 部署成功后页面空白 | Output Directory 填错了 | 确认 Output Dir 填 `public`（不是 `/public`） |
| Vercel 部署成功但 404 | 没有 index.html | 检查 `hugo` 命令是否真的在 public 下生成了 index.html |
| GitHub 仓库名含下划线/点 | Vercel 可能自动给域名加后缀 | 没关系，最终绑你自己的域名，这个不重要 |

**B 计划：**
- Vercel 构建反复失败 → Cloudflare Pages 作为主站，Netlify 作为备用站
- 两个平台都构建失败 → 本地 `hugo` 生成后，用 Vercel CLI（`vercel deploy --prebuilt`）或 Cloudflare Wrangler CLI 手动上传 public/ 目录
- 全部 CI 服务不可用 → 本地 `hugo` → 压缩 public/ 上传到 Cloudflare R2 静态托管（见第六阶段）

---

### 第五阶段：域名绑定 & DNS 双平台切换

#### 前提：DNS 托管到 Cloudflare

在你的域名注册商后台（如阿里云、腾讯云、Namesilo、GoDaddy 等）：
1. 找到 DNS 管理 → 修改 NS 记录
2. 替换为 Cloudflare 分配的 NS 地址（如 `albert.ns.cloudflare.com`）
3. 等待 24-72 小时生效（通常 1-2 小时内开始生效）

**⚠️ 关键注意：NS 修改期间，原有 DNS 解析会中断一小段时间，选择低峰期操作。**

#### 绑定域名到 Vercel（主站）

1. Vercel 项目 → Settings → Domains → 输入你的域名（如 `blog.niyuming.com`）
2. Vercel 会提示添加 DNS 记录：
   - 类型：CNAME
   - 名称：`blog`（如果你想用二级域名）或 `@`（如果直接用根域名）
   - 目标：`cname.vercel-dns.com`
3. 在 Cloudflare DNS 中添加这条 CNAME 记录
4. 打开 Proxy（橙色云图标）— Cloudflare 代理开启，提供 DDoS 防护 + 缓存加速
5. Vercel 自动颁发 Let's Encrypt SSL 证书（自动续期）

#### 绑定域名到 Cloudflare Pages（备用站）

1. Cloudflare Pages → your project → Custom domains → Set up a custom domain
2. 输入同样的域名（如 `blog.niyuming.com`）
3. Cloudflare 会自动创建 DNS 记录，但注意——**这里会和 Vercel 的 CNAME 冲突**（同一域名不能同时指向两个目标）

#### 核心方案：手动切换，不要同时绑定

**正确的做法（不是同时绑定，而是按需切换）：**

```
正常情况下：
  Cloudflare DNS: CNAME blog → cname.vercel-dns.com (Proxy: ON)
  所有流量走 Vercel

Vercel 挂了时：
  步骤 1: 登录 Cloudflare → DNS
  步骤 2: 把 CNAME 从 cname.vercel-dns.com 改为 your-project.pages.dev
  步骤 3: 保存，等待 TTL 过期（默认 5 分钟）
  步骤 4: 访问恢复正常
```

**注意这个流程要求：**
- Vercel 和 Cloudflare Pages 都部署了你的网站
- 但只有 Vercel 绑定了域名（Pages 暂不绑定域名）
- 切换时只改 DNS 记录指向

**⚠️ 可能出问题的地方：**

| 问题 | 说明 | 解决 |
|------|------|------|
| 根域名 CNAME | DNS 规范不允许根域名 CNAME，但 Cloudflare 的 CNAME Flattening 支持 | 直接设 `@` CNAME 即可，Cloudflare 自动拉平 |
| DNS 缓存导致切换慢 | 用户可能还在访问旧的 DNS 缓存 | TTL 设短（60 秒），但会影响 CDN 缓存命中率 |
| 双平台同时绑同域名 | DNS 会冲突，解析不稳定 | **不要同时绑定**，只绑定当前活跃的平台 |
| SSL 证书问题 | 切换后新站点的 SSL 可能还在验证中 | 先确认备用站的 SSL 状态（可通过 .pages.dev 提前验证） |
| Cloudflare Proxy 关不掉 | 橙色云是 Proxy 模式，调试时建议关掉 | 点掉橙色云变灰（DNS-only 模式）再测试 |

**B 计划：**
- 不想手动改 DNS → 注册 `blog.niyuming.com` 和 `blog2.niyuming.com` 双域名，各绑一个站，用户知道两个地址（体验差，但简单）
- Cloudflare DNS 不想用 → 保留原 DNS 服务商，但失去 Proxy（DDoS 防护/缓存）功能
- 没有域名 → 走方案 B（下方）

---

### 第六阶段：核弹级备份

#### 本地备份

```bash
# 每次更新内容后执行
hugo
# 将 public/ 压缩
cd public && 7z a ../public-backup-YYYY-MM-DD.zip *  # 或用 tar/rar
```

备份两份：本地硬盘 + U 盘各一份

**⚠️ 可能出问题的地方：**
- 忘记备份旧版本 → git 本身就是版本管理，不需要手动备份版本历史
- 压缩包体积太大 → public/ 通常只有几 MB 到几十 MB，图片多可能上百 MB
- 7z 命令不存在 → 用 PowerShell：`Compress-Archive -Path public/* -DestinationPath public-backup.zip`

#### Cloudflare R2 核弹级备份（可选）

1. 登录 Cloudflare → R2 → Create bucket（名称如 `myblog-nuclear-backup`）
2. 上传 public-backup-*.zip
3. 需要恢复时：下载解压 → 上传到任何一个平台的静态托管 → 手动改 DNS

**什么时候才用到 R2？**
三大平台同时不可用 + GitHub 不可用 + 本地电脑不可用。这概率接近零，但如果你觉得留着无害就保留。

---

### 第七阶段：联系邮箱 & 可选功能

#### 最简单的方式：mailto 链接

在 `hugo.yaml` 中配置：

```yaml
params:
  email: you@example.com
```

在主题模板中引用。PaperMod 在 `layouts/partials/footer.html` 或配置中的 `social` 部分添加。

#### 隐蔽邮箱（防爬虫）

不建议直接暴露纯文本邮箱（会被爬虫抓取发垃圾邮件），用 HTML 编码：

```html
<a href="mailto:you&#64;example&#46;com">联系我</a>
```

#### 进阶功能（当前阶段不推荐）

| 功能 | 推荐方案 | 复杂度 | 建议时间点 |
|------|---------|--------|-----------|
| 评论系统 | giscus（GitHub Discussions 驱动） | 低 | 先上线再补 |
| 站内搜索 | Pagefind（Hugo 官方推荐） | 低 | 文章超过 20 篇时 |
| 访客统计 | Umami | 中 | 需要时再部署 |
| RSS | Hugo 默认生成 `/index.xml` | 零配置 | 开箱即用 |
| SEO | 默认生成 sitemap.xml | 零配置 | 开箱即用 |

---

## 方案 B：无域名（零成本方案）

如果你暂时不想买域名，仍然可以部署，只是不能做 DNS 级切换。

### 差异点

```
┌─ Vercel:   your-project.vercel.app     ← 主站
└─ CF Pages: your-project.pages.dev      ← 备用站
```

用户需要两个地址都记住，一个挂了就输另一个。体验差一些但成本为零。

### 多域名自动跳转（低配容灾）

在 Cloudflare Pages 部署一个简单的 JavaScript 重定向页面：

```html
<script>
  // 检测 Vercel 主站是否可达
  fetch('https://your-project.vercel.app')
    .then(r => { if (!r.ok) throw new Error('down') })
    .catch(() => { window.location.href = 'https://your-project.pages.dev' })
</script>
```

但这要求用户先访问到主站才能触发跳转，意义有限。

---

## 常见故障排错表

### 构建时

```
症状: "error: failed to transform resource: SCSS processing failed"
原因: 使用标准版 Hugo，需要 hugo_extended
修复: 下载并替换为 extended 版本
```

```
症状: "error: module "github.com/xxx" not found"
原因: 主题使用 Hugo Modules 但没有配置 go.mod
修复: 改用 git submodule 方式安装主题
```

```
症状: "page "/posts/xxx.md" is marked as draft"
原因: frontmatter 中 draft: true
修复: 改为 draft: false 或直接用 hugo server -D
```

### 部署时

```
症状: Vercel 部署成功但页面空白
原因1: Hugo 版本不匹配，生成空 public/
修复1: 设置 HUGO_VERSION 环境变量
原因2: Output Directory 配成了 public/ 而不是 public
修复2: Vercel 自动去掉尾斜杠，填 public 即可
```

```
症状: Cloudflare Pages 构建成功但 404
原因: 框架预设没选择 Hugo，导致 CF 用默认构建命令
修复: 在构建配置中明确填 Framework preset = Hugo
```

```
症状: git push 报错 "failed to push some refs"
原因: 远程仓库有本地没有的提交（如 README.md）
修复: git pull --rebase origin main 再 push
```

### DNS 切换时

```
症状: 改了 CNAME 但用户还在访问旧站
原因: DNS TTL 缓存 + 浏览器 DNS 缓存
修复: TTL 设 60s；用户可尝试清除浏览器 DNS 缓存或等 5 分钟
```

```
症状: 切换后 SSL 证书错误
原因: Cloudflare Pages 还没为你的域名生成证书
修复: 切换前提前在 CF Pages 添加自定义域名（会立刻触发证书生成），
     然后不启用（留作备用），等证书状态变成 Active 后再切
```

---

## 维护清单（上线后）

| 频率 | 事项 |
|------|------|
| 每次写新文章 | `hugo new posts/xxx.md` → 写内容 → `git push` |
| 每次 push 后 | 打开 Vercel 域名检查是否构建成功 |
| 每月一次 | 本地 `hugo` 构建一次 → 备份 public/ 压缩包到 U 盘 |
| 每季度 | 确认两个平台 SSL 证书都有效 |
| 每半年 | `hugo version` 检查是否有新版本需要更新 |
| 域名到期前 1 个月 | 续费（错过可能被抢注） |

---

## 总结：为什么这个方案可信

1. **GitHub 是永远的数据源**——换电脑、重装系统，`git clone` 恢复一切
2. **Vercel + Cloudflare Pages 双重覆盖**——任何单平台出问题或国内网络波动都有冗余
3. **DNS 手动切换方案可行**——不花钱，5-10 分钟恢复，对个人博客来说足够
4. **本地备份是最后防线**——即使所有平台 + GitHub 都无法使用，U 盘里的压缩包也能恢复
5. **零运行成本**——只要你有域名，所有平台免费额度远超个人博客需求

**有疑问或需要调整的地方，随时告诉我。**
