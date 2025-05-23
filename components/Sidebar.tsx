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
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Divider, Layout, Menu, theme } from "antd";
import { useRouter, usePathname } from "next/navigation";
import api from "@/services/api";

const { Sider } = Layout;

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
  getItem("Send Message", "2", <DesktopOutlined />),
  getItem("Message Report", "3", <UserOutlined />),
  getItem("Templates", "4", <BookOutlined />),
  getItem("Plans", "5", <BulbOutlined />),
  getItem("Developer API", "6", <ApiOutlined />),
  getItem("Help", "7", <ToolOutlined />),
  getItem("Logout", "8", <LogoutOutlined />),
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const router = useRouter();
  const pathname = usePathname();

  const hideOnPaths = ["/login", "/register"];
  const shouldHideSidebar = hideOnPaths.includes(pathname);

  if (shouldHideSidebar) return null;

  return (
    <Sider
      className="h-screen"
      width={250}
      theme="light"
      collapsed={collapsed}
      collapsible
      onCollapse={(value) => setCollapsed(value)}
    >
      <div className="flex items-center gap-2 ml-4 mt-5">
        <img src="/assets/logo.png" alt="msgzone logo" className="w-9" />
        {!collapsed && (
          <div>
            <h1 className="text-xl">Msg Zone</h1>
          </div>
        )}
      </div>
      <Divider className="mb-8" />
      <Menu
        className="no-highlight"
        theme="light"
        defaultSelectedKeys={["1"]}
        mode="inline"
        onClick={({ key }) => {
          if (key === "1") router.push("/");
          if (key === "2") router.push("/send");
          if (key === "3") router.push("/reports");
          if (key === "6") router.push("/api");
          if (key === "6") router.push("/api");
          if (key === "8") {
            (async function logout() {
              await api
                .get("/auth/logout")
                .then((res) => {
                  console.log(res.data);
                  setTimeout(() => {
                    window.location.reload()
                  }, 500);
                
                })
                .catch((err) => {
                  console.log(err);
                });
            })();
          }
        }}
        items={items}
      />
    </Sider>
  );
};

export default Sidebar;
