"use client";
import {
  CreditCard,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  Users,
  UserX,
  Activity,
  BarChart3,
} from "lucide-react";

import AdminChart from "@/components/admin/AdminChart";
import AdminLineChart from "@/components/admin/AdminLineChart";
import { useAdminContext } from "@/context/Admin/AdminContext";
import { useEffect, useState } from "react";


const activities = [
  {
    title: "New Enterprise Signup",
    description: "TechCorp Ltd. activated enterprise plan",
    time: "10 mins ago",
    icon: Activity,
    category: "signup",
  },
  {
    title: "Large Transaction",
    description: "₹50,000 received from Acme Industries",
    time: "45 mins ago",
    icon: BarChart3,
    category: "payment",
  },
  {
    title: "System Alert",
    description: "Message delivery rate above 99.9%",
    time: "1 hour ago",
    icon: MessageCircle,
    category: "system",
  },
  {
    title: "Premium Plan Upgrade",
    description: "5 users upgraded to premium tier",
    time: "2 hours ago",
    icon: CreditCard,
    category: "upgrade",
  },
];

function DashboardPage() {
  const [cards, setCards] = useState([
    {
      title: "Total Active Users",
      value: "12,847",
      change: "+15.2% this month",
      trend: "up",
      icon: Users,
      style: {
        bg: "from-emerald-50/80 to-teal-50/80",
        icon: "from-emerald-600 to-teal-700",
        text: "text-emerald-700",
        change: "text-emerald-600",
      },
    },
    {
      title: "Dormant Accounts",
      value: "892",
      change: "-5.8% this month",
      trend: "down",
      icon: UserX,
      style: {
        bg: "from-red-50/80 to-rose-50/80",
        icon: "from-red-600 to-rose-700",
        text: "text-red-700",
        change: "text-red-600",
      },
    },
    {
      title: "Message Analytics",
      value: "158,472",
      change: "+32.7% this month",
      trend: "up",
      icon: MessageCircle,
      style: {
        bg: "from-blue-50/80 to-indigo-50/80",
        icon: "from-blue-600 to-indigo-700",
        text: "text-blue-700",
        change: "text-blue-600",
      },
    },
    {
      title: "Revenue Generated",
      value: "₹4,52,831",
      change: "+22.4% this month",
      trend: "up",
      icon: CreditCard,
      style: {
        bg: "from-purple-50/80 to-violet-50/80",
        icon: "from-purple-600 to-violet-700",
        text: "text-purple-700",
        change: "text-purple-600",
      },
    },
  ]);
  
  const { usersData, weeklyMessageData, userGrowth } = useAdminContext();
  const { totalUsers, dormantAccounts, totalMessages, totalRevenue }: any =
    usersData;
  useEffect(() => {
    setCards((prev) => {
      return prev.map((card) => {
        let updatedCard = {...card};
        // console.log(updatedCard)
        if(card?.title === "Total Active Users") {
          updatedCard.value = totalUsers?.toString() || "0";
        }
        if(card?.title === "Dormant Accounts") {
          updatedCard.value = dormantAccounts?.toString() || "0";
        }
        if(card?.title === "Message Analytics") {
          updatedCard.value = totalMessages?.toString() || "0";
        }
        if(card?.title === "Revenue Generated") {
          updatedCard.value = "0";
          // updatedCard.value = totalRevenue?.toString() || "₹0";
        }
        
        return updatedCard;
      });
    });
   
  }, [usersData, weeklyMessageData]);

  return (
    <main className="w-full min-h-[85vh] bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-base text-gray-600">
                Real-time metrics and business intelligence
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
                Download Report
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                View Details
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
           (card && <div
              key={index}
              className={`bg-gradient-to-br ${card?.style.bg} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${card?.style.icon} rounded-xl shadow-md`}
                >
                  {
                    card?.icon &&
                    <card.icon className="w-6 h-6 text-white" />
                  }
                </div>
                <div className="flex items-center gap-1.5">
                  {card?.trend === "up" ? (
                    <TrendingUp className={`w-4 h-4 ${card?.style.change}`} />
                  ) : (
                    <TrendingDown className={`w-4 h-4 ${card?.style.change}`} />
                  )}
                  <span
                    className={`text-sm font-semibold ${card?.style.change}`}
                  >
                    {card?.change}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                  {card?.title}
                </h3>
                <p className={`text-3xl font-bold ${card?.style.text}`}>
                  {card?.value}
                </p>
              </div>
            </div>)
          ))}
        </div>

        {/* Chart Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8 md:justify-center">
          <AdminChart chartData={weeklyMessageData} />
          <AdminLineChart
            chartData={userGrowth}
          />
        </section>

        {/* Recent Activity */}
        {/* <section className="bg-white/50 rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Live Activity</h2>
                <p className="text-sm text-gray-500">Real-time system events and notifications</p>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                View All Activities
              </button>
            </div>

            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                        <activity.icon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {activity.title}
                      </h3>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                      {activity.time}
                    </span>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {activity.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section> */}
      </div>
    </main>
  );
}

export default DashboardPage;
