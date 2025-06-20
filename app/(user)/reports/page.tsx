"use client";
import React, { useEffect, useState } from "react";
import { DatePicker, Select, Input, Button, Table, Tag } from "antd";
import { FilterFilled } from "@ant-design/icons";
import { useWhatsapp } from "@/context/WhatsappContext";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/Protected";
import type { TablePaginationConfig } from "antd/es/table";

interface Message {
  sendFrom: string;
  sendTo: string;
  text: string;
  status: string;
  sendThrough: string;
  createdAt: string;
}

interface DateRange {
  from?: string;
  to?: string;
}

interface Filters {
  sender: string;
  status: string;
  search: string;
}

const columns = [
  {
    title: "S.No",
    key: "sno",
    render: (_:any, __:any  , index:number) => (index+1),
  },
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
    title: "Mode",
    dataIndex: "sendThrough",
    key: "sendThrough",
  },
  {
    title: "Time",
    dataIndex: "createdAt",
    key: "time",
    render: (date: string) => new Date(date).toLocaleString(),
  },
];

function MessageReports() {
  const { allMessages, getAllMessages } = useWhatsapp();
  const { totalMessages = 0, data = [] } = !allMessages
    ? {
        totalMessages: 0,
        data: [],
      }
    : Array.isArray(allMessages)
    ? {
        totalMessages: allMessages.length,
        data: allMessages,
      }
    : {
        totalMessages:
          (allMessages as { totalMessages?: number }).totalMessages || 0,
        data: (allMessages as { data?: Message[] }).data || [],
      };
  const { loading: authLoading } = useAuth();
  const [msgData, setMsgData] = useState<Message[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [filters, setFilters] = useState<Filters>({
    sender: "all",
    status: "all",
    search: "",
  });

  const fetchMessages = async (
    page: number,
    limit: number,
    dateFilters?: DateRange
  ) => {
    try {
      await getAllMessages(limit, page, dateFilters);
    } catch (error) {
      toast.error("Error while fetching data");
    }
  };

  const handleRefresh = () => {
    fetchMessages(currentPage, pageSize, dateRange);
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    if (pagination.current && pagination.pageSize) {
      setCurrentPage(pagination.current);
      setPageSize(pagination.pageSize);
      fetchMessages(pagination.current, pagination.pageSize, dateRange);
    }
  };

  const handleDateChange = (_: any, dateStrings: [string, string]) => {
    if (dateStrings[0] || dateStrings[1]) {
      setDateRange({
        from: dateStrings[0] ? `${dateStrings[0]}T00:00:00Z` : undefined,
        to: dateStrings[1] ? `${dateStrings[1]}T23:59:59Z` : undefined,
      });
    } else {
      setDateRange({});
    }
  };

  const handleApplyFilters = () => {
    fetchMessages(1, pageSize, dateRange);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchMessages(currentPage, pageSize);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (filters.search) {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters.search]);

  useEffect(() => {
    if (data) {
      let filteredData = [...data];

      if (filters.status !== "all") {
        filteredData = filteredData.filter(
          (msg) => msg.status === filters.status
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(
          (msg) =>
            msg.sendTo?.toLowerCase().includes(searchLower) ||
            msg.sendFrom?.toLowerCase().includes(searchLower) ||
            msg.text?.toLowerCase().includes(searchLower)
        );
      }

      setMsgData(filteredData);
    } else {
      setMsgData([]);
    }
  }, [allMessages, filters.status, filters.search]);

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
          type="primary"
          size="middle"
          className="ml-2"
          loading={authLoading}
        >
          Refresh
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Date Range
            </label>
            <DatePicker.RangePicker
              className="w-full"
              onChange={handleDateChange}
              format="YYYY-MM-DD"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Message Status
            </label>
            <Select
              value={filters.status}
              onChange={(value: string) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
              className="w-full"
              options={[
                { value: "all", label: "All statuses" },
                { value: "delivered", label: "Delivered" },
                { value: "error", label: "Failed" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Search</label>
            <Input
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              placeholder="Search by recipient or message"
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleApplyFilters}
            type="primary"
            size="middle"
            className="ml-2"
            icon={<FilterFilled />}
          >
            Apply Filters
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <Table<Message>
          columns={columns}
          dataSource={msgData}
          className="bg-white rounded-lg shadow-sm"
          onChange={handleTableChange}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalMessages || 50,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
          }}
          rowKey={(record) => record.sendFrom + record.createdAt}
        />
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <ProtectedRoute>
      <MessageReports />
    </ProtectedRoute>
  );
}
