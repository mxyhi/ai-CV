// 客户端演示配置
export const config = {
  // Server API 基础URL（通过 server 的 Dify 代理）
  serverApiBaseUrl:
    import.meta.env.VITE_SERVER_API_BASE_URL || "http://localhost:3001/v1",

  // API Key（必须配置，用于访问 server 的 Dify 代理）
  apiKey: import.meta.env.VITE_API_KEY || "",

  // 应用标题
  appTitle: import.meta.env.VITE_APP_TITLE || "AI 助手演示",

  // 用户ID（用于标识用户）
  userId:
    import.meta.env.VITE_USER_ID ||
    "demo-user-" + Math.random().toString(36).substr(2, 9),

  // 是否启用流式响应
  enableStreaming: import.meta.env.VITE_ENABLE_STREAMING !== "false",
};
