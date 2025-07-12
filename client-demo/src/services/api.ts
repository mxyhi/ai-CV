import axios from "axios";
import { message } from "antd";
import { config } from "../config";

// 创建axios实例
const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 30000,
});

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("API Error:", error);
    message.error(error.response?.data?.message || "请求失败");
    return Promise.reject(error);
  }
);

// 机器人相关API
export const botsAPI = {
  getPublicList: (params?: { page?: number; limit?: number }): Promise<any> =>
    api.get("/bots/public", { params }),
  getById: (id: string): Promise<any> => api.get(`/bots/${id}`),
};

// 聊天相关API
export const chatAPI = {
  startConversation: (data: {
    botId: string;
    userId: string;
    userName?: string;
    userEmail?: string;
  }): Promise<any> => api.post("/chat/start", data),

  sendMessage: (
    conversationId: string,
    data: { message: string; files?: any[] }
  ): Promise<any> => api.post(`/chat/${conversationId}/messages`, data),

  getHistory: (
    conversationId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<any> => api.get(`/chat/${conversationId}`, { params }),

  closeConversation: (conversationId: string): Promise<any> =>
    api.patch(`/chat/${conversationId}/close`),
};

export default api;
