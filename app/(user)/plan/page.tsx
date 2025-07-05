"use client";
import React, { useEffect, useState } from "react";
import {
  Wifi,
  Smartphone,
  Calendar,
  Crown,
  Zap,
  Shield,
  Clock,
  Users,
  MessageSquare,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  Activity,
  TrendingUp,
  Star,
  Gift,
  Play,
  XCircle,
  Upload,
  FileText,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";

interface Plan {
  _id: string;
  name: string;
  price: number;
  currency: string;
  durationDays: number;
  messageLimit: number;
  deviceLimit: number;
  type: string;
  popular: boolean;
}

interface Subscription {
  id: string;
  plan: Plan;
  startDate: string;
  endDate: string;
  usedMessages: number;
  deviceIds: string[];
  status: "active" | "inactive" | "expired";
}

interface Payment {
  _id: string;
  paymentMode: "razorpay" | "manual";
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  utrNumber?: string;
  screenshotUrl?: string;
  status: "pending" | "approved" | "rejected";
  user: string;
  plan: Plan;
  date: string;
}

const PricingPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"current" | "history" | "plans">(
    "current"
  );
  const {
    getAllUserSubscriptions,
    allUserSubscriptions,
    getAllPlans,
    createOrder,
    verifyPayment,
    getUserPayments,
    userPayments,
    switchPlan,
    // createManualPayment,
  } = useAuth();

  // Manual payment state
  const [manualPaymentModalOpen, setManualPaymentModalOpen] = useState(false);
  const [selectedPlanForManual, setSelectedPlanForManual] =
    useState<Plan | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Data state
  const [currentSubscriptions, setCurrentSubscriptions] = useState<
    Subscription[]
  >([]);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<
    (Plan & {
      description: string;
      icon: React.ComponentType<{ className?: string }>;
      color: string;
      features: string[];
    })[]
  >([]);

  const loadRazorpayScript = async () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const formatMessageLimit = (limit: number | undefined) => {
    if (!limit) return "";
    return limit >= 1000 ? `${limit / 1000}K` : limit.toString();
  };

  const getIconForPlan = (planName: string) => {
    if (planName.toLowerCase().includes("pro")) return Wifi;
    if (planName.toLowerCase().includes("premium")) return Crown;
    if (planName.toLowerCase().includes("business")) return Shield;
    if (planName.toLowerCase().includes("ultimate")) return Zap;
    return Smartphone;
  };

  const getColorForPlan = (planName: string) => {
    if (planName.toLowerCase().includes("pro"))
      return "from-purple-500 to-purple-600";
    if (planName.toLowerCase().includes("premium"))
      return "from-indigo-500 to-indigo-600";
    if (planName.toLowerCase().includes("business"))
      return "from-green-500 to-green-600";
    if (planName.toLowerCase().includes("ultimate"))
      return "from-red-500 to-red-600";
    return "from-blue-500 to-blue-600";
  };

  const getFeatures = (planType: string) => {
    const baseFeatures = [
      "Bulk Messaging",
      "Message Scheduling",
      "Media Attachments with Captions",
      "Anti-Block System",
    ];

    if (
      planType === "unlimited" ||
      planType.includes("premium") ||
      planType.includes("ultimate")
    ) {
      return [
        ...baseFeatures,
        "AI-Powered Template Generator",
        "WhatsApp Marketing Tools",
        "API Integration",
      ];
    }

    return baseFeatures;
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

  const formatDuration = (days: number) => {
    if (days >= 365)
      return `${Math.floor(days / 365)} Year${
        Math.floor(days / 365) > 1 ? "s" : ""
      }`;
    return `${days} Days`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();

    if (isNaN(end.getTime())) {
      return 0;
    }

    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  const getUsagePercentage = (used: number, limit: number | undefined) => {
    if (!limit) return 0; // unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const handlePayment = async (planId: string) => {
    setSelectedPlan(planId);
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      const orderData = await createOrder(planId);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Msgzone",
        description: "Plan Purchase",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          const verifyRes = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            planId,
          });

          if (verifyRes?.success) {
            toast.success("Payment Successful!");
          } else {
            toast.error("Payment verification failed");
          }

          setSelectedPlan(null);
        },
        // prefill: {
        //   name: "Abhishek Singh",
        //   email: "abhi@example.com",
        //   contact: "9999999999",
        // },
        theme: {
          color: "#1D4ED8",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment Error:", err);
      toast.error("Payment Error!");
      setSelectedPlan(null);
    }
  };

  const handleManualPaymentClick = (plan: Plan) => {
    setSelectedPlanForManual(plan);
    setManualPaymentModalOpen(true);
  };

  const handleManualPaymentSubmit = async () => {
    if (!selectedPlanForManual || !utrNumber || !screenshotFile) {
      toast.error("Please fill all fields and upload a screenshot");
      return;
    }

    setIsSubmittingManual(true);
    // await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const formData = new FormData();
      formData.append("planId", selectedPlanForManual._id);
      formData.append("utrNumber", utrNumber);
      if(screenshotFile)
      formData.append("screenshot", screenshotFile);

       const res = await api.post("/payment/manual-payment", formData);
      // const result = await createManualPayment(formData);

      if (res?.data?.success) {
        toast.success("Payment submitted for approval!");
        setManualPaymentModalOpen(false);
        setScreenshotFile(null);
        setUtrNumber("");
        fetchPayments();
      } else {
        toast.error(res?.data?.message || "Failed to submit payment");
      }
    } catch (error) {
      console.error("Manual payment error:", error);
      toast.error("Failed to submit payment");
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshotFile(e.target.files[0]);
    }
  };

  const getDescription = (name: string) => {
    const descriptions: Record<string, string> = {
      PREMIUM: "Ultimate business solution",
      "Pro 1 months": "Great for growing teams",
      Basic: "Perfect for small businesses",
    };
    return descriptions[name] || "Flexible messaging plan";
  };

  const fetchPayments = async () => {
    const res = await getUserPayments();
    console.log(userPayments)
    if (res?.payments) {
      setPaymentHistory(res.payments);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const plansData = await getAllPlans();
      if (plansData?.plans) {
        const enhancedPlans = plansData.plans.map((plan: Plan) => ({
          ...plan,
          description: getDescription(plan.name),
          icon: getIconForPlan(plan.name),
          color: getColorForPlan(plan.name),
          features: getFeatures(plan.type),
        }));
        setPlans(enhancedPlans);
      }
      await getAllUserSubscriptions();
    };
    fetchData();
  }, []);

 
  useEffect(() => {
    if (allUserSubscriptions?.data) {
      setCurrentSubscriptions(allUserSubscriptions.data);
    }
  }, [allUserSubscriptions]);

  const SubscriptionCard = ({
    subscription,
  }: {
    subscription: Subscription;
  }) => {
    if (!subscription) return null;
    const IconComponent = getIconForPlan(subscription.plan.name);
    const daysRemaining = getDaysRemaining(subscription.endDate);
    const usagePercentage = getUsagePercentage(
      subscription.usedMessages,
      subscription.plan.messageLimit
    );

    return (
      <div
        className={`relative bg-white rounded-3xl p-6 border transition-all duration-300 hover:shadow-xl ${
          subscription.status === "active"
            ? "border-green-200 shadow-lg ring-2 ring-green-100"
            : "border-yellow-200 shadow-md ring-2 ring-yellow-100"
        }`}
      >
        <div className="absolute top-4 right-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              subscription.status === "active"
                ? "bg-green-100 text-green-800"
                : subscription.status === "expired"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {subscription.status === "active" ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" /> Active
              </>
            ) : subscription.status === "expired" ? (
              <>
                <XCircle className="w-3 h-3 mr-1" /> Expired
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 mr-1" /> Inactive
              </>
            )}
          </span>
        </div>

        <div className="flex items-center mb-6">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getColorForPlan(
              subscription.plan.name
            )} flex items-center justify-center mr-4 shadow-lg`}
          >
            <IconComponent className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800">
              {subscription.plan.name}
            </h3>
            <p className="text-gray-600 text-sm">
              {formatPrice(subscription.plan.price)} Plan
            </p>
          </div>

          {subscription.status === "inactive" && (
            <button
              onClick={async () => {
                await switchPlan(subscription.id);
              }}
              className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Play className="w-4 h-4" />
              Activate
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <CalendarIcon className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">
                Duration
              </span>
            </div>
            <p className="text-lg font-semibold text-gray-800">
              {formatDuration(subscription.plan.durationDays)}
            </p>
            {subscription.status === "active" && (
              <p
                className={`text-xs mt-1 ${
                  daysRemaining > 7 ? "text-green-600" : "text-red-600"
                }`}
              >
                {daysRemaining > 0 ? `${daysRemaining} days left` : "Expired"}
              </p>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <Smartphone className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">Device Limit</span>
            </div>
            <p className="text-lg font-semibold text-gray-800">
              {subscription.plan.deviceLimit}
            </p>
            <p className="text-xs text-gray-500 mt-1">Connected</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">
                Messages
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {subscription.plan.type === "unlimited"
                ? `${subscription.usedMessages.toLocaleString()} sent`
                : `${subscription.usedMessages.toLocaleString()} / ${subscription.plan.messageLimit.toLocaleString()}`}
            </span>
          </div>

          {subscription.plan.type !== "unlimited" && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  usagePercentage > 80
                    ? "bg-red-500"
                    : usagePercentage > 60
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
          )}
        </div>

        <div className="flex justify-between text-sm text-gray-600 pt-4 border-t border-gray-100">
          <span>Start: {formatDate(subscription.startDate)}</span>
          <span>End: {formatDate(subscription.endDate)}</span>
        </div>
      </div>
    );
  };

  const PaymentHistoryCard = ({ payment }: { payment: any }) => {
    const isManualPayment = payment.mode === "manual";

    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                isManualPayment
                  ? payment.status === "approved"
                    ? "bg-gradient-to-br from-green-500 to-green-600"
                    : payment.status === "rejected"
                    ? "bg-gradient-to-br from-red-500 to-red-600"
                    : "bg-gradient-to-br from-yellow-500 to-yellow-600"
                  : "bg-gradient-to-br from-blue-500 to-blue-600"
              }`}
            >
              {isManualPayment ? (
                <FileText className="w-6 h-6 text-white" />
              ) : (
                <CreditCard className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">
                {payment.plan.name}
              </h4>
              <p className="text-sm text-gray-600">
                {formatDate(payment.date)}
              </p>
              {isManualPayment && (
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {payment.status === "approved" ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : payment.status === "rejected" ? (
                      <XCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <Clock className="w-3 h-3 mr-1" />
                    )}
                    {payment.status}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-800">
              {formatPrice(payment.plan.price)}
            </p>
            {!isManualPayment && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Success
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {isManualPayment ? (
            <>
              <div>
                <span className="text-gray-500">UTR Number:</span>
                <p className="font-mono text-gray-800 truncate">
                  {payment.utrNumber || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Payment Mode:</span>
                <p className="text-gray-800">Manual Transfer</p>
              </div>
              {payment.screenshot && (
                <div className="col-span-2">
                  <span className="text-gray-500">Screenshot:</span>
                  <a
                    href={payment.screenshot}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    View Proof
                  </a>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <span className="text-gray-500">Order ID:</span>
                <p className="font-mono text-gray-800 truncate">
                  {payment.orderId}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Payment ID:</span>
                <p className="font-mono text-gray-800 truncate">
                  {payment.paymentId}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4 ">
      <div className="max-w-7xl mx-auto relative">
      

        <div className="mb-12">
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl p-2 border border-gray-200 shadow-lg">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("current")}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === "current"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  Current Subscriptions
                </button>
                <button
                  onClick={() => {
                    fetchPayments();
                    setActiveTab("history");
                  }}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === "history"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  Payment History
                </button>
                <button
                  onClick={() => setActiveTab("plans")}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === "plans"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  Available Plans
                </button>
              </div>
            </div>
          </div>
        </div>

        {activeTab === "current" && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Your Subscriptions
              </h2>
              <p className="text-gray-600">
                Monitor your active and queued subscriptions
              </p>
            </div>

            {currentSubscriptions?.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {currentSubscriptions.map((subscription) => (
                  <SubscriptionCard
                    key={subscription.id}
                    subscription={subscription}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Active Subscriptions
                </h3>
                <p className="text-gray-500 mb-6">
                  Get started by choosing a plan that fits your needs
                </p>
                <button
                  onClick={() => setActiveTab("plans")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Browse Plans
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Payment History
              </h2>
              <p className="text-gray-600">
                View all your previous transactions
              </p>
            </div>

            {paymentHistory?.length > 0 ? (
              <div className="space-y-4 max-w-4xl mx-auto">
                {paymentHistory.map((payment) => (
                  <PaymentHistoryCard key={payment._id} payment={payment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Payment History
                </h3>
                <p className="text-gray-500">
                  Your payment history will appear here once you make your first
                  purchase
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "plans" && (
          <div>
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg">
                <Zap className="w-5 h-5 mr-2" />
                Choose Your Perfect Plan
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Premium Plans
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Unlock powerful features with our flexible pricing options
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {plans.map((plan) => {
                const IconComponent = plan.icon;
                return (
                  <div
                    key={plan._id}
                    className={`relative bg-white rounded-3xl p-8 border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                      plan.popular
                        ? "border-indigo-200 ring-2 ring-indigo-100 shadow-xl"
                        : "border-gray-200 shadow-lg hover:border-indigo-200"
                    }`}
                    onMouseEnter={() => setHoveredPlan(plan._id)}
                    onMouseLeave={() => setHoveredPlan(null)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg">
                          <Star className="w-4 h-4 mr-1" />
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="flex items-center mb-6">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mr-4 shadow-lg`}
                      >
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">
                          {plan.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {plan.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-gray-500 mr-3" />
                          <span className="text-gray-700 font-medium">
                            Duration
                          </span>
                        </div>
                        <span className="text-gray-800 font-semibold">
                          {formatDuration(plan.durationDays)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center">
                          <MessageSquare className="w-5 h-5 text-gray-500 mr-3" />
                          <span className="text-gray-700 font-medium">
                            Messages
                          </span>
                        </div>
                        <span className="text-gray-800 font-semibold">
                          {plan.type === "unlimited"
                            ? "Unlimited"
                            : plan.messageLimit?.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center">
                          <Users className="w-5 h-5 text-gray-500 mr-3" />
                          <span className="text-gray-700 font-medium">
                            Devices
                          </span>
                        </div>
                        <span className="text-gray-800 font-semibold">
                          {plan.deviceLimit}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center">
                          <TrendingUp className="w-5 h-5 text-gray-500 mr-3" />
                          <span className="text-gray-700 font-medium">
                            Type
                          </span>
                        </div>
                        <span
                          className={`font-semibold px-3 py-1 rounded-full text-sm ${
                            plan.type === "unlimited"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {plan.type === "unlimited" ? "Unlimited" : "Limited"}
                        </span>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">
                        Features Included:
                      </h4>
                      <div className="space-y-3">
                        {plan.features?.map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-gray-700 text-sm">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-8">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-800 mb-2">
                          {formatPrice(plan.price)}
                        </div>
                        <div className="text-gray-600">
                          for {formatDuration(plan.durationDays)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-3 mt-6">
                      <button
                        onClick={() => handlePayment(plan._id)}
                        className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 ${
                          selectedPlan === plan._id
                            ? "bg-green-500 text-white"
                            : `bg-gradient-to-r ${plan.color} text-white hover:shadow-xl hover:scale-105 active:scale-95`
                        }`}
                      >
                        {selectedPlan === plan._id ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Processing...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <CreditCard className="w-5 h-5 mr-2" />
                            Pay Online
                          </div>
                        )}
                      </button>

                      <button
                        onClick={() => handleManualPaymentClick(plan)}
                        className="w-full py-3 px-6 rounded-2xl font-semibold bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 hover:shadow-md transition-all duration-300 flex items-center justify-center"
                      >
                        <FileText className="w-5 h-5 mr-2" />
                        Pay Manually
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-16 text-center">
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    {
                      icon: Shield,
                      label: "Secure Payment",
                      desc: "256-bit SSL encryption",
                    },
                    {
                      icon: Zap,
                      label: "Instant Activation",
                      desc: "Start immediately",
                    },
                    {
                      icon: Clock,
                      label: "24/7 Support",
                      desc: "Always here to help",
                    },
                    {
                      icon: Gift,
                      label: "Money Back",
                      desc: "30-day guarantee",
                    },
                  ].map((feature, index) => (
                    <div key={index} className="text-center group">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="w-8 h-8 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1">
                        {feature.label}
                      </h4>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white max-w-3xl mx-auto">
                <h3 className="text-3xl font-bold mb-4">Need Help Choosing?</h3>
                <p className="text-blue-100 mb-8 text-lg">
                  Our experts are here to help you find the perfect plan for
                  your business needs
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold hover:bg-blue-50 transition-all duration-300 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Live Chat Support
                  </button>
                  <button className="bg-blue-500 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-blue-400 transition-all duration-300 flex items-center justify-center border-2 border-blue-400">
                    <Calendar className="w-5 h-5 mr-2" />
                    Schedule a Call
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal  */}
        <Dialog
          open={manualPaymentModalOpen}
          onOpenChange={setManualPaymentModalOpen}
        >
          <DialogContent className="max-w-md p-6 rounded-lg max-h-[90vh] overflow-y-auto scrollbar-hide top-[50%] -translate-y-1/2">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Manual Payment Submission
              </DialogTitle>
              <DialogDescription>
                Upload your payment screenshot and enter UTR number for
                verification
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div>
                <Label htmlFor="plan-name">Selected Plan</Label>
                <Input
                  id="plan-name"
                  value={selectedPlanForManual?.name || ""}
                  disabled
                  className="mt-1 font-medium"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Amount:{" "}
                  {selectedPlanForManual
                    ? formatPrice(selectedPlanForManual.price)
                    : ""}
                </p>
              </div>

              <div>
                <Label htmlFor="utr-number">UTR Number*</Label>
                <Input
                  id="utr-number"
                  placeholder="Enter UTR/Transaction reference number"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Unique transaction reference number from your bank
                </p>
              </div>

              <div>
                <Label htmlFor="screenshot">Payment Screenshot*</Label>
                <div className="mt-1 flex items-center gap-4">
                  <Label
                    htmlFor="screenshot-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG (MAX. 5MB)
                      </p>
                    </div>
                    <Input
                      id="screenshot-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </Label>
                </div>
                {screenshotFile && (
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <FileText className="flex-shrink-0 h-4 w-4 mr-2" />
                    <span>{screenshotFile.name}</span>
                    <span className="ml-2 text-gray-500">
                      {(screenshotFile.size / 1024 / 1024).toFixed(2)}MB
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setManualPaymentModalOpen(false)}
                  disabled={isSubmittingManual}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleManualPaymentSubmit}
                  disabled={isSubmittingManual || !utrNumber || !screenshotFile}
                >
                  {isSubmittingManual ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit for Approval"
                  )}
                </Button>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Your subscription will be activated after manual
                      verification. This process may take up to 24 hours during
                      business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PricingPlans;
