# Cloudflare Pages 部署

## 构建参数

| 设置 | 值 |
|---|---|
| Framework preset | Vite |
| Build command | `npm ci && npm run build` |
| Build output directory | `dist` |
| Node version | `22` |

在 Cloudflare Pages 项目环境变量中设置：

```text
NODE_VERSION=22
```

## 通过 Git 部署

1. 将项目源码推送到 GitHub 或 GitLab。
2. Cloudflare 控制台进入 **Workers & Pages → Create → Pages → Connect to Git**。
3. 选择仓库并填写上方构建参数。
4. 部署后检查：
   - `/zh/`
   - `/en/`
   - `/zh/chains/`
   - `/zh/ecosystem/`
   - `/api/health`
   - `/api/home`
   - `/api/news?scope=latest`

`functions/` 目录必须随源码一起提交，否则 `/api/*` 不会生效。

## 直接上传

已安装 Node 22 时：

```bash
npm ci
npm run build
npx wrangler pages deploy dist --project-name awake-chain-desk
```

首次使用 Wrangler 可能需要登录 Cloudflare 账户。不要把 `.wrangler/` 或 `.tools/` 上传到仓库。

## 自定义域名

在 Pages 项目的 **Custom domains** 中绑定域名。DNS 指向 Pages 后等待证书生效。正式分享前建议确认目标地区的访问稳定性。

## 缓存和限制

- 价格、网络和 Helix 额度的服务端缓存约 5 分钟，首页约 10 分钟刷新。
- 链上详情页服务端缓存约 10 分钟，页面约 15 分钟刷新。
- 产品服务端缓存约 15 分钟、页面约 30 分钟刷新；新闻服务端约 5 分钟、页面约 15 分钟刷新。
- 钱包仓位约 90 秒。

上游失败时接口会尽量返回最近成功边缘缓存并标出过期；没有缓存时返回错误，不使用固定数据冒充实时数据。

Polygon 公共 RPC 偶发限流时，数据层会在多个公共节点间自动切换并拆分重试。若长期全部不可用，建议在后续版本接入 Cloudflare Secret 中的付费或自建 Polygon RPC。

## 验收

```bash
npm run check
npm test
npm run build
npx wrangler pages dev dist --port 8788
```

浏览器检查 390px、768px、1440px，中文/英文切换，产品深层路由刷新，以及无钱包状态。
