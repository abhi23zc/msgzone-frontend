"use client"
import { useEffect, useState } from 'react';
import {
  Send,
  Image,
  Link,
  List,
  MapPin,
  Smile,
  Phone,
  Calendar,
  Clock,
  ChevronDown,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  Users,
  X,
  Plus,
  Check,
  PhoneCall
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import useLocalStorage from '@/hooks/useLocalstorage';
import { useFetch } from '@/hooks/useFetch';
import toast from 'react-hot-toast';
import Loading from '@/components/Loading';
import { useAuth } from '@/context/AuthContext';

export default function BulkSend() {
  const URL = process.env.NEXT_PUBLIC_API_URL

  const [messageType, setMessageType] = useState('text');
  const [showFormatting, setShowFormatting] = useState(false);
  const [recipientOpen, setRecipientOpen] = useState(false);

  const [recipientList, setRecipientList] = useState('')
  const [messageContent, setMessageContent] = useState('')

  const {setTotalMessages} = useAuth();


  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [user, setUser] = useState(null);


  useEffect(() => {

    const stored = window.localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);


  const [timer, setTimer] = useState(0);

  const [data, loading, error, trigger] = useFetch(
    URL + '/api/v1/wp/send',
    { body: { "numbers": recipientList, "message": messageContent, timer }, method: "POST" }
  )
  // const [data, loading, error, trigger] = useFetch(
  //   URL + '/api/v1/wp/send',
  //   { body: { "numbers": ['916389055071', '916389055071'], "message": "Hii" }, method: "POST" }
  // )

  useEffect(() => {
    if (error) {
      toast.error("Error while sending message")
      setRecipientList('')
      console.log(error)
    }
    else {
      console.log(data);
      setRecipientList('')
    }

  }, [data])


  const MessageTypeIcon = () => {
    switch (messageType) {
      case 'text': return <Type size={18} />;
      case 'media': return <Image size={18} />;
      case 'button': return <Link size={18} />;
      case 'list': return <List size={18} />;
      case 'location': return <MapPin size={18} />;
      default: return <Type size={18} />;
    }
  };

  async function handleSubmit() {
    
   
    console.log("Bulk send")

    let arr = recipientList
      .replace(/\s+/g, "")       
      .split(",")                
      .filter(Boolean);

    setRecipientList(arr)

    if(Array.isArray(arr)){

      setTotalMessages((prev) => prev + arr?.length)
    }

    setTimeout(() => {

      trigger()
    }, [1000])

  }

  // Hydration fix: Don't render until mounted
  if (!mounted) return null;

  return (
    <div className="flex ">
      <Sidebar />
      <div className="flex-1 w-full min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
        <div className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-white">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Send Bulk Messages</h1>
            <p className="text-indigo-100 mt-1 text-xs sm:text-sm">Design your perfect message with our advanced composer</p>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {/* Message Type Selector */}
            <div className="mb-6 sm:mb-8">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Message Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                <button
                  onClick={() => setMessageType('text')}
                  className={`flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 rounded-xl border-2 transition-all text-xs sm:text-sm ${messageType === 'text'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                >
                  <Type size={18} className="mb-1" />
                  <span className="font-medium">Text</span>
                </button>

                <button
                  onClick={() => setMessageType('media')}
                  className={`flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 rounded-xl border-2 transition-all text-xs sm:text-sm ${messageType === 'media'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                >
                  <Image size={18} className="mb-1" />
                  <span className="font-medium">Media</span>
                </button>

                <button
                  onClick={() => setMessageType('button')}
                  className={`flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 rounded-xl border-2 transition-all text-xs sm:text-sm ${messageType === 'button'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                >
                  <Link size={18} className="mb-1" />
                  <span className="font-medium">Button</span>
                </button>

                <button
                  onClick={() => setMessageType('list')}
                  className={`flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 rounded-xl border-2 transition-all text-xs sm:text-sm ${messageType === 'list'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                >
                  <List size={18} className="mb-1" />
                  <span className="font-medium">List</span>
                </button>

                <button
                  onClick={() => setMessageType('location')}
                  className={`flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 rounded-xl border-2 transition-all text-xs sm:text-sm ${messageType === 'location'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                >
                  <MapPin size={18} className="mb-1" />
                  <span className="font-medium">Location</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Left Column */}
              <div>
                {/* Device Selector */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Send From</label>
                  <div className="relative">
                    <div className="flex items-center border-2 border-gray-200 rounded-xl p-2 sm:p-3 focus-within:border-indigo-500 transition-all hover:border-gray-300">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-2 sm:mr-3">
                        <PhoneCall size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs sm:text-sm font-medium text-gray-900">Business Account</div>
                        <div className="text-xs text-gray-500">+91{user?.whatsappNumber}</div>
                      </div>
                      <ChevronDown size={16} className="text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Timer Input */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Timer (Delay before sending)
                  </label>
                  <div className="relative">
                    <select
                      value={timer}
                      onChange={e => setTimer(Number(e.target.value))}
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all bg-white text-gray-900 shadow-sm hover:border-gray-300"
                    >
                      <option value={0}>No Delay</option>
                      <option value={5}>5 seconds</option>
                      <option value={10}>10 seconds</option>
                      <option value={15}>15 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={60}>1 minute</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Recipient
                  </label>
                  <div className="relative">
                    <textarea
                      value={recipientList}
                      onChange={(e) => {
                        setRecipientList(e.target.value)
                      }}
                      placeholder="Enter Recipients Phone Numbers, e.g. 91123456789, 910012345678"
                      className="w-full px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:border-gray-300 resize-none"
                      rows={1}
                      style={{ minHeight: '70px', maxHeight: '200px', overflow: 'auto' }}
                      onInput={e => {
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                    />
                  </div>
                </div>

                {/* Recipient Selector
                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Recipients</label>
                  <div className="relative">
                    <div
                      onClick={() => setRecipientOpen(!recipientOpen)}
                      className="flex items-center border-2 border-gray-200 rounded-xl p-2 sm:p-3 cursor-pointer focus-within:border-indigo-500 transition-all hover:border-gray-300"
                    >
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-2 sm:mr-3">
                        <Users size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs sm:text-sm font-medium text-gray-900">2 Recipients Selected</div>
                        <div className="text-xs text-gray-500">Click to manage</div>
                      </div>
                      <ChevronDown size={16} className="text-gray-400" />
                    </div>

                    {recipientOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-3 sm:p-4 z-10">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Select Recipients</span>
                          <button
                            onClick={() => setRecipientOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-3">
                          <div className="flex items-center justify-between p-1 sm:p-2 hover:bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-200 mr-1 sm:mr-2"></div>
                              <span className="text-xs sm:text-sm">John Doe (+1 234-567-8901)</span>
                            </div>
                            <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                              <Check size={12} />
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-1 sm:p-2 hover:bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-200 mr-1 sm:mr-2"></div>
                              <span className="text-xs sm:text-sm">Jane Smith (+1 987-654-3210)</span>
                            </div>
                            <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                              <Check size={12} />
                            </div>
                          </div>
                        </div>

                        <button className="flex items-center text-indigo-600 text-xs sm:text-sm font-medium">
                          <Plus size={14} className="mr-1" />
                          Add New Recipient
                        </button>
                      </div>
                    )}
                  </div>
                </div> */}

                {/* Scheduling
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Scheduling</label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2">
                    <div className="flex items-center border-2 border-gray-200 rounded-xl p-2 sm:p-3 cursor-pointer hover:border-gray-300 transition-all">
                      <Calendar size={16} className="text-gray-500 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm text-gray-700">Schedule Date</span>
                    </div>

                    <div className="flex items-center border-2 border-gray-200 rounded-xl p-2 sm:p-3 cursor-pointer hover:border-gray-300 transition-all">
                      <Clock size={16} className="text-gray-500 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm text-gray-700">Schedule Time</span>
                    </div>
                  </div>

                  <div className="bg-indigo-50 rounded-xl p-2 sm:p-3 border border-indigo-100">
                    <div className="flex items-center text-indigo-700 text-xs sm:text-sm">
                      <Send size={14} className="mr-1 sm:mr-2" />
                      <span>Message will be sent immediately after submission</span>
                    </div>
                  </div>
                </div> */}
              </div>

              {/* Right Column - Message Composer */}
              <div>
                <div className="mb-1 sm:mb-2 flex justify-between items-center">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Message Content</label>
                  <button
                    onClick={() => setShowFormatting(!showFormatting)}
                    className={`text-xs px-2 py-1 rounded ${showFormatting ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    Formatting Options
                  </button>
                </div>

                {showFormatting && (
                  <div className="bg-gray-50 rounded-t-xl p-2 sm:p-3 border border-gray-200 flex space-x-1 mb-1">
                    <button className="p-1 sm:p-2 rounded hover:bg-gray-200">
                      <Bold size={14} className="text-gray-700" />
                    </button>
                    <button className="p-1 sm:p-2 rounded hover:bg-gray-200">
                      <Italic size={14} className="text-gray-700" />
                    </button>
                    <button className="p-1 sm:p-2 rounded hover:bg-gray-200">
                      <Underline size={14} className="text-gray-700" />
                    </button>
                    <div className="border-r border-gray-300 mx-1"></div>
                    <button className="p-1 sm:p-2 rounded hover:bg-gray-200">
                      <AlignLeft size={14} className="text-gray-700" />
                    </button>
                    <button className="p-1 sm:p-2 rounded hover:bg-gray-200">
                      <Smile size={14} className="text-gray-700" />
                    </button>
                  </div>
                )}

                <div className={`relative ${showFormatting ? 'rounded-b-xl rounded-t-none' : 'rounded-xl'} border-2 border-gray-200 focus-within:border-indigo-500 transition-all hover:border-gray-300`}>
                  <textarea
                    onChange={(e) => {
                      setMessageContent(e.target.value)
                    }}
                    value={messageContent}
                    className="w-full p-3 sm:p-4 h-28 sm:h-36 md:h-40 resize-none focus:outline-none text-gray-700 text-xs sm:text-sm"
                    placeholder="Type your message here..."
                  ></textarea>

                  <div className="absolute bottom-2 right-2 flex space-x-2">
                    <div className="text-xs text-gray-400">0/1000</div>
                  </div>
                </div>

                {messageType === 'button' && (
                  <div className="mt-3 sm:mt-4">
                    <div className="flex justify-between items-center mb-1 sm:mb-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Call-to-Action Buttons</label>
                      <button className="text-indigo-600 text-xs sm:text-sm flex items-center">
                        <Plus size={14} className="mr-1" />
                        Add Button
                      </button>
                    </div>

                    <div className="border-2 border-gray-200 rounded-xl p-2 sm:p-3 mb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 mr-1 sm:mr-2">
                            <Link size={14} />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-medium">Learn More</div>
                            <div className="text-xs text-gray-500">https://example.com/learn</div>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="border-2 border-gray-200 rounded-xl p-2 sm:p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 mr-1 sm:mr-2">
                            <Phone size={14} />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-medium">Call Us</div>
                            <div className="text-xs text-gray-500">+1 (555) 123-4567</div>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div onClick={handleSubmit} className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              {/* <button className="px-4 sm:px-5 py-2 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium transition-colors text-xs sm:text-sm">
                Save as Draft
              </button> */}
              <button className="px-4 sm:px-5 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:opacity-90 font-medium transition-opacity flex items-center text-xs sm:text-sm">
                {loading ? <Loading /> :
                  (
                    <>
                      <Send size={16} className="mr-2" />
                      Send Message
                    </>
                  )
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}