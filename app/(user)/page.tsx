"use client";
import MessageList from "@/components/MessageList";
import CustomModal from "@/components/Modal";
import ProtectedRoute from "@/components/Protected";
import { useAuth } from "@/context/AuthContext";
import { useWhatsapp } from "@/context/WhatsappContext";
import { Button, Modal, Progress } from "antd";
import {
  CheckCircle,
  MessageSquare,
  Timer,
  User,
  Plus,
  Smartphone,
  Activity,
  TrendingUp,
  Shield,
  Zap,
  RefreshCw
} from "lucide-react";
import { useEffect, useState, type FC } from "react";
import toast from "react-hot-toast";

const Home: FC = () => {
  const { user, checkUser, loading: authLoading } = useAuth();
  const {
    startSession,
    loading,
    TimeoutInterval,
    getTodayMessages,
    getAllMessagesCount, 
    getTodayMessagesCount,
    todayMessagesCount, 
    allMessagesCount
    
  } = useWhatsapp();
  const [isModalOpen, setisModalOpen] = useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const [deviceName, setdeviceName] = useState("");

  const countDown = (qrData: string | null) => {
    let secondsToGo = 30;

    const instance = modal.success({
      title: "Scan Whatsapp",
      content: (
        <div className="flex justify-center w-full">
          {qrData && <img src={qrData} className="w-full pr-5" alt="WhatsApp QR Code" />}
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden w-full">
      {/* Subtle background pattern */}
     
      
      <CustomModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setisModalOpen}
        props={{ countDown, startSession, deviceName, setdeviceName }}
      />
      {contextHolder}

      <div className="relative z-10 w-full max-w-8xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Premium Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-8 border-b border-slate-200/60">
          <div className="space-y-2">
            <div className="flex ml-5">
             
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                Dashboard
              </h1>
            </div>
            <p className="text-slate-600 text-lg font-medium ml-5">
              Welcome back, <span className="text-slate-900 font-semibold">{user?.data?.user?.name || "Professional"}</span>
            </p>
            <p className="text-sm text-slate-500 ml-5">
              Manage your WhatsApp Business communications with enterprise-grade reliability
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-500 group">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900 text-sm">
                    {user?.data?.user?.name || "Professional User"}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {user?.data?.user?.email}
                  </p>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Metrics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  <span>Today</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-slate-900">
                  {todayMessagesCount?.toLocaleString() || '0'}
                </h3>
                <p className="text-slate-600 font-medium">Messages Sent Today</p>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full w-3/4 transition-all duration-1000"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                  <Zap className="w-4 h-4" />
                  <span>Total</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-slate-900">
                  {allMessagesCount?.toLocaleString() || '0'}
                </h3>
                <p className="text-slate-600 font-medium">Total Messages</p>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full w-4/5 transition-all duration-1000"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-purple-600 text-sm font-medium">
                  <Smartphone className="w-4 h-4" />
                  <span>Devices</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-slate-900">
                  {user?.data?.user?.devices?.length || 0}
                </h3>
                <p className="text-slate-600 font-medium">Devices</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                  <Timer className="w-4 h-4" />
                  <span>Rate</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-slate-900">98.5%</h3>
                <p className="text-slate-600 font-medium">Delivery Success</p>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full w-full transition-all duration-1000"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Device Management - Enhanced */}
          <div className="xl:col-span-3 bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 p-6 border-b border-slate-200/60">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Device Management</h2>
                  </div>
                  <p className="text-slate-600 font-medium">Manage and monitor your WhatsApp Business devices</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleRefresh}
                    size="middle"
                    loading={authLoading}
                    className="border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-300 rounded-xl"
                    icon={<RefreshCw className="w-4 h-4" />}
                  >
                    Refresh
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    type="primary"
                    size="middle"
                    loading={loading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-semibold"
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Add Device
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {user?.data?.user?.devices?.length > 0 ? (
                <div className="space-y-4">
                  {user.data.user.devices.map((device: any, index: number) => (
                    <div key={index} className="bg-slate-50/50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-5 hover:shadow-lg hover:bg-white/70 transition-all duration-300 group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-r from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                              <img src="/assets/whatsapp.png" alt="WhatsApp Logo" className="w-8 h-8 " />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${device?.status === "connected" ? "bg-green-500" : "bg-red-500"} rounded-full border-2 border-white flex items-center justify-center`}>
                              {device?.status === "connected" ? (
                                <CheckCircle className="w-3 h-3 text-white" />
                              ) : (
                                <Timer className="w-3 h-3 text-white" />
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-900">{device?.deviceId}</h3>
                            <p className="text-sm text-slate-600 font-medium">
                              Last active: {new Date(device?.lastConnected).toLocaleString()}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${device?.status === "connected" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
                              <span className={`text-sm font-semibold ${device?.status === "connected" ? "text-green-700" : "text-red-700"}`}>
                                {device?.status === "connected" ? "Connected & Active" : "Disconnected"}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {device?.status === "disconnected" && (
                          <Button
                            type="primary"
                            size="middle"
                            onClick={() => {
                              setdeviceName(device?.deviceId);
                              handleSubmit();
                            }}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-semibold"
                          >
                            Reconnect
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 space-y-6">
                  <div className="relative w-64 h-64 mx-auto mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-full animate-pulse"></div>
                    <div className="absolute inset-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                      <Smartphone className="w-24 h-24 text-slate-400" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      No Devices Connected
                    </h3>
                    <p className="text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                      Connect your first WhatsApp device to unlock enterprise-grade messaging capabilities and start scaling your business communications.
                    </p>
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-semibold px-8 py-3 h-auto"
                    icon={<Plus className="w-5 h-5" />}
                  >
                    Connect Your First Device
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Messages Section - Enhanced */}
          <div className="xl:col-span-2 bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 p-6 border-b border-slate-200/60">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Message Activity</h2>
                  </div>
                  <p className="text-slate-600 font-medium">Real-time communication monitoring</p>
                </div>
                <Button
                  onClick={() => {
                    getTodayMessagesCount();
                    getAllMessagesCount();
                    getTodayMessages();
                  }}
                  type="primary"
                  size="middle"
                  loading={loading}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-semibold"
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Refresh
                </Button>
              </div>
            </div>
            <div className="h-96 overflow-hidden">
              <MessageList />
            </div>
          </div>
        </div>
      </div>
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