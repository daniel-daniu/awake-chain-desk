# DEPLOY.md — 部署到 Cloudflare Pages

适用项目：`C:\Users\haoji\Desktop\myweb\awake`
技术栈：Vite + React + TypeScript + Tailwind + Cloudflare Pages Functions

> 重要：不要用 Cloudflare 控制台的“拖拽上传”。拖拽只传静态文件，`functions/` 会丢失，`/api/*` 全部 404。必须用 Git 集成或 Wrangler。

---

## 0. 最短路径（不装 Node、不装 Git）

只用网页版 GitHub + Cloudflare Pages：

1. GitHub 新建仓库 `awake-chain-desk`
2. 网页上传源码（见第 1 节）
3. Cloudflare Pages 连接仓库
4. 构建参数：`npm run build` / `dist` / `NODE_VERSION=22`
5. 绑定自定义域名
6. 打开 `/api/health` 验收

Cloudflare 会在云端安装 Node 和依赖，本机不需要 Node，也不需要 Git。

---

## 1. GitHub 网页上传

### 1.1 必须上传

保留目录结构，上传以下文件和文件夹：

```
src/
functions/
public/
shared/
scripts/
index.html
package.json
package-lock.json
vite.config.ts
tsconfig.json
tailwind.config.js
postcss.config.js
wrangler.toml
```

其中：

- `functions/api/*` 是后端代理，缺了新闻、价格、收益接口都会失效
- `public/fallback/*.json` 是上游失败时的兜底数据，必须保留
- `shared/news-seed.json` 是新闻种子
- `scripts/snapshot.mjs` 在构建前抓取快照
- `scripts/postbuild.mjs` 生成 `/zh/index.html`、`/en/index.html`

### 1.2 不要上传

```
node_modules/      几千个文件，Cloudflare 会自己安装
dist/              构建产物，Cloudflare 会自己生成
shots/             本地截图
.wrangler/         本地缓存
docs/probe/        抓包样本，可选
.workbuddy-ai/     项目记忆，与站点无关
```

### 1.3 上传步骤

1. 进入 GitHub 仓库 → **Add file** → **Upload files**
2. 拖入上述文件和文件夹
3. 底部填 `initial upload` → **Commit changes**

如果提示单次文件过多，分批传：

1. `src/`
2. `functions/`
3. `public/` + `shared/` + `scripts/`
4. 根目录配置文件

每批 Commit 一次。

### 1.4 私有仓库

Private 仓库可以连 Cloudflare。连接时在 GitHub 授权页勾选该仓库即可。

---

## 2. Cloudflare Pages 连接

1. 登录 Cloudflare 控制台
2. 左侧 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 授权 GitHub，选择 `awake-chain-desk`
4. 填写构建参数：

| 项目 | 值 | 说明 |
|---|---|---|
| Project name | `awake-chain-desk` | 自己起名，会变成 `xxx.pages.dev`，可改 |
| Production branch | `main` | 选你推送代码的那个分支 |
| Framework preset | `Vite` | 只是帮你预填下面两行；选 `None` 也能手动填 |
| Build command | `npm run build` | **必须**，决定能不能构建成功 |
| Build output directory | `dist` | **必须**，填错会部署一个空站 |
| 环境变量 | `NODE_VERSION` = `22` | **必须**，否则可能用旧版 Node 构建失败 |

前两项是命名和选择，第三项只是省事开关；**真正决定部署成败的是后三项**。

5. 点击 **Save and Deploy**

首次构建约 2–3 分钟。`functions/` 在项目根目录，Cloudflare 会自动识别。

---

## 3. 绑定自定义域名（大陆访问关键）

`*.pages.dev` 在大陆经常超时/522，正式分享必须绑自定义域名。

1. Pages 项目 → **Custom domains** → **Set up a custom domain**
2. 填如 `awake.你的域名.com`
3. 域名已托管在 Cloudflare：CNAME 自动添加，等证书签发
4. 域名在阿里云/腾讯云：到 DNS 服务商添加 CNAME，指向 `awake-chain-desk.pages.dev`
5. 状态变成 **Active** 后访问 `https://awake.你的域名.com/zh/`

域名在 Cloudflare 时，SSL/TLS 建议 **Full (strict)**。

---

## 4. 上线验收

```
https://你的域名/zh/
https://你的域名/en/
https://你的域名/api/health
https://你的域名/api/price
https://你的域名/api/yield
https://你的域名/api/stats
https://你的域名/api/flow
https://你的域名/api/ecosystem
https://你的域名/zh/ecosystem
```

- `/api/health`：三个上游都应为 `"ok": true`
- `/api/price`：应有 `polygon` 和 `crossChainSpread`
- `/api/yield`：应有 `prices`、`taxes`、`interest`
- `/api/ecosystem`：应有 `ailgns`、`hpnft`、`helixPower`、`lgnsBurn`
- 直接刷新 `/zh/chain` 不应 404

---

## 5. 以后怎么更新

### 网页上传方式

1. 进入 GitHub 仓库
2. 打开要改的文件 → 右上角铅笔图标 → 修改 → Commit
3. Cloudflare 自动重新构建部署

新增文件：**Add file** → **Upload files**。

### 命令行方式（装了 Git 才可用）

```bash
cd C:\Users\haoji\Desktop\myweb\awake
git add .
git commit -m "update"
git push
```

---

## 5.1 如果之前已经部署过

构建参数、环境变量、域名都不用改。只需要把下面这些文件夹重新上传覆盖：

```
src/
functions/
shared/
public/
scripts/
```

重点新增文件：

- `functions/api/yield.ts`（利息、税率、gas）
- `functions/api/ecosystem.ts`（AiLGNS / HELIX）
- `src/pages/Ecosystem.tsx`（生态页）
- `src/components/blocks.tsx`（价格税费卡、YieldPanel）
- `src/lib/api.ts`、`src/types.ts`、`src/App.tsx`
- `src/components/Header.tsx`、`Footer.tsx`、`src/i18n/zh.ts`、`en.ts`
- `shared/news-seed.json`、`public/sitemap.xml`、`scripts/snapshot.mjs`

最近一次（入门页 + 排版修复）新增 / 修改：

- `src/pages/Learn.tsx`（新增：区块链入门与名词表）
- `src/data/learn.ts`（新增：入门页文案数据）
- `src/pages/Ecosystem.tsx`（新增通俗解读与判断清单）
- `src/pages/Home.tsx`（首屏导读、hero 图形标签修复）
- `src/styles/tokens.css`（修复 `.container-page` 覆盖垂直内边距，手机端版权不再被底部 Tab 遮挡）
- `src/App.tsx`、`src/components/Header.tsx`、`src/components/Footer.tsx`、`src/i18n/zh.ts`、`src/i18n/en.ts`、`public/sitemap.xml`

**网页上传时注意**：`src/data/` 目录和 `src/pages/Learn.tsx` 是新增的，必须一起传，否则构建会报找不到模块。

Cloudflare 会自动重新构建，`/api/*` 由 `_routes.json` 自动接管，不需要新增环境变量。

---

## 6. 常见问题

| 现象 | 处理 |
|---|---|
| 构建报 `tsc: not found` | 环境变量加 `NODE_ENV=development`，或 `NPM_FLAGS=--include=dev` |
| 构建报 Node 版本 | 环境变量 `NODE_VERSION=22` |
| `/zh/chain` 刷新 404 | 确认构建命令包含 `node scripts/postbuild.mjs`，且 `dist/zh/index.html` 存在 |
| `/api/*` 404 | `functions/` 没上传；Git 集成要上传源码，不是只传 `dist` |
| `/api/*` 503 | 上游限流；Pages → Deployments → Functions 日志，前端会自动回退 `fallback/*.json` |
| 改了代码页面没变 | 确认部署的是 Production；强刷或等缓存过期 |
| `pages.dev` 打不开 | 绑自定义域名，不要用 `pages.dev` 分享给大陆用户 |
| 自定义域名 522 | 检查 DNS CNAME 是否指向 `awake-chain-desk.pages.dev`，以及 Cloudflare 代理状态 |

---

## 7. 备选：Wrangler 直传（需要 Node）

如果不想用 GitHub，也可以在本地用 Wrangler 直传。需要安装 Node 18+（推荐 22）。

```bash
cd C:\Users\haoji\Desktop\myweb\awake

# 登录（浏览器授权）
npx wrangler login

# 确认登录
npx wrangler whoami

# 构建
npm run build

# 首次创建项目
npx wrangler pages project create awake-chain-desk --production-branch main

# 部署（必须在项目根目录执行）
npx wrangler pages deploy dist --project-name awake-chain-desk --branch main --commit-dirty=true
```

以后更新：

```bash
npm run build
npx wrangler pages deploy dist --project-name awake-chain-desk --branch main --commit-dirty=true
```

---

## 8. 免费额度

- 静态请求：不限量
- 构建：500 次/月
- Functions：10 万次/天
- 项目没有用 KV、数据库、环境密钥

接口缓存：price 60s、stats 300s、yield 300s、flow 300s。

---

## 9. 项目结构速查

```
awake/
├─ functions/              Cloudflare Pages Functions
│  ├─ api/price.ts         双链价格 + 跨链价差
│  ├─ api/stats.ts         区块、出块、手续费
│  ├─ api/yield.ts         利息、税率、gas
│  ├─ api/ecosystem.ts     AiLGNS / HELIX 链上数据
│  ├─ api/flow.ts          claimInterest 抽样
│  ├─ api/token.ts         供应、持仓
│  ├─ api/news.ts          新闻聚合
│  └─ _lib/utils.ts        RPC / 缓存 / 响应工具
├─ public/
│  ├─ fallback/            构建时快照（兜底）
│  ├─ _redirects           SPA 回退
│  ├─ _headers             安全与缓存头
│  └─ _routes.json         只让 /api/* 走 Functions
├─ shared/news-seed.json   新闻种子
├─ scripts/snapshot.mjs    构建前抓取快照
├─ scripts/postbuild.mjs   生成 /zh /en 入口
├─ src/
│  ├─ pages/Ecosystem.tsx  AiLGNS & HELIX 页面
│  └─ ...                  其余页面与组件
├─ wrangler.toml           Pages 配置
└─ package.json
```

---

## 10. 如果将来要删除整个项目

建议顺序：

```
备份 → 删除 Cloudflare Pages → 清理 DNS → 删除 GitHub 仓库 → 撤销授权 → 删除本地目录
```

先停掉 Cloudflare，再删 GitHub，避免出现“GitHub 删了但站点还在跑”的情况。

### 10.1 先备份

- GitHub 仓库 → **Code** → **Download ZIP**
- 本地保留 `DEPLOY.md`、`shots/`、`.workbuddy-ai/memory/`（如果想留记录）
- 记下自定义域名、Cloudflare 项目名、GitHub 仓库名

GitHub 仓库删除后通常无法直接恢复，先备份。

### 10.2 删除 Cloudflare Pages 项目

1. 登录 Cloudflare 控制台
2. 左侧 **Workers & Pages**
3. 点进 `awake-chain-desk`
4. **Settings** → 拉到最下面 **Delete project**
5. 按提示输入项目名确认

删除后：

- `*.pages.dev` 地址立即失效
- 自定义域名不再指向这个站点
- Functions、部署记录、环境变量一起删除

> 删除 Pages 项目不会删除你的域名，也不会停止域名续费。

### 10.3 清理自定义域名 / DNS

域名托管在 Cloudflare：

1. **Websites** → 你的域名 → **DNS**
2. 找到指向 `awake-chain-desk.pages.dev` 的 CNAME
3. 删除这条记录

域名在阿里云/腾讯云：

- 到对应 DNS 服务商删除那条 CNAME

如果域名还要用于别的网站，只删 CNAME，不要删域名。

### 10.4 删除 GitHub 仓库

1. 打开仓库页面
2. **Settings** → 拉到最下面 **Danger Zone**
3. **Delete this repository**
4. 输入 `你的用户名/awake-chain-desk` 确认

需要仓库管理员权限。

### 10.5 撤销 Cloudflare 的 GitHub 授权（建议）

GitHub → 右上角头像 → **Settings** → **Applications**：

- **Authorized OAuth Apps** → Cloudflare Pages → **Revoke**
- **Installed GitHub Apps** → Cloudflare Pages → **Configure** → 移除该仓库或 Uninstall

这样 Cloudflare 以后不能再读你的 GitHub 仓库。

### 10.6 删除本地项目（可选，危险）

目录：

```
C:\Users\haoji\Desktop\myweb\awake
```

**⚠️ 此操作不可逆，会删除源码、构建产物、截图和项目记忆。**

删除前确认：

- GitHub 仓库已经备份或确认不再需要
- `DEPLOY.md`、`shots/` 里有要留的内容
- 没有其他项目引用这个目录

确认后手动删除整个文件夹，或执行：

```bash
rm -rf "C:/Users/haoji/Desktop/myweb/awake"
```

### 10.7 删除后仍然保留的东西

| 东西 | 是否还在 |
|---|---|
| Cloudflare 账号 | 在 |
| GitHub 账号 | 在 |
| 域名注册与续费 | 在 |
| 域名 DNS 区域 | 在（除非你删） |
| 本地其他项目 | 不受影响 |

### 10.8 如果只是想暂时下线

不用删项目：

- 先移除 Pages 项目的 **Custom domains** 里的域名，站点就不再对外
- 或者把 DNS 的 CNAME 改到别处
- 项目和代码都保留，随时可以重新绑定

真正要“彻底删除”，再按 10.1–10.6 操作。
