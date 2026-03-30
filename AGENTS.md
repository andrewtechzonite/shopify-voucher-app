# 项目概览

## 项目类型
Shopify 应用项目（代码项目）

## 项目描述
这是一个基于 React Router v7 构建的 Shopify 嵌入式应用，名为 "voucher-app"。该应用使用了 Shopify 的最新开发工具和最佳实践，包括 Shopify Admin GraphQL API、Polaris Web Components UI 框架、Prisma ORM 和会话管理。

## 主要技术栈
- **框架**: React Router v7（从 Shopify Remix 模板迁移）
- **语言**: TypeScript / JavaScript (ES Modules)
- **数据库**: Prisma ORM + SQLite（默认用于会话存储）
- **UI 组件**: Polaris Web Components
- **API**: Shopify Admin GraphQL API (2026-04 版本)
- **构建工具**: Vite
- **认证**: Shopify App Bridge + App Router
- **Node 版本要求**: >=20.19 <22 || >=22.12

## 项目架构
```
voucher-app/
├── app/                      # 应用主目录
│   ├── db.server.js         # Prisma 数据库客户端
│   ├── entry.server.jsx     # 服务器入口点
│   ├── root.jsx             # 应用根组件
│   ├── routes.js            # 路由配置（使用 flatRoutes）
│   ├── shopify.server.js    # Shopify 服务器配置和认证
│   └── routes/              # 路由文件
│       ├── app._index.jsx   # 主应用页面（产品生成演示）
│       ├── app.additional.jsx # 额外页面示例
│       ├── app.jsx          # 应用导航配置
│       ├── auth.$.jsx       # 认证处理
│       └── webhooks/        # Webhook 处理器
│           ├── app.scopes_update.jsx
│           └── app.uninstalled.jsx
├── prisma/                  # 数据库模式
│   ├── schema.prisma        # Prisma 模式定义
│   └── migrations/          # 数据库迁移文件
├── public/                  # 静态资源
├── extensions/              # Shopify 扩展
├── package.json             # 项目依赖和脚本
├── shopify.app.toml         # Shopify 应用配置
├── tsconfig.json            # TypeScript 配置
└── vite.config.js           # Vite 构建配置
```

---

# 构建和运行

## 本地开发
```bash
npm run dev
# 或
shopify app dev
```
此命令会启动 Shopify CLI，自动处理：
- 登录到你的 Shopify 账户
- 连接到应用
- 提供环境变量
- 更新远程配置
- 创建隧道
- 按下 `P` 键可打开应用 URL

## 生产构建
```bash
npm run build
```
构建输出到 `./build` 目录。

## 生产环境启动
```bash
npm run start
```
使用 `react-router-serve` 启动构建后的应用。

## Docker 部署
```bash
npm run docker-start
```
这会依次执行 `setup` 和 `start` 脚本。

## 数据库设置
```bash
npm run setup
```
执行 Prisma 客户端生成和迁移部署：
```bash
prisma generate && prisma migrate deploy
```

## 类型检查
```bash
npm run typecheck
```
运行 TypeScript 类型检查：
```bash
react-router typegen && tsc --noEmit
```

## 代码检查
```bash
npm run lint
```
使用 ESLint 检查代码质量。

## GraphQL 代码生成
```bash
npm run graphql-codegen
```
基于 GraphQL 查询生成 TypeScript 类型。

---

# 开发规范

## 认证和 API 调用
所有需要认证的路由和 API 调用都应使用 `shopify` 对象：
```javascript
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    {
      products(first: 25) {
        nodes {
          title
          description
        }
      }
    }
  `);

  const { data } = await response.json();
  return data;
}
```

## 路由规范
- 使用 `flatRoutes` 自动生成路由
- 路由文件放在 `app/routes/` 目录下
- 命名约定：`app._index.jsx`（主页面）、`app.pageName.jsx`（子页面）
- 使用 `export const loader` 用于数据加载
- 使用 `export const action` 用于表单提交和数据修改

## 嵌入式应用导航
**重要**: 嵌入式应用必须维护用户会话，避免导航问题：

1. ✅ 使用 `Link` 组件（来自 `react-router` 或 `@shopify/polaris`）
2. ✅ 使用 `redirect` 返回自 `authenticate.admin`
3. ✅ 使用 `useSubmit` 钩子
4. ❌ 不要使用 `<a>` 标签
5. ❌ 不要使用 `react-router` 的 `redirect`

## Webhook 处理
- 在 `shopify.app.toml` 中定义应用级 webhooks（推荐）
- 避免在 `afterAuth` 钩子中注册 webhooks
- Webhook 处理器位于 `app/routes/webhooks/` 目录

## 数据库使用
- 默认使用 SQLite 数据库（适合单实例应用）
- 生产环境建议使用 PostgreSQL、MySQL 或 Redis
- 使用 Prisma 客户端进行数据库操作：
```javascript
import prisma from "../db.server";

// 创建会话
await prisma.session.create({
  data: {
    shop: "example.myshopify.com",
    // ...其他字段
  }
});
```

## Polaris Web Components
应用使用 Polaris Web Components 而不是 React 组件：
```jsx
<s-page heading="页面标题">
  <s-button onClick={handleClick}>按钮</s-button>
  <s-paragraph>段落文本</s-paragraph>
</s-page>
```

## GraphQL 查询规范
- 在组件中使用 `useFetcher` 钩子处理异步操作
- 所有 GraphQL 查询应包含 `#graphql` 注释以启用 VSCode 支持
- 在 `.graphqlrc.js` 中配置 GraphQL 提示

---

# 环境变量

## 必需变量
- `SHOPIFY_API_KEY`: Shopify 应用的 API 密钥
- `SHOPIFY_API_SECRET`: Shopify 应用的 API 密钥
- `SHOPIFY_APP_URL`: 应用的 URL
- `SCOPES`: 应用权限范围（逗号分隔）

## 可选变量
- `SHOP_CUSTOM_DOMAIN`: 自定义店铺域名
- `FRONTEND_PORT`: 前端端口（默认 8002）
- `NODE_ENV`: 环境模式（development/production）
- `PRISMA_CLIENT_ENGINE_TYPE`: Prisma 引擎类型（Windows ARM64 需设置为 "binary"）

---

# Shopify 权限范围

当前配置的权限（在 `shopify.app.toml` 中）：
- `write_metaobject_definitions`: 写入元对象定义
- `write_metaobjects`: 写入元对象
- `write_products`: 写入产品

如需添加更多权限，在 `shopify.app.toml` 的 `[access_scopes]` 部分修改。

---

# 常见问题和解决方案

## 数据库表不存在
错误：`The table 'main.Session' does not exist in the current database.`

解决：运行设置脚本
```bash
npm run setup
```

## Windows ARM64 Prisma 问题
错误：`Unable to require('C:\...\query_engine-windows.dll.node')`

解决：设置环境变量
```bash
set PRISMA_CLIENT_ENGINE_TYPE=binary
```

## JWT "nbf" 声明时间戳检查失败
原因：系统时间与服务器不同步

解决：在系统设置中启用"自动设置时间和日期"

## Webhook HMAC 验证失败
原因：在 Shopify 管理后台创建的 webhook 没有使用应用的密钥签名

解决：使用 `shopify.app.toml` 中定义的应用级 webhooks

---

# 部署选项

## 推荐的部署平台
1. **Google Cloud Run** - 最详细的部署教程
2. **Fly.io** - 快速部署到单机
3. **Render** - 使用 Docker 部署
4. **其他托管服务** - 遵循手动部署指南

## 部署清单
- [ ] 设置生产数据库（PostgreSQL/MySQL 推荐）
- [ ] 配置环境变量（包括 `NODE_ENV=production`）
- [ ] 运行 `npm run build`
- [ ] 部署应用到托管平台
- [ ] 在 Shopify 中配置应用 URL

---

# 扩展和自定义

## 添加新页面
1. 在 `app/routes/` 创建新文件（如 `app.myPage.jsx`）
2. 在 `app/routes/app.jsx` 的导航菜单中添加链接
3. 实现 loader 和 action 函数（如需要）

## 添加新路由
遵循 flatRoutes 约定：
- `app._index.jsx` → `/`
- `app.products.jsx` → `/products`
- `app.products.$id.jsx` → `/products/:id`

## 使用元字段和元对象
模板已包含使用示例：
- 在 `app._index.jsx` 中查看 `metafields` 和 `metaobject` 的使用
- 在 `shopify.app.toml` 中配置元对象定义

---

# 相关资源

## 官方文档
- [React Router 文档](https://reactrouter.com/)
- [Shopify 应用开发入门](https://shopify.dev/docs/apps/getting-started)
- [Shopify App React Router 文档](https://shopify.dev/docs/api/shopify-app-react-router)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [Shopify Admin GraphQL API](https://shopify.dev/docs/api/admin-graphql)
- [Polaris Web Components](https://shopify.dev/docs/api/app-home/polaris-web-components)

## Shopify Dev MCP
此项目已配置 Shopify Dev MCP，支持 Cursor、GitHub Copilot、Claude Code 和 Google Gemini CLI。详见 `.gemini/extensions/shopify-dev-mcp/`。

---

# 作者
FOG CREATIVE01