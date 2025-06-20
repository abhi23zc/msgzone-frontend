"use client";
import api from "@/services/api";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const checkIsAdmin = async () => {
    try {
      const res = await api.get("/admin/isAdmin");

      if (!res?.data?.status) {
        toast.error("You are not authorized");
        router.push("/");
      }
    } catch (err) {
      console.log(err);
      // toast.error("You are not an admin");
      router.push("/");
    }
  };

  useEffect(() => {
    checkIsAdmin();
  }, []);

  return <>{children}</>;
}

export default ProtectedAdmin;
