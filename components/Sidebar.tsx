"use client";
import React, { useState } from "react";
import {
  ApiOutlined,
  BookOutlined,
  BulbOutlined,
  DesktopOutlined,
  InfoOutlined,
  PieChartOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Divider, Layout, Menu, theme } from "antd";

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
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    // <Layout style={{ minHeight: "100vh" }}>
    <Sider
      className="h-screen"
      width={250}
      theme="light"
      collapsed={collapsed}
      collapsible={true}
      onCollapse={(value) => setCollapsed(value)}
    >
      <div className="demo-logo-vertical" />
      <div className="flex items-center gap-2 ml-4  mt-5">
        <img src="/assets/logo.png" alt="msgzone logo" className="w-9" />

        {
          !collapsed && <div>
            <h1 className="text-xl">Msg Zone</h1>
          </div>
        }
      </div>
      <Divider className="mb-8" />
      <Menu
        theme="light"
        defaultSelectedKeys={["1"]}
        mode="inline"
        items={items}
      />
    </Sider>
    // </Layout>
  );
};

export default Sidebar;
