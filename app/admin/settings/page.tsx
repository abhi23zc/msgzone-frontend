"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Save,
  MessageCircle,
  CreditCard,
  Smartphone,
  CheckCircle,
  XCircle,
  Loader2,
  Settings as SettingsIcon,
  Upload,
  Image,
  FileText,
  Eye,
  Edit3,
  Clock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

function Settings() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [showDeviceSuccess, setShowDeviceSuccess] = useState(false);
  const [selectedDeviceName, setSelectedDeviceName] = useState('business');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [paymentSettingsLoading, setPaymentSettingsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoUploading, setLogoUploading] = useState(false);
  
  const [messageTemplates, setMessageTemplates] = useState({
    paymentApproval: `🎉 *Payment Approved!*

Hello {{userName}},

Your payment of ₹{{amount}} for the *{{planName}}* plan has been approved successfully!

📋 *Payment Details:*
• Amount: ₹{{amount}}
• Plan: {{planName}}
• Payment Method: {{paymentMethod}}
• UTR: {{utrNumber}}
• Status: ✅ Approved
• Approved At: {{approvedAt}}

📋 *Plan Details:*
• Duration: {{durationDays}} days
• Messages: {{messageLimit}} messages
• Features: {{features}}
• Start Date: {{startDate}}
• End Date: {{endDate}}

🚀 *What's Next:*
• Your subscription is now active
• You can start sending messages immediately
• Access all premium features
• Track your usage in the dashboard

Thank you for choosing MsgZone! 

Need help? Contact our support team anytime.

Best regards,
MsgZone Team`,
    paymentRejection: `❌ *Payment Rejected*

Hello {{userName}},

We regret to inform you that your payment of ₹{{amount}} for the *{{planName}}* plan has been rejected.

📋 *Payment Details:*
• Amount: ₹{{amount}}
• Plan: {{planName}}
• UTR: {{utrNumber}}
• Status: ❌ Rejected
• Rejected At: {{rejectedAt}}

*Reason:* {{rejectionReason}}

🔄 *What's Next:*
• Please verify your payment details
• Ensure UTR number is correct
• Check if payment was successful
• Contact support if you believe this is an error

💡 *Need Help?*
• Contact our support team
• Resubmit payment with correct details
• Check our payment guidelines

We're here to help you get started!

Best regards,
MsgZone Team`,
    paymentPending: `⏳ *Payment Under Review*

Hello {{userName}},

Your payment of ₹{{amount}} for the *{{planName}}* plan has been received and is currently under review.

📋 *Payment Details:*
• Amount: ₹{{amount}}
• Plan: {{planName}}
• Payment Method: {{paymentMethod}}
• UTR: {{utrNumber}}
• Status: 🔍 Pending Review

📋 *Plan Details:*
• Duration: {{durationDays}} days
• Messages: {{messageLimit}} messages
• Features: {{features}}

Our team will review your payment and activate your plan within 24 hours. You will receive a confirmation message once approved.

Thank you for your patience!

Best regards,
MsgZone Team`
  });
  
  const [templateLoading, setTemplateLoading] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const [settings, setSettings] = useState({
    systemName: 'MsgZone',
    logoUrl: '',
    whatsappEnabled: true,
    webhookUrl: '',
    autoReply: false,
    businessProfile: true,
    messageTemplate: '',
    paymentEnabled: true,
    qrUpiEnabled: true,
    qrCodeUrl: '',
    upiId: '',
    bankAccountEnabled: true,
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    smtpEnabled: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@msgzone.com',
    fromName: 'MsgZone',
    emailNotifications: true,
    smsNotifications: true,
    whatsappLoginNotifications: true
  });


  const checkUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/profile");
      if (res?.data.success) {
        setUser(res.data);
        // Auto-load devices when user data is available
        if (res.data.data?.user?.devices) {
          fetchDevices(res.data);
        }
      }
    } catch (error) {
      console.error("Error checking user:", error);
      showNotification('error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const saveToLocalStorage = useCallback((settingsData: any) => {
    try {
      localStorage.setItem('msgzone_general_settings', JSON.stringify(settingsData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedSettings = localStorage.getItem('msgzone_general_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({
          ...prev,
          systemName: parsedSettings.systemName || prev.systemName,
          logoUrl: parsedSettings.logoUrl || prev.logoUrl,
        }));
        
        // Set logo preview if logoUrl exists
        if (parsedSettings.logoUrl) {
          // Convert relative URL to full URL using NEXT_PUBLIC_API_URL
          const fullLogoUrl = parsedSettings.logoUrl.startsWith('http') 
            ? parsedSettings.logoUrl 
            : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${parsedSettings.logoUrl}`;
          setLogoPreview(fullLogoUrl);
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    checkUser();
    loadFromLocalStorage();
  }, [checkUser, loadFromLocalStorage]);

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification('error', 'Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('error', 'File size must be less than 5MB');
        return;
      }

      try {
        setLogoUploading(true);
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('logo', file);

        // Upload file to backend
        const response = await api.post('/admin/general-settings/upload-logo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          const logoUrl = response.data.data.logoUrl;
          
          // Convert relative URL to full URL using NEXT_PUBLIC_API_URL
          const fullLogoUrl = logoUrl.startsWith('http') 
            ? logoUrl 
            : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${logoUrl}`;
          
          // Update settings with the uploaded logo URL
          setSettings(prev => ({
            ...prev,
            logoUrl: fullLogoUrl
          }));
          
          // Set preview
          setLogoPreview(fullLogoUrl);
          setLogoFile(file);
          
          showNotification('success', 'Logo uploaded successfully!');
        } else {
          showNotification('error', response.data.message || 'Failed to upload logo');
        }
      } catch (error) {
        console.error('Error uploading logo:', error);
        showNotification('error', 'Failed to upload logo');
      } finally {
        setLogoUploading(false);
      }
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setSettings(prev => ({
      ...prev,
      logoUrl: ''
    }));
    showNotification('success', 'Logo removed successfully!');
  };

  const fetchGeneralSettings = useCallback(async () => {
    try {
      const res = await api.get("/admin/general-settings");
      if (res?.data?.success) {
        const generalSettings = res.data.data;
        setSettings(prev => ({
          ...prev,
          systemName: generalSettings.systemName || prev.systemName,
          logoUrl: generalSettings.logoUrl || prev.logoUrl,
          emailNotifications: generalSettings.emailNotifications !== undefined ? generalSettings.emailNotifications : prev.emailNotifications,
          smsNotifications: generalSettings.smsNotifications !== undefined ? generalSettings.smsNotifications : prev.smsNotifications,
          whatsappLoginNotifications: generalSettings.whatsappLoginNotifications !== undefined ? generalSettings.whatsappLoginNotifications : prev.whatsappLoginNotifications,
        }));
        
        // Set logo preview if logoUrl exists
        if (generalSettings.logoUrl) {
          // Convert relative URL to full URL using NEXT_PUBLIC_API_URL
          const fullLogoUrl = generalSettings.logoUrl.startsWith('http') 
            ? generalSettings.logoUrl 
            : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${generalSettings.logoUrl}`;
          setLogoPreview(fullLogoUrl);
        }
      }
    } catch (error) {
      console.error("Error fetching general settings:", error);
      // Don't show error notification for general settings as it's not critical
    }
  }, []);

  const fetchPaymentSettings = useCallback(async () => {
    if (paymentSettingsLoading) return; // Prevent multiple simultaneous requests
    
    try {
      setPaymentSettingsLoading(true);
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
      showNotification('error', 'Failed to load payment settings');
    } finally {
      setPaymentSettingsLoading(false);
    }
  }, [showNotification]);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      console.log('Saving settings for tab:', activeTab);
      
      if (activeTab === 'general') {
        // Save general settings
        const generalSettingsData = {
          systemName: settings.systemName,
          logoUrl: logoPreview || settings.logoUrl,
          emailNotifications: settings.emailNotifications,
          smsNotifications: settings.smsNotifications,
          whatsappLoginNotifications: settings.whatsappLoginNotifications,
        };

        console.log('Saving general settings:', generalSettingsData);

        // Save to localStorage
        saveToLocalStorage(generalSettingsData);

        // Save to backend
        const res = await api.put("/admin/general-settings", generalSettingsData);
        console.log('General settings response:', res.data);
        if (res?.data?.success) {
          showNotification('success', 'General settings saved successfully!');
        } else {
          showNotification('error', res.data.message || 'Failed to save general settings');
        }
      } else if (activeTab === 'payments') {
        // Save payment settings
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

        console.log('Saving payment settings:', paymentSettingsData);
        const res = await api.put("/admin/payment-settings", paymentSettingsData);
        console.log('Payment settings response:', res.data);
        if (res?.data?.success) {
          showNotification('success', 'Payment settings saved successfully!');
        } else {
          showNotification('error', res.data.message || 'Failed to save payment settings');
        }
      } else if (activeTab === 'templates') {
        // Save message templates
        console.log('Saving message templates:', messageTemplates);
        const res = await api.put("/admin/message-templates", messageTemplates);
        console.log('Message templates response:', res.data);
        if (res?.data?.success) {
          showNotification('success', 'Message templates saved successfully!');
        } else {
          showNotification('error', res.data.message || 'Failed to save message templates');
        }
      } else if (activeTab === 'whatsapp') {
        // WhatsApp tab doesn't have settings to save, just show a message
        console.log('WhatsApp tab - no settings to save');
        showNotification('success', 'WhatsApp settings are managed automatically!');
      } else {
        console.log('Unknown tab:', activeTab);
        showNotification('error', 'Unknown tab - cannot save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('error', `Failed to save settings: ${error}`);
    } finally {
      setSaving(false);
    }
  }, [settings, activeTab, logoPreview, showNotification, saveToLocalStorage, messageTemplates]);

  const fetchDevices = useCallback((userData?: any) => {
    const userToUse = userData || user;
    if (!userToUse?.data?.user?.devices) {
      setDevices([]);
      return;
    }

    const deviceData = userToUse.data.user.devices.map((device: any, idx: any) => ({
      key: idx,
      number: device?.number || "N/A",
      deviceId: device?.deviceId,
      sent: device?.sent || 0,
      lastConnected: device?.lastConnected,
      status: device?.status,
    }));

    setDevices(deviceData);
    
    // Set the currently active device as selected
    const activeDevice = userToUse.data.user.adminDevice;
    if (activeDevice) {
      setSelectedDeviceId(activeDevice);
    }
  }, [user]);

  // Template Management Functions
  const fetchMessageTemplates = useCallback(async () => {
    try {
      setTemplateLoading(true);
      const res = await api.get("/admin/message-templates");
      if (res?.data?.success) {
        setMessageTemplates(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching message templates:", error);
      // Don't show error notification as templates are not critical
    } finally {
      setTemplateLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'general') {
      fetchGeneralSettings();
    } else if (activeTab === 'payments') {
      fetchPaymentSettings();
    } else if (activeTab === 'templates') {
      fetchMessageTemplates();
    }
  }, [activeTab, fetchGeneralSettings, fetchPaymentSettings, fetchMessageTemplates]);

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon, color: 'bg-gray-500' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500' },
    { id: 'payments', label: 'Payments', icon: CreditCard, color: 'bg-purple-500' },
    { id: 'templates', label: 'Message Templates', icon: FileText, color: 'bg-blue-500' }
  ];


  const handleDeviceSelection = useCallback(async () => {
    try {
      setDevicesLoading(true);
      if (selectedDeviceId) {
        setSelectedDeviceName(selectedDeviceId);
        
        const data = await api.post("/admin/setAdminDevice", { deviceId: selectedDeviceId });
        if (data?.data?.status) {
          showNotification('success', `${selectedDeviceId} is now your active device!`);
        } else {
          showNotification('error', 'Failed to set active device');
        }
      } else {
        showNotification('error', 'Please select a device first');
      }
    } catch (error) {
      console.error('Error setting device:', error);
      showNotification('error', 'Failed to set active device');
    } finally {
      setDevicesLoading(false);
    }
  }, [selectedDeviceId, showNotification]);

  const saveMessageTemplates = useCallback(async () => {
    try {
      setSaving(true);
      const res = await api.put("/admin/message-templates", messageTemplates);
      if (res?.data?.success) {
        showNotification('success', 'Message templates saved successfully!');
      } else {
        showNotification('error', res.data.message || 'Failed to save message templates');
      }
    } catch (error) {
      console.error('Error saving message templates:', error);
      showNotification('error', 'Failed to save message templates');
    } finally {
      setSaving(false);
    }
  }, [messageTemplates, showNotification]);

  const handleTemplateChange = (templateType: string, content: string) => {
    setMessageTemplates(prev => ({
      ...prev,
      [templateType]: content
    }));
  };

  const generatePreview = (templateType: string) => {
    const template = messageTemplates[templateType as keyof typeof messageTemplates];
    const sampleData = {
      userName: 'John Doe',
      amount: '999',
      planName: 'Premium Plan',
      paymentMethod: 'QR Code & UPI',
      utrNumber: 'TXN123456789',
      approvedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      rejectedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      durationDays: '30',
      messageLimit: '1000',
      features: 'Unlimited messages, Priority support, Advanced analytics',
      startDate: new Date().toLocaleDateString('en-IN'),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
      rejectionReason: 'Payment verification failed'
    };

    let preview = template;
    Object.entries(sampleData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    setPreviewTemplate(preview);
    setShowPreview(true);
  };

  const convertToWhatsAppText = (content: string) => {
    if (!content) return "";
    
    const isHTML = /<\/?[a-z][\s\S]*>/i.test(content);
    
    if (!isHTML) return content;
    
    const div = document.createElement("div");
    div.innerHTML = content;
    
    const walk = (node: any) => {
      let text = "";
      
      node.childNodes.forEach((child: any) => {
        if (child.nodeType === 3) {
          text += child.nodeValue;
        } else if (child.nodeType === 1) {
          const tag = child.nodeName;
          
          if (tag === "BR") {
            text += "\n";
          } else if (["P", "DIV", "LI"].includes(tag)) {
            text += walk(child) + "\n";
          } else if (["STRONG", "B"].includes(tag)) {
            text += `*${walk(child)}*`;
          } else if (["EM", "I"].includes(tag)) {
            text += `_${walk(child)}_`;
          } else if (["S", "DEL"].includes(tag)) {
            text += `~${walk(child)}~`;
          } else {
            text += walk(child);
          }
        }
      });
      
      return text;
    };
    
    return walk(div).replace(/\n{2,}/g, "\n\n").trim();
  };

  const renderWhatsAppPreview = (content: string) => {
    const whatsappText = convertToWhatsAppText(content);
    const lines = whatsappText.split("\n").map((line) =>
      line
        .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
        .replace(/_(.*?)_/g, "<em>$1</em>")
        .replace(/~(.*?)~/g, "<s>$1</s>")
    );
    
    const htmlContent = `<ul style="list-style: none; padding-left: 0; margin: 0;">${lines
      .map((line) => `<li style="margin: 0; padding: 0;">${line}</li>`)
      .join("")}</ul>`;
    
    return (
      <div
        className="text-sm text-gray-800"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
    
      {/* System Name & Logo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-500 rounded-xl flex items-center justify-center shadow-lg">
              <SettingsIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Brand Identity</h3>
              <p className="text-gray-600">Set your system name and upload a logo</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* System Name */}
          <div className="space-y-2">
            <Label htmlFor="systemName">System Name</Label>
            <Input
              id="systemName"
              value={settings.systemName}
              onChange={(e) => handleInputChange('systemName', e.target.value)}
              placeholder="Enter your system name"
              className="text-lg font-medium"
            />
            <p className="text-sm text-gray-500">This will be displayed throughout the application</p>
          </div>

          {/* Logo Upload */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium text-gray-900">System Logo</Label>
              <p className="text-sm text-gray-500">Upload your company or system logo (PNG, JPG, SVG - Max 5MB)</p>
            </div>
            
            <div className="flex items-center justify-center">
              <input
                type="file"
                id="logoUpload"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={logoUploading}
                className="hidden"
              />
              <Button 
                variant="outline" 
                className={`cursor-pointer transition-colors ${
                  logoUploading 
                    ? 'border-blue-200 text-blue-600 bg-blue-50 cursor-not-allowed' 
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                disabled={logoUploading}
                onClick={() => {
                  if (!logoUploading) {
                    document.getElementById('logoUpload')?.click();
                  }
                }}
              >
                {logoUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </>
                )}
              </Button>
            </div>

            {/* Current Logo Preview */}
            {(logoPreview || settings.logoUrl) && !logoUploading && (
              <div className="mt-4">
                <Label className="text-sm font-medium text-gray-700">Current Logo</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={logoPreview || settings.logoUrl} 
                      alt="System Logo" 
                      className="h-16 w-16 object-contain bg-white rounded-lg border border-gray-200 p-2"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Logo Preview</p>
                      <p className="text-xs text-gray-500">This will be displayed in the header and throughout the app</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={removeLogo}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    disabled={logoUploading}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}

            {/* Uploading Status */}
            {logoUploading && (
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Uploading logo...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
              <p className="text-gray-600">Configure system notifications and alerts</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">


          {/* WhatsApp Login Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">WhatsApp Login Notifications</h4>
                <p className="text-xs text-gray-500">Send login alerts with device info via WhatsApp</p>
              </div>
            </div>
            <Switch
              checked={settings.whatsappLoginNotifications}
              onCheckedChange={(checked) => handleInputChange('whatsappLoginNotifications', checked)}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6">
        <Button 
          onClick={handleSave}
          className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-2"
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save General Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );

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
                            checked={selectedDeviceId === device.deviceId}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                            onChange={() => setSelectedDeviceId(device.deviceId)}
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
              {devices.length > 0 && selectedDeviceId && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Selected Device:</span>
                  <span className="text-sm font-semibold text-blue-600">{selectedDeviceId}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {devices.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 transition-colors"
                  onClick={handleDeviceSelection}
                  disabled={devicesLoading}
                >
                  {devicesLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Setting...
                    </>
                  ) : (
                    'Set as Active'
                  )}
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

      {/* Loading State */}
      {paymentSettingsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            <span className="text-gray-600">Loading payment settings...</span>
          </div>
        </div>
      ) : (
        <>
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
                      src={settings.qrCodeUrl.startsWith('http') 
                        ? settings.qrCodeUrl 
                        : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${settings.qrCodeUrl}`} 
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
          disabled={saving || paymentSettingsLoading}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Payment Settings
            </>
          )}
        </Button>
      </div>
        </>
      )}
    </div>
  );


  const renderMessageTemplates = () => (
    <div className="space-y-6">
      {/* Template Management Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Templates</h2>
        <p className="text-gray-600">Customize WhatsApp message templates for payment notifications</p>
      </div>

      {/* Available Variables Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">Available Variables</h4>
            <p className="text-sm text-blue-700 mt-1">
              Use these variables in your templates: <code className="bg-blue-100 px-1 rounded">{"{{userName}}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{{amount}}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{{planName}}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{{paymentMethod}}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{{utrNumber}}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{{approvedAt}}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{{rejectedAt}}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{{durationDays}}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{{messageLimit}}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{{features}}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{{startDate}}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{{endDate}}"}</code>, <code className="bg-blue-100 px-1 rounded">{"{{rejectionReason}}"}</code>
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {templateLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading message templates...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Payment Approval Template */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Payment Approval Template</h3>
                    <p className="text-gray-600">Message sent when payment is approved</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generatePreview('paymentApproval')}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
            <div className="p-6">
              <ReactQuill
                theme="snow"
                value={messageTemplates.paymentApproval}
                onChange={(content) => handleTemplateChange('paymentApproval', content)}
                className="h-64"
                modules={{
                  toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['clean']
                  ]
                }}
              />
            </div>
          </div>

          {/* Payment Rejection Template */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-rose-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                    <XCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Payment Rejection Template</h3>
                    <p className="text-gray-600">Message sent when payment is rejected</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generatePreview('paymentRejection')}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
            <div className="p-6">
              <ReactQuill
                theme="snow"
                value={messageTemplates.paymentRejection}
                onChange={(content) => handleTemplateChange('paymentRejection', content)}
                className="h-64"
                modules={{
                  toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['clean']
                  ]
                }}
              />
            </div>
          </div>

          {/* Payment Pending Template */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-amber-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Payment Pending Template</h3>
                    <p className="text-gray-600">Message sent when payment is under review</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generatePreview('paymentPending')}
                  className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
            <div className="p-6">
              <ReactQuill
                theme="snow"
                value={messageTemplates.paymentPending}
                onChange={(content) => handleTemplateChange('paymentPending', content)}
                className="h-64"
                modules={{
                  toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['clean']
                  ]
                }}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <Button 
              onClick={saveMessageTemplates}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Message Templates
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">WhatsApp Preview</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                  className="text-gray-600 border-gray-200 hover:bg-gray-50"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="relative w-[280px] h-[400px] mx-auto">
                {/* Phone Frame */}
                <div className="absolute inset-0 bg-gray-900 rounded-[40px] shadow-xl">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl"></div>
                  
                  {/* Screen */}
                  <div className="absolute inset-4 bg-white rounded-[32px] overflow-hidden">
                    {/* WhatsApp Header */}
                    <div className="h-14 bg-[#075E54] flex items-center px-4">
                      <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                      <div className="ml-3">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded mt-1"></div>
                      </div>
                    </div>
                    
                    {/* Message Preview */}
                    <div className="p-4 h-[calc(100%-56px)] overflow-y-auto">
                      <div className="bg-[#DCF8C6] rounded-lg p-3 max-w-[80%]">
                        {renderWhatsAppPreview(previewTemplate)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'whatsapp':
        return renderWhatsAppSettings();
      case 'payments':
        return renderPaymentSettings();
      case 'templates':
        return renderMessageTemplates();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className={`px-6 py-4 rounded-lg shadow-lg border flex items-center space-x-3 ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white border-green-400' 
              : 'bg-red-500 text-white border-red-400'
          }`}>
            <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
              notification.type === 'success' ? 'bg-green-400' : 'bg-red-400'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-white" />
              ) : (
                <XCircle className="h-4 w-4 text-white" />
              )}
            </div>
            <div>
              <p className="font-semibold">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-white/80 hover:text-white transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your system preferences and integrations</p>
        </div>
        <Button 
          onClick={handleSave} 
          className="bg-green-600 hover:bg-green-700"
          disabled={saving || paymentSettingsLoading}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Settings
            </>
          )}
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
            {activeTab === 'general' && 'Configure system name, logo, and basic application settings'}
            {activeTab === 'whatsapp' && 'Manage WhatsApp Business API integration and settings'}
            {activeTab === 'payments' && 'Configure payment processing and billing settings'}
            {activeTab === 'templates' && 'Customize WhatsApp message templates for payment notifications'}
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
