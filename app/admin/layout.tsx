import Sidebar from "@/components/admin/Sidebar";
import "../globals.css";
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
          <Sidebar />
          {children}
        </div>
      </body>
    </html>
  );
}
