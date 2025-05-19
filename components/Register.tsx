"use client";
import { Button, Card, Checkbox, Divider, Form, Input } from "antd";
import { useForm } from "antd/es/form/Form";
import type { FormProps } from "antd";
import React, { useEffect } from "react";
import Link from "next/link";
import SocialIcons from "./Social.Icons";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type FieldType = {
  name?: string;
  password?: string;
  phone?: string;
  email?: string;
  remember?: string;
};

function RegisterPage() {
  const { user, loading, register } = useAuth();
  const router = useRouter()
  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { name, email, phone, password } = values;
    if(!name || !email || !phone || !password) return
    try {
      await register({
        name: name || "",
        email: email || "",
        phone: phone || "",
        password: password || "",
      });
      router.push("/login")
    } catch (error) {
      console.log("Error in register", error);
    }
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, loading])
  

  return (
    <div className="w-full flex justify-center items-center min-h-screen ">
      <div className="card w-96 bg-white shadow-xl rounded-md mt-7 mb-5">
        <div className="p-6 pt-4">
          <p className="text-xl font-semibold text-center ">
            Sign up with MSG Zone
          </p>
          <Divider />

          <Form
            layout="vertical"
            name="register"
            size="middle"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            className="flex flex-col items-center w-full"
          >
            <Form.Item<FieldType>
              label="Name"
              name="name"
              className="w-full max-w-xs"
              rules={[
                { required: true, message: "Please input your full name!" },
              ]}
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
                  type: "email",
                  message: "Please enter a valid email address!",
                },
              ]}
            >
              <Input type="email" />
            </Form.Item>

            <Form.Item<FieldType>
              label="Phone Number"
              name="phone"
              className="w-full max-w-xs"
              rules={[
                { required: true, message: "Please input your phone number!" },
              ]}
            >
              <Input type="text" maxLength={12} />
            </Form.Item>

            <Form.Item<FieldType>
              label="Password"
              name="password"
              className="w-full max-w-xs"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item label={null} className="w-full ">
              <Button
                color="purple"
                variant="solid"
                className="w-full !h-10"
                size="large"
                htmlType="submit"
              >
                Register
              </Button>
            </Form.Item>

            <div className="flex items-center w-full px-2">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-4 text-gray-700 font-medium">Or</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
          </Form>

          <SocialIcons />
        </div>

        <div className="flex justify-center items-center bg-gray-100 w-full py-3">
          <p className="text-sm">Already a member?</p>
          <Link href={"/login"}>
            <Button type="link" className="text-sm ">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
