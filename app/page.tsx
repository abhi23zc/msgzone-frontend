"use client"
import MessageList from "@/components/MessageList";
import ProtectedRoute from "@/components/Protected";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useWhatsapp } from "@/context/WhatsappContext";
import { Button, Progress } from "antd";
import {
  CheckCircle2Icon,
  CircleCheck,
  MessageSquareIcon,
  Plus,
  Timer,
  WatchIcon,
} from "lucide-react";
import { useEffect, type FC } from "react";

const Home: FC = () => {
  const { user, loading } = useAuth();
  const { startSession } = useWhatsapp();

  useEffect(() => {
  }, [loading, user])
  

  return (
    <main className="min-h-screen w-full bg-[url('/assets/bg.png')] bg-cover bg-center bg-no-repeat flex ">
      <Sidebar />
      {/* Right Component */}
      <section className="w-full p-4 md:p-6 bg-gray-50 overflow-y-auto min-h-screen">
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 transform transition-all hover:shadow-lg">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Current Plan</h2>
              <p className="text-sm text-gray-600">
                Your current subscription details
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Plan details */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full shrink-0">
                    <CircleCheck className="text-green-600 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      Business Pro
                    </h3>
                    <p className="text-sm text-gray-600">
                      Unlimited messages, 5 WhatsApp numbers, priority support
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl">
                  <div className="bg-blue-100 p-3 rounded-full shrink-0">
                    <WatchIcon className="text-blue-600 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">
                      Valid until
                    </h4>
                    <p className="text-blue-700 font-semibold">June 30, 2023</p>
                  </div>
                </div>
              </div>

              {/* Message Usage */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-full shrink-0">
                    <MessageSquareIcon className="text-purple-600 w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Monthly Messages
                    </h3>
                    <Progress percent={30} strokeWidth={8} />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-3 rounded-full shrink-0">
                    <Timer className="text-red-600 w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Monthly Usage
                    </h3>
                    <Progress
                      percent={30}
                      strokeWidth={8}
                      strokeColor="#22C55E"
                    />
                  </div>
                </div>
              </div>

              {/* Plan Features */}
              <div className="hidden lg:flex flex-col space-y-4 text-sm">
                {[
                  "Unlimited templates",
                  "Bulk messaging",
                  "Scheduled messages",
                  "API access",
                  "Priority support",
                ].map((feature, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <CheckCircle2Icon className="text-green-600 w-5 h-5 shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 max-w-7xl mx-auto">
          {/* Whatsapp Numbers */}
          <div className="bg-white shadow-sm rounded-xl overflow-hidden">
            <div className="p-6 border-b flex justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Devices {user?.data?.user?.devices?.length}
                </h2>
                <p className="text-gray-500 mt-1">
                  Your registered numbers and their status
                </p>
              </div>

              <Button onClick={startSession} color="purple" variant="solid" size="middle">
                Add Device
              </Button>
            </div>

            <div className="p-6">
              <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow">
                <div className="flex flex-wrap gap-4 justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-6 h-6 text-green-600"
                        fill="currentColor"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        +1 (234) 567-8900
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">
                          Last active: Today, 9:45 AM
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <span className="text-sm text-green-600 font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white shadow-sm rounded-xl overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-900">
                Recent Messages
              </h2>
              <p className="text-gray-500 mt-1">
                Status of your recent messages
              </p>
            </div>
            <MessageList />
          </div>
        </section>
      </section>
    </main>
  );
};

export default function Page() {
  return (
    // <ProtectedRoute>
    <Home />
    // </ProtectedRoute>
  );
}
