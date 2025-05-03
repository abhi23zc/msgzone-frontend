'use client'
import { useState, useEffect } from "react";
import { Smartphone, RefreshCw, CheckCircle, Info, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function GenerateQR() {
    const [scanningStatus, setScanningStatus] = useState("waiting"); // waiting, scanning, success, error
    const [timeLeft, setTimeLeft] = useState(60);
    const [showInfo, setShowInfo] = useState(false);

    // Simulate the QR code refreshing countdown
    useEffect(() => {
        if (scanningStatus === "waiting" && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            setTimeLeft(60);
        }
    }, [timeLeft, scanningStatus]);

    // Function to simulate successful scan
    const simulateSuccessfulScan = () => {
        setScanningStatus("scanning");
        setTimeout(() => {
            setScanningStatus("success");
        }, 2000);
    };

    // Function to reset the QR code
    const resetQRCode = () => {
        setScanningStatus("waiting");
        setTimeLeft(60);
    };

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
                                <li className="flex">
                                    <div className="bg-white/20 rounded-full h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                                        <span className="font-bold">1</span>
                                    </div>
                                    <p>Open WhatsApp on your phone</p>
                                </li>

                                <li className="flex">
                                    <div className="bg-white/20 rounded-full h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                                        <span className="font-bold">2</span>
                                    </div>
                                    <p>Tap <strong>Menu</strong> or <strong>Settings</strong> and select <strong>Linked Devices</strong></p>
                                </li>

                                <li className="flex">
                                    <div className="bg-white/20 rounded-full h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                                        <span className="font-bold">3</span>
                                    </div>
                                    <p>Tap <strong>Link a Device</strong></p>
                                </li>

                                <li className="flex">
                                    <div className="bg-white/20 rounded-full h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                                        <span className="font-bold">4</span>
                                    </div>
                                    <p>Point your phone at this screen to capture the QR code</p>
                                </li>
                            </ol>
                        </div>

                        {/* Animated phone shape */}
                        <div className="hidden lg:block absolute -right-12 bottom-0 opacity-20">
                            <div className="w-32 h-64 border-4 border-white rounded-3xl relative">
                                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Right side - QR code */}
                    <div className="w-full md:w-3/5 p-8 flex flex-col items-center justify-center relative">
                        {showInfo && (
                            <div className="absolute inset-0 bg-white bg-opacity-95 z-20 p-6 flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-gray-800">About WhatsApp Web</h3>
                                    <button
                                        onClick={() => setShowInfo(false)}
                                        className="p-1 rounded-full hover:bg-gray-100"
                                    >
                                        <X className="h-6 w-6 text-gray-500" />
                                    </button>
                                </div>
                                <div className="text-gray-600 space-y-4 overflow-y-auto flex-grow">
                                    <p>WhatsApp Web is a browser-based extension of the WhatsApp application on your phone. The web app mirrors conversations and messages from your mobile device.</p>
                                    <p>Your phone needs to stay connected to the internet for WhatsApp Web to work, as all messages still live on your mobile device.</p>
                                    <p>This secure connection ensures your data stays private and encrypted end-to-end.</p>
                                    <p>The QR code shown here creates a secure pairing between your browser and mobile device.</p>
                                </div>
                            </div>
                        )}

                        <div className="mb-6 text-center">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Scan QR Code</h2>
                            <p className="text-gray-500 max-w-md">
                                Use WhatsApp on your phone to scan the QR code
                            </p>
                        </div>

                        <div className="relative">
                            {/* QR code container */}
                            <div className={`w-64 h-64 md:w-72 md:h-72 relative flex items-center justify-center ${scanningStatus === "success" ? "bg-green-50" : "bg-gray-50"} rounded-lg overflow-hidden`}>
                                {scanningStatus === "waiting" && (
                                    <>
                                        <img src="https://cdn.pixabay.com/photo/2023/02/28/01/50/qr-code-7819652_1280.jpg" />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                            {scanningStatus === "waiting" && (
                                <button
                                    onClick={simulateSuccessfulScan}
                                    className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium flex items-center hover:bg-green-600 transition-colors shadow-sm"
                                >
                                    <Smartphone className="h-5 w-5 mr-2" />
                                    Scan QR Code
                                </button>
                            )}

                            {scanningStatus === "success" && (
                                <button
                                    onClick={resetQRCode}
                                    className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium flex items-center hover:bg-green-600 transition-colors shadow-sm"
                                >
                                    <RefreshCw className="h-5 w-5 mr-2" />
                                    Reset QR Code
                                </button>
                            )}

                            <button
                                onClick={() => setShowInfo(!showInfo)}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium flex items-center hover:bg-gray-200 transition-colors"
                            >
                                <Info className="h-5 w-5 mr-2" />
                                Help
                            </button>
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