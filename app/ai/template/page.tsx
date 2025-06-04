"use client";

import { useState } from "react";
import {
  Input,
  Switch,
  Button,
  Card,
  Spin,
  Typography,
  Layout,
} from "antd";
import { CopyOutlined, RobotOutlined, SlackOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";

const { TextArea } = Input;
const { Title } = Typography;
const { Content } = Layout;

// Daily usage tracker
function checkLimit() {
  const today = new Date().toISOString().split("T")[0];
  const stored = JSON.parse(localStorage.getItem("ai-limit") || "{}");

  if (stored.date !== today) {
    localStorage.setItem("ai-limit", JSON.stringify({ date: today, count: 0 }));
    return { allowed: true, count: 0 };
  }

  if (stored.count >= 10) {
    return { allowed: false, count: stored.count };
  }

  return { allowed: true, count: stored.count };
}

function incrementLimit() {
  const today = new Date().toISOString().split("T")[0];
  const stored = JSON.parse(localStorage.getItem("ai-limit") || "{}");
  const newCount = (stored.date === today ? stored.count : 0) + 1;
  localStorage.setItem("ai-limit", JSON.stringify({ date: today, count: newCount }));
}

export default function MarketingGenerator() {
  const [useTemplate, setUseTemplate] = useState(true);
  const [businessName, setBusinessName] = useState("");
  const [features, setFeatures] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    const { allowed, count } = checkLimit();
    if (!allowed) {
      toast.error("❌ Daily limit of 10 messages reached.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        useTemplate,
        businessName,
        features,
        customPrompt,
      }),
    });

    const data = await res.json();
    setResponse(data.message || data.error);
    incrementLimit();
    setLoading(false);
  };

  return (
    <Layout className="min-h-screen ">
      <Content className="p-4 sm:p-6 md:p-8 lg:p-12">
        <Card
          className="max-w-2xl mx-auto shadow-xl hover:shadow-2xl transition-shadow duration-300"
          bordered={false}
        >
          <div className="space-y-6">
            <div className="text-center space-y-4 py-6">
              <div className="relative">
                <div className="absolute -inset-1  rounded-lg blur opacity-25  "></div>
                <Title level={2} className="relative flex items-center justify-center gap-3 !mb-0">
                  <SlackOutlined className="text-purple-600 text-3xl animate-pulse" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 font-bold">
                    AI Marketing Message Generator
                  </span>
                </Title>
              </div>
              <Typography.Text type="secondary" className="text-lg block mt-4 font-light tracking-wide">
                <span className="inline-block transform hover:scale-105 transition-transform duration-200">
                  Create compelling marketing messages with AI ✨
                </span>
              </Typography.Text>
            
            </div>

            <div className="flex items-center justify-start gap-2 border-b pb-4">
              <Switch
                
                checked={useTemplate}
                onChange={setUseTemplate}
                className="bg-purple-400"
              />
              <Typography.Text>Use Template Prompt</Typography.Text>
            </div>

            <div className="space-y-4">
              {useTemplate ? (
                <>
                  <Input
                    size="large"
                    placeholder="Enter your business name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="hover:border-blue-400 focus:border-blue-500"
                  />
                  <TextArea
                    size="large"
                    placeholder="Enter features (comma-separated)"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    autoSize={{ minRows: 3, maxRows: 6 }}
                    className="hover:border-blue-400 focus:border-blue-500"
                  />
                </>
              ) : (
                <TextArea
                  size="large"
                  placeholder="Enter your custom prompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  autoSize={{ minRows: 4, maxRows: 8 }}
                  className="hover:border-blue-400 focus:border-blue-500"
                />
              )}

              <Button
                color="purple"
                variant="solid"
                size="middle"
                className="ml-2"
                onClick={generate}
                disabled={loading}
              >
                {loading ? <Spin className="mr-2" /> : "✨"}
                {loading ? "Generating..." : "Generate Message"}
              </Button>
            </div>

            {response && (
              <div className="mt-6 animate-fade-in">
                <Card className="bg-gradient-to-br from-gray-50 to-blue-50 shadow-md" bordered={false}>
                  <div className="flex justify-end mb-2">
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(response);
                        toast.success("Copied to Clipboard");
                      }}
                      type="text"
                      icon={<CopyOutlined />}
                      className="flex items-center gap-1 rounded-md px-3 py-1 transition-all duration-200"
                    >
                      <span>Copy</span>
                    </Button>
                  </div>
                  <Typography.Paragraph className="whitespace-pre-wrap text-gray-700">
                    {response}
                  </Typography.Paragraph>
                </Card>
              </div>
            )}
          </div>
        </Card>
      </Content>
    </Layout>
  );
}
