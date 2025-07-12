// 机器人相关类型
export interface Bot {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  category: string;
  welcomeMessage?: string;
  createdAt: string;
  user?: {
    username: string;
    name?: string;
  };
}

// 对话相关类型
export interface Conversation {
  conversationId: string;
  bot: {
    id: string;
    name: string;
    avatar?: string;
    welcomeMessage?: string;
  };
  messages: Message[];
}

export interface Message {
  id: string;
  content: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  createdAt: string;
  metadata?: any;
}

// 聊天相关类型
export interface ChatMessage {
  id: string;
  content: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  timestamp: Date;
  avatar?: string;
  userName?: string;
  botName?: string;
}

export interface SendMessageRequest {
  message: string;
  files?: any[];
}

export interface SendMessageResponse {
  userMessage: {
    id: string;
    content: string;
    role: string;
    createdAt: string;
  };
  botMessage: {
    id: string;
    content: string;
    role: string;
    createdAt: string;
  };
  error?: string;
}

// API响应类型
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success?: boolean;
}
