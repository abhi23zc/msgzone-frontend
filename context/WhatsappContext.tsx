"use client"
import api from "@/services/api";
import { createContext, useContext, useEffect, useState } from "react";

const WhatsappContext = createContext({})

export const WhatsappProvider = ({children}:{ children: React.ReactNode }) =>{
    const [loading, setLoading] = useState(false)
    useEffect(() => {
    }, [])

    const startSession =async () =>{
        console.log("Starting Session")
        try {
            setLoading(true);
            const res = await api.post("/wp/start", {"clientId":"abhishek"});
            if(res?.data?.status){
                connectSession()
            }   
          } catch (error) {
            console.log("Error while staring whatsapp session:", error);
          } finally {
            setLoading(false);
          }
    }

    const connectSession =async () =>{
        try {
            setLoading(true);
            const res = await api.post("/wp/connect", {clientId:"abhishek"});
            console.log(res.data);
           
          } catch (error) {
            console.log("Error while connecting whatsapp :", error);
          } finally {
            setLoading(false);
          }
    }


    return (
        <WhatsappContext.Provider value={{loading, startSession}}>
            {children}
        </WhatsappContext.Provider>
    )
}

export default WhatsappContext;
export const useWhatsapp = () => useContext(WhatsappContext);