'use client'
import { useEffect, useState } from 'react';
import { 
  Home, 
  Smartphone, 
  FileText, 
  Send, 
  MessageSquare, 
  Layers, 
  Users, 
  Calendar, 
  List, 
  Bookmark,
  MapPin,
  Menu,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');

  const params = usePathname()
  useEffect(() => {
      if(params.includes('dashboard')) setActiveItem('dashboard')
      if(params.includes('send')) setActiveItem('send')
      if(params.includes('bulkSend')) setActiveItem('bulkSend')
      if(params.includes('scheduled')) setActiveItem('scheduled')
      if(params.includes('device')) setActiveItem('device')

  }, [usePathname])
  

  const router = useRouter()

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <Home size={20} /> },
    { id: 'device', name: 'My Devices', icon: <Smartphone size={20} /> },
    // { id: 'templates', name: 'Templates', icon: <FileText size={20} /> },
    { id: 'send', name: 'Send', icon: <Send size={20} /> },
    // { id: 'chatbot', name: 'Chatbot (Auto Reply)', icon: <MessageSquare size={20} /> },
    // { id: 'apps', name: 'My Apps', icon: <Layers size={20} /> },
    { id: 'contact-book', name: 'Contact Book', icon: <Users size={20} /> },
    { id: 'bulkSend', name: 'Send Bulk Message', icon: <Send size={20} /> },
    { id: 'scheduled', name: 'Scheduled Message', icon: <Calendar size={20} /> },
    { id: 'message-log', name: 'Message Log', icon: <List size={20} /> },
    { id: 'logout', name: 'Log out', icon: <LogOut size={20} /> },
    // { id: 'webhook', name: 'Webhook Logs', icon: <Bookmark size={20} /> },
  ];


  return (
    <div className={`relative flex flex-col min-h-screen max-h-full bg-white shadow-lg transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Header */}
      <div className="flex items-center px-4 py-5 border-b border-gray-100 ">
        {!collapsed && (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-indigo-600 flex items-center justify-center text-white">
              <Layers size={18} />
            </div>
            <span className="ml-2 font-bold text-gray-800">Msgzone</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto h-8 w-8 rounded-md bg-indigo-600 p-2 flex items-center justify-center text-white">
            <Layers size={18} />
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className={`ml-auto p-1 rounded-md hover:bg-gray-100 ${collapsed ? 'mx-auto' : ''}`}
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-2">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  if(item.id == "logout"){
                    localStorage.clear();
                    document.cookie = `token=''; path=/;`;
                    router.push("/login")
                    return ;
                  }
                  setActiveItem(item.id)
                  router.push(item.id)
                }}
                
                className={`flex items-center w-full px-4 py-3 ${
                  activeItem === item.id
                    ? 'text-indigo-600 bg-indigo-50 border-r-4 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="ml-3 truncate">{item.name}</span>}
              </button>
            </li>
          ))}
        </ul>

      </div>

      {/* User Profile */}
      <div className="absolute border-t border-gray-100 p-4 bottom-0">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="font-medium text-sm">U</span>
          </div>
          {!collapsed && (
            <>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">user</p>
              </div>
              <ChevronRight size={16} className="ml-auto text-gray-400" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}