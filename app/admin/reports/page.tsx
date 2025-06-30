"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  CheckCircle2,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useAdminContext } from "@/context/Admin/AdminContext";
import { Select, Tooltip } from "antd";

interface Message {
  recipient: string;
  message: string;
  status: "Delivered" | "Failed" | "Pending";
  sentTime: string;
  type: string;
  sendThrough: string;
  user: string;
  createdAt: string;
}

function Report() {
  const { fetchMessageStats, reportStats, reports, fetchReports } =
    useAdminContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [filters, setFilters] = useState<any>({
    sender: "all",
    status: "all",
    search: "",
  });

  const cards = [
    {
      title: "Total Messages",
      value: reportStats?.totalMessages || 0,
      change: `${reportStats?.percentChange || 0}% this month`,
      trend: Number(reportStats?.percentChange) >= 0 ? "up" : "down",
      icon: MessageCircle,
      style: {
        bg: "from-blue-50/80 to-indigo-50/80",
        icon: "from-blue-600 to-indigo-700",
        text: "text-blue-700",
        change: "text-blue-600",
      },
    },
    {
      title: "Delivered Messages",
      value: reportStats?.deliveredMessages || 0,
      change: `${reportStats?.percentChange || 0}% this month`,
      trend: Number(reportStats?.percentChange) >= 0 ? "up" : "down",
      icon: CheckCircle2,
      style: {
        bg: "from-emerald-50/80 to-teal-50/80",
        icon: "from-emerald-600 to-teal-700",
        text: "text-emerald-700",
        change: "text-emerald-600",
      },
    },
    {
      title: "Failed Messages",
      value: reportStats?.failedMessages || 0,
      change: `${reportStats?.percentChange || 0}% this month`,
      trend: Number(reportStats?.percentChange) >= 0 ? "up" : "down",
      icon: XCircle,
      style: {
        bg: "from-red-50/80 to-rose-50/80",
        icon: "from-red-600 to-rose-700",
        text: "text-red-700",
        change: "text-red-600",
      },
    },
  ];

const filteredMessages = reports?.results || [];

  useEffect(() => {
    fetchMessageStats();
    fetchReports(pageSize, currentPage, dateRange.from, dateRange.to, filters);
  }, [currentPage, pageSize, dateRange.from, dateRange.to, filters]);

  const totalPages = reports?.pagination?.totalPages || 1;

  const handleDateChange = (type: "from" | "to", value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [type]: value,
    }));
    setCurrentPage(1); 
  };

  return (
    <div className="w-full min-h-[85vh] bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Message Reports</h1>
        <Button className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${card.style.bg} rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${card.style.icon} rounded-xl shadow-sm`}
              >
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2">
                {card.trend === "up" ? (
                  <TrendingUp className={`w-4 h-4 ${card.style.change}`} />
                ) : (
                  <TrendingDown className={`w-4 h-4 ${card.style.change}`} />
                )}
                <span className={`text-sm font-semibold ${card.style.change}`}>
                  {card.change}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                {card.title}
              </h3>
              <p className={`text-3xl font-bold ${card.style.text}`}>
                {card.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
        <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-800">Filter Reports</h2>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <Input
              placeholder="Search by user or messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => handleDateChange("from", e.target.value)}
                className="w-full sm:w-40"
              />
              <span className="text-gray-500 hidden sm:inline">to</span>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => handleDateChange("to", e.target.value)}
                className="w-full sm:w-40"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Select
                value={filters.status}
                onChange={(value: string) =>
                  setFilters((prev:any) => ({ ...prev, status: value }))
                }
                className="w-full"
                options={[
                  { value: "all", label: "All statuses" },
                  { value: "delivered", label: "Delivered" },
                  { value: "error", label: "Failed" },
                
                ]}
                placeholder="Select Status"
              />
            </div>
          </div>
        </div>
      </div>

      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 text-sm bg-white"
            >
              {[5, 10, 20, 50].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="text-sm text-gray-600">entries</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-gray-50">
                <TableHead className="font-semibold">S.No</TableHead>
                <TableHead className="font-semibold">Recipient</TableHead>
                <TableHead className="font-semibold">Message</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Sent Time</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Mode</TableHead>
                <TableHead className="font-semibold">Sender</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!filteredMessages || filteredMessages.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-12 text-gray-500"
                  >
                    No messages found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMessages.map((message: Message, index: number) => (
                  <TableRow key={index} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="py-4 font-medium">{index+1}</TableCell>
                    <TableCell className="py-4">{message.recipient}</TableCell>
                    <Tooltip title={message.message} placement="topLeft">
                      <TableCell className="py-4">
                        <div className="max-w-[200px] truncate">{message.message}</div>
                      </TableCell>
                    </Tooltip>
                    <TableCell className="py-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                          message.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : message.status === "Failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {message.status}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap">
                      {new Date(message.sentTime).toLocaleDateString()}{" "}
                      {new Date(message.sentTime).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="py-4">{message.type}</TableCell>
                    <TableCell className="py-4">{message.sendThrough}</TableCell>
                    <TableCell className="py-4">{message.user}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className="text-sm text-gray-600 order-2 sm:order-1">
            Showing {Math.min((reports?.pagination?.page - 1) * reports?.pagination?.limit + 1, reports?.pagination?.total || 0)} to{" "}
            {Math.min(reports?.pagination?.page * reports?.pagination?.limit, reports?.pagination?.total || 0)} of{" "}
            {reports?.pagination?.total || 0} entries
          </div>
          <div className="flex gap-3 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="min-w-[100px]"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="min-w-[100px]"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Report;
