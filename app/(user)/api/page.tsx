"use client";

import {
  Card,
  Button,
  Input,
  Tag,
  Typography,
  Tooltip,
  message,
  Select,
  Space,
  Modal,
} from "antd";
import {
  CopyOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  SendOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { KeyRound } from "lucide-react";
import ProtectedRoute from "@/components/Protected";

const { Title, Paragraph, Text } = Typography;

// Helper function to get device status icon and color
const getDeviceStatusInfo = (status: string) => {
  switch (status) {
    case "connected":
      return {
        icon: <CheckCircleOutlined />,
        color: "green",
        text: "Connected"
      };
    case "disconnected":
      return {
        icon: <CloseCircleOutlined />,
        color: "red",
        text: "Disconnected"
      };
    case "auth_failure":
      return {
        icon: <ExclamationCircleOutlined />,
        color: "orange",
        text: "Auth Failed"
      };
    case "not_found":
      return {
        icon: <ExclamationCircleOutlined />,
        color: "gray",
        text: "Not Found"
      };
    default:
      return {
        icon: <ExclamationCircleOutlined />,
        color: "gray",
        text: "Unknown"
      };
  }
};

function Developer() {
  const [apiKeys, setApiKeys] = useState([]);

  const generateApiKey = async (deviceId: string) => {
    if (deviceId === null) {
      toast.error("Please select a device");
      return;
    }
    try {
      const res = await api.post("/dev/generate", { deviceId });
      console.log(res?.data);
      if (res?.data.status) {
        fetchApiKeys();
        toast.success(res?.data?.message);
      } else {
        toast.error(res?.data?.message);
      }
    } catch (e) {
      toast.error("Failed to generate API key");
      console.error("API Error", e);
    }
  };

  const re_generateApiKey = async (deviceId: string) => {
    if (deviceId === null) {
      toast.error("Please select a device");
      return;
    }
    try {
      const res = await api.post("/dev/re-generate", { deviceId });
      console.log(res?.data);
      if (res?.data.status) {
        fetchApiKeys();
        toast.success(res?.data?.message);
      } else {
        toast.error(res?.data?.message);
      }
    } catch (e) {
      toast.error("Failed to generate API key");
      console.error("API Error", e);
    }
  };

  const deleteApiKey = async (apiKeyId: string) => {
    setIsDeleting(true);
    try {
      const res = await api.delete(`/dev/delete/${apiKeyId}`);
      console.log(res?.data);
      if (res?.data.status) {
        fetchApiKeys();
        toast.success(res?.data?.message);
        setIsDeleteModalOpen(false);
        setApiKeyToDelete(null);
      } else {
        toast.error(res?.data?.message);
      }
    } catch (e) {
      toast.error("Failed to delete API key");
      console.error("API Error", e);
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const res = await api.get("/dev/get-api-keys");
      setApiKeys(res?.data?.data);
    } catch (e) {
      console.error("API Error", e);
    }
  };

  const [selectedApiKey, setSelectedApiKey] = useState<string>("");
  const [baseUrl, setBaseUrl] = useState<string>(
    process.env.NEXT_PUBLIC_API_URL + "/dev/create-message?"
  );
  const [queryParams, setQueryParams] = useState<
    Array<{ key: string; value: string }>
  >([
    {
      key: "apikey",
      value: "[API_KEY]",
    },
    {
      key: "to",
      value: "[MOBILE_NUMBER]",
    },
    {
      key: "message",
      value: '[CONTENT]',
    },
  ]);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [apiKeyToDelete, setApiKeyToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const [selectedDevice, setselectedDevice] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success("API key copied to clipboard");
  };

  const regenerateKey = (deviceId: string) => {
    re_generateApiKey(deviceId);
  };

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: "", value: "" }]);
  };

  const removeQueryParam = (index: number) => {
    const newParams = queryParams.filter((_, i) => i !== index);
    setQueryParams(newParams);
  };

  const updateQueryParam = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newParams = queryParams.map((param, i) => {
      if (i === index) {
        return { ...param, [field]: value };
      }
      return param;
    });
    setQueryParams(newParams);
  };

  const handleTest = async () => {
    setLoading(true);
    try {
      const url = new URL(baseUrl);
      if (!url) {
        toast.error("Please input correct url");
        return;
      }
      const response = await fetch(url);

      const data = await response.json();
      setResponse(data);
      message.success("API request completed successfully");
    } catch (error) {
      message.error("Failed to make API request");
      setResponse({ error: "Failed to make API request" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setBaseUrl(`${process.env.NEXT_PUBLIC_API_URL}/dev/create-message?`);

    queryParams.map((param, index) => {
      if (param.key && param.value) {
        setBaseUrl((prev) => prev + param.key + "=" + param.value + "&");
      }
    });
    setBaseUrl((prev) => prev.slice(0, -1));
  }, [queryParams]);

  useEffect(() => {}, [user]);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  return (
    <section className="bg-[#ffffff] w-full p-6 sm:p-8 lg:p-12">
      {/* Modal Section */}
      <Modal
        title="Select Device for API Key"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={() => {
          setIsModalOpen(false);
          generateApiKey(selectedDevice!);
          console.log(selectedDevice);
        }}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        okButtonProps={{
          disabled: !selectedDevice
        }}
        width="90%"
        style={{ maxWidth: 500 }}
      >
        <div className="space-y-3">
          <Paragraph className="text-gray-600 mb-3 text-sm">
            Select a connected device to generate an API key. Only connected devices can create active API keys.
          </Paragraph>
          
          <Select
            className="w-full"
            placeholder="Choose a connected device"
            value={selectedDevice}
            onChange={setselectedDevice}
            optionFilterProp="children"
            showSearch
            size="large"
            filterOption={(input, option) => {
              const text = String(option?.children || '');
              return text.toLowerCase().includes(input.toLowerCase());
            }}
          >
            {user?.data?.user?.devices?.map((device: any, index: number) => {
              const deviceStatusInfo = getDeviceStatusInfo(device?.status);
              const isConnected = device?.status === "connected";
              
              return (
                <Select.Option 
                  key={index} 
                  value={device?.deviceId}
                  disabled={!isConnected}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{device?.deviceId}</span>
                      <Tag
                        color={deviceStatusInfo.color}
                        className="flex items-center gap-1 text-xs"
                      >
                        {deviceStatusInfo.icon}
                        {deviceStatusInfo.text}
                      </Tag>
                    </div>
                    {device?.number && (
                      <span className="text-gray-500 text-xs">
                        {device.number}
                      </span>
                    )}
                  </div>
                </Select.Option>
              );
            })}
          </Select>

          {/* Show warning if no connected devices */}
          {user?.data?.user?.devices?.filter((device: any) => device?.status === "connected").length === 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-orange-700">
                <ExclamationCircleOutlined className="text-sm" />
                <span className="font-medium text-sm">
                  No connected devices found. Please connect a device first before creating an API key.
                </span>
              </div>
            </div>
          )}

          {/* Show connected devices count */}
          {user?.data?.user?.devices?.filter((device: any) => device?.status === "connected").length > 0 && (
            <div className="text-xs text-gray-600">
              {user?.data?.user?.devices?.filter((device: any) => device?.status === "connected").length} connected device(s) available
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete API Key"
        open={isDeleteModalOpen}
        onOk={() => {
          if (apiKeyToDelete) {
            deleteApiKey(apiKeyToDelete._id);
          }
        }}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setApiKeyToDelete(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          loading: isDeleting,
        }}
        cancelButtonProps={{
          disabled: isDeleting,
        }}
        width="90%"
        style={{ maxWidth: 500 }}
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <ExclamationCircleOutlined className="text-red-500 text-xl mt-1 flex-shrink-0" />
            <div>
              <Title level={5} className="!mb-2">Are you sure you want to delete this API key?</Title>
              <Paragraph className="text-gray-600 !mb-0 text-sm">
                This action cannot be undone. The API key will be permanently removed and any applications using it will stop working.
              </Paragraph>
            </div>
          </div>
          
          {apiKeyToDelete && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="font-medium text-sm">Device ID:</span>
                  <span className="text-sm break-all">{apiKeyToDelete.deviceId}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-sm">API Key:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono break-all">
                    {apiKeyToDelete.apiKey}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">Status:</span>
                  <Tag color={apiKeyToDelete.status === "active" ? "green" : "red"}>
                    {apiKeyToDelete.status?.toUpperCase()}
                  </Tag>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
      {/*  */}

      <div className="max-w-7xl mx-auto space-y-10">
        {/* API Keys Section */}
        <Card
          title={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Title level={3} className="!mb-0">
                API Keys
              </Title>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchApiKeys}
                className="bg-blue-500 text-white"
              >
                <span className="hidden sm:inline">Refresh Status</span>
                <span className="sm:hidden">Refresh</span>
              </Button>
            </div>
          }
          className="shadow-md"
        >
          <Paragraph className="text-gray-500 mb-6 text-base">
            Manage your API keys for external integrations. Keep your keys
            secure - they provide full access to your account.
          </Paragraph>

          {/* Statistics Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <KeyOutlined className="text-blue-600 text-base" />
                <span className="font-medium text-blue-800 text-sm">Total Keys</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-2">
                {apiKeys.length}
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircleOutlined className="text-green-600 text-base" />
                <span className="font-medium text-green-800 text-sm">Active</span>
              </div>
              <div className="text-2xl font-bold text-green-900 mt-2">
                {apiKeys.filter((key: any) => key?.status === "active").length}
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CloseCircleOutlined className="text-red-600 text-base" />
                <span className="font-medium text-red-800 text-sm">Inactive</span>
              </div>
              <div className="text-2xl font-bold text-red-900 mt-2">
                {apiKeys.filter((key: any) => key?.status === "inactive").length}
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <PhoneOutlined className="text-orange-600 text-base" />
                <span className="font-medium text-orange-800 text-sm">Connected</span>
              </div>
              <div className="text-2xl font-bold text-orange-900 mt-2">
                {apiKeys.filter((key: any) => key?.deviceStatus === "connected").length}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {apiKeys.map((apiKey: any) => {
              const deviceStatusInfo = getDeviceStatusInfo(apiKey?.deviceStatus);
              return (
                <Card
                  key={apiKey?.deviceId}
                  className="bg-gray-50 border border-gray-200"
                  size="default"
                >
                  <div className="space-y-4">
                    {/* Device ID and Status */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-wrap min-w-0 flex-1">
                        <span className="font-medium text-base">{apiKey?.deviceId}</span>
                        <Tag
                          color={deviceStatusInfo.color}
                          className="flex items-center gap-1 flex-shrink-0"
                        >
                          {deviceStatusInfo.icon}
                          {deviceStatusInfo.text}
                        </Tag>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Tooltip title="Regenerate Key">
                          <Button
                            icon={<ReloadOutlined />}
                            onClick={() => regenerateKey(apiKey?.deviceId)}
                            className="bg-white"
                            disabled={apiKey?.deviceStatus !== "connected"}
                          />
                        </Tooltip>
                        <Tooltip title="Delete Key">
                          <Button
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              setApiKeyToDelete(apiKey);
                              setIsDeleteModalOpen(true);
                            }}
                            danger
                            className="bg-white"
                          />
                        </Tooltip>
                      </div>
                    </div>

                    {/* API Key */}
                    <div className="flex items-center gap-3">
                      <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono flex items-center gap-2 flex-1 break-all min-w-0">
                        <KeyRound size={16} />
                        <span className="truncate">{apiKey?.apiKey}</span>
                      </code>
                      <Tooltip title="Copy API Key">
                        <Button
                          icon={<CopyOutlined />}
                          type="text"
                          onClick={() => copyToClipboard(apiKey?.apiKey)}
                          className="flex-shrink-0"
                        />
                      </Tooltip>
                    </div>

                    {/* Device Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <PhoneOutlined className="text-sm flex-shrink-0" />
                        <span className="truncate">
                          <strong>Number:</strong> {apiKey?.deviceNumber || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <ClockCircleOutlined className="text-sm flex-shrink-0" />
                        <span className="truncate">
                          <strong>Last Connected:</strong>{" "}
                          {apiKey?.lastConnected 
                            ? new Date(apiKey.lastConnected).toLocaleDateString()
                            : "Never"
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 sm:col-span-2">
                        <span className="truncate">
                          <strong>Created:</strong> {new Date(apiKey.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Warning for disconnected devices */}
                    {apiKey?.deviceStatus !== "connected" && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-orange-700">
                          <ExclamationCircleOutlined className="text-base flex-shrink-0" />
                          <span className="font-medium text-sm">
                            Device is {apiKey?.deviceStatus}. API key is inactive and cannot send messages.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-8">
            <Button
              type="primary"
              className="bg-blue-500 w-full sm:w-auto"
              onClick={() => setIsModalOpen(true)}
              size="large"
            >
              Create New API Key
            </Button>
          </div>
        </Card>

        {/* API Testing Console */}
        <Card
          title={
            <Title level={3} className="!mb-0">
              API Testing Console
            </Title>
          }
          className="shadow-md"
        >
          <Paragraph className="text-gray-500 mb-6 text-base">
            Test your API endpoints and see real-time responses
          </Paragraph>

          <div className="space-y-6">
            <div>
              <Text strong className="text-base">API URL</Text>
              <Input
                className="mt-2"
                placeholder="Enter your API endpoint URL"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                size="large"
              />
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
                <Text strong className="text-base">Query Parameters</Text>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addQueryParam}
                  className="w-full sm:w-auto"
                >
                  Add Parameter
                </Button>
              </div>

              <div className="space-y-3">
                {queryParams.map((param, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-3 items-start">
                    <Input
                      placeholder="Parameter name"
                      value={param.key}
                      onChange={(e) =>
                        updateQueryParam(index, "key", e.target.value)
                      }
                      className="flex-1"
                    />
                    <Input
                      placeholder="Value"
                      value={param.value}
                      onChange={(e) =>
                        updateQueryParam(index, "value", e.target.value)
                      }
                      className="flex-1"
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeQueryParam(index)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleTest}
                loading={loading}
                className="bg-blue-500 w-full sm:w-auto"
                size="large"
              >
                Test Endpoint
              </Button>
            </div>

            <div>
              <Text strong className="text-base">Response</Text>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[200px]">
                {response ? (
                  <pre className="whitespace-pre-wrap break-words font-mono text-sm">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                ) : (
                  <div className="text-center text-gray-500 flex flex-col items-center justify-center h-[160px]">
                    <SendOutlined className="text-3xl mb-3" />
                    <Text className="text-base">
                      Select an API key and endpoint, then click "Test Endpoint"
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}



export default function Page() {
  return (
    <ProtectedRoute>
      <Developer/>
    </ProtectedRoute>
  );
}
