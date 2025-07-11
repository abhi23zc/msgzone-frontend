"use client";
import api from "@/services/api";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (credentials: {
    email: string | null;
    password: string | null;
  }) => Promise<void>;
  register: (credentials: {
    name: string | null;
    phone: string | null;
    email: string | null;
    password: string | null;
  }) => Promise<void>;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>;
  error: null | string;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  getActivePlan: () => Promise<void>;
  getAllPlans: () => Promise<void>;
  activePlan: any;
  allPlans: any;
  createOrder: (planId: string) => Promise<{
    amount: number;
    currency: string;
    orderId: string;
  }>;
  verifyPayment: (payload: any) => Promise<{
    success: boolean;
  }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  checkUser: async () => {},
  sendOtp: async () => {},
  verifyOtp: async () => {},
  error: null,
  getActivePlan: async () => {},
  getAllPlans: async () => {},
  activePlan: null,
  allPlans: null,
  createOrder: async (planId: string) => ({
    amount: 0,
    currency: "",
    orderId: "",
  }),
  verifyPayment: async () => ({ success: false }),
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [activePlan, setactivePlan] = useState(null);
  const [allPlans, setallPlans] = useState(null);
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await api.get("/auth/profile");
      setLoading(false);
      setUser(res.data);
      // console.log("Data", res.data);
    } catch (error) {
      console.log("Error checking user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async ({
    email,
    password,
  }: {
    email: string | null;
    password: string | null;
  }) => {
    try {
      setError(null);
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      setLoading(false);
      setUser(res.data);
      // console.log("Data", res.data);
    } catch (error) {
      console.log("Login error:", error);
      const err = error as AxiosError<{ message: string }>;
      if (err.response?.data?.message == "Please verify your email.") {
        toast("Please verify your email!", {
          icon: "ℹ️",
        });
        router.push(`/verify?email=${email}`);

        return;
      }
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const register = async ({
    name,
    phone,
    email,
    password,
  }: {
    name: string | null;
    phone: string | null;
    email: string | null;
    password: string | null;
  }) => {
    try {
      setError(null);
      setLoading(true);
      const res = await api.post("/auth/register", {
        email,
        password,
        name,
        whatsappNumber: phone,
        businessName: "msgzone",
      });
      // console.log("Data", res.data);
      setLoading(false);
      return res.data;
    } catch (error: any) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Registration failed");
      console.log("Register error:", error?.response?.data?.message);
      setError(error?.response?.data?.message);
      setLoading(false);
      return null;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      await api.post("/auth/logout");
      setLoading(false);
      setUser(null);
    } catch (error) {
      console.log("Logout error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (email: string) => {
    try {
      setError(null);
      const res = await api.post("/auth/send-otp", { email });
      if (res.data?.success) {
        toast.success("OTP sent successfully!");
      } else {
        toast.error(res.data?.message);
      }
      setLoading(false);
      return res.data;
    } catch (error) {
      console.log("Send OTP error:", error);
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Error Sending OTP");
      setLoading(false);
      return null;
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      setError(null);
      const res = await api.post("/auth/verify-otp", { email, otp });
      if (res.data?.success) {
        toast.success("Verification Successfull!");
      } else {
        toast.error(res.data?.message);
      }
      setLoading(false);
      return res.data;
    } catch (error) {
      console.log("Otp validation error:", error);
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Otp verification failed");
      setLoading(false);
      return null;
    }
  };

  const getActivePlan = async () => {
    try {
      setError(null);
      const res = await api.get("/plan/subscription");
      setactivePlan(res.data);
      console.log(res?.data);
      return res.data;
    } catch (error) {
      console.log("Error getting active plan:", error);
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to fetch active plan");
      setLoading(false);
      return null;
    }
  };
  const getAllPlans = async () => {
    try {
      setError(null);
      const res = await api.get("/admin/plans");
      if (res?.data?.success) {
        return res.data?.data;
      }
      // console.log(res?.data);
      return res.data;
    } catch (error) {
      console.log("Error getting all plans:", error);
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to fetch all plans");
      setLoading(false);
      return null;
    }
  };

  const createOrder = async (planId: string) => {
    try {
      const res = await api.post("/payment/create-order", { planId });
      if (res?.data?.success) {
        return res?.data?.data;
      }
      return null;
    } catch (error) {
      console.log("Error creating order:", error);
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to create order");
      setLoading(false);
      return null;
    }
  };

  const verifyPayment = async (payload: any) => {
    try {
      const res = await api.post("/payment/verify-payment", payload);
      if (res?.data?.success) {
        return res.data;
      }
      return null;
    } catch (error) {
      console.log("Error verifying payment:", error);
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to verify payment");
      setLoading(false);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        checkUser,
        error,
        sendOtp,
        verifyOtp,
        getAllPlans,
        getActivePlan,
        activePlan,
        allPlans,
        createOrder,
        verifyPayment,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
export const useAuth = () => useContext(AuthContext);
