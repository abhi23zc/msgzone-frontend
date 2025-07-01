import Sidebar from "@/components/admin/Sidebar";
import "../globals.css";
import { AdminProvider } from "@/context/Admin/AdminContext";
import { Toaster } from "react-hot-toast";
import ProtectedAdmin from "./ProtectedAdmin";
export const metadata = {
  title: "MsgZone | Admin ",
  description: "Whatsapp bulk message sender platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex">
          <Toaster />
          <ProtectedAdmin>
            <AdminProvider>
              <div className="flex h-screen overflow-hidden w-screen">
                <Sidebar />
                <main className="flex-1 overflow-auto">{children}</main>
              </div>
            </AdminProvider>
          </ProtectedAdmin>
        </div>
      </body>
    </html>
  );
}
