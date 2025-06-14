"use client";
import { Button, Card, Checkbox, Divider, Form, Input } from "antd";
import type { FormProps } from "antd";
import React, { useEffect } from "react";
import Link from "next/link";
import SocialIcons from "./Social.Icons";
import { useForm } from "antd/es/form/Form";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type FieldType = {
  password?: string;
  email?: string;
  remember?: string;
};


function LoginPage() {
  const { login, user , loading } = useAuth();
  const router = useRouter();

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    try {
      await login({email:values.email||"", password:values.password || ""})
      // await login(values);
      // router.push("/");
    } catch (err) {
      console.log("login failed", err)
    }
  };
  
  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  useEffect(() => {
    console.log(user)
    if(user) {
      router.push("/");
    }
  }, [user, loading])
  

  return (
    <div className="w-full flex justify-center items-center min-h-screen p-4">
      <div className="card w-96 bg-white shadow-xl rounded-md">
        <div className="p-6">
          <p className="text-xl font-semibold text-center mb-4">
            Sign in with MSG Zone
          </p>
          <Divider />
          <Form
            layout="vertical"
            name="login"
            size="middle"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            className="flex flex-col items-center w-full"
          >
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
              label="Password"
              name="password"
              className="w-full max-w-xs"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <div className="flex w-full justify-around ">
              <Form.Item<FieldType>
                name="remember"
                valuePropName="checked"
                label={null}
                className="w-full max-w-xs text-xs"
              >
                <Checkbox>Remember me</Checkbox>
              </Form.Item>

              <Link href={""}>
                <Button type="link" className="text-xs w-24">
                  Forgot Password?
                </Button>
              </Link>
            </div>

            <Form.Item label={null} className="w-full ">
              <Button
                color="purple"
                variant="solid"
                className="w-full !h-10"
                size="large"
                htmlType="submit"
                loading={loading}
              >
                Submit
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

        <div className="flex justify-center items-center bg-gray-100 w-full py-3 gap-2">
          <p className="text-sm">Not a member?</p>
          <Link href={"/register"}>
            <p className="text-sm text-cyan-600">
              Sign up
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
