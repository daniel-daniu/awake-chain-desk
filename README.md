# Awake 双链数据站

独立、只读的 Anubis / Polygon 链上数据工具。网站动态数据由 Cloudflare Pages Functions 聚合，不在前端写死价格、收益、奖励或费率。

## 功能

- 首页首先展示新闻、公告与链上动态，外部来源和链上事实分开标记。
- 双链 LGNS 价格由 `LGNS/DAI` 池储备反推，买卖税由代币合约读取。
- 24 小时、7 日和 30 日收益窗口来自真实起止 index 读数和对应区块时间。
- 网络出块、Gas、区块奖励、领取事件和持仓集中度保留观测窗口与区块高度。
- 产品页区分链上可读、部分可读和不可读字段。
- AiLGNS / HELIX 页使用官方 DApp 公布的合约目录，并通过 RPC 读取当前供应、额度、Power、销毁地址余额和池子数据。
- 钱包使用 EIP-6963 自动发现，只读展示双链资产、LP 与 HELIX Power，不请求签名或交易。
- 中文 `/zh` 默认，英文 `/en` 完整镜像。

## 数据原则

- 动态指标必须来自 RPC 或区块浏览器链上索引。
- 新闻和公开文档只作为外部来源，不参与链上数值计算。
- 缺少数据时显示 `N/A`，并在可用情况下携带来源错误或过期状态。
- 未开源合约只陈述可观察行为，不假定完整规则。
- 年化仅表示同一观察窗口下代币数量变化，不代表美元收益。

## 本地开发

需要 Node.js 22：

```bash
npm ci
npm run dev
```

完整检查：

```bash
npm run check
npm test
npm run build
```

预览 Cloudflare Pages Functions：

```bash
npx wrangler pages dev dist --port 8788
```

## API

| 路径 | 用途 | 默认缓存 |
|---|---|---|
| `/api/home` | 首页双链聚合数据 | 5 分钟服务端 / 页面约 10 分钟刷新 |
| `/api/chains` | 完整链上数据 | 10 分钟服务端 / 页面约 15 分钟刷新 |
| `/api/products` | 产品动态指标与证据 | 15 分钟服务端 / 页面约 30 分钟刷新 |
| `/api/news?scope=latest` | 外部新闻和公告 | 5 分钟服务端 / 页面约 15 分钟刷新 |
| `/api/ecosystem` | AiLGNS / HELIX | 5 分钟服务端 / 页面约 10 分钟刷新 |
| `/api/portfolio?address=0x...` | 钱包只读仓位 | 不缓存 |
| `/api/health` | 上游健康检查 | 不缓存 |

响应统一带有 `retrievedAt`、`sources` 和 `warnings`。前端页面隐藏时停止轮询，相同请求使用 React Query 缓存。页面用“自动刷新 / 部分数据 / 已过期”区分缓存与完整性，不把历史缓存写成实时。

## 目录

- `src/`：React 页面、双语文案、钱包只读交互和展示组件。
- `functions/api/`：Cloudflare Pages Functions。
- `shared/`：前后端共享类型与合约地址。
- `scripts/postbuild.mjs`：生成所有中英文静态路由入口。
- `public/_redirects`、`public/_headers`：Pages 路由与安全头。

## 联系

作者：Daniel 大牛  
邮箱：hello@danieln.top
