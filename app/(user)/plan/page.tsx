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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const PricingPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [activeTab, setActiveTab] = useState("current");
  const { getAllUserSubscriptions, allUserSubscriptions, getAllPlans, createOrder, verifyPayment } =
    useAuth();

  const loadRazorpayScript = async () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });


  const [currentSubscriptions, setCurrentSubscriptions] = useState([]);

  const [paymentHistory, setPaymentHistory] = useState([
    {
      _id: "pay_1",
      razorpay_order_id: "order_MK8j9L5Q2nP3oR",
      razorpay_payment_id: "pay_MK8j9L5Q2nP3oR",
      razorpay_signature: "signature_123",
      plan: {
        _id: "plan_1",
        name: "Premium 99",
        price: 6500,
        currency: "INR",
      },
      date: "2024-01-01T10:30:00Z",
    },
    {
      _id: "pay_2",
      razorpay_order_id: "order_NK7h8K4P1mO2nQ",
      razorpay_payment_id: "pay_NK7h8K4P1mO2nQ",
      razorpay_signature: "signature_456",
      plan: {
        _id: "plan_2",
        name: "Pro 20",
        price: 350,
        currency: "INR",
      },
      date: "2023-12-15T14:45:00Z",
    },
    {
      _id: "pay_3",
      razorpay_order_id: "order_PL9i0M6R3pQ4sT",
      razorpay_payment_id: "pay_PL9i0M6R3pQ4sT",
      razorpay_signature: "signature_789",
      plan: {
        _id: "plan_3",
        name: "Basic 10",
        price: 200,
        currency: "INR",
      },
      date: "2023-11-20T09:15:00Z",
    },
  ]);

  const formatMessageLimit = (limit: any) => {
    if (!limit) return "";
    return limit >= 1000 ? `${limit / 1000}K` : limit;
  };

  const getIconForPlan = (planName: any) => {
    if (planName.toLowerCase().includes("pro")) return Wifi;
    if (planName.toLowerCase().includes("premium")) return Crown;
    if (planName.toLowerCase().includes("business")) return Shield;
    if (planName.toLowerCase().includes("ultimate")) return Zap;
    return Smartphone;
  };

  const getColorForPlan = (planName: any) => {
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

  const getFeatures = (planType: any) => {
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
  const [plans, setPlans] = useState([]);

  const formatPrice = (price: any) => {
    return `₹${price.toLocaleString()}`;
  };

  const formatDuration = (days: any) => {
    if (days >= 365)
      return `${Math.floor(days / 365)} Year${
        Math.floor(days / 365) > 1 ? "s" : ""
      }`;
    return `${days} Days`;
  };

  const formatDate = (dateString: any) => {
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

  const getUsagePercentage = (used: any, limit: any) => {
    if (!limit) return 0; // unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const handlePayment = async (planId: any) => {
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
            toast.error("Payment verified failed");
          }

          setSelectedPlan(null);
        },
        prefill: {
          name: "Abhishek Singh", // Optional: Use logged-in user info
          email: "abhi@example.com",
          contact: "9999999999",
        },
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


  // const handlePayment = async (planId: string) => {
  //   setSelectedPlan(planId);
  //   // Payment logic here
  //   setTimeout(() => {
  //     setSelectedPlan(null);
  //   }, 2000);
  // };

  useEffect(() => {
    getAllPlans().then((data: any) => {
      if (data?.plans) {
        const enhancedPlans = data.plans.map((plan:any) => ({
          ...plan,
          description: getDescription(plan.name),
          icon: getIconForPlan(plan.name),
          color: getColorForPlan(plan.name),
          features: getFeatures("premium"),
        }));
        setPlans(enhancedPlans);
      }
    });
    getAllUserSubscriptions();
  }, []);

  useEffect(() => {
    setCurrentSubscriptions(allUserSubscriptions?.data);
  }, [allUserSubscriptions]);

  // Helper function to get description based on plan name
  const getDescription = (name: string) => {
    const descriptions = {
      PREMIUM: "Ultimate business solution",
      "Pro 1 months": "Great for growing teams",
      Basic: "Perfect for small businesses",
    };
    return descriptions[name as keyof typeof descriptions] || "Flexible messaging plan";
  };

  const SubscriptionCard = ({ subscription }: { subscription: any }) => {
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
          subscription.isActive
            ? "border-green-200 shadow-lg ring-2 ring-green-100"
            : "border-yellow-200 shadow-md ring-2 ring-yellow-100"
        }`}
      >
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              subscription.isActive
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {subscription.isActive ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 mr-1" />
                Queued
              </>
            )}
          </span>
        </div>

        {/* Plan Header */}
        <div className="flex items-center mb-6">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getColorForPlan(
              subscription.plan.name
            )} flex items-center justify-center mr-4 shadow-lg`}
          >
            <IconComponent className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              {subscription.plan.name}
            </h3>
            <p className="text-gray-600 text-sm">
              {formatPrice(subscription.plan.price)} Plan
            </p>
          </div>
        </div>

        {/* Plan Details */}
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
            {subscription.isActive && (
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
              <Users className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">Devices</span>
            </div>
            <p className="text-lg font-semibold text-gray-800">
              {subscription.deviceIds.length} / {subscription.plan.deviceLimit}
            </p>
            <p className="text-xs text-gray-500 mt-1">Connected</p>
          </div>
        </div>

        {/* Message Usage */}
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

        {/* Dates */}
        <div className="flex justify-between text-sm text-gray-600 pt-4 border-t border-gray-100">
          <span>Start: {formatDate(subscription.startDate)}</span>
          <span>End: {formatDate(subscription.endDate)}</span>
        </div>
      </div>
    );
  };

  const PaymentHistoryCard = ({ payment }: { payment: any }) => {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">
                {payment.plan.name}
              </h4>
              <p className="text-sm text-gray-600">
                {formatDate(payment.date)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-800">
              {formatPrice(payment.plan.price)}
            </p>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Success
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Order ID:</span>
            <p className="font-mono text-gray-800 truncate">
              {payment.razorpay_order_id}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Payment ID:</span>
            <p className="font-mono text-gray-800 truncate">
              {payment.razorpay_payment_id}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg">
            <Activity className="w-5 h-5 mr-2" />
            Subscription Dashboard
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
            Manage Your Plans
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your subscriptions, view payment history, and upgrade your
            plans
          </p>
        </div>

        {/* Tab Navigation */}
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
                  onClick={() => setActiveTab("history")}
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

        {/* Tab Content */}
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
                {currentSubscriptions.map((subscription:any) => (
                  <SubscriptionCard
                    key={subscription._id}
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

            {paymentHistory.length > 0 ? (
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
            {/* Pricing Plans Section */}
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
              {plans.map((plan:any) => {
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
                    {/* Popular Badge */}
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg">
                          <Star className="w-4 h-4 mr-1" />
                          Most Popular
                        </span>
                      </div>
                    )}

                    {/* Plan Header */}
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

                    {/* Plan Details */}
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

                    {/* Features */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">
                        Features Included:
                      </h4>
                      <div className="space-y-3">
                        {plan.features?.map((feature:any, index:number) => (
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

                    {/* Pricing */}
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

                    {/* CTA Button */}
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
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <CreditCard className="w-5 h-5 mr-2" />
                          Get Started
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Trust Indicators */}
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

            {/* Help Section */}
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
      </div>
    </div>
  );
};

export default PricingPlans;
