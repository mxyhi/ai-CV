import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Avatar,
  Popconfirm,
  message,
  Typography,
  Card,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  RobotOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { botsAPI } from "../services/api";
import type { Bot } from "../types";
import dayjs from "dayjs";

const { Title } = Typography;

const Bots: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBots = async () => {
    try {
      setLoading(true);
      const data = await botsAPI.getList();
      setBots(data as unknown as Bot[]);
    } catch (error) {
      message.error("获取机器人列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await botsAPI.delete(id);
      message.success("删除成功");
      fetchBots();
    } catch (error) {
      message.error("删除失败");
    }
  };

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

  const columns = [
    {
      title: "机器人",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Bot) => (
        <Space>
          <Avatar src={record.avatar} icon={<RobotOutlined />} size="small" />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "类别",
      dataIndex: "category",
      key: "category",
      render: (category: keyof typeof categoryNames) => (
        <Tag color={categoryColors[category]}>{categoryNames[category]}</Tag>
      ),
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
      title: "对话数",
      dataIndex: ["_count", "conversations"],
      key: "conversations",
      render: (count: number) => count || 0,
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
      width: 180,
      render: (_: any, record: Bot) => (
        <Space size="small" wrap style={{ maxWidth: 180 }}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/bots/${record.id}/edit`)}
            size="small"
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<KeyOutlined />}
            onClick={() => navigate(`/bots/${record.id}/api-keys`)}
            size="small"
          >
            API密钥
          </Button>
          <Popconfirm
            title="确定要删除这个机器人吗？"
            description="删除后将无法恢复，相关对话记录也会被删除。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              删除
            </Button>
          </Popconfirm>
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
          <Title level={3} style={{ margin: 0 }}>
            机器人管理
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/bots/create")}
          >
            创建机器人
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={bots}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  );
};

export default Bots;
