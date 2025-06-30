"use client";
import {RenderWhatsapp }from './RenderWhatsapp' 
import {
  Form,
  Input,
  Select,
  Button,
  Upload,
  message,
  Image,
  DatePicker,
} from "antd";
import {
  UploadOutlined,
  SendOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useWhatsapp } from "@/context/WhatsappContext";
import toast from "react-hot-toast";
import PhoneUploaderInput from "./UploadContact";
import dynamic from "next/dynamic";
import Link from "next/link";
import ProtectedRoute from "@/components/Protected";
const { TextArea } = Input;

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface AttachmentType {
  file: File;
  caption: string;
  previewUrl?: string;
}

function Send() {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const {
    loading,
    sendMessage,
    sendBulkMessage,
    error,
    sendScheduleMessage,
    sendScheduleBulk,
  } = useWhatsapp();
  let devices = user?.data?.user?.devices;
  const [attachments, setAttachments] = useState<AttachmentType[]>([]);
  const [messageContent, setMessageContent] = useState("");

  const onSchedule = async (values: any) => {
    try {
      console.log("Schedule");
      const numbers = values.recipientNumber;
      if (numbers.length === 0) {
        toast.error("Please enter at least one recipient's WhatsApp number");
        return;
      }
      if (numbers.length == 1) {
        const msg: any = await sendScheduleMessage({
          number: numbers[0] || "",
          schedule: values?.schedule?.toISOString(),
          message: values.message,
          deviceId: values.fromNumber,
          attachments: attachments,
        });
        console.log(msg);
        if (msg) {
          toast.success("Message scheduled successfully");
          // Clear attachments after successful send
          setAttachments([]);
          form.resetFields(["message"]);
        }
      } else {
        const msg: any = await sendScheduleBulk({
          numbers: numbers || [],
          schedule: values?.schedule?.toISOString(),
          message: values.message,
          deviceId: values.fromNumber,
          attachments: attachments,
          timer: values.timer || 2,
        });
        console.log(msg);
        if (msg) {
          toast.success("Message scheduled successfully");
          // Clear attachments after successful send
          setAttachments([]);
          form.resetFields(["message"]);
        }
      }
    } catch (error) {
      toast.error("Error while scheduling message");
    }
  };

  const onFinish = async (values: any) => {
    const numbers = values.recipientNumber;
    console.log(values?.schedule?.toISOString());
    if (values?.schedule?.toISOString()) {
      onSchedule(values);
    } else {
      // console.log(numbers);
      if (numbers.length === 0) {
        toast.error("Please enter at least one recipient's WhatsApp number");
        return;
      }
      if (numbers.length == 1) {
        const msg: any = await sendMessage({
          number: numbers[0] || "",
          message: values.message,
          deviceId: values.fromNumber,
          attachments: attachments,
        });
        if (msg) {
          toast.success("Message sent successfully");
          // Clear attachments after successful send
          setAttachments([]);
          form.resetFields(["message"]);
        } 
      } else {
        const msg: any = await sendBulkMessage({
          numbers: numbers,
          message: values.message,
          deviceId: values.fromNumber,
          attachments: attachments,
          timer: values.timer || 2,
        });
        if (msg) {

          toast.success("Messages sent successfully");

          // Clear attachments after successful send
          setAttachments([]);
          form.resetFields(["message"]);
        } 
      }
    }
  };

  useEffect(() => {
    devices = user?.data?.user?.devices;
  }, [user]);

  const beforeUpload = (file: File) => {
    const isValidFormat = /\.(jpg|png|pdf|mp3|mp4)$/i.test(file.name);
    const isLessThan16MB = file.size / 1024 / 1024 < 5;

    if (!isValidFormat) {
      message.error(
        "Please upload files in JPG, PNG, PDF, MP3, or MP4 format only!"
      );
      return false;
    }
    if (!isLessThan16MB) {
      message.error("File must be smaller than 5MB!");
      return false;
    }

    // Create preview URL for images
    const previewUrl = file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : undefined;

    setAttachments((prev) => [...prev, { file, caption: "", previewUrl }]);
    return false;
  };

  const handleCaptionChange = (index: number, caption: string) => {
    const newAttachments = [...attachments];
    newAttachments[index].caption = caption;
    setAttachments(newAttachments);
  };

  const removeAttachment = (index: number) => {
    const attachment = attachments[index];
    if (attachment.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl);
    }
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  useEffect(() => {
    return () => {
      attachments.forEach((attachment) => {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
      });
    };
  }, []);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return null;
    if (file.type === "application/pdf") return "📄";
    if (file.type.startsWith("audio/")) return "🎵";
    if (file.type.startsWith("video/")) return "🎥";
    return "📎";
  };

  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
    ],
  };


  return (
    <section className="p-10 m-3 w-full ">
      <div className="flex flex-col lg:flex-row gap-6 ">
        {/* Left Column - Form */}
        <div className="flex-1 bg-white p-6 shadow-lg border border-gray-100 rounded-xl">
          <h1 className="text-2xl font-semibold mb-6 text-gray-800">Send Message</h1>

          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="From WhatsApp Number"
              name="fromNumber"
              rules={[{ required: true, message: "Please select WhatsApp number" }]}
            >
              <Select
                placeholder="Select WhatsApp number"
                className="w-full"
                size="large"
              >
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
              label="Recipient Numbers"
              name="recipientNumber"
              rules={[{ required: true, message: "Please enter at least one recipient's WhatsApp number" }]}
            >
              <PhoneUploaderInput messageContent={messageContent} />
            </Form.Item>

            <Form.Item
              label="Message"
              name="message"
              rules={[{ required: true, message: "Please enter your message" }]}
            >
              <ReactQuill
                theme="snow"
                modules={modules}
                className="h-32"
                onChange={(content) => {
                  setMessageContent(content);
                  form.setFieldValue('message', content);
                }}
              />
            </Form.Item>

            <div className="flex justify-end mt-10">
              <Link href={"/ai/template"} target="_blank">
                <Button type="link" className="text-blue-600 hover:text-blue-700">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Use AI Template
                  </span>
                </Button>
              </Link>
            </div>

            {/* Attachments Section */}
            <Form.Item label="Attachments" className="mb-6">
              <div className="space-y-4">
                <Upload.Dragger
                  beforeUpload={beforeUpload}
                  multiple={true}
                  showUploadList={false}
                  className="w-full hover:border-blue-500 transition-colors"
                >
                  <div className="p-6">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <UploadOutlined className="text-xl text-blue-500" />
                    </div>
                    <p className="text-base font-medium text-gray-900 mb-1">Drop files here or click to upload</p>
                    <p className="text-sm text-gray-500">
                      Support for JPG, PNG, PDF, MP3, MP4 files up to 5MB
                    </p>
                  </div>
                </Upload.Dragger>

                {attachments.length > 0 && (
                  <div className="space-y-3">
                    {attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-white rounded-lg border">
                          {attachment.previewUrl ? (
                            <Image
                              src={attachment.previewUrl}
                              alt={attachment.file.name}
                              className="object-cover w-full h-full rounded-lg"
                              preview={{ mask: "Preview" }}
                            />
                          ) : (
                            <span className="text-2xl">
                              {getFileIcon(attachment.file)}
                            </span>
                          )}
                        </div>

                        <div className="flex-grow min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {attachment.file.name}
                            </span>
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => removeAttachment(index)}
                              className="flex-shrink-0"
                            />
                          </div>
                          <Input.TextArea
                            placeholder="Add a caption (optional)"
                            value={attachment.caption}
                            onChange={(e) => handleCaptionChange(index, e.target.value)}
                            className="w-full"
                            autoSize={{ minRows: 1, maxRows: 3 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Form.Item>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    loading={loading}
                    type="primary"
                    htmlType="submit"
                    icon={<SendOutlined />}
                    size="large"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Send Message
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Form.Item
                    name="schedule"
                    rules={[]}
                    className="mb-0"
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      className="h-10 min-w-[240px]"
                      placeholder="Schedule Message"
                    />
                  </Form.Item>

                  <Form.Item
                    name="timer"
                    rules={[]}
                    className="mb-0"
                  >
                    <Input
                      prefix={<ClockCircleOutlined className="text-gray-400" />}
                      placeholder="Delay (seconds)"
                      className="h-10 w-32"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          </Form>
        </div>

        {/* Right Column - WhatsApp Preview */}
        <div className="lg:w-[400px] bg-white p-6 shadow-lg border border-gray-100 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">WhatsApp Preview</h3>
          <div className="relative w-[280px] h-[560px] mx-auto">
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
                <div
                  className="p-4 h-[calc(100%-56px)] overflow-y-auto"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <style>
                    {`
                      .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                      }
                    `}
                  </style>
                  <div className="bg-[#DCF8C6] rounded-lg p-3 max-w-[80%] max-h-full overflow-y-auto hide-scrollbar"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    
                    {RenderWhatsapp(messageContent)}  
                  </div>

                  {/* Attachments */}
                  {attachments.length > 0 && (
                    <div className="mt-2">
                      {attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="bg-[#DCF8C6] rounded-lg p-2 max-w-[80%] mt-2"
                        >
                          {attachment.previewUrl ? (
                            <img
                              src={attachment.previewUrl}
                              alt={attachment.file.name}
                              className="w-full rounded-lg"
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                              <span className="text-2xl">
                                {getFileIcon(attachment.file)}
                              </span>
                              <span className="text-sm text-gray-600 truncate">
                                {attachment.file.name}
                              </span>
                            </div>
                          )}
                          {attachment.caption && (
                            <div className="text-sm text-gray-800 mt-1">
                              {attachment.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <ProtectedRoute>
      <Send />
    </ProtectedRoute>
  );
}
