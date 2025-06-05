"use client";
import React, { useEffect, useState } from "react";
import { DatePicker, Select, Input, Button, Table, Tag } from "antd";

import { FilterFilled, MoreOutlined } from "@ant-design/icons";
import { useWhatsapp } from "@/context/WhatsappContext";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const columns = [
  {
    title: "Sender",
    dataIndex: "sendFrom",
    key: "sender",
  },
  {
    title: "Recipient",
    dataIndex: "sendTo",
    key: "recipient",
  },
  {
    title: "Message",
    dataIndex: "text",
    key: "message",
    ellipsis: true,
  },

  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => (
      <Tag
        color={
          status === "delivered"
            ? "success"
            : status === "scheduled"
            ? "processing"
            : "error"
        }
        className="rounded-full px-3"
      >
        {status}
      </Tag>
    ),
  },
  {
    title: "Time",
    dataIndex: "createdAt",
    key: "time",
    render: (date: string) => {
      return new Date(date).toLocaleString();
    },
  },
  //   {
  //     title: "Actions",
  //     key: "actions",
  //     render: () => (
  //       <Button
  //         type="text"
  //         icon={<MoreOutlined />}
  //         className="text-gray-500 hover:text-gray-700"
  //       />
  //     ),
  //   },
];

function MessageReports() {
  const { allMessages, getAllMessages } = useWhatsapp();
  const { loading: authLoading } = useAuth();
  const [msgData, setmsgData] = useState<any>([]);
  const handleRefresh = async () => {
    try {
      await getAllMessages();
    } catch (error) {
      toast.error("Errow while refreshing");
    }
  };

  useEffect(() => {
    getAllMessages();
  }, [])
  

  useEffect(() => {
    setmsgData(allMessages);
  }, [allMessages]);
  return (
    <section className="md:my-10 md:mx-10 m-3 w-full">
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-6">Filter Reports</h1>
          <p className="text-gray-600 mb-6">
            Filter your message reports by date, status, and more
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          color="purple"
          variant="solid"
          size="middle"
          className="ml-2"
          loading={authLoading}
        >
          Refresh
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Date Range
            </label>
            <div className="flex gap-2">
              <DatePicker placeholder="From" className="w-full" />
              <DatePicker placeholder="To" className="w-full" />
            </div>
          </div>

          {/* Sender Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Sender Number
            </label>
            <Select
              defaultValue="all"
              className="w-full"
              options={[
                { value: "all", label: "All numbers" },
                { value: "active", label: "Active numbers" },
                { value: "inactive", label: "Inactive numbers" },
              ]}
            />
          </div>

          {/* Message Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Message Status
            </label>
            <Select
              defaultValue="all"
              className="w-full"
              options={[
                { value: "all", label: "All statuses" },
                { value: "delivered", label: "Delivered" },
                { value: "failed", label: "Failed" },
                { value: "pending", label: "Pending" },
              ]}
            />
          </div>

          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Search</label>
            <Input
              placeholder="Search by recipient or message"
              className="w-full"
            />
          </div>
        </div>

        {/* Apply Filters Button */}
        <div className="mt-6 flex justify-end">
          <Button
            color="purple"
            variant="solid"
            size="middle"
            className="ml-2"
            icon={<FilterFilled />}
          >
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Message Reports Table */}
      <div className="mt-8">
        <Table
          columns={columns}
          dataSource={msgData}
          className="bg-white rounded-lg shadow-sm"
          //   pagination={{
          //     total: 100,
          //     pageSize: 10,
          //     showSizeChanger: true,
          //     showQuickJumper: true,
          //     showTotal: (total) => `Total ${total} items`,
          //   }}
        />
      </div>
    </section>
  );
}

export default MessageReports;
