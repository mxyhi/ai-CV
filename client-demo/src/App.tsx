import { ConfigProvider, Alert } from "antd";
import zhCN from "antd/locale/zh_CN";
import ChatInterface from "./components/ChatInterface";
import { config } from "./config";
import "antd/dist/reset.css";

function App() {
  // 检查 API Key 配置
  if (!config.apiKey) {
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
            message="配置错误"
            description="请配置 VITE_API_KEY 环境变量"
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
        <ChatInterface />
      </div>
    </ConfigProvider>
  );
}

export default App;
