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
  Input,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  RobotOutlined,
  KeyOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { botsAPI } from "../services/api";
import type { Bot } from "../types";
import dayjs from "dayjs";

const { Title } = Typography;

const Bots: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const fetchBots = async (
    page = currentPage,
    size = pageSize,
    search = searchText
  ) => {
    try {
      setLoading(true);
      const data = await botsAPI.getList({
        page,
        limit: size,
        search: search || undefined,
      });
      // server现在返回分页格式 {data: [], total: number, page: number, limit: number}
      const result = data as any;
      setBots(result.data || []);
      setTotal(result.total || 0);
      setCurrentPage(page);
      setPageSize(size);
    } catch (error) {
      message.error("获取机器人列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
    fetchBots(1, pageSize, value);
  };

  const handleTableChange = (pagination: any) => {
    const { current, pageSize: size } = pagination;
    fetchBots(current, size, searchText);
  };

  const handleDelete = async (id: string) => {
    try {
      await botsAPI.delete(id);
      message.success("删除成功");
      fetchBots();
    } catch (error) {
      message.error("删除失败");
    }
  };

  const handleSync = async (id: string) => {
    try {
      await botsAPI.sync(id);
      message.success("同步成功");
      fetchBots();
    } catch (error: any) {
      message.error(error.response?.data?.message || "同步失败");
    }
  };

  const handleValidateConnection = async (id: string) => {
    try {
      const result = (await botsAPI.validateDifyConnection(id)) as any;
      if (result.valid) {
        message.success("Dify连接验证成功");
      } else {
        message.error("Dify连接验证失败");
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "验证失败");
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
      title: "创建者",
      dataIndex: "user",
      key: "user",
      render: (user: any) => user?.name || user?.username || "未知",
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
      width: 240,
      render: (_: any, record: Bot) => (
        <Space size="small" wrap style={{ maxWidth: 240 }}>
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
          <Button
            type="link"
            icon={<SyncOutlined />}
            onClick={() => handleSync(record.id)}
            size="small"
            title="从Dify同步信息"
          >
            同步
          </Button>
          <Button
            type="link"
            icon={<CheckCircleOutlined />}
            onClick={() => handleValidateConnection(record.id)}
            size="small"
            title="验证Dify连接"
          >
            验证
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
          <Space>
            <Input.Search
              placeholder="搜索机器人名称或描述"
              allowClear
              style={{ width: 250 }}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/bots/create")}
            >
              创建机器人
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={bots}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default Bots;
