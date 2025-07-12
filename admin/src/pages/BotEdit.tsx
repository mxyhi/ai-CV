import React, { useState, useEffect } from "react";
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
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  RobotOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { botsAPI } from "../services/api";
import { Bot, UpdateBotForm } from "../types";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const BotEdit: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [bot, setBot] = useState<Bot | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 获取机器人详情
  const fetchBot = async () => {
    if (!id) {
      message.error("机器人ID不存在");
      navigate("/bots");
      return;
    }

    try {
      setPageLoading(true);
      const data = await botsAPI.getById(id);
      setBot(data);
      setAvatarUrl(data.avatar || "");
    } catch (error: any) {
      message.error(error.response?.data?.message || "获取机器人信息失败");
      navigate("/bots");
    } finally {
      setPageLoading(false);
    }
  };

  // 当机器人数据加载完成后设置表单初始值
  useEffect(() => {
    if (bot && form) {
      form.setFieldsValue({
        name: bot.name,
        description: bot.description,
        category: bot.category,
        difyApiKey: bot.difyApiKey,
        difyBaseUrl: bot.difyBaseUrl,
        welcomeMessage: bot.welcomeMessage,
        fallbackMessage: bot.fallbackMessage,
        maxTokens: bot.maxTokens,
        temperature: bot.temperature,
        isActive: bot.isActive,
        isPublic: bot.isPublic,
      });
    }
  }, [bot, form]);

  useEffect(() => {
    fetchBot();
  }, [id]);

  const handleSubmit = async (values: UpdateBotForm) => {
    if (!id) return;

    try {
      setLoading(true);
      const formData = {
        ...values,
        avatar: avatarUrl || undefined,
      };
      await botsAPI.update(id, formData);
      message.success("机器人更新成功");
      navigate("/bots");
    } catch (error: any) {
      message.error(error.response?.data?.message || "更新失败");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (info: any) => {
    if (info.file.status === "done") {
      setAvatarUrl(info.file.response?.url || "");
    }
  };

  if (pageLoading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!bot) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Text>机器人不存在</Text>
      </div>
    );
  }

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
              编辑机器人 - {bot.name}
            </Title>
          </Space>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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

              <Form.Item label="头像">
                <Space direction="vertical" align="center">
                  <Avatar
                    size={80}
                    src={avatarUrl || null}
                    icon={<RobotOutlined />}
                  />
                  <Upload
                    name="avatar"
                    showUploadList={false}
                    action="/api/upload"
                    onChange={handleAvatarChange}
                  >
                    <Button icon={<UploadOutlined />}>更换头像</Button>
                  </Upload>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    支持 JPG、PNG 格式，建议尺寸 200x200
                  </Text>
                </Space>
              </Form.Item>

              <Form.Item label="类别" name="category">
                <Select>
                  <Option value="CUSTOMER_SERVICE">客服</Option>
                  <Option value="SALES">销售</Option>
                  <Option value="SUPPORT">技术支持</Option>
                  <Option value="GENERAL">通用</Option>
                </Select>
              </Form.Item>
            </div>

            <div>
              <Form.Item label="Dify 应用 ID">
                <Input value={bot.difyAppId} disabled />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Dify 应用 ID 不可修改
                </Text>
              </Form.Item>

              <Form.Item
                label="Dify API 密钥"
                name="difyApiKey"
                rules={[{ required: true, message: "请输入 Dify API 密钥" }]}
              >
                <Input.Password placeholder="请输入 Dify API 密钥" />
              </Form.Item>

              <Form.Item label="Dify API 基础 URL" name="difyBaseUrl">
                <Input placeholder="http://localhost/api" />
              </Form.Item>

              <Form.Item label="欢迎消息" name="welcomeMessage">
                <TextArea rows={2} placeholder="用户开始对话时的欢迎消息" />
              </Form.Item>

              <Form.Item label="兜底回复" name="fallbackMessage">
                <TextArea
                  rows={2}
                  placeholder="当机器人无法理解用户意图时的回复"
                />
              </Form.Item>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: "24px",
              marginTop: "24px",
            }}
          >
            <Form.Item label="最大令牌数" name="maxTokens">
              <InputNumber
                min={100}
                max={8000}
                style={{ width: "100%" }}
                placeholder="4000"
              />
            </Form.Item>

            <Form.Item label="温度参数" name="temperature">
              <InputNumber
                min={0}
                max={2}
                step={0.1}
                style={{ width: "100%" }}
                placeholder="0.7"
              />
            </Form.Item>

            <Form.Item label="启用状态" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item label="公开访问" name="isPublic" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>

          <Form.Item style={{ marginTop: "32px" }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                保存更改
              </Button>
              <Button onClick={() => navigate("/bots")}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BotEdit;
