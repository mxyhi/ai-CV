import axios from 'axios';
import { message } from 'antd';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else {
      message.error(error.response?.data?.message || '请求失败');
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  login: (data: { identifier: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { email: string; username: string; password: string; name?: string }) =>
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
};

// 机器人相关API
export const botsAPI = {
  getList: () => api.get('/bots'),
  getPublicList: () => api.get('/bots/public'),
  getById: (id: string) => api.get(`/bots/${id}`),
  create: (data: any) => api.post('/bots', data),
  update: (id: string, data: any) => api.patch(`/bots/${id}`, data),
  delete: (id: string) => api.delete(`/bots/${id}`),
};

// 聊天相关API
export const chatAPI = {
  startConversation: (data: { botId: string; userId: string; userName?: string; userEmail?: string }) =>
    api.post('/chat/start', data),
  sendMessage: (conversationId: string, data: { message: string; files?: any[] }) =>
    api.post(`/chat/${conversationId}/messages`, data),
  getHistory: (conversationId: string, params?: { limit?: number; offset?: number }) =>
    api.get(`/chat/${conversationId}`, { params }),
  closeConversation: (conversationId: string) =>
    api.patch(`/chat/${conversationId}/close`),
};

export default api;
