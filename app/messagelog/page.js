"use client"
import { useEffect, useState } from 'react';
import { Search, Calendar, MessageSquare, User, Download, Filter, ChevronDown, MoreHorizontal, ArrowUpRight, ArrowDownRight, Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useFetch } from '@/hooks/useFetch';
import { useAuth } from '@/context/AuthContext';


function useHasMounted() {
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        setHasMounted(true);
    }, []);
    return hasMounted;
}

export default function MessageLogs() {
    const URL = process.env.NEXT_PUBLIC_API_URL

    const [messageLogs, setmessageLogs] = useState([])

    const transactions = [
        { id: 1, user: '638905071', title: 'System', messageTo: 'Students', status: 'recieved', createdAt: '04-May-2025' },
        { id: 2, user: '638905071', title: 'System', messageTo: 'Teachers', status: 'recieved', createdAt: '04-May-2025' },
        { id: 3, user: '638905071', title: 'System', messageTo: 'Parents', status: 'recieved', createdAt: '04-May-2025' },
    ];

    const [data, loading, error, triggerFetch] = useFetch(
        URL + "/api/v1/wp/getAllMessages",
        {
            method: "GET",
        }
    );
    useEffect(() => {
        triggerFetch()
    }, [])

    const {totalMessages} = useAuth()

    useEffect(() => {
        console.log(data)
        setmessageLogs(data?.data)
    }, [data])

    const hasMounted = useHasMounted();
    if (!hasMounted) {
        return null;
    }

    function MessageCard({ message }) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex flex-col gap-2 border border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                        <User className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-900">From: {message.sendFrom}</div>
                        <div className="text-xs font-medium text-gray-900">To: {message.sendTo}</div>
                    </div>
                </div>
                <div>
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                        {message.text}
                    </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    <span className="font-semibold">Status:</span> {message.status}
                    <span className="font-semibold">Created:</span> {message.createdAt}
                </div>
                <div className="flex justify-end">
                    <button className="text-blue-600 hover:text-blue-900">
                        <MoreHorizontal className="h-5 w-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            <div className="w-full md:w-auto">
                <Sidebar />
            </div>
            <div className="flex-1 min-w-0">
                <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-500">Total Messages</p>
                                    <h2 className="mt-1 md:mt-2 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{totalMessages}</h2>
                                    <p className="mt-1 text-xs md:text-sm text-green-600 flex items-center">
                                        <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                        <span>+2.5% from last month</span>
                                    </p>
                                </div>
                                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-500">Today's Messages</p>
                                    <h2 className="mt-1 md:mt-2 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">0</h2>
                                    <p className="mt-1 text-xs md:text-sm text-red-600 flex items-center">
                                        <ArrowDownRight className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                        <span>-100% from yesterday</span>
                                    </p>
                                </div>
                                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Download className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 sm:col-span-2 lg:col-span-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-500">Last 30 Days</p>
                                    <h2 className="mt-1 md:mt-2 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">5,225</h2>
                                    <p className="mt-1 text-xs md:text-sm text-green-600 flex items-center">
                                        <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                        <span>+12% from previous period</span>
                                    </p>
                                </div>
                                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-indigo-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Tabs */}
                    <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
                        <div className="p-4 md:p-6 border-b border-gray-200">
                            <h2 className="text-base sm:text-lg font-medium text-gray-900">Message Logs</h2>
                        </div>


                        <div>
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Send From
                                            </th>
                                            <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Send To
                                            </th>
                                            <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Title
                                            </th>
                                            <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created At
                                            </th>
                                            <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {Array.isArray(messageLogs) && messageLogs.length > 0 && messageLogs.map(({ messages }) =>
                                            messages?.map((message) => (
                                                <tr key={message._id} className="hover:bg-gray-50">
                                                    <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                                                                <User className="h-4 w-4" />
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className="text-xs md:text-sm font-medium text-gray-900">{message.sendFrom}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap">
                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                                                            {message.sendTo}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap">
                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                                                            {message.text}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{message.status}</div>
                                                    </td>
                                                    <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{message.createdAt}</div>
                                                    </td>
                                                    <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap">
                                                        <button className="text-blue-600 hover:text-blue-900">
                                                            <MoreHorizontal className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Cards for mobile screens */}
                            <div className="block md:hidden">
                                {Array.isArray(messageLogs) && messageLogs.flatMap(({ messages }) =>
                                    messages?.map((message) => (
                                        <MessageCard key={message._id} message={message} />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Pagination - Responsive */}
                        <div className="px-2 sm:px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-2">
                            {/* Mobile pagination */}
                            <div className="flex w-full justify-between sm:hidden">
                                <button className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                    Previous
                                </button>
                                <button className="ml-3 relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                    Next
                                </button>
                            </div>
                            {/* Desktop pagination */}
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between w-full">
                                <div>
                                    {/* <p className="text-xs md:text-sm text-gray-700">
                                        Showing <span className="font-medium">1</span> to <span className="font-medium">3</span> of{' '}
                                        <span className="font-medium">3</span> results
                                    </p> */}
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-xs md:text-sm font-medium text-gray-500 hover:bg-gray-50">
                                            <span className="sr-only">Previous</span>
                                            <svg className="h-4 w-4 md:h-5 md:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <button aria-current="page" className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border text-xs md:text-sm font-medium">
                                            1
                                        </button>
                                        <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-xs md:text-sm font-medium text-gray-500 hover:bg-gray-50">
                                            <span className="sr-only">Next</span>
                                            <svg className="h-4 w-4 md:h-5 md:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}