"use client";
import api from "@/services/api";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface AuthContextType {
  user: any;
  loading: boolean;
  login: ({
    email,
    password,
  }: {
    email: string | null;
    password: string | null;
  }) => Promise<void>;
  register: ({
    name,
    phone,
    email,
    password,
  }: {
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
  // Reset password functions
  forgotPassword: (email: string) => Promise<any>;
  verifyResetOtp: (email: string, otp: string) => Promise<any>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<any>;
  getActivePlan: () => Promise<void>;
  getAllPlans: () => Promise<any>;
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
  getAllUserSubscriptions: () => Promise<void>;
  allUserSubscriptions: any;
  getUserPayments: () => Promise<any>;
  userPayments: any;
  switchPlan: (planId: string) => Promise<void>;
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
  forgotPassword: async () => {},
  verifyResetOtp: async () => {},
  resetPassword: async () => {},
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
  getAllUserSubscriptions: async () => {},
  allUserSubscriptions: null,
  getUserPayments: async () => {},
  userPayments: null,
  switchPlan: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [activePlan, setActivePlan] = useState(null);
  const [allPlans, setAllPlans] = useState(null);
  const [allUserSubscriptions, setallUserSubscriptions] = useState(null);
  const [userPayments, setUserPayments] = useState(null);

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
      // console.log(res)
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

  // Reset password functions
  const forgotPassword = async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      const res = await api.post("/auth/forgot-password", { email });
      if (res.data?.success) {
        toast.success("Password reset OTP sent to your email!");
      } else {
        toast.error(res.data?.message || "Failed to send reset OTP");
      }
      setLoading(false);
      return res.data;
    } catch (error) {
      console.log("Forgot password error:", error);
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to send reset OTP");
      setLoading(false);
      return null;
    }
  };

  const verifyResetOtp = async (email: string, otp: string) => {
    try {
      setError(null);
      setLoading(true);
      const res = await api.post("/auth/verify-reset-otp", { email, otp });
      if (res.data?.success) {
        toast.success("OTP verified successfully!");
      } else {
        toast.error(res.data?.message || "Invalid OTP");
      }
      setLoading(false);
      return res.data;
    } catch (error) {
      console.log("Verify reset OTP error:", error);
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "OTP verification failed");
      setLoading(false);
      return null;
    }
  };

  const resetPassword = async (resetToken: string, newPassword: string) => {
    try {
      setError(null);
      setLoading(true);
      const res = await api.post("/auth/reset-password", { resetToken, newPassword });
      if (res.data?.success) {
        toast.success("Password reset successful!");
      } else {
        toast.error(res.data?.message || "Failed to reset password");
      }
      setLoading(false);
      return res.data;
    } catch (error) {
      console.log("Reset password error:", error);
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to reset password");
      setLoading(false);
      return null;
    }
  };

  const getActivePlan = async () => {
    try {
      setError(null);
      const res = await api.get("/plan/subscription");
      setActivePlan(res.data);
      console.log(res?.data);
      return res.data;
    } catch (error) {
      console.log("Error getting active plan:", error);
      const err = error as AxiosError<{ message: string }>;
      // toast.error(err.response?.data?.message || "Failed to fetch active plan");
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
      console.log(res?.data);
      return res.data;
    } catch (error) {
      console.log("Error getting all plans:", error);
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to fetch all plans");
      setLoading(false);
      return null;
    }
  };

  const getUserPayments = async () => {
    try {
      const res = await api.get("/payment/user-payments");
      if (res?.data?.success) {
        setUserPayments(res?.data?.data);
        return res?.data?.data;
      }
      console.log(res?.data);
      return res.data;
    } catch (error) {
      console.log("Error getting user payments:", error);
      const err = error as AxiosError<{ message: string }>;
      toast.error(
        err.response?.data?.message || "Failed to fetch user payments"
      );
      setLoading(false);
      return null;
    }
  };

  const createOrder = async (planId: string) => {
    try {
      const res = await api.post("/payment/create-order", { planId });
      if (res?.data?.success) {
        console.log(res?.data.data)
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
  const getAllUserSubscriptions = async () => {
    try {
      const res = await api.get("/plan/allsubscription");
      setallUserSubscriptions(res.data);
      console.log(res?.data);
      return res.data;
    } catch (error) {
      console.log("Error getting all user subscriptions:", error);
      const err = error as AxiosError<{ message: string }>;
      toast.error(
        err.response?.data?.message || "Failed to fetch all user subscriptions"
      );
      return null;
    }
  };

  const switchPlan = async (subscriptionId: string) => {
    
    try {
      const res = await api.post("/plan/switch-plan", { subscriptionId });
      if (res?.data?.success) {
        toast.success("Subscription activated successfully")
        // setActivePlan(res.data);
        await getAllUserSubscriptions();
        return res.data;
      }
      return null;
    } catch (error) {
      console.log("Error switching subscription:", error);
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to switch subscription");
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
        getAllUserSubscriptions,
        allUserSubscriptions,
        getUserPayments,
        userPayments,
        switchPlan,
        forgotPassword,
        verifyResetOtp,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
export const useAuth = () => useContext(AuthContext);
