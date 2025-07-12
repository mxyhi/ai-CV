import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Bots from "./pages/Bots";
import BotCreate from "./pages/BotCreate";
import BotEdit from "./pages/BotEdit";
import ApiKeys from "./pages/ApiKeys";
import "antd/dist/reset.css";

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="bots" element={<Bots />} />
              <Route path="bots/create" element={<BotCreate />} />
              <Route path="bots/:id/edit" element={<BotEdit />} />
              <Route path="bots/:botId/api-keys" element={<ApiKeys />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
