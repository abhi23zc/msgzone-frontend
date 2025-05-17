"use client";
import api from "@/services/api";
import { createContext, useContext, useEffect, useState } from "react";

const delay = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

interface WhatsappContextProps {
  loading: boolean;
  startSession: (deviceId: string | "") => Promise<void>;
}

const WhatsappContext = createContext<WhatsappContextProps>({
  loading: false,
  startSession: async () => {},
});

export const WhatsappProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(false);
  useEffect(() => {}, []);

  const startSession = async (deviceId: string | "") => {
    console.log("Starting Session");
    try {
      if (!deviceId) throw new Error("Device Id is required");
      setLoading(true);
      const res = await api.post("/wp/start", { deviceId });
      if (res.data?.message == "QR generated successfully") {
        await delay(3000);
        return connectSession(deviceId);
      }
      // if(res?.data?.status){
      //     connectSession()
      // }
    } catch (error) {
      console.log("Error while staring whatsapp session:", error);
    } finally {
      setLoading(false);
    }
  };

  const connectSession = async (deviceId: string | "") => {
    console.log("Session Connecting...");
    try {
      setLoading(true);
      const res = await api.post("/wp/connect", { deviceId });
      console.log(res?.data);
      if (res?.data?.status) {
        return res?.data?.data;
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Error while connecting whatsapp :", error);
      return null;
    }
  };

  return (
    <WhatsappContext.Provider value={{ loading, startSession }}>
      {children}
    </WhatsappContext.Provider>
  );
};

export default WhatsappContext;
export const useWhatsapp = () => useContext(WhatsappContext);
