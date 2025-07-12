import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Select,
  Switch,
  InputNumber,
  message,
  Space,
  Upload,
  Avatar,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  RobotOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { botsAPI } from "../services/api";
import type { CreateBotForm } from "../types";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const BotCreate: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (values: CreateBotForm) => {
    try {
      setLoading(true);
      const formData = {
        ...values,
        avatar: avatarUrl || undefined,
      };
      await botsAPI.create(formData);
      message.success("机器人创建成功");
      navigate("/bots");
    } catch (error: any) {
      message.error(error.response?.data?.message || "创建失败");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (info: any) => {
    if (info.file.status === "done") {
      setAvatarUrl(info.file.response?.url || "");
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <div style={{ marginBottom: "24px" }}>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/bots")}
            >
              返回
            </Button>
            <Title level={3} style={{ margin: 0 }}>
              创建机器人
            </Title>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isActive: true,
            difyBaseUrl: "http://localhost/v1",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
            }}
          >
            <div>
              <Form.Item
                label="机器人名称"
                name="name"
                rules={[{ required: true, message: "请输入机器人名称" }]}
              >
                <Input placeholder="请输入机器人名称" />
              </Form.Item>

              <Form.Item label="描述" name="description">
                <TextArea rows={3} placeholder="请输入机器人描述" />
              </Form.Item>

              <Form.Item
                label="启用状态"
                name="isActive"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </div>

            <div>
              <Form.Item
                label="Dify API 密钥"
                name="difyApiKey"
                rules={[{ required: true, message: "请输入 Dify API 密钥" }]}
                extra="从 Dify 应用设置中获取的 API 密钥"
              >
                <Input.Password placeholder="app-xxxxxxxxxxxxxxxxxxxxxxxx" />
              </Form.Item>

              <Form.Item
                label="Dify API 基础 URL"
                name="difyBaseUrl"
                rules={[
                  { required: true, message: "请输入 Dify API 基础 URL" },
                ]}
                extra="Dify 服务的基础 URL，例如：http://localhost/v1"
              >
                <Input placeholder="http://localhost/v1" />
              </Form.Item>
            </div>
          </div>

          <Form.Item style={{ marginTop: "32px" }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                创建机器人
              </Button>
              <Button onClick={() => navigate("/bots")}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BotCreate;
