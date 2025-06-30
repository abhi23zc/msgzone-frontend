"use client";
import api from "@/services/api";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const delay = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

interface AttachmentType {
  file: File;
  caption: string;
  previewUrl?: string;
}

interface WhatsappContextProps {
  loading: boolean;
  startSession: (deviceId: string | "") => Promise<void>;
  sendMessage: ({
    number,
    message,
    deviceId,
    attachments,
  }: {
    number: string;
    message: string;
    deviceId: string;
    attachments?: AttachmentType[];
  }) => Promise<void>;
  sendBulkMessage: ({
    numbers,
    timer,
    message,
    deviceId,
    attachments,
  }: {
    numbers: [];
    timer:string;
    message: string;
    deviceId: string;
    attachments?: AttachmentType[];
  }) => Promise<void>;

  sendScheduleMessage: ({
    number,
    schedule,
    message,
    deviceId,
    attachments,
  }: {
    number: string;
    schedule: string;
    message: string;
    deviceId: string;
    attachments?: AttachmentType[];
  }) => Promise<void>;
  sendScheduleBulk :({
    numbers,
    timer,
    schedule,
    message,
    deviceId,
    attachments,
  }: {
    numbers: string;
    timer: string;
    schedule: string;
    message: string;
    deviceId: string;
    attachments?: AttachmentType[];
  }) => Promise<void>;
  getAllMessages: (limit:number, page:number, dateFilters:any, filters:any) => Promise<void>;
  getAllMessagesCount: () => Promise<void>;
  getTodayMessages: () => Promise<void>;
  getTodayMessagesCount: () => Promise<void>;
  allMessagesCount: number;
  todayMessagesCount: number;
  allMessages: any[];
  todayMessages: any[];
  error: string | "";
  TimeoutInterval: any;
  deleteDevice:(deviceId:string) => Promise<void>
}

const WhatsappContext = createContext<WhatsappContextProps>({
  loading: false,
  startSession: async () => {},
  sendMessage: async () => {},
  sendScheduleMessage: async () => {},
  sendBulkMessage: async () => {},
  sendScheduleBulk : async () => {},
  getAllMessages: async () => {},
  getAllMessagesCount: async () => {},
  getTodayMessages: async () => {},
  getTodayMessagesCount: async () => {},
  allMessagesCount: 0,
  todayMessagesCount: 0,
  allMessages: [],
  todayMessages: [],
  error: "",
  TimeoutInterval: null,
  deleteDevice: async () =>{}
});

export const WhatsappProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | "">("");
  const [allMessages, setAllMessages] = useState<any>([]);
  const [todayMessages, setTodayMessages] = useState<any>([]);
  const [TimeoutInterval, setTimeoutInterval] = useState<any>(null);
  const [allMessagesCount, setallMessagesCount] = useState<number>(0)
  const [todayMessagesCount, setTodayMessagesCount] = useState<number>(0)
  const {checkUser, user} = useAuth()

  const startSession = async (deviceId: string | "") => {
    console.log("Starting Session");
    try {
      setError("");
      if (!deviceId) throw new Error("Device Id is required");
      setLoading(true);
      
      const res = await api.post("/wp/start", { deviceId });
      console.log(res)

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
    } catch (error:any) {
      toast.error(error?.response?.data?.message || "Something went wrong" )
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
      // console.log(res?.data);
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

  const deleteDevice = async (deviceId: string) => {
    try {
      setError("");
      const res = await api.post("/wp/delete", { deviceId });
      if (res?.data?.status) {
        await checkUser();
        return res?.data?.data;
      }
      console.log(res?.data)
    } catch (error:any) {
      setLoading(false);
      toast.error(error?.response?.data?.message || "Something went wrong");
      return null;
    }
  };

  const sendMessage = async ({
    number,
    message,
    deviceId,
    attachments = [],
  }: {
    number: string;
    message: string;
    deviceId: string;
    attachments?: AttachmentType[];
  }) => {
    try {
      setError("");
      setLoading(true);
      
      // Use FormData to handle file uploads
      const formData = new FormData();
      formData.append("number", number);
      formData.append("message", message);
      formData.append("deviceId", deviceId);
      
      // Add attachments if any
      if (attachments && attachments.length > 0) {
        // Add each file and its caption
        attachments.forEach((attachment, index) => {
          formData.append(`attachments`, attachment.file);
          formData.append(`captions`, attachment.caption || "");
        });
      }
      
      const res = await api.post("/wp/sendSingle", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      setLoading(false);
      return res?.data;
    } catch (error: any) {
      setError(error?.response?.data?.message || error?.message || "Something went wrong");
      console.log(error);
      setLoading(false);
      toast.error(error?.response?.data?.message || "Something went wrong" )
      return null
    }
  };

  const sendScheduleMessage = async ({
    number,
    schedule,
    message,
    deviceId,
    attachments = [],
  }: {
    number: string;
    schedule:string;
    message: string;
    deviceId: string;
    attachments?: AttachmentType[];
  }) => {
    try {
      setError("");
      setLoading(true);
      
      // Use FormData to handle file uploads
      const formData = new FormData();
      formData.append("number", number);
      formData.append("message", message);
      formData.append("deviceId", deviceId);
      formData.append("schedule", schedule);
      
      // Add attachments if any
      if (attachments && attachments.length > 0) {
        // Add each file and its caption
        attachments.forEach((attachment, index) => {
          formData.append(`attachments`, attachment.file);
          formData.append(`captions`, attachment.caption || "");
        });
      }
      
      const res = await api.post("/wp/scheduleSingle", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      setLoading(false);
      return res?.data;
    } catch (error:any) {
      toast.error(error?.response?.data?.message || "Something went wrong" )
      // setError("Error while sending message");
      console.log(error);
      setLoading(false);
      return null;
    }
  };

  const sendBulkMessage = async ({
    numbers,
    message,
    deviceId,
    timer,
    attachments = [],
  }: {
    numbers: [];
    timer:string;
    message: string;
    deviceId: string;
    attachments?: AttachmentType[];
  }) => {
    try {
      setError("");
      setLoading(true);
      
      // Use FormData to handle file uploads
      const formData = new FormData();
      
      // Append numbers as JSON string
      formData.append("numbers", JSON.stringify(numbers));
      formData.append("message", message);
      formData.append("deviceId", deviceId);
      formData.append("timer", timer);
      
      // Add attachments if any
      if (attachments && attachments.length > 0) {
        
        // Add each file and its caption
        attachments.forEach((attachment, index) => {
          formData.append(`attachments`, attachment.file);
          formData.append(`captions`, attachment.caption || "");
        });
      }
      
      const res = await api.post("/wp/sendBulk", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      setLoading(false);
      return res?.data;
    } catch (error:any) {
      toast.error(error?.response?.data?.message || "Something went wrong" )
      // setError("Error while sending bulk messages");
      console.log(error);
      setLoading(false);
      return null;
    }
  };

  const sendScheduleBulk = async ({
    numbers,
    timer,
    schedule,
    message,
    deviceId,
    attachments = [],
  }: {
    numbers: string;
    timer:string;
    schedule:string;
    message: string;
    deviceId: string;
    attachments?: AttachmentType[];
  }) => {
    try {
      setError("");
      setLoading(true);
      
      // Use FormData to handle file uploads
      const formData = new FormData();
      formData.append("numbers", JSON.stringify(numbers));
      formData.append("message", message);
      formData.append("deviceId", deviceId);
      formData.append("schedule", schedule);
      formData.append("timer", timer);
      
      // Add attachments if any
      if (attachments && attachments.length > 0) {
        // Add each file and its caption
        attachments.forEach((attachment, index) => {
          formData.append(`attachments`, attachment.file);
          formData.append(`captions`, attachment.caption || "");
        });
      }
      
      const res = await api.post("/wp/scheduleBulk", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      setLoading(false);
      return res?.data;
    } catch (error:any) {
      setError("Error while sending message");
      toast.error(error?.response?.data?.message || "Something went wrong" )
      console.log(error);
      setLoading(false);
      return null;
    }
  };

  // const getAllMessages = async (limit:number, page:number, dateFilters:any) => {

  //   try {
  //     setError("");
  //     setAllMessages([]);
  //     setLoading(true);
      
  //     // Build query parameters
  //     let url = `/wp/getAllMessages?limit=${limit}&page=${page}`;
      
  //     // Add date filters if provided
  //     if (dateFilters?.from) url += `&from=${dateFilters.from}`;
  //     if (dateFilters?.to) url += `&to=${dateFilters.to}`;
      
  //     const res = await api.get(url);
  //     const msgArray = res?.data;
  //     setAllMessages(msgArray || []);
      
  //   } catch (error) {
  //     setError("Error while fetching messages");
  //     console.log(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const getAllMessages = async (
  limit: number,
  page: number,
  dateFilters?: any,
  filters?: any
) => {
  try {
    setError("");
    setAllMessages([]);
    setLoading(true);

    let url = `/wp/getAllMessages?limit=${limit}&page=${page}`;

    if (dateFilters?.from) url += `&from=${dateFilters.from}`;
    if (dateFilters?.to) url += `&to=${dateFilters.to}`;
    if (filters?.status && filters.status !== "all") url += `&status=${filters.status}`;
    if (filters?.search) url += `&search=${filters.search}`;

    const res = await api.get(url);
    const msgArray = res?.data;
    setAllMessages(msgArray || []);
  } catch (error) {
    setError("Error while fetching messages");
    console.log(error);
  } finally {
    setLoading(false);
  }
};

  
  const getAllMessagesCount = async () => {
    try {
      setError("");
      setAllMessages([]);
      const res = await api.get("/wp/getAllMessagesCount");
      // if(res.status == 200){
        console.log("Total", res)  
        setallMessagesCount(res?.data?.data)
      // }
    } catch (error) {
      setError("Error while fetching messages");
      console.log(error);
    } 
  };

  const getTodayMessagesCount = async () => {
    try {
      setError("");
      setAllMessages([]);
      const res = await api.get("/wp/getTodayMessagesCount");
      // if(res.status == 200){
      console.log("Today", res)

      setTodayMessagesCount(res?.data?.data)
      // }
    } catch (error) {
      setError("Error while fetching messages");
      console.log(error);
    } 
  };

  
  const getTodayMessages = async () => {
    try {
      setError("");
      setTodayMessages([]);
      setLoading(true);
      const res = await api.get("/wp/getTodayMessages");
      const msgArray = res?.data?.data;
      setTodayMessages(msgArray || []);
      
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
        sendBulkMessage,
        getAllMessages,
        getTodayMessages,
        error,
        TimeoutInterval,
        todayMessages,
        sendScheduleMessage,
        sendScheduleBulk,
        allMessagesCount,
        todayMessagesCount,
        getAllMessagesCount,
        getTodayMessagesCount,
        deleteDevice
      }}
    >
      {children}
    </WhatsappContext.Provider>
  );
};

export default WhatsappContext;
export const useWhatsapp = () => useContext(WhatsappContext);
