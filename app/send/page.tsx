"use client";

import { Form, Input, Select, Button, Upload, message } from "antd";
import { UploadOutlined, SendOutlined } from "@ant-design/icons";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useWhatsapp } from "@/context/WhatsappContext";
import toast from "react-hot-toast";

const { TextArea } = Input;

function Send() {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const { loading, sendMessage, error } = useWhatsapp();
  let devices = user?.data?.user?.devices;
  const onFinish = async (values: any) => {
    
    console.log("Form values:", values);
    const msg:any = await sendMessage({
      number: values.recipientNumber,
      message: values.message,
      deviceId: values.fromNumber,
    })
    if(msg) toast.success("Message sent successfully");
    else toast.error("Error while sending message");

  };

  useEffect(() => {
    devices = user?.data?.user?.devices;
  }, [user]);

  const beforeUpload = (file: any) => {
    const isValidFormat = /\.(jpg|png|pdf|mp3|mp4)$/i.test(file.name);
    const isLessThan16MB = file.size / 1024 / 1024 < 16;

    if (!isValidFormat) {
      message.error(
        "Please upload files in JPG, PNG, PDF, MP3, or MP4 format only!"
      );
    }
    if (!isLessThan16MB) {
      message.error("File must be smaller than 16MB!");
    }

    return isValidFormat && isLessThan16MB;
  };

  return (
    <section className="md:my-10 md:mx-10 m-3 w-full ">
      <h1 className="text-3xl font-semibold mb-6">Send Message</h1>

      <div className="w-full bg-white p-6 shadow-md border border-gray-200 rounded-lg ">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="From WhatsApp Number"
            name="fromNumber"
            rules={[
              { required: true, message: "Please select WhatsApp number" },
            ]}
          >
            <Select placeholder="Select WhatsApp number" className="w-full">
              {devices?.map(
                (device: any, index: number) =>
                  device.status === "connected" && (
                    <Select.Option key={index} value={device.deviceId}>
                      {device.deviceName}
                    </Select.Option>
                  )
              )}
            </Select>
          </Form.Item>

          <Form.Item
            label="Recipient Number"
            name="recipientNumber"
            rules={[
              {
                required: true,
                message: "Please enter recipient's WhatsApp number",
              },
            ]}
          >
            <Input
              placeholder="Enter recipient's WhatsApp number"
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            label="Message"
            name="message"
            rules={[{ required: true, message: "Please enter your message" }]}
            extra={
              <div className="flex justify-end">
                <Button type="link" className="p-0">
                  Use Template
                </Button>
              </div>
            }
          >
            <TextArea
              rows={4}
              placeholder="Type your message here..."
              className="w-full"
            />
          </Form.Item>

          <Form.Item label="Attachments" name="attachments">
            <Upload
              disabled
              beforeUpload={beforeUpload}
              multiple
              className="w-full"
            >
              <Button icon={<UploadOutlined />} className="w-full">
                Add Attachment
              </Button>
            </Upload>
            <div className="text-xs text-gray-500 mt-2">
              Supported formats: JPG, PNG, PDF, MP3, MP4 (max 16MB)
            </div>
          </Form.Item>

          <div className="flex justify-end gap-4 mt-6">
            <Button loading={loading} type="primary" htmlType="submit" icon={<SendOutlined />}>
              Send Message
            </Button>
          </div>
        </Form>
      </div>
    </section>
  );
}

export default Send;
