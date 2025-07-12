import React from "react";
import { Avatar, Typography, Spin } from "antd";
import {
  UserOutlined,
  RobotOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import type { ChatMessage as ChatMessageType } from "../types";
import dayjs from "dayjs";

const { Text } = Typography;

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "USER";
  const isSystem = message.role === "SYSTEM";
  const isAssistant = message.role === "ASSISTANT";
  const isLoading = isAssistant && !message.content.trim();

  if (isSystem) {
    return (
      <div
        style={{
          textAlign: "center",
          margin: "16px 0",
          color: "#999",
          fontSize: "12px",
        }}
      >
        {message.content}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
        marginBottom: "16px",
        gap: "8px",
      }}
    >
      <Avatar
        size={32}
        src={isUser ? undefined : message.avatar}
        icon={isUser ? <UserOutlined /> : <RobotOutlined />}
        style={{
          backgroundColor: isUser ? "#1890ff" : "#52c41a",
          flexShrink: 0,
        }}
      />

      <div
        style={{
          maxWidth: "70%",
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
        }}
      >
        <div
          style={{
            marginBottom: "4px",
            fontSize: "12px",
            color: "#999",
          }}
        >
          {isUser ? message.userName || "我" : message.botName || "AI助手"}
          <span style={{ marginLeft: "8px" }}>
            {dayjs(message.timestamp).format("HH:mm")}
          </span>
        </div>

        <div
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            backgroundColor: isUser ? "#1890ff" : "#f5f5f5",
            color: isUser ? "#fff" : "#000",
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            minHeight: isLoading ? "40px" : "auto",
            display: "flex",
            alignItems: isLoading ? "center" : "flex-start",
          }}
        >
          {isLoading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#999",
              }}
            >
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />}
                size="small"
              />
              <Text style={{ color: "#999", fontSize: "12px" }}>
                AI正在思考中...
              </Text>
            </div>
          ) : (
            <Text style={{ color: "inherit" }}>{message.content}</Text>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
