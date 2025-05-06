'use client'
import { useState, useEffect } from "react";
import { Smartphone, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";

export default function GenerateQR() {
    const URL = process.env.NEXT_PUBLIC_API_URL;
    const [qrData, setqrData] = useState(null);
    const [showInfo, setShowInfo] = useState(false);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const eventSource = new EventSource(`${URL}/api/v1/wp/scan`);

        eventSource.addEventListener('qr', (event) => {
            const data = JSON.parse(event.data);
            setqrData(data.qr);
        });

        eventSource.addEventListener('ready', (event) => {
            const data = JSON.parse(event.data);
            toast.success(data.message || "Client is ready");
            setConnected(true);
            eventSource.close();
        });

        eventSource.addEventListener('error', (event) => {
            toast.error("Something went wrong while connecting to WhatsApp.");
            eventSource.close();
        });

        return () => {
            eventSource.close();
        };
    }, []);

    return (
        <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 w-full">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
                {/* Left side - Instructions */}
                <div className="w-full md:w-2/5 bg-gradient-to-br from-green-500 to-teal-600 p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center mb-6">
                            <div className="bg-white p-2 rounded-full mr-3">
                                <Smartphone className="h-6 w-6 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold">WhatsApp Web</h2>
                        </div>
                        <h3 className="text-xl font-bold mb-4">How to connect your WhatsApp</h3>
                        <ol className="space-y-6">
                            <li className="flex"><span className="step-circle">1</span>Open WhatsApp on your phone</li>
                            <li className="flex"><span className="step-circle">2</span>Go to <strong>Menu</strong> or <strong>Settings</strong> → <strong>Linked Devices</strong></li>
                            <li className="flex"><span className="step-circle">3</span>Select <strong>Link a Device</strong></li>
                            <li className="flex"><span className="step-circle">4</span>Point your phone at this screen to scan the QR code</li>
                        </ol>
                    </div>
                </div>

                {/* Right side - QR code */}
                <div className="w-full md:w-3/5 p-8 flex flex-col items-center justify-center relative">
                    {showInfo && (
                        <div className="absolute inset-0 bg-white bg-opacity-95 z-20 p-6 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800">About WhatsApp Web</h3>
                                <button onClick={() => setShowInfo(false)} className="p-1 rounded-full hover:bg-gray-100">
                                    <X className="h-6 w-6 text-gray-500" />
                                </button>
                            </div>
                            <div className="text-gray-600 space-y-4 overflow-y-auto flex-grow">
                                <p>WhatsApp Web mirrors messages from your phone.</p>
                                <p>Your phone must stay connected to the internet.</p>
                                <p>Data is end-to-end encrypted and private.</p>
                                <p>This QR code securely pairs your device and browser.</p>
                            </div>
                        </div>
                    )}

                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Scan QR Code</h2>
                        <p className="text-gray-500 max-w-md">Use WhatsApp on your phone to scan the QR code</p>
                    </div>

                    <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center border border-dashed border-gray-300">
                        {!qrData && !connected ? <Loading className="border-black" /> :
                            connected ? (
                                <div className="text-green-600 text-center">
                                    <p className="text-lg font-semibold">WhatsApp Connected ✅</p>
                                </div>
                            ) : (
                                <img src={qrData} alt="QR Code" />
                            )
                        }
                    </div>

                    <div className="mt-6 text-center text-gray-500 text-sm">
                        <p>WhatsApp Web requires a secure connection</p>
                        <p className="mt-1">© WhatsApp LLC</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
