# AI 客服演示客户端

这是一个通过 Server 的 Dify API 代理进行 AI 对话的客户端演示应用，用于展示 AI 客服的对话功能。

## 功能特点

- 🤖 **Dify API 集成**: 通过 Server 的 Dify 代理 API 进行对话
- 💬 **实时对话**: 支持阻塞和流式两种对话模式
- 🎨 **简洁界面**: 专注于对话体验的简洁界面设计
- ⚙️ **灵活配置**: 支持通过环境变量自定义各种设置
- 🔐 **API Key 认证**: 使用 API Key 进行安全认证

## 配置说明

### 环境变量配置

复制 `.env.example` 文件为 `.env.local` 并修改相应的配置：

```bash
cp .env.example .env.local
```

### 配置项说明

| 环境变量                   | 说明                         | 默认值                     |
| -------------------------- | ---------------------------- | -------------------------- |
| `VITE_SERVER_API_BASE_URL` | Server API 基础 URL          | `http://localhost:3001/v1` |
| `VITE_API_KEY`             | API Key（从 Admin 后台创建） | 必须配置                   |
| `VITE_APP_TITLE`           | 应用标题                     | `AI 助手演示`              |
| `VITE_USER_ID`             | 用户 ID（可选）              | 自动生成                   |
| `VITE_ENABLE_STREAMING`    | 是否启用流式响应             | `true`                     |

## 安装和运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 使用前准备

1. **启动 Server**: 确保 Server 服务正在运行（默认端口 3001）
2. **配置 Dify**: 在 Admin 后台配置 Dify API 连接
3. **创建 API Key**: 在 Admin 后台创建用于客户端的 API Key
4. **配置环境变量**: 将 API Key 配置到 `.env.local` 文件中

## 使用场景

- **客户服务**: 嵌入到客户服务页面，提供 24/7 的 AI 客服支持
- **产品演示**: 展示 AI 机器人的对话能力和响应质量
- **集成测试**: 测试 Dify 应用的配置和性能
- **客户体验**: 让客户直接体验 AI 客服的服务质量

## 技术栈

- React 18
- TypeScript
- Vite
- Ant Design
- Axios

## 注意事项

1. 确保 Server 服务正在运行（端口 3001）
2. 必须配置有效的 API Key
3. API Key 需要有对应机器人的访问权限
4. 支持响应式设计，适配移动端和桌面端
5. 流式响应需要现代浏览器支持 Server-Sent Events
