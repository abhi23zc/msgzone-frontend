"use client";

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
        } else toast.error("Error while sending message");
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
        } else toast.error("Error while sending message");
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
      [{ list: "ordered" }, { list: "bullet" }], // lists
    ],
  };

  return (
    <section className="md:my-10 md:mx-10 m-3 w-full">
      <h1 className="text-3xl font-semibold mb-6">Send Message</h1>

      <div className="w-full bg-white p-6 shadow-md border border-gray-200 rounded-lg">
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

          {/* <Form.Item
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
          </Form.Item> */}

          <Form.Item
            label="Recipient Numbers"
            name="recipientNumber"
            rules={[
              {
                required: true,
                message:
                  "Please enter at least one recipient's WhatsApp number",
              },
            ]}
          >
            {/* <PhoneNumberInput form={form} /> */}
            <PhoneUploaderInput />
          </Form.Item>

          {/* <Form.Item
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
          </Form.Item> */}

          <Form.Item
            label="Message"
            name="message"
            rules={[{ required: true, message: "Please enter your message" }]}
          >
            <ReactQuill theme="snow" modules={modules} className="h-32" />
          </Form.Item>
          <div className="flex justify-end animate-pulse">
            <Link href={"/ai/template"} target="_blank">
              <Button type="link" className="mt-5">
                Use AI Generated Template
              </Button>
            </Link>
          </div>

          <Form.Item label="Attachments">
            <div className="space-y-4">
              <Upload.Dragger
                beforeUpload={beforeUpload}
                multiple={true}
                showUploadList={false}
                className="w-full"
              >
                <div className="flex flex-col items-center justify-center space-y-4 p-8 ">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <UploadOutlined className="text-2xl text-white" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-lg font-semibold text-gray-800">
                      Drop files here or click to browse
                    </p>
                    <p className="text-sm text-gray-500 max-w-sm">
                      Support JPG, PNG, PDF, MP3, MP4 files up to 5MB each
                    </p>
                  </div>
                </div>
              </Upload.Dragger>

              {attachments.length > 0 && (
                <div className="space-y-4 mt-4">
                  {attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-4 border rounded-lg bg-gray-50"
                    >
                      <div className="w-24 h-24 flex items-center justify-center bg-white rounded border">
                        {attachment.previewUrl ? (
                          <Image
                            src={attachment.previewUrl}
                            alt={attachment.file.name}
                            className="object-cover w-full h-full rounded "
                            preview={{ mask: "Preview" }}
                          />
                        ) : (
                          <span className="text-4xl">
                            {getFileIcon(attachment.file)}
                          </span>
                        )}
                      </div>

                      <div className="flex-grow space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">
                            {attachment.file.name}
                          </span>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeAttachment(index)}
                          />
                        </div>
                        <Input.TextArea
                          placeholder="Add a caption (optional)"
                          value={attachment.caption}
                          onChange={(e) =>
                            handleCaptionChange(index, e.target.value)
                          }
                          className="w-full"
                          autoSize={{ minRows: 2, maxRows: 4 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Form.Item>

          <div className="mt-8 p-6  shadow-sm flex flex-wrap gap-5" >
           
              <div className="flex items-center gap-4">
                <Button
                  loading={loading}
                  type="primary"
                  htmlType="submit"
                  icon={<SendOutlined />}
                 className="h-10"
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
                    format="YYYY-MM-DDTHH:mm:ssZ"
                    className="h-10 min-w-[240px] text-base hover:border-blue-500 focus:border-blue-500" 
                    placeholder="Schedule Message (Optional)"
                  />
                </Form.Item>

                <Form.Item 
                  name="timer" 
                  rules={[]}
                  className="mb-0"
                >
                  <Input 
                    prefix={<ClockCircleOutlined className="text-gray-400" />}
                    placeholder="Sleep Timer (sec)" 
                    className="h-10 max-w-36 text-base hover:border-blue-500 focus:border-blue-500"
                  />
                </Form.Item>
              </div>
            </div>
          {/* </div> */}
        </Form>
      </div>
    </section>
  );
}

export default Send;
