"use client";
import api from "@/services/api";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const delay = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

interface WhatsappContextProps {
  loading: boolean;
  startSession: (deviceId: string | "") => Promise<void>;
  sendMessage: ({
    number,
    message,
    deviceId,
  }: {
    number: number;
    message: string;
    deviceId: string;
  }) => Promise<void>;
  getAllMessages: () => Promise<void>;
  allMessages: any[];
  error: string | "";
  TimeoutInterval: any;
}

const WhatsappContext = createContext<WhatsappContextProps>({
  loading: false,
  startSession: async () => {},
  sendMessage: async () => {},
  getAllMessages: async () => {},
  allMessages: [],
  error: "",
  TimeoutInterval: null,
});

export const WhatsappProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | "">("");
  const [allMessages, setAllMessages] = useState<any>([]);
  const [TimeoutInterval, setTimeoutInterval] = useState<any>(null);
  const {checkUser, user} = useAuth()

  const startSession = async (deviceId: string | "") => {
    console.log("Starting Session");
    try {
      setError("");
      if (!deviceId) throw new Error("Device Id is required");
      setLoading(true);
      
      const res = await api.post("/wp/start", { deviceId });

      if (res.data?.message == "QR generated successfully") {
        await delay(3000);
        return connectSession(deviceId);
      }
      else if(res?.data?.message == "Client already connected"){
        setLoading(false);
        toast.error("Client already exists")
        return null
      }
      // if(res?.data?.status){
      //     connectSession()
      // }
    } catch (error) {
      setError("Error while staring whatsapp session");
      console.log("Error while staring whatsapp session:", error);
      setLoading(false);
    }
  };

  const connectSession = async (deviceId: string | "") => {
    console.log("Session Connecting...");
    try {
      setError("");
      setLoading(true);
      const res = await api.post("/wp/connect", { deviceId });
      console.log(res?.data);
      if (res?.data?.status) {
        const timeoutInterval = setTimeout(async() => {
          setLoading(false);
          try {
            await checkUser();
          } catch (error) {
            toast.error("Error while connecting device");
          }
        }, 30000);

        setTimeoutInterval(timeoutInterval);
        return res?.data?.data;
      }
    } catch (error) {
      setLoading(false);
      try {
        await checkUser();
      } catch (error) {
        setError("Error while connecting whatsapp");
        return null;
      }
      toast.error("Error while connecting device");
      return null;
    }
  };

  const sendMessage = async ({
    number,
    message,
    deviceId,
  }: {
    number: number;
    message: string;
    deviceId: string;
  }) => {
    try {
      setError("");
      setLoading(true);
      const res = await api.post("/wp/sendSingle", {
        number,
        message,
        deviceId,
      });
      setLoading(false);
      return res?.data;
    } catch (error) {
      setError("Error while sending message");
      console.log(error);
      setLoading(false);
      return null;
    }
  };

  const getAllMessages = async () => {
    try {
      setError("");
      setAllMessages([]);
      setLoading(true);
      const res = await api.get("/wp/getAllMessages");
      const msgArray = res?.data?.data;
      const allMsgs = msgArray?.reduce((acc: any[], { messages }: any) => {
        return [...acc, ...messages];
      }, []);

      setAllMessages(allMsgs || []);
      
    } catch (error) {
      setError("Error while fetching messages");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WhatsappContext.Provider
      value={{
        loading,
        allMessages,
        startSession,
        sendMessage,
        getAllMessages,
        error,
        TimeoutInterval,
      }}
    >
      {children}
    </WhatsappContext.Provider>
  );
};

export default WhatsappContext;
export const useWhatsapp = () => useContext(WhatsappContext);
