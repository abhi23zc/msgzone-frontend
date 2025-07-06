"use client";
import React, { useState } from "react";
import {
  ApiOutlined,
  BookOutlined,
  BulbOutlined,
  DesktopOutlined,
  ToolOutlined,
  UserOutlined,
  PieChartOutlined,
  LogoutOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, Avatar, Typography, Space } from "antd";
import { useRouter, usePathname } from "next/navigation";
import api from "@/services/api";
import { ChartNoAxesGantt, ChevronsLeft, ChevronsRight } from "lucide-react";

const { Sider } = Layout;
const { Text } = Typography;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem("Dashboard", "1", <PieChartOutlined />),
  getItem("Send Message", "2", <MessageOutlined />),
  getItem("Message Report", "3", <BookOutlined />),
  // getItem("Templates", "4", <BookOutlined />),
  getItem("Plans", "5", <BulbOutlined />),
  getItem("Developer API", "6", <ApiOutlined />),
  getItem("Help", "7", <ToolOutlined />),
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const hideOnPaths = ["/login", "/register", "/verify", "/forgot"];
  const shouldHideSidebar = hideOnPaths.includes(pathname);

  if (shouldHideSidebar) return null;

  const handleLogout = async () => {
    try {
      await api.get("/auth/logout");
      window.location.href = "/login";
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
      className="h-screen"
      style={{ 
        boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 1000
      }}
    >
      <Sider
        className="h-full"
        width={280}
        collapsed={collapsed}
        collapsible
        collapsedWidth={80}
        trigger={null}
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: collapsed ? "0" : "0 16px 16px 0",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        {/* Header Section */}
        <div className="px-6 py-8">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            {collapsed ? (
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <ChartNoAxesGantt 
                  className="w-6 h-6 text-white cursor-pointer" 
                  onClick={() => setCollapsed(false)} 
                />
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <img src="/assets/logo.png" alt="msgzone logo" className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-0">Msg Zone</h1>
                  <Text className="text-white/70 text-sm">Communication Hub</Text>
                </div>
                <button
                  onClick={() => setCollapsed(true)}
                  className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ChevronsLeft className="w-4 h-4 text-white" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-4">
          <Menu
            mode="inline"
            defaultSelectedKeys={["1"]}
            style={{
              background: "transparent",
              border: "none",
            }}
            className="custom-menu"
            onClick={({ key }) => {
              if (key === "1") router.push("/");
              if (key === "2") router.push("/send");
              if (key === "3") router.push("/reports");
              if (key === "6") router.push("/api");
              if (key === "5") router.push("/plan");
              if (key === "7") router.push("/help");
            }}
            items={items.map((item:any) => ({
              ...item,
              style: {
                margin: "8px 0",
                borderRadius: "12px",
                height: "48px",
                lineHeight: "48px",
                border: "none",
                transition: "all 0.2s ease-in-out"
              }
            }))}
          />
        </div>

        {/* User Section & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogoutOutlined className="text-lg" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>

        {/* Expand Button for Collapsed State */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-12 bg-white rounded-r-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronsRight className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </Sider>

      <style jsx global>{`
        .custom-menu .ant-menu-item {
          color: rgba(255, 255, 255, 0.8) !important;
          font-weight: 500;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }
        
        .custom-menu .ant-menu-item:hover {
          background: rgba(255, 255, 255, 0.15) !important;
          color: white !important;
          transform: translateX(4px);
        }
        
        .custom-menu .ant-menu-item-selected {
          background: rgba(255, 255, 255, 0.2) !important;
          color: white !important;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .custom-menu .ant-menu-item-selected::after {
          display: none;
        }
        
        .custom-menu .ant-menu-item .ant-menu-item-icon {
          font-size: 18px;
          margin-right: 12px;
        }
        
        .custom-menu .ant-menu-item-selected .ant-menu-item-icon {
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;