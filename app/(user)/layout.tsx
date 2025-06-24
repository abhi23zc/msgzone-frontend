import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "../globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { WhatsappProvider } from "@/context/WhatsappContext";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";

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
        <Toaster/>
          <AuthProvider>
            <WhatsappProvider>
              <div className="flex h-screen overflow-hidden w-screen">
                <Sidebar />
                <main className="flex-1 overflow-auto">{children}</main>
              </div>
            </WhatsappProvider>
          </AuthProvider>

      </body>
    </html>
  );
}
