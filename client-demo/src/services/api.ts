import axios from 'axios';
import { message } from 'antd';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 30000,
});

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    message.error(error.response?.data?.message || '请求失败');
    return Promise.reject(error);
  }
);

// 机器人相关API
export const botsAPI = {
  getPublicList: () => api.get('/bots/public'),
  getById: (id: string) => api.get(`/bots/${id}`),
};

// 聊天相关API
export const chatAPI = {
  startConversation: (data: { 
    botId: string; 
    userId: string; 
    userName?: string; 
    userEmail?: string 
  }) => api.post('/chat/start', data),
  
  sendMessage: (conversationId: string, data: { message: string; files?: any[] }) =>
    api.post(`/chat/${conversationId}/messages`, data),
    
  getHistory: (conversationId: string, params?: { limit?: number; offset?: number }) =>
    api.get(`/chat/${conversationId}`, { params }),
    
  closeConversation: (conversationId: string) =>
    api.patch(`/chat/${conversationId}/close`),
};

export default api;
