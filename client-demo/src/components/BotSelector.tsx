import React, { useState, useEffect } from "react";
import {
  Card,
  Avatar,
  Typography,
  Tag,
  Button,
  Row,
  Col,
  Spin,
  Empty,
} from "antd";
import { RobotOutlined } from "@ant-design/icons";
import type { Bot } from "../types";
import { botsAPI } from "../services/api";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

interface BotSelectorProps {
  onSelectBot: (bot: Bot) => void;
}

const BotSelector: React.FC<BotSelectorProps> = ({ onSelectBot }) => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const response = await botsAPI.getPublicList();
        setBots(response.data);
      } catch (error) {
        console.error("Failed to fetch bots:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBots();
  }, []);

  const categoryColors = {
    CUSTOMER_SERVICE: "blue",
    SALES: "green",
    SUPPORT: "orange",
    GENERAL: "purple",
  };

  const categoryNames = {
    CUSTOMER_SERVICE: "客服",
    SALES: "销售",
    SUPPORT: "技术支持",
    GENERAL: "通用",
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (bots.length === 0) {
    return (
      <Empty description="暂无可用的机器人" style={{ margin: "50px 0" }} />
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <Title level={2}>选择AI客服机器人</Title>
        <Text type="secondary">选择一个机器人开始对话</Text>
      </div>

      <Row gutter={[16, 16]}>
        {bots.map((bot) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={bot.id}>
            <Card
              hoverable
              style={{ height: "100%" }}
              cover={
                <div
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <Avatar
                    size={64}
                    src={bot.avatar}
                    icon={<RobotOutlined />}
                    style={{ backgroundColor: "#1890ff" }}
                  />
                </div>
              }
              actions={[
                <Button
                  type="primary"
                  onClick={() => onSelectBot(bot)}
                  style={{ width: "80%" }}
                >
                  开始对话
                </Button>,
              ]}
            >
              <Card.Meta
                title={
                  <div style={{ textAlign: "center" }}>
                    <Title level={4} style={{ margin: 0 }}>
                      {bot.name}
                    </Title>
                    <Tag
                      color={
                        categoryColors[
                          bot.category as keyof typeof categoryColors
                        ]
                      }
                      style={{ marginTop: "8px" }}
                    >
                      {
                        categoryNames[
                          bot.category as keyof typeof categoryNames
                        ]
                      }
                    </Tag>
                  </div>
                }
                description={
                  <div style={{ textAlign: "center" }}>
                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      style={{ marginBottom: "8px", minHeight: "44px" }}
                    >
                      {bot.description || "暂无描述"}
                    </Paragraph>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      创建于 {dayjs(bot.createdAt).format("YYYY-MM-DD")}
                    </Text>
                    {bot.user && (
                      <div style={{ marginTop: "4px" }}>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          by {bot.user.name || bot.user.username}
                        </Text>
                      </div>
                    )}
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default BotSelector;
