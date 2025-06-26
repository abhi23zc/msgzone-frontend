"use client";
import CustomModal from "@/components/Modal";
import ProtectedRoute from "@/components/Protected";
import { useAuth } from "@/context/AuthContext";
import { useWhatsapp } from "@/context/WhatsappContext";
import { DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Modal, Table, Tooltip, Popconfirm, Avatar } from "antd";
import {
  CheckCircle,
  MessageSquare,
  User,
  Smartphone,
  Activity,
  Shield,
  XCircle,
  CirclePlus,
  CreditCard,
  Calendar,
  Clock,
} from "lucide-react";
import { useEffect, useState, type FC } from "react";
import toast from "react-hot-toast";

const Home: FC = () => {
  const { user, checkUser, getActivePlan, activePlan, getAllPlans, allPlans } = useAuth();
  const {
    startSession,
    TimeoutInterval,
    allMessagesCount,
    getAllMessagesCount,
    deleteDevice,
  } = useWhatsapp();
  const [isModalOpen, setisModalOpen] = useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const [deviceName, setdeviceName] = useState("");
  const [deleteLoading, setdeleteLoading] = useState(false);

  useEffect(() => {
    getAllMessagesCount();
    getActivePlan();
    getAllPlans();
    console.log(activePlan)
  }, []);

  const countDown = (qrData: string | null) => {
    let secondsToGo = 30;
    const instance = modal.success({
      title: "Scan Whatsapp",
      content: (
        <div className="flex justify-center w-full">
          {qrData && (
            <img
              src={qrData}
              className="w-full max-w-xs pr-5"
              alt="WhatsApp QR Code"
            />
          )}
        </div>
      ),
      maskClosable: false,
      onOk() {
        if (TimeoutInterval) clearTimeout(TimeoutInterval as NodeJS.Timeout);
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

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  const handlePlanCardClick = () => {
    setIsPlanModalOpen(true);
  };

  const summaryCards = [
    {
      title: "Total Devices",
      value: user?.data?.user?.devices?.length || 0,
      icon: <Smartphone className="w-6 h-6 text-white" />,
      gradient: "from-emerald-500 to-green-600",
    },
    {
      title: "Device Limit",
      value: activePlan?.data?.plan?.deviceLimit || 0,
      icon: <Activity className="w-6 h-6 text-white" />,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      title: `Subscription Status`,
      value: activePlan?.data?.plan?.name || "N/A",
      icon: <Shield className="w-6 h-6 text-white" />,
      gradient: "from-purple-500 to-violet-600",
      onClick: handlePlanCardClick,
    },
    {
      title: "All Messages Sent",
      value: allMessagesCount?.toLocaleString() ?? "0",
      icon: <MessageSquare className="w-6 h-6 text-white" />,
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  // Responsive Table Columns
  const deviceColumns = [
    {
      title: "Device",
      dataIndex: "deviceId",
      key: "deviceId",
      responsive: ["sm", "md", "lg", "xl"],
      render: (text: string) => (
        <span className="font-semibold text-slate-800 break-all">{text}</span>
      ),
    },
    {
      title: "Number",
      dataIndex: "number",
      key: "number",
      responsive: ["md", "lg", "xl"],
      render: (text: string) =>(
        <span className="font-normal text-slate-800 break-all">+{text}</span>
      )
    },
    // {
    //   title: "Sent",
    //   dataIndex: "sent",
    //   key: "sent",
    //   responsive: ["sm", "md", "lg", "xl"],
    //   render: (num: number) => (
    //     <span className="font-semibold text-green-600">{num || 0}</span>
    //   ),
    // },
    {
      title: "Last Active",
      dataIndex: "lastConnected",
      key: "lastConnected",
      responsive: ["md", "lg", "xl"],
      render: (date: string) =>
        date ? (
          <span className="text-slate-600">
            {new Date(date).toLocaleString()}
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      responsive: ["xs", "sm", "md", "lg", "xl"],
      render: (status: string) =>
        status === "connected" ? (
          <Tooltip title="Active & Connected">
            <span className="text-green-700 font-semibold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Active
            </span>
          </Tooltip>
        ) : (
          <Tooltip title="Disconnected">
            <span className="text-red-700 font-semibold flex items-center gap-1">
              <XCircle className="w-4 h-4" /> Inactive
            </span>
          </Tooltip>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      responsive: ["xs", "sm", "md", "lg", "xl"],
      render: function ActionsCell(_: any, record: any) {
        return (
          <div className="space-y-2">
            {record.status !== "connected" && (
              <Button
                type="primary"
                icon={<ReloadOutlined className="w-4 h-4" />}
                className="border-none shadow-md  transition-all duration-200 font-semibold flex items-center"
                onClick={() => {
                  setdeviceName(record.deviceId);
                  handleSubmit();
                }}
              >
                Reconnect
              </Button>
            )}
            <Popconfirm
              title="Are you sure you want to delete this device?"
              onConfirm={() => handleDeleteDevice(record.deviceId)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{
                danger: true,
                className:
                  "bg-gradient-to-r from-red-500 to-pink-500 border-none",
              }}
            >
              <Button
                danger
                type="primary"
                loading={deleteLoading}
                icon={<DeleteOutlined className="w-4 h-4" />}
                className="bg-gradient-to-r from-red-500 to-pink-500 border-none shadow-md hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-semibold flex items-center"
              >
                Delete
              </Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const deviceData =
    user?.data?.user?.devices?.map((device: any, idx: any) => ({
      key: idx,
      number: device?.number || "N/A",
      deviceId: device?.deviceId,
      sent: device?.sent || 0,
      lastConnected: device?.lastConnected,
      status: device?.status,
    })) || [];

  async function handleDeleteDevice(deviceId: string) {
    try {
      setdeleteLoading(true);
      await deleteDevice(deviceId);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
    setdeleteLoading(false);
  }

  return (
    <main className="h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 relative overflow-x-auto overflow-y-auto w-full">
      {/* Header */}
      <div className="w-full max-w-8xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 mt-2">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 pb-6 md:pb-8 border-b border-slate-200/60">
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            <Avatar
              size={56}
              src={user?.data?.user?.avatar || undefined}
              className="shadow-lg min-w-[56px]"
            />
            <div className="min-w-0">
              <p className="text-slate-600 text-base sm:text-lg font-medium truncate">
                Welcome back,{" "}
                <span className="text-slate-900 font-semibold">
                  {user?.data?.user?.name || "Professional"}
                </span>
              </p>
              <p className="text-xs sm:text-sm text-slate-500 truncate">
                Manage your WhatsApp Business communications with
                enterprise-grade reliability
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 mt-4 md:mt-0">
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-500 group flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                  {user?.data?.user?.name || "Professional User"}
                </p>
                <p className="text-xs text-slate-500 font-medium truncate">
                  {user?.data?.user?.email}
                </p>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 my-6 md:my-8">
          {summaryCards.map((card, idx) => (
            <div
              key={idx}
              className={`bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-500 group relative overflow-hidden min-w-0 ${
                card.onClick ? "cursor-pointer" : ""
              }`}
              onClick={card.onClick}
            >
              <div
                className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br ${card.gradient}/10 rounded-full -translate-y-10 sm:-translate-y-16 translate-x-10 sm:translate-x-16 group-hover:scale-110 transition-transform duration-700`}
              ></div>
              <div className="relative flex items-center gap-3 sm:gap-4">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
                >
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {card.value}
                  </h3>
                  <p className="text-slate-600 font-medium text-sm sm:text-base">
                    {card.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Device Management Table */}
        <section className="bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-x-auto p-3 sm:p-6 md:p-8 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex gap-2 sm:gap-3 ">
              <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                WhatsApp Devices
              </h2>
            </div>
            <Button
              type="primary"
              icon={<CirclePlus className="w-4 h-4" />}
              className="border-none shadow-md  transition-all duration-200 font-semibold flex items-center"
              onClick={() => {
                handleSubmit();
              }}
            >
              Add Device
            </Button>
          </div>
          <div className="w-full overflow-x-auto">
            <Table
              columns={deviceColumns as any}
              dataSource={deviceData}
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
                responsive: true,
                position: ["bottomCenter"],
              }}
              className="rounded-xl overflow-hidden min-w-[600px] md:min-w-0"
              scroll={{ x: 600 }}
              locale={{
                emptyText: (
                  <div className="text-center py-12 sm:py-16 space-y-4 sm:space-y-6">
                    <div className="relative w-40 h-40 sm:w-64 sm:h-64 mx-auto mb-4 sm:mb-8">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-full animate-pulse"></div>
                      <div className="absolute inset-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                        <Smartphone className="w-16 h-16 sm:w-24 sm:h-24 text-slate-400" />
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-4">
                      <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        No Devices Connected
                      </h3>
                      <p className="text-slate-600 font-medium max-w-xs sm:max-w-md mx-auto leading-relaxed text-sm sm:text-base">
                        Connect your first WhatsApp device to unlock
                        enterprise-grade messaging capabilities and start
                        scaling your business communications.
                      </p>
                    </div>
                  </div>
                ),
              }}
            />
          </div>
        </section>
      </div>
      <CustomModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setisModalOpen}
        props={{ countDown, startSession, deviceName, setdeviceName }}
      />
      {contextHolder}

      <Modal
        title="Subscription Plan Details"
        open={isPlanModalOpen}
        onCancel={() => setIsPlanModalOpen(false)}
        footer={null}
        centered
      >
        {activePlan?.data?.plan ? (
          <div className="space-y-6 py-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                {activePlan?.data?.plan?.name} Plan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <span className="text-slate-700">
                      Device Limit:{" "}
                      <strong>
                        {activePlan?.data?.plan?.deviceLimit === -1
                          ? "Unlimited"
                          : activePlan?.data?.plan?.deviceLimit}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <span className="text-slate-700">
                      Message Limit:{" "}
                      <strong>
                        {activePlan?.data?.plan?.messageLimit === -1
                          ? "Unlimited"
                          : activePlan?.data?.plan?.messageLimit}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="text-slate-700">
                      Currency:{" "}
                      <strong>{activePlan?.data?.plan?.currency}</strong>
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700">
                      Start Date:{" "}
                      <strong>
                        {new Date(
                          activePlan?.data?.startDate
                        ).toLocaleDateString()}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-red-600" />
                    <span className="text-slate-700">
                      End Date:{" "}
                      <strong>
                        {new Date(
                          activePlan?.data?.endDate
                        ).toLocaleDateString()}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-slate-700">
                      Duration:{" "}
                      <strong>
                        {activePlan?.data?.plan?.durationDays} days
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                Usage Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Messages Used:</span>
                  <strong className="text-green-700">
                    {activePlan?.data?.usedMessages}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Messages Remaining:</span>
                  <strong className="text-blue-700">
                    {activePlan?.data?.plan?.messageLimit === -1
                      ? "Unlimited"
                      : activePlan?.data?.plan?.messageLimit -
                        activePlan?.data?.usedMessages}
                  </strong>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{
                      width: `${
                        activePlan?.data?.plan?.messageLimit === -1
                          ? 0
                          : (activePlan?.data?.usedMessages /
                              activePlan?.data?.plan?.messageLimit) *
                            100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>No active plan details available.</p>
        )}

        {allPlans && allPlans.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Available Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPlans.map((plan: any) => (
                <div key={plan._id} className="bg-white rounded-lg shadow-md p-6">
                  <h4 className="text-lg font-semibold mb-2">{plan.name}</h4>
                  <p>Type: {plan.type}</p>
                  <p>Message Limit: {plan.messageLimit === -1 ? "Unlimited" : plan.messageLimit}</p>
                  <p>Device Limit: {plan.deviceLimit}</p>
                  <p>Duration: {plan.durationDays} days</p>
                  <p>Price: {plan.price} {plan.currency}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
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
