import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  message,
  Typography,
  Card,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  Tooltip,
  Drawer,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  KeyOutlined,
  CopyOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { apiKeysAPI, botsAPI } from "../services/api";
import type { ApiKey, CreateApiKeyForm, UpdateApiKeyForm, Bot } from "../types";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const ApiKeys: React.FC = () => {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchApiKeys = async () => {
    if (!botId) return;

    try {
      setLoading(true);
      const [apiKeysData, botData] = await Promise.all([
        apiKeysAPI.getByBot(botId),
        botsAPI.getById(botId),
      ]);
      setApiKeys(apiKeysData.data || []);
      setBot(botData as unknown as Bot);
    } catch (error) {
      message.error("获取API密钥列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, [botId]);

  const handleCreate = async (values: CreateApiKeyForm) => {
    if (!botId) return;

    try {
      const result = (await apiKeysAPI.create(
        botId,
        values
      )) as unknown as ApiKey;
      message.success("API密钥创建成功");

      // 显示完整密钥
      Modal.success({
        title: "API密钥创建成功",
        width: 600,
        content: (
          <div>
            <p>请妥善保存以下API密钥，它只会显示一次：</p>
            <div
              style={{
                background: "#f5f5f5",
                padding: "12px",
                borderRadius: "4px",
                fontFamily: "monospace",
                wordBreak: "break-all",
              }}
            >
              {result.key}
            </div>
            <p style={{ marginTop: "12px", color: "#666" }}>
              您可以使用此密钥来访问机器人的API接口。
            </p>
          </div>
        ),
      });

      setCreateModalVisible(false);
      createForm.resetFields();
      fetchApiKeys();
    } catch (error) {
      message.error("创建失败");
    }
  };

  const handleUpdate = async (values: UpdateApiKeyForm) => {
    if (!selectedApiKey) return;

    try {
      await apiKeysAPI.update(selectedApiKey.id, values);
      message.success("更新成功");
      setEditModalVisible(false);
      editForm.resetFields();
      setSelectedApiKey(null);
      fetchApiKeys();
    } catch (error) {
      message.error("更新失败");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiKeysAPI.delete(id);
      message.success("删除成功");
      fetchApiKeys();
    } catch (error) {
      message.error("删除失败");
    }
  };

  const handleRegenerate = async (id: string) => {
    try {
      const result = (await apiKeysAPI.regenerate(id)) as unknown as ApiKey;
      message.success("API密钥重新生成成功");

      // 显示新的完整密钥
      Modal.success({
        title: "API密钥重新生成成功",
        width: 600,
        content: (
          <div>
            <p>新的API密钥：</p>
            <div
              style={{
                background: "#f5f5f5",
                padding: "12px",
                borderRadius: "4px",
                fontFamily: "monospace",
                wordBreak: "break-all",
              }}
            >
              {result.key}
            </div>
            <p style={{ marginTop: "12px", color: "#666" }}>
              旧密钥已失效，请使用新密钥。
            </p>
          </div>
        ),
      });

      fetchApiKeys();
    } catch (error) {
      message.error("重新生成失败");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success("已复制到剪贴板");
    });
  };

  const showEditModal = (apiKey: ApiKey) => {
    setSelectedApiKey(apiKey);
    editForm.setFieldsValue({
      name: apiKey.name,
      isActive: apiKey.isActive,
      permissions: apiKey.permissions,
      rateLimit: apiKey.rateLimit,
      expiresAt: apiKey.expiresAt ? dayjs(apiKey.expiresAt) : null,
    });
    setEditModalVisible(true);
  };

  const showDetailDrawer = (apiKey: ApiKey) => {
    setSelectedApiKey(apiKey);
    setDetailDrawerVisible(true);
  };

  const columns = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <Space>
          <KeyOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: "密钥前缀",
      dataIndex: "keyPrefix",
      key: "keyPrefix",
      render: (prefix: string) => <Text code>{prefix}</Text>,
    },
    {
      title: "权限",
      dataIndex: "permissions",
      key: "permissions",
      render: (permissions: string) => <Tag color="blue">{permissions}</Tag>,
    },
    {
      title: "状态",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "success" : "default"}>
          {isActive ? "活跃" : "禁用"}
        </Tag>
      ),
    },
    {
      title: "使用次数",
      dataIndex: "usageCount",
      key: "usageCount",
      render: (count: number) => count || 0,
    },
    {
      title: "最后使用",
      dataIndex: "lastUsedAt",
      key: "lastUsedAt",
      render: (date: string) =>
        date ? dayjs(date).format("YYYY-MM-DD HH:mm") : "从未使用",
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      render: (_: any, record: ApiKey) => (
        <Space size="small" wrap>
          <Tooltip title="查看详情">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => showDetailDrawer(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="重新生成">
            <Popconfirm
              title="确定要重新生成此API密钥吗？"
              description="重新生成后，旧密钥将立即失效。"
              onConfirm={() => handleRegenerate(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" icon={<ReloadOutlined />} size="small" />
            </Popconfirm>
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个API密钥吗？"
              description="删除后将无法恢复，使用此密钥的应用将无法访问。"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0 }}>
              API密钥管理
            </Title>
            {bot && <Text type="secondary">机器人：{bot.name}</Text>}
          </div>
          <Space>
            <Button onClick={() => navigate("/bots")}>返回机器人列表</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              创建API密钥
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={apiKeys}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 创建API密钥模态框 */}
      <Modal
        title="创建API密钥"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{
            permissions: "chat",
            rateLimit: 100,
          }}
        >
          <Form.Item
            label="密钥名称"
            name="name"
            rules={[{ required: true, message: "请输入密钥名称" }]}
          >
            <Input placeholder="请输入密钥名称，便于识别" />
          </Form.Item>

          <Form.Item
            label="权限范围"
            name="permissions"
            rules={[{ required: true, message: "请选择权限范围" }]}
          >
            <Select placeholder="请选择权限范围">
              <Option value="chat">聊天</Option>
              <Option value="chat,admin">聊天+管理</Option>
            </Select>
          </Form.Item>

          <Form.Item label="请求限制（每小时）" name="rateLimit">
            <InputNumber
              min={1}
              max={10000}
              placeholder="每小时最大请求次数"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item label="过期时间" name="expiresAt">
            <DatePicker
              showTime
              placeholder="选择过期时间（可选）"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setCreateModalVisible(false);
                  createForm.resetFields();
                }}
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑API密钥模态框 */}
      <Modal
        title="编辑API密钥"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
          setSelectedApiKey(null);
        }}
        footer={null}
        width={600}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            label="密钥名称"
            name="name"
            rules={[{ required: true, message: "请输入密钥名称" }]}
          >
            <Input placeholder="请输入密钥名称" />
          </Form.Item>

          <Form.Item label="状态" name="isActive" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item
            label="权限范围"
            name="permissions"
            rules={[{ required: true, message: "请选择权限范围" }]}
          >
            <Select placeholder="请选择权限范围">
              <Option value="chat">聊天</Option>
              <Option value="chat,admin">聊天+管理</Option>
            </Select>
          </Form.Item>

          <Form.Item label="请求限制（每小时）" name="rateLimit">
            <InputNumber
              min={1}
              max={10000}
              placeholder="每小时最大请求次数"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item label="过期时间" name="expiresAt">
            <DatePicker
              showTime
              placeholder="选择过期时间（可选）"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setEditModalVisible(false);
                  editForm.resetFields();
                  setSelectedApiKey(null);
                }}
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                更新
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* API密钥详情抽屉 */}
      <Drawer
        title="API密钥详情"
        placement="right"
        width={500}
        open={detailDrawerVisible}
        onClose={() => {
          setDetailDrawerVisible(false);
          setSelectedApiKey(null);
        }}
      >
        {selectedApiKey && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <Title level={5}>基本信息</Title>
              <div style={{ marginBottom: 12 }}>
                <Text strong>名称：</Text>
                <Text>{selectedApiKey.name}</Text>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>密钥前缀：</Text>
                <Text code>{selectedApiKey.keyPrefix}</Text>
                <Button
                  type="link"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(selectedApiKey.keyPrefix)}
                >
                  复制
                </Button>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>状态：</Text>
                <Tag color={selectedApiKey.isActive ? "success" : "default"}>
                  {selectedApiKey.isActive ? "活跃" : "禁用"}
                </Tag>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>权限：</Text>
                <Tag color="blue">{selectedApiKey.permissions}</Tag>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <Title level={5}>使用统计</Title>
              <div style={{ marginBottom: 12 }}>
                <Text strong>使用次数：</Text>
                <Text>{selectedApiKey.usageCount}</Text>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>最后使用：</Text>
                <Text>
                  {selectedApiKey.lastUsedAt
                    ? dayjs(selectedApiKey.lastUsedAt).format(
                        "YYYY-MM-DD HH:mm:ss"
                      )
                    : "从未使用"}
                </Text>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>请求限制：</Text>
                <Text>{selectedApiKey.rateLimit || "无限制"} 次/小时</Text>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <Title level={5}>时间信息</Title>
              <div style={{ marginBottom: 12 }}>
                <Text strong>创建时间：</Text>
                <Text>
                  {dayjs(selectedApiKey.createdAt).format(
                    "YYYY-MM-DD HH:mm:ss"
                  )}
                </Text>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>更新时间：</Text>
                <Text>
                  {dayjs(selectedApiKey.updatedAt).format(
                    "YYYY-MM-DD HH:mm:ss"
                  )}
                </Text>
              </div>
              {selectedApiKey.expiresAt && (
                <div style={{ marginBottom: 12 }}>
                  <Text strong>过期时间：</Text>
                  <Text>
                    {dayjs(selectedApiKey.expiresAt).format(
                      "YYYY-MM-DD HH:mm:ss"
                    )}
                  </Text>
                </div>
              )}
            </div>

            <div>
              <Title level={5}>操作</Title>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  block
                  icon={<EditOutlined />}
                  onClick={() => {
                    setDetailDrawerVisible(false);
                    showEditModal(selectedApiKey);
                  }}
                >
                  编辑密钥
                </Button>
                <Popconfirm
                  title="确定要重新生成此API密钥吗？"
                  description="重新生成后，旧密钥将立即失效。"
                  onConfirm={() => {
                    setDetailDrawerVisible(false);
                    handleRegenerate(selectedApiKey.id);
                  }}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button block icon={<ReloadOutlined />}>
                    重新生成密钥
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title="确定要删除这个API密钥吗？"
                  description="删除后将无法恢复，使用此密钥的应用将无法访问。"
                  onConfirm={() => {
                    setDetailDrawerVisible(false);
                    handleDelete(selectedApiKey.id);
                  }}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button block danger icon={<DeleteOutlined />}>
                    删除密钥
                  </Button>
                </Popconfirm>
              </Space>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ApiKeys;
