import axios from "axios";
import { message } from "antd";
import { config } from "../config";

// 创建 Dify API 客户端
const difyApi = axios.create({
  baseURL: config.difyApiBaseUrl,
  timeout: 30000,
  headers: {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  },
});

// 响应拦截器
difyApi.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("Dify API Error:", error);
    message.error(error.response?.data?.message || "请求失败");
    return Promise.reject(error);
  }
);

// Dify API 接口
export const difyAPI = {
  // 获取应用信息
  getInfo: (): Promise<any> => difyApi.get("/info"),

  // 获取应用参数
  getParameters: (): Promise<any> => difyApi.get("/parameters"),

  // 获取应用Meta信息
  getMeta: (): Promise<any> => difyApi.get("/meta"),

  // 发送消息 - 阻塞模式
  sendMessage: (data: {
    query: string;
    inputs?: Record<string, any>;
    user: string;
    conversation_id?: string;
    files?: any[];
    auto_generate_name?: boolean;
  }): Promise<any> =>
    difyApi.post("/chat-messages", {
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
    return fetch(`${config.difyApiBaseUrl}/chat-messages`, {
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

export default difyApi;
