"use client";
import api from "@/services/api";
import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (credentials: {email: string | null, password: string | null}) => Promise<void>;
  register: (credentials: {name:string| null, phone: string | null, email: string | null, password: string | null}) => Promise<void>;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>;
  error: null | string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  login: async () => {},
  logout: async () => {},
  register:async()=>{},
  checkUser: async()=>{},
  error: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      setError(null)
      setLoading(true);
      const res = await api.get("/auth/profile");
      setUser(res.data);
      // console.log("Data", res.data);
    } catch (error) {
      console.log("Error checking user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password }: { email: string | null, password: string | null}) => {
    try {
      setError(null)
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      setUser(res.data);
      // console.log("Data", res.data);
    } catch (error) {
      console.log("Login error:", error);
      toast.error("Invalid credentials")
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, phone, email, password}:  {name:string| null, phone: string | null, email: string | null, password: string | null}) => {
    try {
      setError(null)
      setLoading(true);
      const res = await api.post("/auth/register", { email, password, name, whatsappNumber: phone,  businessName:"msgzone"});
      setUser(res.data);
      // console.log("Data", res.data);
      return res.data;
    } catch (error:any) {
      console.log("Register error:", error?.response?.data?.message);
      setError(error?.response?.data?.message)
      return null;

    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null)
      setLoading(true);
      await api.post("/auth/logout");
      setUser(null);
    } catch (error) {
      console.log("Logout error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout , register, checkUser, error}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
export const useAuth = () => useContext(AuthContext);