// 客户端演示配置
export const config = {
  // 指定要使用的机器人ID（可以通过环境变量覆盖）
  botId: import.meta.env.VITE_BOT_ID || "1",

  // API 基础URL
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api",

  // 应用标题
  appTitle: import.meta.env.VITE_APP_TITLE || "AI客服演示",

  // 是否显示机器人信息
  showBotInfo: import.meta.env.VITE_SHOW_BOT_INFO !== "false",
};
