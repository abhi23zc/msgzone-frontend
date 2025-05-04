"use client";
import { useEffect, useState } from "react";
import {
  MessageCircle,
  BarChart3,
  Calendar,
  Users,
  Bell,
  Search,
  Settings,
  ChevronDown,
  Clock,
  Zap,
  PieChart,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Filter,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useFetch } from "@/hooks/useFetch";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const URL = process.env.NEXT_PUBLIC_API_URL;

  const { totalMessages, setTotalMessages } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");

  const router = useRouter();

  const [data, loading, error, triggerFetch] = useFetch(
    URL + "/api/v1/wp/getAllMessages",
    {
      method: "GET",
    }
  );

  useEffect(() => {
    if (data?.success) {
      let msgLength = 0;
      data?.data?.forEach((msgs) => {
        msgLength += msgs?.messages?.length || 0;
      });
      setTotalMessages(msgLength);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    triggerFetch();
  }, []);

  return (
    <div className="flex flex-row h-full w-full">
      <Sidebar />
      <div className="min-h-screen h-full bg-gradient-to-br from-gray-50 to-gray-100 w-full">
        {/* Main Content */}
        <main className="px-6 py-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6 relative">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Messages
                  </p>
                  <h3 className="text-3xl font-bold mt-1 text-gray-800">
                    {totalMessages ? totalMessages : 0}
                  </h3>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp size={14} className="text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">+12.5%</span>
                    <span className="text-gray-500 ml-1">from last week</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <MessageCircle size={24} className="text-blue-600" />
                </div>
              </div>
              <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-1 bg-blue-500 rounded-full"
                  style={{ width: "70%" }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6 relative">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Active Contacts
                  </p>
                  <h3 className="text-3xl font-bold mt-1 text-gray-800">856</h3>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp size={14} className="text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">+7.2%</span>
                    <span className="text-gray-500 ml-1">from last week</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Users size={24} className="text-purple-600" />
                </div>
              </div>
              <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-1 bg-purple-500 rounded-full"
                  style={{ width: "65%" }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6 relative">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Scheduled Tasks
                  </p>
                  <h3 className="text-3xl font-bold mt-1 text-gray-800">42</h3>
                  <div className="flex items-center mt-2 text-sm">
                    <Clock size={14} className="text-amber-500 mr-1" />
                    <span className="text-amber-500 font-medium">5 pending</span>
                    <span className="text-gray-500 ml-1">for today</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Calendar size={24} className="text-amber-600" />
                </div>
              </div>
              <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-1 bg-amber-500 rounded-full"
                  style={{ width: "30%" }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6 relative">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Conversion Rate
                  </p>
                  <h3 className="text-3xl font-bold mt-1 text-gray-800">
                    24.8%
                  </h3>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp size={14} className="text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">+3.1%</span>
                    <span className="text-gray-500 ml-1">from last month</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                  <BarChart3 size={24} className="text-green-600" />
                </div>
              </div>
              <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-1 bg-green-500 rounded-full"
                  style={{ width: "25%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
              <h3 className="font-semibold text-gray-800 mb-6">
                Recent Activity
              </h3>

              <div className="space-y-5">
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-1">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">Scheduled campaign</span> to
                      342 recipients was successfully delivered
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Today, 09:42 AM
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1">
                    <Users size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">New contacts</span> (56)
                      were imported from CSV file
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Yesterday, 04:23 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mr-3 mt-1">
                    <AlertCircle size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">Attention needed:</span> 3
                      messages failed to deliver due to invalid numbers
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Yesterday, 02:45 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-1">
                    <Zap size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">
                        Automation workflow
                      </span>{" "}
                      &quot;Welcome Sequence&quot; has been activated
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      May 2, 2025, 11:30 AM
                    </p>
                  </div>
                </div>
              </div>

              <button className="mt-6 text-sm text-indigo-600 font-medium hover:text-indigo-800">
                View all activity
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-6">
                Quick Actions
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    router.push("/send");
                  }}
                  className="cursor-pointer w-full flex items-center justify-between p-3 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  <div className="flex items-center">
                    <MessageCircle size={18} className="mr-3" />
                    <span className="font-medium">Send New Message</span>
                  </div>
                  <ChevronDown size={16} className="transform -rotate-90" />
                </button>

                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <Users size={18} className="mr-3" />
                    <span className="font-medium">Import Contacts</span>
                  </div>
                  <ChevronDown size={16} className="transform -rotate-90" />
                </button>

                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <Zap size={18} className="mr-3" />
                    <span className="font-medium">Create Automation</span>
                  </div>
                  <ChevronDown size={16} className="transform -rotate-90" />
                </button>

                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <BarChart3 size={18} className="mr-3" />
                    <span className="font-medium">View Reports</span>
                  </div>
                  <ChevronDown size={16} className="transform -rotate-90" />
                </button>
              </div>

              <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <PieChart size={20} className="text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-800">
                      Monthly Statistics
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Your monthly report is ready
                    </p>
                  </div>
                </div>
                <button className="mt-3 w-full py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                  View Report
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}