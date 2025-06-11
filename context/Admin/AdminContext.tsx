"use client";

import api from "@/services/api";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface AdminContextType {
  usersData: Record<string, any>;
  fetchDashboardStats: () => Promise<void>;
  weeklyMessageData: Record<string, any>;
  weeklyMessageStats: () => Promise<void>;
  userGrowth: Record<string, any>;
  userGrowthStats: () => Promise<void>;
  allUsers: Record<string, any>;
  fetchallUsers: () => Promise<void>;
  createUser: (userData: Record<string, any>) => Promise<void>;
  updateUser: (id: string, userData: Record<string, any>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const AdminContext = createContext<AdminContextType>({
  usersData: {},
  fetchDashboardStats: async () => {},
  weeklyMessageData: {},
  weeklyMessageStats: async () => {},
  userGrowth: {},
  userGrowthStats: async () => {},
  allUsers: {},
  fetchallUsers: async () => {},
  createUser: async () => {},
  updateUser: async () => {},
  deleteUser: async () => {},
});

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [usersData, setUsersData] = useState<Record<string, any>>({});
  const [allUsers, setallUsers] = useState<Record<string, any>>({});
  const [weeklyMessageData, setweeklyMessageData] = useState<Record<string, any>>({});
  const [userGrowth, setuserGrowth] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchDashboardStats();
    weeklyMessageStats();
    userGrowthStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get("/admin/dashboard-stats");
      if (res?.data?.status) {
        setUsersData(res.data.data);
      } else {
        toast.error("Unable to fetch dashboard stats");
      }
    } catch (error) {
      console.error("Error [Admin Dashboard Stats]:", error);
      toast.error("Failed to fetch dashboard statistics");
    }
  };

  const weeklyMessageStats = async () => {
    try {
      const res = await api.get("/admin/weekly-message-stats");
      if (res?.data?.status) {
        setweeklyMessageData(res.data.data);
      } else {
        toast.error("Unable to fetch weekly message stats");
      }
    } catch (error) {
      console.error("Error [Weekly Message Stats]:", error);
      toast.error("Failed to fetch weekly message statistics");
    }
  };

  const userGrowthStats = async () => {
    try {
      const res = await api.get("/admin/user-growth");
      if (res?.data?.status) {
        setuserGrowth(res.data.data);
      } else {
        toast.error("Unable to fetch user growth stats");
      }
    } catch (error) {
      console.error("Error [User Growth Stats]:", error);
      toast.error("Failed to fetch user growth statistics");
    }
  };

  const fetchallUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      if (res?.data?.status) {
        setallUsers(res.data.data);
      } else {
        toast.error("Unable to fetch users");
      }
    } catch (error) {
      console.error("Error [Fetch Users]:", error);
      toast.error("Failed to fetch users");
    }
  };

  const createUser = async (userData: Record<string, any>) => {
    try {
      const { _id, ...userDataWithoutId } = userData;
      const res = await api.post("/admin/users", userDataWithoutId);
      
      if (res?.data?.status) {
        await fetchallUsers();
        toast.success("User created successfully");
      } else {
        toast.error(res?.data?.message || "Failed to create user");
      }
    } catch (error: any) {
      console.error("Error [Create User]:", error);
      toast.error(error.response?.data?.message || "Unable to create user");
    }
  };

  const updateUser = async (id: string, userData: Record<string, any>) => {
    try {
      const res = await api.put(`/admin/users/${id}`, userData);
      if (res?.data?.status) {
        await fetchallUsers();
        toast.success("User updated successfully");
      } else {
        toast.error(res?.data?.message || "Failed to update user");
      }
    } catch (error: any) {
      console.error("Error [Update User]:", error);
      toast.error(error.response?.data?.message || "Unable to update user");
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await api.delete(`/admin/users/${id}`);
      if (res?.data?.status) {
        await fetchallUsers();
        toast.success("User deleted successfully");
      } else {
        toast.error(res?.data?.message || "Failed to delete user");
      }
    } catch (error: any) {
      console.error("Error [Delete User]:", error);
      toast.error(error.response?.data?.message || "Unable to delete user");
    }
  };

  return (
    <AdminContext.Provider
      value={{
        usersData,
        allUsers,
        fetchallUsers,
        fetchDashboardStats,
        weeklyMessageData,
        weeklyMessageStats,
        userGrowth,
        userGrowthStats,
        createUser,
        updateUser,
        deleteUser
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = ()=> {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminContext must be used within an AdminProvider");
  }
  return context;
};
