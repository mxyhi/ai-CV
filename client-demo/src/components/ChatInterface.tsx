import React, { useState, useEffect, useRef } from "react";
import { Layout, Typography, Avatar, Space, message, Spin } from "antd";
import { RobotOutlined } from "@ant-design/icons";
import { difyAPI } from "../services/api";
import { config } from "../config";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface ChatMessage {
  id: string;
  content: string;
  role: "USER" | "ASSISTANT";
  timestamp: Date;
  avatar?: string;
  userName?: string;
  botName?: string;
}

interface AppInfo {
  name: string;
  description?: string;
  tags?: string[];
  mode?: string;
  author_name?: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 使用配置中的用户ID
  const userId = config.userId;

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeApp = async () => {
    try {
      setInitializing(true);

      // 检查 API Key 是否配置
      if (!config.apiKey) {
        message.error("请配置 API Key");
        return;
      }

      // 获取应用信息
      const info = await difyAPI.getInfo();
      setAppInfo(info);

      // 添加欢迎消息
      const welcomeMessage: ChatMessage = {
        id: `welcome_${Date.now()}`,
        content: "您好！我是 AI 助手，有什么可以帮助您的吗？",
        role: "ASSISTANT",
        timestamp: new Date(),
        botName: info.name || "AI 助手",
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      message.error("初始化应用失败，请检查 API Key 配置");
      console.error("Failed to initialize app:", error);
    } finally {
      setInitializing(false);
    }
  };

  const handleSendMessage = async (messageContent: string) => {
    // 添加用户消息到界面
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content: messageContent,
      role: "USER",
      timestamp: new Date(),
      userName: "用户",
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      if (config.enableStreaming) {
        // 流式模式
        await handleStreamMessage(messageContent);
      } else {
        // 阻塞模式
        await handleBlockingMessage(messageContent);
      }
    } catch (error) {
      message.error("发送消息失败");
      console.error("Failed to send message:", error);

      // 移除失败的用户消息
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const handleBlockingMessage = async (messageContent: string) => {
    const response = await difyAPI.sendMessage({
      query: messageContent,
      user: userId,
      conversation_id: conversationId || undefined,
      inputs: {},
      auto_generate_name: true,
    });

    // 更新对话ID
    if (response.conversation_id && !conversationId) {
      setConversationId(response.conversation_id);
    }

    // 添加机器人回复
    const botMessage: ChatMessage = {
      id: response.message_id || `bot_${Date.now()}`,
      content: response.answer,
      role: "ASSISTANT",
      timestamp: new Date(response.created_at * 1000),
      botName: appInfo?.name || "AI 助手",
    };

    setMessages((prev) => [...prev, botMessage]);
  };

  const handleStreamMessage = async (messageContent: string) => {
    const response = await difyAPI.sendMessageStream({
      query: messageContent,
      user: userId,
      conversation_id: conversationId || undefined,
      inputs: {},
      auto_generate_name: true,
    });

    if (!response.ok) {
      throw new Error("Stream request failed");
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No reader available");
    }

    // 创建机器人消息
    const botMessage: ChatMessage = {
      id: `bot_${Date.now()}`,
      content: "",
      role: "ASSISTANT",
      timestamp: new Date(),
      botName: appInfo?.name || "AI 助手",
    };

    setMessages((prev) => [...prev, botMessage]);

    const decoder = new TextDecoder();
    let buffer = "";
    let accumulatedContent = ""; // 用于累积内容

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.event === "message") {
                // 更新对话ID
                if (data.conversation_id && !conversationId) {
                  setConversationId(data.conversation_id);
                }

                // 累积内容
                accumulatedContent += data.answer;

                // 更新消息内容
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.id === botMessage.id) {
                    lastMessage.content = accumulatedContent; // 直接设置累积的内容
                  }
                  return newMessages;
                });
              } else if (data.event === "message_end") {
                // 消息结束
                break;
              } else if (data.event === "error") {
                throw new Error(data.message || "Stream error");
              }
            } catch (e) {
              console.warn("Failed to parse SSE data:", line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  if (initializing) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
        <span style={{ marginLeft: 16 }}>正在初始化应用...</span>
      </div>
    );
  }

  return (
    <Layout style={{ height: "100vh" }}>
      <Header
        style={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #f0f0f0",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Space>
          <Avatar
            icon={<RobotOutlined />}
            style={{ backgroundColor: "#52c41a" }}
          />
          <div style={{ lineHeight: 1.2 }}>
            <Title
              level={4}
              style={{ margin: 0, fontSize: "16px", lineHeight: 1.2 }}
            >
              {config.appTitle}
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: "11px", lineHeight: 1.2 }}
            >
              {appInfo?.description || "AI 智能助手"}
            </Text>
          </div>
        </Space>
      </Header>

      <Content
        style={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f5f5f5",
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
          }}
        >
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput
          onSendMessage={handleSendMessage}
          loading={loading}
          disabled={false}
          placeholder="输入您的问题..."
        />
      </Content>
    </Layout>
  );
};

export default ChatInterface;
