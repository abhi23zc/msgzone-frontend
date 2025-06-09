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
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { KeyRound } from "lucide-react";
import ProtectedRoute from "@/components/Protected";

const { Title, Paragraph, Text } = Typography;
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
    <section className="bg-[#ffffff] w-full p-8">
      {/* Modal Section */}
      <Modal
        title="Select Device"
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
      >
        <Select
          className="w-full mt-2"
          placeholder="Choose a device"
          value={selectedDevice}
          onChange={setselectedDevice}
        >
          {user?.data?.user?.devices?.map((device: any, index: number) => (
            <Select.Option key={index} value={device?.deviceId}>
              {device?.deviceId}
            </Select.Option>
          ))}
        </Select>
      </Modal>
      {/*  */}

      <div className="max-w-6xl mx-auto space-y-8">
        {/* API Keys Section */}
        <Card
          title={
            <Title level={3} className="!mb-0">
              API Keys
            </Title>
          }
          className="shadow-md"
        >
          <Paragraph className="text-gray-500 mb-6">
            Manage your API keys for external integrations. Keep your keys
            secure - they provide full access to your account.
          </Paragraph>

          <div className="space-y-6">
            {apiKeys.map((apiKey: any) => (
              <Card
                key={apiKey?.deviceId}
                className="bg-gray-50 border border-gray-200"
                size="small"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{apiKey?.deviceId}</span>
                      <Tag
                        color={apiKey?.status === "active" ? "green" : "red"}
                      >
                        {apiKey?.status?.toUpperCase()}
                      </Tag>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono flex items-center gap-3">
                        <KeyRound size={15} />
                        {apiKey?.apiKey}
                      </code>
                      <Tooltip title="Copy API Key">
                        <Button
                          icon={<CopyOutlined />}
                          size="small"
                          type="text"
                          onClick={() => copyToClipboard(apiKey?.apiKey)}
                        />
                      </Tooltip>
                    </div>
                    <div className="text-sm text-gray-500">
                      Created: {new Date(apiKey.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => regenerateKey(apiKey?.deviceId)}
                    className="bg-white"
                  >
                    Regenerate
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6">
            <Button
              type="primary"
              className="bg-blue-500"
              onClick={() => setIsModalOpen(true)}
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
          <Paragraph className="text-gray-500 mb-6">
            Test your API endpoints and see real-time responses
          </Paragraph>

          <div className="space-y-6">
            <div>
              <Text strong>API URL</Text>
              <Input
                className="mt-2"
                placeholder="Enter your API endpoint URL"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Text strong>Query Parameters</Text>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addQueryParam}
                >
                  Add Parameter
                </Button>
              </div>

              <div className="space-y-3">
                {queryParams.map((param, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <Input
                      placeholder="Parameter name"
                      value={param.key}
                      onChange={(e) =>
                        updateQueryParam(index, "key", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Value"
                      value={param.value}
                      onChange={(e) =>
                        updateQueryParam(index, "value", e.target.value)
                      }
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

            <div className="flex gap-2">
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleTest}
                loading={loading}
                className="bg-blue-500"
              >
                Test Endpoint
              </Button>
            </div>

            <div>
              <Text strong>Response</Text>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[200px]">
                {response ? (
                  <pre className="whitespace-pre-wrap break-words font-mono text-sm">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                ) : (
                  <div className="text-center text-gray-500 flex flex-col items-center justify-center h-[160px]">
                    <SendOutlined className="text-3xl mb-3" />
                    <Text>
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
