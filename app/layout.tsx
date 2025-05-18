import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { WhatsappProvider } from "@/context/WhatsappContext";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "react-hot-toast";

const jost = Jost({
  variable: "--font-jost",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["sans-serif"],
});

export const metadata: Metadata = {
  title: "MSG zone",
  description:
    "Bulk WhatsApp message sender web application - Send messages to multiple contacts efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jost.variable} ${jost.variable} antialiased`}>
        <AuthProvider>
          <WhatsappProvider>
            <div className="flex ">
              <Toaster/>
              <Sidebar />
              {children}
            </div>
          </WhatsappProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
