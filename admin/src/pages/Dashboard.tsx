import React, { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Typography, Space, Spin } from "antd";
import {
  RobotOutlined,
  MessageOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { botsAPI } from "../services/api";
import type { Bot } from "../types";

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const botsData = await botsAPI.getList();
        setBots(botsData as unknown as Bot[]);
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
        </Row>
      </Space>
    </div>
  );
};

export default Dashboard;
