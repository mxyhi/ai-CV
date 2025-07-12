import React, { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Typography, Space, Spin } from "antd";
import {
  RobotOutlined,
  MessageOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { botsAPI } from "../services/api";
import { Bot } from "../types";

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const botsData = await botsAPI.getList();
        setBots(botsData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeBots = bots.filter((bot) => bot.isActive);
  const totalConversations = bots.reduce(
    (sum, bot) => sum + (bot._count?.conversations || 0),
    0
  );

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={2}>仪表板</Title>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="总机器人数"
                value={bots.length}
                prefix={<RobotOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="活跃机器人"
                value={activeBots.length}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="总对话数"
                value={totalConversations}
                prefix={<MessageOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="最近创建的机器人" size="small">
              <Space direction="vertical" style={{ width: "100%" }}>
                {bots
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .slice(0, 5)
                  .map((bot) => (
                    <div
                      key={bot.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <Space>
                        <RobotOutlined
                          style={{
                            color: bot.isActive ? "#52c41a" : "#d9d9d9",
                          }}
                        />
                        <span>{bot.name}</span>
                      </Space>
                      <span style={{ color: "#999", fontSize: "12px" }}>
                        {new Date(bot.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                {bots.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#999",
                      padding: "20px",
                    }}
                  >
                    暂无机器人
                  </div>
                )}
              </Space>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="机器人类别分布" size="small">
              <Space direction="vertical" style={{ width: "100%" }}>
                {["CUSTOMER_SERVICE", "SALES", "SUPPORT", "GENERAL"].map(
                  (category) => {
                    const count = bots.filter(
                      (bot) => bot.category === category
                    ).length;
                    const categoryNames = {
                      CUSTOMER_SERVICE: "客服",
                      SALES: "销售",
                      SUPPORT: "技术支持",
                      GENERAL: "通用",
                    };

                    return (
                      <div
                        key={category}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 0",
                          borderBottom: "1px solid #f0f0f0",
                        }}
                      >
                        <span>
                          {
                            categoryNames[
                              category as keyof typeof categoryNames
                            ]
                          }
                        </span>
                        <span style={{ fontWeight: "bold" }}>{count}</span>
                      </div>
                    );
                  }
                )}
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default Dashboard;
