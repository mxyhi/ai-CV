import axios from "axios";
import { message } from "antd";
import { config } from "../config";

// 创建 Server API 客户端（通过 server 的 Dify 代理）
const serverApi = axios.create({
  baseURL: config.serverApiBaseUrl,
  timeout: 30000,
  headers: {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  },
});

// 响应拦截器
serverApi.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("Server API Error:", error);
    message.error(error.response?.data?.message || "请求失败");
    return Promise.reject(error);
  }
);

// Server API 接口（通过 server 的 Dify 代理）
export const difyAPI = {
  // 获取应用信息
  getInfo: (): Promise<any> => serverApi.get("/info"),

  // 获取应用参数
  getParameters: (): Promise<any> => serverApi.get("/parameters"),

  // 获取应用Meta信息
  getMeta: (): Promise<any> => serverApi.get("/meta"),

  // 发送消息 - 阻塞模式
  sendMessage: (data: {
    query: string;
    inputs?: Record<string, any>;
    user: string;
    conversation_id?: string;
    files?: any[];
    auto_generate_name?: boolean;
  }): Promise<any> =>
    serverApi.post("/chat-messages", {
      ...data,
      response_mode: "blocking",
    }),

  // 发送消息 - 流式模式
  sendMessageStream: (data: {
    query: string;
    inputs?: Record<string, any>;
    user: string;
    conversation_id?: string;
    files?: any[];
    auto_generate_name?: boolean;
  }): Promise<Response> => {
    return fetch(`${config.serverApiBaseUrl}/chat-messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        response_mode: "streaming",
      }),
    });
  },
};

export default serverApi;
