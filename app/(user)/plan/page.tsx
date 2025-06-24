"use client"
import React, { useState } from 'react';
import { Wifi, Smartphone, Calendar, Crown, Zap, Shield } from 'lucide-react';

const PricingPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [hoveredPlan, setHoveredPlan] = useState(null);

  // Sample data based on your schema - Vodafone style
  const plans = [
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
      color: "bg-blue-500"
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
      color: "bg-purple-500"
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
      color: "bg-amber-500"
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
      color: "bg-green-500"
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
      color: "bg-red-500"
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
      color: "bg-indigo-500"
    }
  ];

  const formatPrice = (price:string) => {
    return `₹ ${price}`;
  };

  const formatDuration = (days:number) => {

    if (days >= 365) return `${Math.floor(days / 365)} Year`;
    return `${days} Days`;
  };

  const handlePayment = (planId:any) => {

    setSelectedPlan(planId);
    // Handle payment logic here
    console.log('Processing payment for plan:', planId);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg ">
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

     

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan:any) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={plan._id}
                className={`relative bg-white rounded-2xl p-6 border border-gray-200 transition-all duration-300 hover:shadow-lg ${
                  hoveredPlan === plan?._id ? 'transform-translate-y-2' : ''
                }`}
                onMouseEnter={() => setHoveredPlan(plan?._id)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {/* Plan Header */}
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-xl ${plan.color} flex items-center justify-center mr-4`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                  </div>
                </div>

                {/* Validity */}
                <div className="flex items-center text-gray-600 text-sm mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  Valid for {formatDuration(plan.durationDays)}
                </div>

                {/* Plan Details */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Messages:</span>
                    <span className="text-gray-800 font-semibold">
                      {plan.type === 'unlimited' ? 'Unlimited' : `${plan.messageLimit?.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Devices:</span>
                    <span className="text-gray-800 font-semibold">{plan.deviceLimit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className={`font-semibold ${plan.type === 'unlimited' ? 'text-green-400' : 'text-blue-400'}`}>
                      {plan.type === 'unlimited' ? 'Unlimited' : 'Limited'}
                    </span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    {formatPrice(plan.price)}
                  </div>
                  <div className="text-gray-600 text-sm">Only</div>
                </div>

                {/* Pay Button */}
                <button
                  onClick={() => handlePayment(plan._id)}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    selectedPlan === plan._id
                      ? 'bg-green-500 text-white'
                      : `${plan.color} text-white hover:opacity-90 hover:scale-105`
                  } active:scale-95`}
                >
                  {selectedPlan === plan._id ? 'Processing...' : 'Pay'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
            {[
              'Secure Payment',
              'Instant Activation', 
              '24/7 Support',
              'Money Back Guarantee'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Need Help Choosing?</h3>
            <p className="text-gray-600 mb-4">Our experts are here to help you find the perfect plan</p>
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