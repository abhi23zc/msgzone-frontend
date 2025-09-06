"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Save,
  MessageCircle,
  CreditCard,
  Smartphone
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

function Settings() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('whatsapp');
  const [showDeviceSuccess, setShowDeviceSuccess] = useState(false);
  const [selectedDeviceName, setSelectedDeviceName] = useState('business');
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    // General Settings
    systemName: 'WhatsApp Bulk Sender',
    adminEmail: 'admin@msgzone.com',

    timezone: 'UTC',
    language: 'en',
    
    // WhatsApp Settings
    whatsappEnabled: true,
    webhookUrl: '',
    autoReply: false,
    businessProfile: true,
    messageTemplate: '',
    
    // Payment Settings
    paymentEnabled: true,
    
    // QR Code & UPI Settings
    qrUpiEnabled: true,
    qrCodeUrl: '',
    upiId: '',
    
    // Bank Account Settings
    bankAccountEnabled: true,
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    
    // Email Settings
    smtpEnabled: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@msgzone.com',
    fromName: 'MsgZone'
  });


  const checkUser = async () => {
    try {
      console.log("Checking user");
      const res = await api.get("/auth/profile");
      console.log("Data", res.data)
      if (res?.data.success) {
        setUser(res.data)
      }
    } catch (error) {
      console.log("Error checking user:", error);

    }
  };
  useEffect(() => {
    checkUser()
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fetchPaymentSettings = async () => {
    try {
      const res = await api.get("/admin/payment-settings");
      if (res?.data?.success) {
        const paymentSettings = res.data.data;
        setSettings(prev => ({
          ...prev,
          qrUpiEnabled: paymentSettings.qrUpiEnabled || false,
          qrCodeUrl: paymentSettings.qrCodeImage || '',
          upiId: paymentSettings.upiId || '',
          bankAccountEnabled: paymentSettings.bankAccountEnabled || false,
          accountHolderName: paymentSettings.bankDetails?.accountHolderName || '',
          bankName: paymentSettings.bankDetails?.bankName || '',
          accountNumber: paymentSettings.bankDetails?.accountNumber || '',
          ifscCode: paymentSettings.bankDetails?.ifscCode || '',
          branchName: paymentSettings.bankDetails?.branchName || '',
        }));
      }
    } catch (error) {
      console.error("Error fetching payment settings:", error);
    }
  };

  const handleSave = async () => {
    try {
      const paymentSettingsData = {
        qrUpiEnabled: settings.qrUpiEnabled,
        qrCodeImage: settings.qrCodeUrl,
        upiId: settings.upiId,
        bankAccountEnabled: settings.bankAccountEnabled,
        bankDetails: {
          accountHolderName: settings.accountHolderName,
          bankName: settings.bankName,
          accountNumber: settings.accountNumber,
          ifscCode: settings.ifscCode,
          branchName: settings.branchName,
        },
        currency: "INR",
        taxRate: 0,
        processingFee: 0,
      };

      const res = await api.put("/admin/payment-settings", paymentSettingsData);
      if (res?.data?.success) {
        console.log('Payment settings saved successfully:', res.data);
        // You can add a toast notification here
      } else {
        console.error('Failed to save payment settings:', res.data.message);
      }
    } catch (error) {
      console.error('Error saving payment settings:', error);
    }
  };

  const fetchDevices = async () => {
    console.log(user)
    const deviceData =
      user?.data?.user?.devices?.map((device: any, idx: any) => ({
        key: idx,
        number: device?.number || "N/A",
        deviceId: device?.deviceId,
        sent: device?.sent || 0,
        lastConnected: device?.lastConnected,
        status: device?.status,
      })) || [];

    setDevices(deviceData);
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'whatsapp') {
      fetchDevices();
    } else if (activeTab === 'payments') {
      fetchPaymentSettings();
    }
  }, [activeTab]);

  const tabs = [
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500' },
    { id: 'payments', label: 'Payments', icon: CreditCard, color: 'bg-purple-500' }
  ];


  const renderWhatsAppSettings = () => (
    <div className="space-y-6">
      {/* Success Popup Message */}
      {showDeviceSuccess && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg border border-green-400">
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 bg-green-400 rounded-full flex items-center justify-center">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Device Activated!</p>
                <p className="text-sm text-green-100">{selectedDeviceName} is now your active device for sending messages</p>
              </div>
              <button
                onClick={() => setShowDeviceSuccess(false)}
                className="ml-4 text-green-100 hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Devices Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">WhatsApp Devices</h3>
                <p className="text-gray-600">Manage your connected WhatsApp Business devices</p>
              </div>
            </div>

          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Select</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Device</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Number</th>
                {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Messages Sent</th */}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Connected</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-gray-500">Loading devices...</span>
                    </div>
                  </td>
                </tr>
              ) : devices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Smartphone className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium">No devices found</p>
                      <p className="text-sm">Add your first WhatsApp device to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                devices.map((device, index) => {
                  const isActiveDevice = user?.data?.user?.adminDevice === device.deviceId;
                  return (
                    <tr key={device.key} className={`hover:bg-gray-50 transition-colors duration-200 ${isActiveDevice ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="selectedDevice"
                            value={device.deviceId}
                            id={`device-${device.deviceId}`}
                            checked={isActiveDevice}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                            onChange={() => setSelectedDeviceName(device.deviceId)}
                          />
                          <label htmlFor={`device-${device.deviceId}`} className="sr-only">Select {device.deviceId} device</label>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center mr-4 shadow-sm ${isActiveDevice
                            ? 'bg-gradient-to-br from-green-400 to-green-600'
                            : 'bg-gradient-to-br from-blue-400 to-blue-600'
                            }`}>
                            <Smartphone className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 flex items-center">
                              {device.deviceId}
                              {isActiveDevice && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{device.deviceId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{device.number}</div>
                      </td>

                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{device.lastConnected}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${isActiveDevice
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${isActiveDevice ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                            }`}></div>
                          {isActiveDevice ? 'Connected' : 'Idle'}
                        </span>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {devices.length > 0 ? (
                  <>Showing <span className="font-semibold text-gray-900">1</span> to <span className="font-semibold text-gray-900">{devices.length}</span> of <span className="font-semibold text-gray-900">{devices.length}</span> results</>
                ) : (
                  <span className="text-gray-500">No devices found</span>
                )}
              </div>
              {devices.length > 0 && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Selected Device:</span>
                  <span className="text-sm font-semibold text-blue-600">{user?.data?.user?.adminDevice}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {devices.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 transition-colors"
                  onClick={async () => {
                    const selectedDevice = document.querySelector('input[name="selectedDevice"]:checked') as HTMLInputElement;
                    console.log(selectedDevice)
                    if (selectedDevice) {
                      const deviceName = selectedDevice.value;
                      setSelectedDeviceName(deviceName);
                      setShowDeviceSuccess(true);
                      // Here you can add logic to set the active device for sending messages
                      console.log('Active device set to:', user?.data?.user?.adminDevice);
                      const data = await api.post("/admin/setAdminDevice", { deviceId: deviceName });
                      console.log(data)
                      setTimeout(() => {
                        setShowDeviceSuccess(false);
                      }, 2000);
                    }
                  }}
                >
                  Set as Active
                </Button>
              )}
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled className="text-gray-400 border-gray-300">
                  Previous
                </Button>
                <span className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">1</span>
                <Button variant="outline" size="sm" disabled className="text-gray-400 border-gray-300">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      {/* Payment Methods Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Methods</h2>
        <p className="text-gray-600">Choose your preferred payment collection method for manual payments</p>
      </div>

      {/* QR Code & UPI Payment Method */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">QR Code & UPI</h3>
                <p className="text-gray-600">Upload QR code and set UPI ID for instant payments</p>
              </div>
            </div>
            <Switch
              checked={settings.qrUpiEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleInputChange('bankAccountEnabled', false);
                }
                handleInputChange('qrUpiEnabled', checked);
              }}
            />
          </div>
        </div>

        {settings.qrUpiEnabled && (
          <div className="p-6 space-y-6">
            {/* QR Code Upload */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium text-gray-900">QR Code Image</Label>
                <p className="text-sm text-gray-500">Upload your payment QR code image</p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors">
                <div className="space-y-4">
                  <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">Upload QR Code</p>
                    <p className="text-sm text-gray-500">Drag and drop or click to browse</p>
                  </div>
                  <Button variant="outline" className="border-green-200 text-green-600 hover:bg-green-50">
                    Choose File
                  </Button>
                </div>
              </div>

              {/* Current QR Code Preview */}
              {settings.qrCodeUrl && (
                <div className="mt-4">
                  <Label className="text-sm font-medium text-gray-700">Current QR Code</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <img 
                      src={settings.qrCodeUrl} 
                      alt="Payment QR Code" 
                      className="h-32 w-32 mx-auto object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* UPI ID */}
            <div className="space-y-2">
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                value={settings.upiId}
                onChange={(e) => handleInputChange('upiId', e.target.value)}
                placeholder="yourname@paytm"
              />
              <p className="text-sm text-gray-500">Enter your UPI ID for payments</p>
            </div>

            {/* Payment Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Payment Instructions</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Users can scan the QR code or use the UPI ID to make instant payments. 
                    Make sure to keep your QR code updated and UPI ID active.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bank Account Payment Method */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Bank Account</h3>
                <p className="text-gray-600">Set up bank account details for NEFT/RTGS payments</p>
              </div>
            </div>
            <Switch
              checked={settings.bankAccountEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleInputChange('qrUpiEnabled', false);
                }
                handleInputChange('bankAccountEnabled', checked);
              }}
            />
          </div>
        </div>

        {settings.bankAccountEnabled && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Holder Name */}
              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input
                  id="accountHolderName"
                  value={settings.accountHolderName}
                  onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                  placeholder="Enter account holder name"
                />
                <p className="text-sm text-gray-500">Name as per bank records</p>
              </div>

              {/* Bank Name */}
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={settings.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  placeholder="Enter bank name"
                />
                <p className="text-sm text-gray-500">Name of the bank</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Number */}
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={settings.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  placeholder="Enter account number"
                />
                <p className="text-sm text-gray-500">Your bank account number</p>
              </div>

              {/* IFSC Code */}
              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  value={settings.ifscCode}
                  onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                  placeholder="Enter IFSC code"
                  className="uppercase"
                />
                <p className="text-sm text-gray-500">Bank's IFSC code</p>
              </div>
            </div>

            {/* Branch Name */}
            <div className="space-y-2">
              <Label htmlFor="branchName">Branch Name</Label>
              <Input
                id="branchName"
                value={settings.branchName}
                onChange={(e) => handleInputChange('branchName', e.target.value)}
                placeholder="Enter branch name"
              />
              <p className="text-sm text-gray-500">Bank branch name</p>
            </div>

            {/* Payment Instructions */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="h-5 w-5 bg-amber-500 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-amber-900">Important Notes</h4>
                  <ul className="text-sm text-amber-700 mt-1 space-y-1">
                    <li>• Ensure all bank details are accurate</li>
                    <li>• NEFT/RTGS payments may take 1-2 business days</li>
                    <li>• Keep your bank account active and accessible</li>
                    <li>• Verify IFSC code with your bank</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6">
        <Button 
          onClick={handleSave}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Payment Settings
        </Button>
      </div>
    </div>
  );


  const renderTabContent = () => {
    switch (activeTab) {
      case 'whatsapp':
        return renderWhatsAppSettings();
      case 'payments':
        return renderPaymentSettings();
      default:
        return renderWhatsAppSettings();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your system preferences and integrations</p>
        </div>
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
          <Save className="h-4 w-4 mr-2" />
          Save All Settings
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className={`p-1.5 rounded-md ${activeTab === tab.id ? tab.color : 'bg-gray-100'}`}>
                  <Icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {(() => {
              const Icon = tabs.find(t => t.id === activeTab)?.icon || MessageCircle;
              return <Icon className="h-5 w-5" />;
            })()}
            {tabs.find(t => t.id === activeTab)?.label} Settings
          </CardTitle>
          <CardDescription>
            {activeTab === 'whatsapp' && 'Manage WhatsApp Business API integration and settings'}
            {activeTab === 'payments' && 'Configure payment processing and billing settings'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderTabContent()}
        </CardContent>
      </Card>
    </div>
  );
}


export default function Page() {
  return (
    <Settings />

  );
}
