"use client";

import React, { useState } from "react";
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
  Clock,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";

interface Message {
  id: number;
  recipient: string;
  message: string;
  status: "Delivered" | "Failed" | "Pending";
  sentTime: string;
  deliveredTime: string;
  duration: string;
  user: string;
}

function Report() {
  const cards = [
    {
      title: "Total Messages",
      value: "15,234",
      change: "+12.5% this month",
      trend: "up",
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
      value: "14,890",
      change: "+15.2% this month",
      trend: "up",
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
      value: "344",
      change: "-8.4% this month",
      trend: "down",
      icon: XCircle,
      style: {
        bg: "from-red-50/80 to-rose-50/80",
        icon: "from-red-600 to-rose-700",
        text: "text-red-700",
        change: "text-red-600",
      },
    },
  ];

  const [messages] = useState<Message[]>([
    {
      id: 1,
      recipient: "+1 234-567-8900",
      message: "Your OTP is 123456",
      status: "Delivered",
      sentTime: "2024-03-15 10:30:00",
      deliveredTime: "2024-03-15 10:30:02",
      duration: "2s",
      user: "John Doe",
    },
    {
      id: 2,
      recipient: "+1 234-567-8901",
      message: "Your appointment is confirmed",
      status: "Failed",
      sentTime: "2024-03-15 10:35:00",
      deliveredTime: "-",
      duration: "-",
      user: "Jane Smith",
    },
    {
      id: 3,
      recipient: "+1 234-567-8902",
      message: "Welcome to our service!",
      status: "Delivered",
      sentTime: "2024-03-15 10:40:00",
      deliveredTime: "2024-03-15 10:40:03",
      duration: "3s",
      user: "Bob Wilson",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.user.toLowerCase().includes(searchTerm.toLowerCase());

    const messageDate = new Date(message.sentTime);
    const fromDate = dateRange.from ? new Date(dateRange.from) : null;
    const toDate = dateRange.to ? new Date(dateRange.to) : null;

    const matchesDateRange =
      (!fromDate || messageDate >= fromDate) &&
      (!toDate || messageDate <= toDate);

    return matchesSearch && matchesDateRange;
  });

  return (
    <div className="w-full space-y-6 min-h-[85vh] bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Message Reports</h1>
        <Button className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${card.style.bg} rounded-xl p-4 shadow hover:shadow-lg transition-all duration-300 border border-gray-100`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br ${card.style.icon} rounded-lg shadow`}
              >
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-1">
                {card.trend === "up" ? (
                  <TrendingUp className={`w-3.5 h-3.5 ${card.style.change}`} />
                ) : (
                  <TrendingDown
                    className={`w-3.5 h-3.5 ${card.style.change}`}
                  />
                )}
                <span className={`text-xs font-semibold ${card.style.change}`}>
                  {card.change}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                {card.title}
              </h3>
              <p className={`text-2xl font-bold ${card.style.text}`}>
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-gray-200 p-5 rounded-md shadow-sm ">
        <h1 className="text-3xl font-semibold ">Filter Reports</h1>
        <div className="flex flex-col md:flex-row gap-4 ">
          <Input
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex gap-2">
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange({ ...dateRange, from: e.target.value })
              }
              className="w-40"
            />
            <span className="text-gray-500 self-center">to</span>
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
              className="w-40"
            />
          </div>
        </div>
      </div>

      <Card className="p-5">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Recipient</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent Time</TableHead>
              <TableHead>Delivered Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMessages.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No messages found
                </TableCell>
              </TableRow>
            ) : (
              filteredMessages.map((message) => (
                <TableRow key={message.id} className="py-2 my-2">
                  <TableCell className="py-4">{message.recipient}</TableCell>
                  <TableCell className="py-4">
                    <div className="max-w-xs truncate">{message.message}</div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
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
                  <TableCell className="py-4">{message.sentTime}</TableCell>
                  <TableCell className="py-4">{message.deliveredTime}</TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      {message.duration}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">{message.user}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default Report;
