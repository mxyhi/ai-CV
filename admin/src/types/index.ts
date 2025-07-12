// 用户相关类型
export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginForm {
  identifier: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  username: string;
  password: string;
  name?: string;
}

// 机器人相关类型
export interface Bot {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  difyApiKey: string;
  difyBaseUrl: string;
  category: "CUSTOMER_SERVICE" | "SALES" | "SUPPORT" | "GENERAL";
  isActive: boolean;
  welcomeMessage?: string;
  fallbackMessage?: string;
  maxTokens?: number;
  temperature?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
    name?: string;
  };
  _count?: {
    conversations: number;
  };
}

export interface CreateBotForm {
  name: string;
  description?: string;
  avatar?: string;
  difyApiKey: string;
  difyBaseUrl?: string;
  category?: "CUSTOMER_SERVICE" | "SALES" | "SUPPORT" | "GENERAL";
  isActive?: boolean;

  welcomeMessage?: string;
  fallbackMessage?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface UpdateBotForm {
  name?: string;
  description?: string;
  avatar?: string;
  difyApiKey?: string;
  difyBaseUrl?: string;
  category?: "CUSTOMER_SERVICE" | "SALES" | "SUPPORT" | "GENERAL";
  isActive?: boolean;
  welcomeMessage?: string;
  fallbackMessage?: string;
  maxTokens?: number;
  temperature?: number;
}

// 对话相关类型
export interface Conversation {
  id: string;
  botId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  title?: string;
  status: "ACTIVE" | "CLOSED" | "ARCHIVED";
  difyConversationId?: string;
  createdAt: string;
  updatedAt: string;
  bot?: {
    id: string;
    name: string;
    avatar?: string;
    welcomeMessage?: string;
  };
  messages?: Message[];
  _count?: {
    messages: number;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  difyMessageId?: string;
  metadata?: string;
  createdAt: string;
}

// API响应类型
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success?: boolean;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// API Key 相关类型
export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  key?: string; // 完整密钥仅在创建时返回
  botId: string;
  isActive: boolean;
  permissions: string;
  lastUsedAt?: string;
  usageCount: number;
  rateLimit?: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  bot?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface CreateApiKeyForm {
  name: string;
  permissions?: string;
  rateLimit?: number;
  expiresAt?: string;
}

export interface UpdateApiKeyForm {
  name?: string;
  isActive?: boolean;
  permissions?: string;
  rateLimit?: number;
  expiresAt?: string;
}

export interface ApiKeyListResponse {
  data: ApiKey[];
  total: number;
}

// 表格分页类型
export interface TablePagination {
  current: number;
  pageSize: number;
  total: number;
}
