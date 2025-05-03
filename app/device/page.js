"use client"
import { useState } from "react";
import { 
  Smartphone, 
  Activity, 
  Clock, 
  Menu, 
  Plus, 
  MoreVertical, 
  User, 
  LogOut, 
  Search,
  Bell
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";

export default function Devices() {
 

  const router = useRouter()
  
  const deviceData = {
    total: 1,
    active: 1,
    inactive: 0,
    phone: "234234234",
    messages: 0,
    status: "ACTIVE"
  };

  return (
    <div className="flex flex-row w-full"> 
        <Sidebar/>

    <div className="flex h-screen bg-gray-50 text-gray-800 w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
    
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <h3 className="text-2xl font-bold mb-2 md:mb-0">Device Overview</h3>
            <button onClick={()=>{
              router.push("/device/generate")
            }} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Plus className="h-5 w-5 mr-2" />
              Create Device
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Total Devices" 
              value={deviceData.total} 
              icon={<Smartphone className="h-6 w-6 text-indigo-600" />}
              accentColor="bg-indigo-100"
            />
            <StatCard 
              title="Active Devices" 
              value={deviceData.active} 
              icon={<Activity className="h-6 w-6 text-green-600" />}
              accentColor="bg-green-100"
            />
            <StatCard 
              title="Inactive Devices" 
              value={deviceData.inactive} 
              icon={<Clock className="h-6 w-6 text-orange-600" />}
              accentColor="bg-orange-100"
            />
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold">Device Details</h4>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <DetailItem 
                  label="Phone Number" 
                  value={deviceData.phone} 
                  icon={<Smartphone className="h-5 w-5 text-gray-500" />}
                />
                <DetailItem 
                  label="Total Messages" 
                  value={deviceData.messages.toString()} 
                  icon={<Activity className="h-5 w-5 text-gray-500" />}
                />
                <DetailItem 
                  label="Status" 
                  value={
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {deviceData.status}
                    </span>
                  } 
                  icon={<Clock className="h-5 w-5 text-gray-500" />}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    </div>
  );
}


function StatCard({ title, value, icon, accentColor }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${accentColor}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, icon }) {
  return (
    <div className="flex items-center">
      <div className="p-2 bg-gray-100 rounded-lg mr-4">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}