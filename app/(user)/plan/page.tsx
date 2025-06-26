"use client";
import React, { useEffect, useState } from "react";
import { Wifi, Smartphone, Calendar, Crown, Zap, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const PricingPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const { getAllPlans, createOrder, verifyPayment } = useAuth();

  const loadRazorpayScript = async () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  useEffect(() => {
    getAllPlans().then((data: any) => {
      if (data?.plans && Array.isArray(data.plans)) {
        const formattedPlans = data?.plans?.map((plan: any) => ({
          ...plan,
          icon: getIconForPlan(plan.name),
          color: getColorForPlan(plan.name),
          description: `Send ${
            plan.type === "unlimited"
              ? "Unlimited"
              : `up to ${formatMessageLimit(plan.messageLimit)} `
          } Messages `,
          features: getFeatures("premium"),
        }));
        setPlans(formattedPlans);
      }
    });
  }, []);

  const formatMessageLimit = (limit: number | null) => {
    if (!limit) return "";
    return limit >= 1000 ? `${limit / 1000}K` : limit;
  };

  const getIconForPlan = (planName: string) => {
    if (planName.toLowerCase().includes("pro")) return Wifi;
    if (planName.toLowerCase().includes("premium")) return Crown;
    if (planName.toLowerCase().includes("business")) return Shield;
    if (planName.toLowerCase().includes("ultimate")) return Zap;
    return Smartphone;
  };

  const getColorForPlan = (planName: string) => {
    if (planName.toLowerCase().includes("pro")) return "bg-purple-500";
    if (planName.toLowerCase().includes("premium")) return "bg-indigo-500";
    if (planName.toLowerCase().includes("business")) return "bg-green-500";
    if (planName.toLowerCase().includes("ultimate")) return "bg-red-500";
    return "bg-blue-500";
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

  const [plans, setPlans] = useState([
    {
      _id: "1",
      name: "Basic 10",
      type: "limited",
      messageLimit: 1000,
      deviceLimit: 1,
      durationDays: 28,
      price: 200,
      currency: "INR",
      status: "active",
      description: "Add Upto 1K Messages and Plans",
      icon: Smartphone,
      color: "bg-blue-500",
      features: getFeatures("basic"),
    },
    {
      _id: "2",
      name: "Pro 20",
      type: "limited",
      messageLimit: 5000,
      deviceLimit: 2,
      durationDays: 28,
      price: 350,
      currency: "INR",
      status: "active",
      description: "Add Upto 5K Messages and Plans",
      icon: Wifi,
      color: "bg-purple-500",
      features: getFeatures("pro"),
    },
    {
      _id: "3",
      name: "Elite 10",
      type: "limited",
      messageLimit: 2000,
      deviceLimit: 1,
      durationDays: 365,
      price: 2400,
      currency: "INR",
      status: "active",
      description: "Add Upto 2K Messages and Plans",
      icon: Crown,
      color: "bg-amber-500",
      features: getFeatures("elite"),
    },
    {
      _id: "4",
      name: "Business 20",
      type: "limited",
      messageLimit: 10000,
      deviceLimit: 3,
      durationDays: 365,
      price: 4200,
      currency: "INR",
      status: "active",
      description: "Add Upto 10K Messages and Plans",
      icon: Shield,
      color: "bg-green-500",
      features: getFeatures("business"),
    },
    {
      _id: "5",
      name: "Ultimate 99",
      type: "unlimited",
      messageLimit: null,
      deviceLimit: 5,
      durationDays: 28,
      price: 550,
      currency: "INR",
      status: "active",
      description: "Add Unlimited Messages and Plans",
      icon: Zap,
      color: "bg-red-500",
      features: getFeatures("unlimited"),
    },
    {
      _id: "6",
      name: "Premium 99",
      type: "unlimited",
      messageLimit: null,
      deviceLimit: 10,
      durationDays: 365,
      price: 6500,
      currency: "INR",
      status: "active",
      description: "Add Unlimited Messages and Plans",
      icon: Crown,
      color: "bg-indigo-500",
      features: getFeatures("premium"),
    },
  ]);

  const formatPrice = (price: string) => {
    return `₹ ${price}`;
  };

  const formatDuration = (days: number) => {
    if (days >= 365) return `${Math.floor(days / 365)} Year`;
    return `${days} Days`;
  };

  const handlePayment = async (planId: any) => {
    setSelectedPlan(planId);
    // console.log(planId);
    // console.log("Processing payment for plan:", planId);
    // setSelectedPlan(planId);

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
        name: "MsgZone", 
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
            toast.success("Payment Successful and Plan Activated!");
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

  // useEffect(() => {
  //   getAllPlans().then((data) => {
  //     console.log(data);
  //   });
  // }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg">
            <Zap className="w-5 h-5 mr-2" />
            Choose Your Perfect Plan
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            Premium Plans
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock powerful features with our flexible pricing options
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan: any) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={plan._id}
                className={`relative bg-white rounded-2xl p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg ${
                  hoveredPlan === plan?._id ? "transform-translate-y-2" : ""
                }`}
                onMouseEnter={() => setHoveredPlan(plan?._id)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                <div className="flex items-center mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${plan.color} flex items-center justify-center mr-4`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-600 text-sm mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  Valid for {formatDuration(plan.durationDays)}
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Messages:</span>
                    <span className="text-gray-800 font-semibold">
                      {plan.type === "unlimited"
                        ? "Unlimited"
                        : `${plan.messageLimit?.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Devices:</span>
                    <span className="text-gray-800 font-semibold">
                      {plan.deviceLimit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span
                      className={`font-semibold ${
                        plan.type === "unlimited"
                          ? "text-green-400"
                          : "text-blue-400"
                      }`}
                    >
                      {plan.type === "unlimited" ? "Unlimited" : "Limited"}
                    </span>
                  </div>

                  {/* Features List */}
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-700">
                      Features:
                    </p>
                    {plan?.features?.map((feature: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    {formatPrice(plan.price)}
                  </div>
                  <div className="text-gray-600 text-sm">Only</div>
                </div>

                <button
                  onClick={() => handlePayment(plan._id)}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    selectedPlan === plan._id
                      ? "bg-green-500 text-white"
                      : `${plan.color} text-white hover:opacity-90 hover:scale-105`
                  } active:scale-95`}
                >
                  {selectedPlan === plan._id ? "Processing..." : "Pay"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
            {[
              "Secure Payment",
              "Instant Activation",
              "24/7 Support",
              "Money Back Guarantee",
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Need Help Choosing?
            </h3>
            <p className="text-gray-600 mb-4">
              Our experts are here to help you find the perfect plan
            </p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-300">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;
