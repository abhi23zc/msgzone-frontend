"use client";

import { Card, Button, Input, Tag, Typography, Tooltip, message, Select, Space } from 'antd';
import { CopyOutlined, ReloadOutlined, PlusOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Title, Paragraph, Text } = Typography;

function Developer() {
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: 'Production API Key',
      key: 'msg_prod_xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      created: '2024-05-12',
      lastUsed: '2024-05-12',
      status: 'active'
    },
    {
      id: 2,
      name: 'Development API Key',
      key: 'msg_dev_xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      created: '2024-05-10',
      lastUsed: '2024-05-11',
      status: 'active'
    }
  ]);

  const [selectedApiKey, setSelectedApiKey] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [queryParams, setQueryParams] = useState<Array<{ key: string; value: string }>>([]);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('API key copied to clipboard');
  };

  const regenerateKey = (id: number) => {
    message.success('API key regenerated successfully');
    // In a real app, you would call an API here to regenerate the key
  };

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: '', value: '' }]);
  };

  const removeQueryParam = (index: number) => {
    const newParams = queryParams.filter((_, i) => i !== index);
    setQueryParams(newParams);
  };

  const updateQueryParam = (index: number, field: 'key' | 'value', value: string) => {
    const newParams = queryParams.map((param, i) => {
      if (i === index) {
        return { ...param, [field]: value };
      }
      return param;
    });
    setQueryParams(newParams);
  };

  const handleTest = async () => {
    if (!selectedApiKey || !baseUrl) {
      message.error('Please select an API key and enter a URL');
      return;
    }

    setLoading(true);
    try {
      const url = new URL(baseUrl);
      queryParams.forEach(param => {
        if (param.key && param.value) {
          url.searchParams.append(param.key, param.value);
        }
      });

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${selectedApiKey}`,
        }
      });

      const data = await response.json();
      setResponse(data);
      message.success('API request completed successfully');
    } catch (error) {
      message.error('Failed to make API request');
      setResponse({ error: 'Failed to make API request' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#ffffff] w-full p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* API Keys Section */}
        <Card
          title={<Title level={3} className="!mb-0">API Keys</Title>}
          className="shadow-md"
        >
          <Paragraph className="text-gray-500 mb-6">
            Manage your API keys for external integrations. Keep your keys secure - they provide full access to your account.
          </Paragraph>

          <div className="space-y-6">
            {apiKeys.map((apiKey) => (
              <Card
                key={apiKey.id}
                className="bg-gray-50 border border-gray-200"
                size="small"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{apiKey.name}</span>
                      <Tag color={apiKey.status === 'active' ? 'green' : 'red'}>
                        {apiKey.status.toUpperCase()}
                      </Tag>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                        {apiKey.key}
                      </code>
                      <Tooltip title="Copy API Key">
                        <Button
                          icon={<CopyOutlined />}
                          size="small"
                          type="text"
                          onClick={() => copyToClipboard(apiKey.key)}
                        />
                      </Tooltip>
                    </div>
                    <div className="text-sm text-gray-500">
                      Created: {apiKey.created} · Last used: {apiKey.lastUsed}
                    </div>
                  </div>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => regenerateKey(apiKey.id)}
                    className="bg-white"
                  >
                    Regenerate
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6">
            <Button type="primary" className="bg-blue-500">
              Create New API Key
            </Button>
          </div>
        </Card>

        {/* API Testing Console */}
        <Card
          title={<Title level={3} className="!mb-0">API Testing Console</Title>}
          className="shadow-md"
        >
          <Paragraph className="text-gray-500 mb-6">
            Test your API endpoints and see real-time responses
          </Paragraph>

          <div className="space-y-6">
            <div>
              <Text strong>Select API Key</Text>
              <Select
                className="w-full mt-2"
                placeholder="Choose an API key"
                value={selectedApiKey}
                onChange={setSelectedApiKey}
              >
                {apiKeys.map(key => (
                  <Select.Option key={key.id} value={key.key}>
                    {key.name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div>
              <Text strong>API URL</Text>
              <Input
                className="mt-2"
                placeholder="Enter your API endpoint URL"
                value={baseUrl}
                onChange={e => setBaseUrl(e.target.value)}
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
                      onChange={e => updateQueryParam(index, 'key', e.target.value)}
                    />
                    <Input
                      placeholder="Value"
                      value={param.value}
                      onChange={e => updateQueryParam(index, 'value', e.target.value)}
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

            <div>
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
                    <Text>Select an API key and endpoint, then click "Test Endpoint"</Text>
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

export default Developer;