"use client";
import QRCode from "react-qr-code";
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
  paymentMethod?: "qr" | "bank";
  bankDetails?: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branchName: string;
  };
  status: "pending" | "approved" | "rejected";
  user: string;
  plan: Plan;
  date: string;
}

const PricingPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loadingPlans, setLoadingPlans] = useState<Set<string>>(new Set());
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
  
  // Payment method selection
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'qr' | 'bank'>('qr');

  // Payment settings from database
  const [paymentSettings, setPaymentSettings] = useState<any>(null);

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
    console.log(plan)
    setSelectedPlanForManual(plan);
    setManualPaymentModalOpen(true);
  };

  const handleManualPaymentSubmit = async (plan: any) => {
    if (!plan) {
      setSelectedPlanForManual(plan);
      toast.error("Please select plan");
      return;
    }
    
    console.log(plan)
    setIsSubmittingManual(true);
    setLoadingPlans(prev => new Set(prev).add(plan._id));
    // await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const formData = new FormData();
      formData.append("planId", plan?._id || '');
      formData.append("utrNumber", utrNumber || "0000000");
      formData.append("paymentMethod", selectedPaymentMethod);
      
      if (screenshotFile) formData.append("screenshot", screenshotFile);

      // Debug: Log the data being sent
      console.log("Submitting payment with:", {
        planId: plan?._id,
        utrNumber: utrNumber || "0000000",
        paymentMethod: selectedPaymentMethod
      });

      const res = await api.post("/payment/manual-payment", formData);
      // const result = await createManualPayment(formData);

      if (res?.data?.success) {
        toast.success(res?.data?.message || "Payment submitted for approval!");
        setManualPaymentModalOpen(false);
        setScreenshotFile(null);
        setUtrNumber("");
        setSelectedPaymentMethod('qr');
        
        // Refresh the page after successful payment
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(res?.data?.message || "Failed to submit payment");
      }
    } catch (error) {
      console.error("Manual payment error:", error);
      toast.error("Failed to submit payment");
    } finally {
      setIsSubmittingManual(false);
      setLoadingPlans(prev => {
        const newSet = new Set(prev);
        newSet.delete(plan._id);
        return newSet;
      });
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
    console.log("User payments response:", res);
    console.log("User payments from context:", userPayments);
    if (res?.payments) {
      console.log("Setting payment history:", res.payments);
      setPaymentHistory(res.payments);
    }
  };

  const fetchPaymentSettings = async () => {
    try {
      const res = await api.get("/payment-settings");
      if (res?.data?.success) {
        console.log("Payment settings fetched:", res.data.data);
        setPaymentSettings(res.data.data);
        
        // Set default payment method based on what's enabled
        if (res.data.data.qrUpiEnabled) {
          setSelectedPaymentMethod('qr');
        } else if (res.data.data.bankAccountEnabled) {
          setSelectedPaymentMethod('bank');
        }
      }
    } catch (error) {
      console.error("Error fetching payment settings:", error);
    }
  };

  const fetchallPlans = async () => {
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

  useEffect(() => {
    fetchallPlans();
    fetchPaymentSettings();
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
        className={`relative bg-white rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
          subscription.status === "active"
            ? "border-green-200 shadow-md ring-1 ring-green-100"
            : subscription.status === "expired"
            ? "border-red-200 shadow-md ring-1 ring-red-100"
            : "border-yellow-200 shadow-sm ring-1 ring-yellow-100"
        }`}
      >
        <div className="absolute top-2 right-4">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
              subscription.status === "active"
                ? "bg-green-100 text-green-700"
                : subscription.status === "expired"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
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

        <div className="p-4">
          {/* Header */}
          <div className="flex items-center mb-3">
          <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getColorForPlan(
              subscription.plan.name
              )} flex items-center justify-center mr-3 shadow-sm`}
          >
              <IconComponent className="w-5 h-5 text-white" />
          </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-800 truncate">
              {subscription.plan.name}
            </h3>
              <p className="text-sm text-gray-500 truncate">
              {formatPrice(subscription.plan.price)} Plan
            </p>
          </div>
        </div>

          {/* Status and Duration */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-gray-50 rounded-md p-2 text-center">
              <CalendarIcon className="w-3 h-3 text-gray-500 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Duration</p>
              <p className="text-xs font-semibold text-gray-800">
              {formatDuration(subscription.plan.durationDays)}
            </p>
          </div>
            <div className="bg-gray-50 rounded-md p-2 text-center">
              <Users className="w-3 h-3 text-gray-500 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Devices</p>
              <p className="text-xs font-semibold text-gray-800">
              {subscription.plan.deviceLimit}
            </p>
          </div>
        </div>

          {/* Messages Usage */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
                <MessageSquare className="w-3 h-3 text-gray-500 mr-1" />
                <span className="text-xs text-gray-600">Messages</span>
            </div>
              <span className="text-xs font-semibold text-gray-800">
              {subscription.plan.type === "unlimited"
                ? `${subscription.usedMessages.toLocaleString()} sent`
                : `${subscription.usedMessages.toLocaleString()} / ${subscription.plan.messageLimit.toLocaleString()}`}
            </span>
          </div>
          {subscription.plan.type !== "unlimited" && (
              <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                  className={`h-1 rounded-full transition-all duration-300 ${
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

          {/* Days Remaining */}
          {subscription.status === "active" && (
            <div className="mb-3">
              <div className="flex justify-center">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    daysRemaining > 7
                      ? "bg-green-100 text-green-700"
                      : daysRemaining > 3
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {daysRemaining > 0 ? `${daysRemaining} days left` : "Expired"}
                </span>
              </div>
            </div>
          )}

          {/* Action Button */}
          {subscription.status === "inactive" && (
            <button
              onClick={async () => {
                await switchPlan(subscription.id);
              }}
              className="w-full py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm"
            >
              <div className="flex items-center justify-center">
                <Play className="w-3 h-3 mr-1" />
                <span>Activate</span>
              </div>
            </button>
          )}

          {/* Date Range */}
          <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span>Start: {formatDate(subscription.startDate)}</span>
          <span>End: {formatDate(subscription.endDate)}</span>
          </div>
        </div>
      </div>
    );
  };

  const PaymentHistoryCard = ({ payment }: { payment: any }) => {
    const isManualPayment = payment.paymentMode === "manual";
    
    // Debug: Log payment data to see what fields are available
    console.log("Payment data:", payment);

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
                {payment.plan?.name || "Unknown Plan"}
              </h4>
              <p className="text-sm text-gray-600">
                {formatDate(payment.date)}
              </p>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    isManualPayment
                      ? payment.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {isManualPayment ? (
                    <>
                      {payment.status === "approved" ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : payment.status === "rejected" ? (
                        <XCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {payment.status}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Success
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-800">
              {formatPrice(payment.plan?.price || 0)}
            </p>
            <p className="text-sm text-gray-500">
              {payment.paymentMode === "razorpay" ? "Online Payment" : "Manual Payment"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Payment Mode and Method */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Payment Mode:</span>
              <p className="text-gray-800 font-medium">
                {payment.paymentMode === "razorpay" ? "Online (Razorpay)" : "Manual"}
              </p>
            </div>
            {isManualPayment && (
              <div>
                <span className="text-gray-500">Payment Method:</span>
                <p className="text-gray-800 font-medium">
                  {payment.paymentMethod === 'bank' 
                    ? 'Bank Transfer (NEFT/RTGS)' 
                    : 'QR Code & UPI'}
                </p>
              </div>
            )}
          </div>

          {/* Razorpay Details */}
          {!isManualPayment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {payment.razorpay_order_id && (
                <div>
                  <span className="text-gray-500">Order ID:</span>
                  <p className="font-mono text-gray-800 text-xs break-all">
                    {payment.razorpay_order_id}
                  </p>
                </div>
              )}
              {payment.razorpay_payment_id && (
                <div>
                  <span className="text-gray-500">Payment ID:</span>
                  <p className="font-mono text-gray-800 text-xs break-all">
                    {payment.razorpay_payment_id}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Manual Payment Details */}
          {isManualPayment && (
            <div className="space-y-4">
              {payment.utrNumber && (
                <div>
                  <span className="text-gray-500">UTR Number:</span>
                  <p className="font-mono text-gray-800 font-medium">
                    {payment.utrNumber}
                  </p>
                </div>
              )}

              {/* Bank Details - Only show for bank transfers */}
              {payment.paymentMethod === 'bank' && payment.bankDetails && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-blue-900 mb-2">Bank Transfer Details</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-blue-700 font-medium">Account Holder:</span>
                      <p className="text-blue-800">{payment.bankDetails.accountHolderName}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Bank:</span>
                      <p className="text-blue-800">{payment.bankDetails.bankName}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Account No:</span>
                      <p className="text-blue-800 font-mono">{payment.bankDetails.accountNumber}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">IFSC:</span>
                      <p className="text-blue-800 font-mono">{payment.bankDetails.ifscCode}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-blue-700 font-medium">Branch:</span>
                      <p className="text-blue-800">{payment.bankDetails.branchName}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {payment.screenshotUrl && (
                <div>
                  <span className="text-gray-500">Payment Proof:</span>
                  <div className="mt-1">
                    <a
                      href={payment.screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      View Screenshot
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Plan Details */}
          <div className="border-t border-gray-100 pt-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Plan Details</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Plan Name:</span>
                <p className="text-gray-800 font-medium">{payment.plan?.name || "N/A"}</p>
              </div>
              <div>
                <span className="text-gray-500">Duration:</span>
                <p className="text-gray-800">{payment.plan?.durationDays ? formatDuration(payment.plan.durationDays) : "N/A"}</p>
              </div>
              <div>
                <span className="text-gray-500">Messages:</span>
                <p className="text-gray-800">
                  {payment.plan?.type === "unlimited" 
                    ? "Unlimited" 
                    : payment.plan?.messageLimit ? payment.plan.messageLimit.toLocaleString() : "N/A"}
                </p>
              </div>
            </div>
          </div>
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
                  onClick={() => {
                    getAllUserSubscriptions();
                    setActiveTab("current");
                  }}
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
          <div className="mb-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Your Subscriptions
              </h2>
              <p className="text-gray-600 text-sm">
                Monitor your active and queued subscriptions
              </p>
            </div>

            {currentSubscriptions?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
                {currentSubscriptions.map((subscription) => (
                  <SubscriptionCard
                    key={subscription.id}
                    subscription={subscription}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Active Subscriptions
                </h3>
                <p className="text-gray-500 mb-4 text-sm">
                  Get started by choosing a plan that fits your needs
                </p>
                <button
                  onClick={() => setActiveTab("plans")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 text-sm"
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
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-medium mb-4 shadow-md">
                <Zap className="w-4 h-4 mr-2" />
                Choose Your Plan
              </div>
           
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 max-w-7xl mx-auto">
              {plans.map((plan) => {
                const IconComponent = plan.icon;
                return (
                  <div
                    key={plan._id}
                    className={`relative bg-white rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                      plan.popular
                        ? "border-indigo-300 ring-1 ring-indigo-200 shadow-md"
                        : "border-gray-200 shadow-sm hover:border-gray-300"
                    }`}
                    onMouseEnter={() => setHoveredPlan(plan._id)}
                    onMouseLeave={() => setHoveredPlan(null)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-full shadow-md">
                          <Star className="w-4 h-4 mr-1" />
                          Popular
                        </span>
                      </div>
                    )}

                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-center mb-3">
                      <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center mr-3 shadow-sm`}
                      >
                          <IconComponent className="w-5 h-5 text-white" />
                      </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-gray-800 truncate">
                          {plan.name}
                        </h3>
                          <p className="text-sm text-gray-500 truncate">
                          {plan.description}
                        </p>
                      </div>
                    </div>

                      {/* Price */}
                      <div className="text-center mb-3">
                        <div className="text-2xl font-bold text-gray-800">
                          {formatPrice(plan.price)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDuration(plan.durationDays)}
                      </div>
                        </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-gray-50 rounded-md p-3 text-center">
                          <MessageSquare className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                          <p className="text-sm text-gray-600 font-medium">Messages</p>
                          <p className="text-sm font-bold text-gray-800">
                          {plan.type === "unlimited"
                            ? "Unlimited"
                              : plan.messageLimit && plan.messageLimit >= 1000 
                                ? `${(plan.messageLimit / 1000).toFixed(0)}K`
                            : plan.messageLimit?.toLocaleString()}
                          </p>
                      </div>
                        <div className="bg-gray-50 rounded-md p-3 text-center">
                          <Users className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                          <p className="text-sm text-gray-600 font-medium">Devices</p>
                          <p className="text-sm font-bold text-gray-800">
                          {plan.deviceLimit}
                          </p>
                      </div>
                        </div>

                      {/* Type Badge */}
                      <div className="flex justify-center mb-3">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                            plan.type === "unlimited"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {plan.type === "unlimited" ? "Unlimited" : "Limited"}
                        </span>
                    </div>

                      {/* Button */}
                      <button
                        onClick={() => {
                          if (plan.name.includes("Free Tier")) {
                            setSelectedPlanForManual(plan);
                            handleManualPaymentSubmit(plan);
                          } else handleManualPaymentClick(plan);
                        }}
                        disabled={loadingPlans.has(plan._id)}
                        className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                          loadingPlans.has(plan._id)
                            ? "bg-green-500 text-white cursor-not-allowed"
                            : plan.popular
                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-sm"
                            : `bg-gradient-to-r ${plan.color} text-white hover:shadow-md`
                        }`}
                      >
                          {loadingPlans.has(plan._id) ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <CreditCard className="w-4 h-4 mr-2" />
                            <span>Select Plan</span>
                        </div>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1 text-sm">
                        {feature.label}
                      </h4>
                      <p className="text-xs text-gray-600">{feature.desc}</p>
                    </div>
                  ))}
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
      <DialogContent className="max-w-2xl p-6 rounded-lg max-h-[90vh] overflow-y-auto scrollbar-hide top-[50%] -translate-y-1/2">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Manual Payment Submission
          </DialogTitle>
          <DialogDescription>
            Choose your payment method and complete the transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Plan details */}
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
                ? `₹${selectedPlanForManual.price}`
                : ""}
            </p>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium text-gray-900">Choose Payment Method</Label>
            <div className="grid grid-cols-2 gap-4">
              {/* QR Code & UPI Option - Only show if enabled and not bank transfer selected */}
              {paymentSettings?.qrUpiEnabled && selectedPaymentMethod !== 'bank' && (
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPaymentMethod === 'qr' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                  onClick={() => setSelectedPaymentMethod('qr')}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      selectedPaymentMethod === 'qr' ? 'bg-green-500' : 'bg-gray-200'
                    }`}>
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">QR Code & UPI</h4>
                      <p className="text-sm text-gray-500">Instant payment</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Account Option - Only show if enabled and not QR selected */}
              {paymentSettings?.bankAccountEnabled && selectedPaymentMethod !== 'qr' && (
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPaymentMethod === 'bank' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedPaymentMethod('bank')}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      selectedPaymentMethod === 'bank' ? 'bg-blue-500' : 'bg-gray-200'
                    }`}>
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Bank Transfer</h4>
                      <p className="text-sm text-gray-500">NEFT/RTGS</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* QR CODE SECTION */}
          {selectedPaymentMethod === 'qr' && (
            <div className="text-center p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-800">
                  Scan QR to Pay
                </h3>
                {paymentSettings?.bankAccountEnabled && (
                  <button
                    onClick={() => setSelectedPaymentMethod('bank')}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Use Bank Transfer instead
                  </button>
                )}
              </div>
              <div className="flex justify-center">
                {paymentSettings?.qrCodeImage ? (
                  <img 
                    src={paymentSettings.qrCodeImage} 
                    alt="Payment QR Code" 
                    className="h-48 w-48 object-contain"
                  />
                ) : (
                  <QRCode
                    value={`upi://pay?pa=${paymentSettings?.upiId || 'abhishekssingh0000-1@okicici'}&pn=${paymentSettings?.upiName || 'Abhishek'}&am=${
                      selectedPlanForManual?.price || 0
                    }&cu=INR`}
                    size={180}
                    className="mx-auto"
                  />
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                UPI ID: <span className="font-medium">{paymentSettings?.upiId || 'abhishekssingh0000-1@okicici'}</span>
              </p>
              <p className="text-xs text-gray-400">Scan using any UPI app</p>
            </div>
          )}

          {/* Bank Account Details */}
          {selectedPaymentMethod === 'bank' && (
            <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">Bank Account Details</h3>
                {paymentSettings?.qrUpiEnabled && (
                  <button
                    onClick={() => setSelectedPaymentMethod('qr')}
                    className="text-sm text-green-600 hover:text-green-800 underline"
                  >
                    Use QR Code & UPI instead
                  </button>
                )}
              </div>
              
              {paymentSettings?.bankDetails ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-blue-900 mb-3">Bank Account Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-blue-800">Account Holder:</span>
                        <p className="text-blue-700">{paymentSettings.bankDetails.accountHolderName}</p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Bank Name:</span>
                        <p className="text-blue-700">{paymentSettings.bankDetails.bankName}</p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Account Number:</span>
                        <p className="text-blue-700 font-mono">{paymentSettings.bankDetails.accountNumber}</p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">IFSC Code:</span>
                        <p className="text-blue-700 font-mono">{paymentSettings.bankDetails.ifscCode}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium text-blue-800">Branch Name:</span>
                        <p className="text-blue-700">{paymentSettings.bankDetails.branchName}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-900">Payment Instructions</h4>
                        <ul className="text-sm text-amber-700 mt-1 space-y-1">
                          <li>• Transfer the exact amount: ₹{selectedPlanForManual?.price}</li>
                          <li>• Use the bank details above for NEFT/RTGS</li>
                          <li>• Keep your UTR number for reference</li>
                          <li>• Upload payment screenshot as proof</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Bank account details not configured</p>
                </div>
              )}
            </div>
          )}

          {/* UTR input */}
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

          {/* Screenshot Upload */}
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
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
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

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setManualPaymentModalOpen(false)}
              disabled={isSubmittingManual}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleManualPaymentSubmit(selectedPlanForManual)}
              disabled={
                isSubmittingManual || 
                !utrNumber || 
                !screenshotFile ||
                !paymentSettings ||
                (selectedPaymentMethod === 'bank' && !paymentSettings?.bankAccountEnabled) ||
                (selectedPaymentMethod === 'qr' && !paymentSettings?.qrUpiEnabled)
              }
            >
              {isSubmittingManual ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                "Submit for Approval"
              )}
            </Button>
          </div>

          {/* Info Box */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Your subscription will be activated after manual verification.
                  This process may take up to 24 hours during business days.
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
