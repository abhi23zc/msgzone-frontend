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
import { TrendingDown, TrendingUp, Users } from "lucide-react";
import { useAdminContext } from "@/context/Admin/AdminContext";
import { UserModal } from "./UserModal";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  isBlocked: boolean;
  isVerified: boolean;
  devices: {
    deviceId: string;
    status: string;
    lastConnected: string;
  }[];
  createdAt: string;
  plan: {
    name: string;
    expiresAt: string;
    limit: number;
    usedMessages:number;
  };
  usage: {
    messagesSent: number;
    messagesLimit: number;
  };
}

type FilterStatus = "all" | "active" | "inactive";

function UserManagementPage() {
  const [cards, setCards] = useState([
    {
      title: "Total Users",
      value: 0,
      change: "+15.2% this month",
      trend: "up",
      icon: Users,
      style: {
        bg: "from-blue-50/80 to-indigo-50/80",
        icon: "from-blue-600 to-indigo-700",
        text: "text-blue-700",
        change: "text-blue-600",
      },
    },
    {
      title: "Active Users",
      value: "0",
      change: "-5.8% this month",
      trend: "up",
      icon: Users,
      style: {
        bg: "from-emerald-50/80 to-teal-50/80",
        icon: "from-emerald-600 to-teal-700",
        text: "text-emerald-700",
        change: "text-emerald-600",
      },
    },
    {
      title: "Inactive Users",
      value: "0",
      change: "+32.7% this month",
      trend: "down",
      icon: Users,
      style: {
        bg: "from-red-50/80 to-rose-50/80",
        icon: "from-red-600 to-rose-700",
        text: "text-red-700",
        change: "text-red-600",
      },
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const {
    usersData,
    allUsers,
    fetchallUsers,
    createUser,
    updateUser,
    deleteUser,
  } = useAdminContext();

  const filteredUsers = Array.isArray(allUsers)
    ? allUsers.filter((user: User) => {
        const matchesSearch =
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && user.isActive) ||
          (statusFilter === "inactive" && !user.isActive);

        return matchesSearch && matchesStatus;
      })
    : [];

  useEffect(() => {
    fetchallUsers();
  }, []);

  useEffect(() => {
    if (usersData) {
      const { totalUsers, activeUsers, dormantAccounts }: any = usersData;
      setCards((prevCards) =>
        prevCards.map((card, index) => ({
          ...card,
          value:
            index === 0
              ? totalUsers?.toString()
              : index === 1
              ? activeUsers?.toString()
              : dormantAccounts?.toString(),
        }))
      );
    }
  }, [usersData]);

  return (
    <div className="w-full space-y-6 min-h-[85vh] bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <UserModal
          title="Add User"
          triggerLabel="Add User"
          onSubmit={async (data: any) => {
            // console.log("Creating user:", data);
            await createUser(data);
          }}
        />
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

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "active" ? "default" : "outline"}
            onClick={() => setStatusFilter("active")}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === "inactive" ? "default" : "outline"}
            onClick={() => setStatusFilter("inactive")}
          >
            Inactive
          </Button>
        </div>
      </div>

      <Card className="p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Details</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!filteredUsers.length ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user: User) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.role}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{user.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{user?.plan?.name || "No Plan"}</div>
                      <div className="text-sm text-muted-foreground">
                        Expires:{" "}
                        {user?.plan?.expiresAt ? new Date(user?.plan?.expiresAt).toLocaleDateString() : "---"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                  {/* ❌ This has to be change  */}
                    {/* <div className="text-sm">
                      Messages: {user?.usage?.messagesSent}/
                      {user?.usage?.messagesLimit}
                    </div> */}
                    <div className="text-sm">
                      Messages: {user?.plan?.usedMessages || 0}/  
                      {user?.usage?.messagesLimit || 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <UserModal
                        title="Edit User"
                        triggerLabel="Edit"
                        defaultValues={user}
                        onSubmit={async (data: any) => {
                         
                          // console.log("Updating user:", data);
                          await updateUser(data._id, data);
                        }}
                      />
                      <Button
                        onClick={async () => {
                          let res = confirm(
                            "Are you sure you want to delete this user account? This action cannot be undone."
                          );
                          if(res)await deleteUser(user._id);
                        }}
                        variant="destructive"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default UserManagementPage;
