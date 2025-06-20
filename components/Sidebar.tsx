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
  UsergroupAddOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Divider, Layout, Menu, theme } from "antd";
import { useRouter, usePathname } from "next/navigation";
import api from "@/services/api";
import { ChartNoAxesGantt, ChevronsLeft } from "lucide-react";

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
  getItem("", "9", <ChevronsLeft />),
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const router = useRouter();
  const pathname = usePathname();

  const hideOnPaths = ["/login", "/register", "/verify"];
  const shouldHideSidebar = hideOnPaths.includes(pathname);

  if (shouldHideSidebar) return null;

  return (
    <div
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
      className="transition-all duration-300"
    >
      <Sider
        className="h-screen"
        width={200}
        theme="light"
        collapsed={collapsed}
        collapsible
        collapsedWidth={80}
        trigger={null}
      >
        <div
          className={`flex items-center gap-2 ${
            collapsed ? "justify-center" : "ml-4"
          } mt-5`}
        >
          {collapsed && (
            <ChartNoAxesGantt onClick={() => setCollapsed(false)} />
          )}
          {!collapsed && (
            <>
              <img src="/assets/logo.png" alt="msgzone logo" className="w-9" />
              <div>
                <h1 className="text-xl">Msg Zone</h1>
              </div>
            </>
          )}
        </div>

        <Divider className="mb-5" />
        <Menu
          className="no-highlight"
          theme="light"
          defaultSelectedKeys={["1"]}
          mode="inline"
          onClick={({ key }) => {
            if (key === "9") setCollapsed(true);
            if (key === "1") router.push("/");
            if (key === "2") router.push("/send");
            if (key === "3") router.push("/reports");
            if (key === "6") router.push("/api");
            if (key === "8") {
              (async function logout() {
                await api
                  .get("/auth/logout")
                  .then((res) => {
                    console.log(res.data);
                    window.location.href = "/login";
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
    </div>
  );
};

export default Sidebar;
