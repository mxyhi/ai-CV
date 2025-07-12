// 客户端演示配置
export const config = {
  // Dify API 转发服务基础URL
  difyApiBaseUrl:
    import.meta.env.VITE_DIFY_API_BASE_URL || "http://localhost:3001/v1",

  // API Key（必须配置）
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
