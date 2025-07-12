import React, { useState, useEffect, useRef } from "react";
import { Layout, Typography, Avatar, Space, message } from "antd";
import { RobotOutlined } from "@ant-design/icons";
import type {
  Bot,
  ChatMessage as ChatMessageType,
  StartConversationResponse,
  SendMessageResponse,
} from "../types";
import { chatAPI } from "../services/api";
import { config } from "../config";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface ChatInterfaceProps {
  bot: Bot;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ bot }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [conversationId, setConversationId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 生成用户ID（实际项目中应该从用户系统获取）
  const userId = `user_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  const userName = "访客";

  useEffect(() => {
    initializeConversation();
  }, [bot.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeConversation = async () => {
    try {
      setInitializing(true);
      const response: StartConversationResponse =
        await chatAPI.startConversation({
          botId: bot.id,
          userId,
          userName,
        });

      setConversationId(response.conversationId);

      // 转换消息格式
      const chatMessages: ChatMessageType[] = response.messages.map(
        (msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.createdAt),
          avatar: msg.role === "ASSISTANT" ? bot.avatar : undefined,
          userName: msg.role === "USER" ? userName : undefined,
          botName: msg.role === "ASSISTANT" ? bot.name : undefined,
        })
      );

      // 如果没有消息，添加欢迎消息
      if (chatMessages.length === 0) {
        const welcomeMessage: ChatMessageType = {
          id: `welcome_${Date.now()}`,
          content:
            bot.welcomeMessage || "您好！我是AI客服，有什么可以帮助您的吗？",
          role: "ASSISTANT",
          timestamp: new Date(),
          avatar: bot.avatar,
          botName: bot.name,
        };
        chatMessages.push(welcomeMessage);
      }

      setMessages(chatMessages);
    } catch (error) {
      message.error("初始化对话失败");
      console.error("Failed to initialize conversation:", error);
    } finally {
      setInitializing(false);
    }
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!conversationId) {
      message.error("对话未初始化");
      return;
    }

    // 添加用户消息到界面
    const userMessage: ChatMessageType = {
      id: `temp_${Date.now()}`,
      content: messageContent,
      role: "USER",
      timestamp: new Date(),
      userName,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response: SendMessageResponse = await chatAPI.sendMessage(
        conversationId,
        {
          message: messageContent,
        }
      );

      // 更新用户消息ID
      const updatedUserMessage: ChatMessageType = {
        ...userMessage,
        id: response.userMessage.id,
        timestamp: new Date(response.userMessage.createdAt),
      };

      // 添加机器人回复
      const botMessage: ChatMessageType = {
        id: response.botMessage.id,
        content: response.botMessage.content,
        role: "ASSISTANT",
        timestamp: new Date(response.botMessage.createdAt),
        avatar: bot.avatar,
        botName: bot.name,
      };

      setMessages((prev) => {
        const newMessages = [...prev];
        // 替换临时用户消息
        const tempIndex = newMessages.findIndex(
          (msg) => msg.id === userMessage.id
        );
        if (tempIndex !== -1) {
          newMessages[tempIndex] = updatedUserMessage;
        }
        // 添加机器人回复
        newMessages.push(botMessage);
        return newMessages;
      });

      if (response.error) {
        message.warning("机器人回复可能不完整，请重试");
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

  return (
    <Layout style={{ height: "100vh" }}>
      {config.showBotInfo && (
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
              src={bot.avatar}
              icon={<RobotOutlined />}
              style={{ backgroundColor: "#52c41a" }}
            />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {config.appTitle}
              </Title>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {bot.description || "AI智能客服"}
              </Text>
            </div>
          </Space>
        </Header>
      )}

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
          {initializing ? (
            <div
              style={{
                textAlign: "center",
                padding: "50px",
                color: "#999",
              }}
            >
              正在初始化对话...
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <ChatInput
          onSendMessage={handleSendMessage}
          loading={loading}
          disabled={initializing}
          placeholder={`向 ${bot.name} 发送消息...`}
        />
      </Content>
    </Layout>
  );
};

export default ChatInterface;
