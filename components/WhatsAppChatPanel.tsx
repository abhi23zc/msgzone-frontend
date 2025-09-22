"use client";
import React, { useState, useEffect } from "react";
import { useWhatsapp } from "@/context/WhatsappContext";
import { useAuth } from "@/context/AuthContext";
import { 
  MessageSquare, 
  Users, 
  Search, 
  Phone, 
  MoreVertical,
  Send,
  Image,
  Paperclip,
  Smile,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button, Input, Avatar, Badge, Tooltip, Dropdown, Menu } from "antd";
import toast from "react-hot-toast";

interface WhatsAppChatPanelProps {
  onClose?: () => void;
}

const WhatsAppChatPanel: React.FC<WhatsAppChatPanelProps> = ({ onClose }) => {
  const { 
    getWhatsAppChats, 
    getWhatsAppContacts, 
    getChatMessages,
    whatsappChats,
    whatsappContacts,
    currentChatMessages,
    loading 
  } = useWhatsapp();
  
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts'>('chats');
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');

  // Get connected devices
  const connectedDevices = user?.data?.user?.devices?.filter(
    (device: any) => device.status === 'connected'
  ) || [];

  useEffect(() => {
    if (connectedDevices.length > 0 && !selectedDevice) {
      setSelectedDevice(connectedDevices[0].deviceId);
    }
  }, [connectedDevices, selectedDevice]);

  useEffect(() => {
    if (selectedDevice) {
      if (activeTab === 'chats') {
        getWhatsAppChats(selectedDevice);
      } else {
        getWhatsAppContacts(selectedDevice);
      }
    }
  }, [selectedDevice, activeTab, getWhatsAppChats, getWhatsAppContacts]);

  const handleChatSelect = async (chat: any) => {
    setSelectedChat(chat);
    if (selectedDevice) {
      await getChatMessages(selectedDevice, chat.id);
    }
  };

  const handleContactSelect = (contact: any) => {
    // Create a new chat with the contact
    const newChat = {
      id: contact.id,
      name: contact.name,
      isGroup: false,
      isReadOnly: false,
      unreadCount: 0,
      lastMessage: null,
      timestamp: Date.now()
    };
    setSelectedChat(newChat);
    setActiveTab('chats');
  };

  const filteredChats = whatsappChats.filter((chat: any) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = whatsappContacts.filter((contact: any) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getMessageStatusIcon = (status: string, fromMe: boolean) => {
    if (!fromMe) return null;
    
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Paperclip className="w-4 h-4" />;
      case 'document':
        return <Paperclip className="w-4 h-4" />;
      case 'audio':
        return <Phone className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (connectedDevices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Connected Devices</h3>
        <p className="text-gray-500 mb-4">
          Please connect a WhatsApp device to view your chats and contacts.
        </p>
        <Button type="primary" onClick={onClose}>
          Go to Dashboard
        </Button>
      </div>
    );
  }


  return (
    <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {selectedChat && (
                <Button
                  type="text"
                  icon={<ArrowLeft className="w-4 h-4" />}
                  onClick={() => setSelectedChat(null)}
                  className="p-1"
                />
              )}
              <h2 className="text-lg font-semibold text-gray-800">
                {selectedChat ? selectedChat.name : 'WhatsApp'}
              </h2>
            </div>
            <Dropdown
              overlay={
                <Menu>
                  {connectedDevices.map((device: any) => (
                    <Menu.Item
                      key={device.deviceId}
                      onClick={() => setSelectedDevice(device.deviceId)}
                    >
                      {device.deviceId} ({device.number})
                    </Menu.Item>
                  ))}
                </Menu>
              }
              trigger={['click']}
            >
              <Button type="text" icon={<MoreVertical className="w-4 h-4" />} />
            </Dropdown>
          </div>

          {!selectedChat && (
            <>
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search chats or contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                <Button
                  type={activeTab === 'chats' ? 'primary' : 'default'}
                  icon={<MessageSquare className="w-4 h-4" />}
                  onClick={() => setActiveTab('chats')}
                  className="flex-1"
                >
                  Chats
                </Button>
                <Button
                  type={activeTab === 'contacts' ? 'primary' : 'default'}
                  icon={<Users className="w-4 h-4" />}
                  onClick={() => setActiveTab('contacts')}
                  className="flex-1"
                >
                  Contacts
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Chat/Contact List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : activeTab === 'chats' ? (
            <div className="space-y-1 p-2">
              {filteredChats.map((chat: any) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatSelect(chat)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChat?.id === chat.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      size={48}
                      className="bg-green-500"
                    >
                      {chat.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {chat.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          {chat.unreadCount > 0 && (
                            <Badge count={chat.unreadCount} size="small" />
                          )}
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(chat.lastMessage?.timestamp || chat.timestamp)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage?.message || 'No messages'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredContacts.map((contact: any) => (
                <div
                  key={contact.id}
                  onClick={() => handleContactSelect(contact)}
                  className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      size={48}
                      className="bg-blue-500"
                    >
                      {contact.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {contact.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {contact.number}
                      </p>
                    </div>
                    {contact.isBusiness && (
                      <Badge color="green" text="Business" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <Avatar
                  size={40}
                  className="bg-green-500"
                >
                  {selectedChat.name.charAt(0).toUpperCase()}
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-900">{selectedChat.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedChat.isGroup ? 'Group' : 'Contact'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentChatMessages?.messages?.map((message: any) => (
                <div
                  key={message.id}
                  className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.fromMe
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getMessageTypeIcon(message.message.type)}
                      <span className="text-sm">{message.message.text || '[Media]'}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-xs opacity-70">
                        {formatTimestamp(message.timestamp)}
                      </span>
                      {getMessageStatusIcon(message.status, message.fromMe)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Button type="text" icon={<Paperclip className="w-4 h-4" />} />
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onPressEnter={() => {
                    // Handle send message
                    setMessageInput('');
                  }}
                  className="flex-1"
                />
                <Button type="text" icon={<Smile className="w-4 h-4" />} />
                <Button
                  type="primary"
                  icon={<Send className="w-4 h-4" />}
                  disabled={!messageInput.trim()}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Select a Chat
              </h3>
              <p className="text-gray-500">
                Choose a chat from the sidebar to start viewing messages
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppChatPanel;
