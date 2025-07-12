import React, { useState } from "react";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { Bot } from "./types";
import BotSelector from "./components/BotSelector";
import ChatInterface from "./components/ChatInterface";
import "antd/dist/reset.css";

function App() {
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);

  const handleSelectBot = (bot: Bot) => {
    setSelectedBot(bot);
  };

  const handleBack = () => {
    setSelectedBot(null);
  };

  return (
    <ConfigProvider locale={zhCN}>
      <div style={{ height: "100vh", backgroundColor: "#f5f5f5" }}>
        {selectedBot ? (
          <ChatInterface bot={selectedBot} onBack={handleBack} />
        ) : (
          <BotSelector onSelectBot={handleSelectBot} />
        )}
      </div>
    </ConfigProvider>
  );
}

export default App;
