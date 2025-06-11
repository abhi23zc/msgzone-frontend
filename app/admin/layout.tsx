import Sidebar from "@/components/admin/Sidebar";
import "../globals.css";
import { AdminProvider } from "@/context/Admin/AdminContext";
import { Toaster } from "react-hot-toast";
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
          <Toaster/>
          <AdminProvider>
            <Sidebar />
            {children}
          </AdminProvider>
        </div>
      </body>
    </html>
  );
}
