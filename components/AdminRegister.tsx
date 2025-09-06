"use client";
import { Button, Card, Divider, Form, Input } from "antd";
import { useForm } from "antd/es/form/Form";
import type { FormProps } from "antd";
import React, { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type FieldType = {
  name?: string;
  password?: string;
  phone?: string;
  email?: string;
  businessName?: string;
  address?: string;
  alternateNumber?: string;
};

function AdminRegisterPage() {
  const { user, loading, registerAdmin, error } = useAuth();
  const router = useRouter();
  const [form] = useForm();

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { name, email, phone, password, businessName, address, alternateNumber } = values;
    if(!name || !email || !phone || !password) return;
    
    try {
      const res = await registerAdmin({
        name: name || "",
        email: email || "",
        phone: phone || "",
        password: password || "",
        businessName: businessName || "",
        address: address || "",
        alternateNumber: alternateNumber || "",
      });
      
      if(res != null){
        toast.success("Admin registration successful");
        router.push("/login");
      }
    } catch (error) {
      console.log("Error in admin register", error);
    }
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, loading]);

  return (
    <div className="w-full flex justify-center items-center min-h-screen p-4">
      <div className="card w-96 bg-white shadow-xl rounded-md mt-7 mb-5">
        <div className="p-6 pt-4">
          <p className="text-xl font-semibold text-center">
            Admin Registration - MSG Zone
          </p>
          <Divider />

          <Form
            layout="vertical"
            name="admin-register"
            size="middle"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            className="flex flex-col items-center w-full"
            form={form}
          >
            <Form.Item<FieldType>
              label="Full Name"
              name="name"
              className="w-full max-w-xs"
              rules={[
                { required: true, message: "Please input your full name!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item<FieldType>
              label="Business Name"
              name="businessName"
              className="w-full max-w-xs"
            >
              <Input />
            </Form.Item>

            <Form.Item<FieldType>
              label="Email"
              name="email"
              className="w-full max-w-xs"
              rules={[
                { required: true, message: "Please input your email!" },
                {
                  pattern: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  message: "Please enter a valid email address!",
                },
              ]}
            >
              <Input type="email" />
            </Form.Item>

            <Form.Item<FieldType>
              label="WhatsApp Number"
              name="phone"
              className="w-full max-w-xs"
              rules={[
                { required: true, message: "Please input your WhatsApp number!" },
              ]}
            >
              <Input type="text" maxLength={12} />
            </Form.Item>

            <Form.Item<FieldType>
              label="Alternate Number"
              name="alternateNumber"
              className="w-full max-w-xs"
            >
              <Input type="text" maxLength={12} />
            </Form.Item>

            <Form.Item<FieldType>
              label="Address"
              name="address"
              className="w-full max-w-xs"
            >
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item<FieldType>
              label="Password"
              name="password"
              className="w-full max-w-xs"
              rules={[
                { required: true, message: "Please input your password!" },
                { min: 6, message: "Minimum password length must be 6 characters" }
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item label={null} className="w-full">
              <Button
                color="purple"
                variant="solid"
                className="w-full !h-10"
                size="large"
                htmlType="submit"
                loading={loading}
              >
                Register as Admin
              </Button>
            </Form.Item>
            
            {error && (
              <div className="w-full max-w-xs bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
          </Form>
        </div>

        <div className="flex justify-center items-center bg-gray-100 w-full py-3 gap-3">
          <p className="text-sm">Already have an account?</p>
          <Link href={"/login"}>
            <p className="text-sm text-cyan-600">
              Sign in
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminRegisterPage;