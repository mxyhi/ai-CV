import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Space } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { LoginForm } from "../types";

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // 如果已经登录，重定向到首页
  if (user) {
    return <Navigate to="/" replace />;
  }

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    const success = await login(values.identifier, values.password);
    if (success) {
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%", textAlign: "center" }}
        >
          <div>
            <Title level={2} style={{ marginBottom: 8 }}>
              AI客服机器人
            </Title>
            <Text type="secondary">管理后台</Text>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="identifier"
              rules={[{ required: true, message: "请输入用户名或邮箱!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="用户名或邮箱" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "请输入密码!" }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ width: "100%" }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center" }}>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              测试账号: admin@example.com / admin123456
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Login;
