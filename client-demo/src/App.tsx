import { useState, useEffect } from "react";
import { ConfigProvider, Spin, Alert } from "antd";
import zhCN from "antd/locale/zh_CN";
import type { Bot } from "./types";
import ChatInterface from "./components/ChatInterface";
import { config } from "./config";
import { botsAPI } from "./services/api";
import "antd/dist/reset.css";

function App() {
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBot = async () => {
      try {
        setLoading(true);
        setError(null);

        // 根据配置的机器人ID获取机器人信息
        const response = await botsAPI.getById(config.botId);
        setBot(response);
      } catch (error) {
        console.error("Failed to fetch bot:", error);
        setError(`无法加载机器人信息 (ID: ${config.botId})`);
      } finally {
        setLoading(false);
      }
    };

    fetchBot();
  }, []);

  if (loading) {
    return (
      <ConfigProvider locale={zhCN}>
        <div
          style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Spin size="large" tip="正在加载..." />
        </div>
      </ConfigProvider>
    );
  }

  if (error || !bot) {
    return (
      <ConfigProvider locale={zhCN}>
        <div
          style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f5f5f5",
            padding: "20px",
          }}
        >
          <Alert
            message="加载失败"
            description={error || "未找到指定的机器人"}
            type="error"
            showIcon
            style={{ maxWidth: "400px" }}
          />
        </div>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider locale={zhCN}>
      <div style={{ height: "100vh", backgroundColor: "#f5f5f5" }}>
        <ChatInterface bot={bot} />
      </div>
    </ConfigProvider>
  );
}

export default App;
