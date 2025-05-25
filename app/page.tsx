"use client";
import MessageList from "@/components/MessageList";
import CustomModal from "@/components/Modal";
import ProtectedRoute from "@/components/Protected";
import { useAuth } from "@/context/AuthContext";
import { useWhatsapp } from "@/context/WhatsappContext";
import { Button, Modal, Progress, QRCode } from "antd";
import {
  CheckCircle2Icon,
  CircleCheck,
  MessageSquareIcon,
  Timer,
  User,
  WatchIcon,
} from "lucide-react";
import { useEffect, useState, type FC } from "react";
import toast from "react-hot-toast";

const Home: FC = () => {
  const { user, checkUser, loading: authLoading } = useAuth();
  const {
    startSession,
    loading,
    TimeoutInterval,
    allMessages,
    getAllMessages,
    getTodayMessages, 
    todayMessages
  } = useWhatsapp();
  const [isModalOpen, setisModalOpen] = useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const [deviceName, setdeviceName] = useState("");

  const countDown = (qrData: string | null) => {
    let secondsToGo = 30;

    const instance = modal.success({
      title: "Scan Whatsapp",
      content: (
        <div className="flex justify-center w-full ">
          {qrData && <img src={qrData} className="w-full pr-5" />}
        </div>
      ),
      maskClosable: false,
      onOk() {
        if (TimeoutInterval) clearTimeout(TimeoutInterval);
      },
      okText: `Ok (${secondsToGo})`,
      width: 400,
    });

    const timer = setInterval(() => {
      secondsToGo -= 1;
      instance.update({
        okText: `Ok (${secondsToGo})`,
      });
    }, 1000);

    setTimeout(() => {
      clearInterval(timer);
      instance.destroy();
    }, secondsToGo * 1000);
  };

  const handleSubmit = async () => {
    try {
      setisModalOpen(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {}, [TimeoutInterval]);

  const handleRefresh = async () => {
    try {
      await checkUser();
    } catch (error) {
      toast.error("Errow while refreshing");
    }
  };
  return (
    <main className="min-h-screen w-full bg-[url('/assets/bg.png')] bg-cover bg-center bg-no-repeat flex ">
      <CustomModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setisModalOpen}
        props={{ countDown, startSession, deviceName, setdeviceName }}
      />
      {contextHolder}

      {/* Right Component */}

      <section className="w-full p-4 md:p-6 bg-gray-50 overflow-y-auto min-h-screen">
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 transform transition-all hover:shadow-lg relative">
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
                    <p className="text-blue-700 font-semibold">June 30, 2025</p>
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
                    <Progress
                      percent={30}
                      strokeWidth={10}
                      strokeColor="#1677ff"
                      showInfo={true}
                    />
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
                      strokeWidth={10}
                      strokeColor="#1677ff"
                      showInfo={true}
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

<div className="absolute top-2 right-2 md:top-5 md:right-5 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 md:shadow-md shadow-sm ">
  <div className="bg-blue-100 p-2 rounded-full">
    <User className="w-4 h-4 text-blue-600" />
  </div>
  <div className="flex flex-col">
    <span className="text-sm font-medium text-gray-900 ">
      {user?.data?.user?.name || 'Guest'}
    </span>
    <span className="text-xs text-gray-500 hidden md:block">
      {user?.data?.user?.email}
    </span>
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

              <div className="flex flex-wrap gap-0">
                <Button
                  onClick={handleSubmit}
                  color="purple"
                  variant="solid"
                  size="middle"
                  loading={loading}
                >
                  Add Device
                </Button>

                <Button
                  onClick={handleRefresh}
                  color="purple"
                  variant="solid"
                  size="middle"
                  className="ml-2"
                  loading={authLoading}
                >
                  Refresh
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-2 mb-5 overflow-y-scroll">
              {user?.data?.user?.devices?.length > 0 ? (
                user.data.user.devices.map((device: any, index: number) => {
                  return (
                    <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow">
                      <div className="flex flex-wrap gap-4 justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                            <img src="/assets/whatsapp.png" alt="whatsapp" />
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {device?.deviceId}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-500">
                                Last active:{" "}
                                {new Date(
                                  device?.lastConnected
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${
                                device?.status != "connected"
                                  ? "bg-red-500"
                                  : "bg-green-500"
                              } `}
                            ></div>
                            <span
                              className={`text-sm ${
                                device?.status != "connected"
                                  ? "text-red-600"
                                  : "text-green-600"
                              }  font-medium`}
                            >
                              {device?.status == "connected"
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </div>

                          {device?.status == "disconnected" && (
                            <Button
                              color="green"
                              variant="outlined"
                              size="small"
                              className="text-sm"
                              onClick={() => {
                                setdeviceName(device?.deviceId);
                                handleSubmit();
                              }}
                            >
                              Connect
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No devices found.</p>
              )}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white shadow-sm rounded-xl overflow-hidden">
            <div className="p-6 border-b flex justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Recent Messages
                </h2>
                <p className="text-gray-500 mt-1">
                  Status of your recent messages
                </p>

                <p className="text-gray-500 mt-1">
                  Today Messages:{" "}
                  {Array.isArray(todayMessages) ? todayMessages.length : 0}
                </p>
                <p className="text-gray-500 mt-1">
                  Total Messages:{" "}
                  {Array.isArray(allMessages) ? allMessages.length : 0}
                </p>
              </div>
              <Button
                onClick={() => {
                  getAllMessages();
                  getTodayMessages();
                }}
                color="purple"
                variant="solid"
                size="middle"
                className="ml-2"
                loading={loading}
              >
                Refresh
              </Button>
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
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  );
}
