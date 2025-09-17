"use client";

import { useState, useEffect } from "react";
import { Button, Input, message } from "antd";
import { InputOTP } from "antd-input-otp";
import {
  MailOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const LoginVerifyPage = () => {
  const searchParams = useSearchParams();

  const [otpValue, setOtpValue] = useState<string[]>([]);
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<{ email?: string; otp?: string }>({});
  const router = useRouter();

  const { verifyLoginOtp } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: { email?: string; otp?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Check if OTP is exactly 6 digits
    if (otpValue.join("").length !== 6) {
      newErrors.otp = "Please enter the complete 6-digit verification code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerify = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const res = (await verifyLoginOtp(email, otpValue.join(""))) as any;

      if (res?.success) {
        toast.success("Login successful!");
      } else throw new Error();
    } catch (e) {
      toast.error("OTP validation Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email.trim() || !validateEmail(email)) {
      message.error("Please enter a valid email address first");
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password: "dummy" }),
      });
      
      if (response.ok) {
        toast.success("New OTP sent to your email!");
      } else {
        toast.error("Failed to resend OTP. Please try logging in again.");
        router.push("/login");
      }
    } catch (error) {
      message.error("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    setCountdown(60);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="flex justify-center items-center mb-5">
            <MailOutlined className="text-blue-600 bg-blue-100 p-5 rounded-full" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Login
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Enter the 6-digit verification code we sent to your email to complete the login process
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              size="large"
              placeholder="Enter your email address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              className={`rounded-lg transition-all duration-200 ${
                errors.email
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
              prefix={<MailOutlined className="text-gray-400" />}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <Button
                type="link"
                size="small"
                disabled={isResending || countdown > 0}
                onClick={handleResendCode}
                loading={isResending}
                className="p-0 h-auto text-blue-600 hover:text-blue-700"
                icon={<ReloadOutlined />}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
              </Button>
            </div>

            <div className="flex justify-center">
              <InputOTP
                onChange={(value) => {
                  setOtpValue(value);
                }}
                value={otpValue}
                inputClassName={`w-12 h-12 text-xl font-semibold rounded-lg text-center transition-all duration-200`}
                length={6}
                inputType="numeric"
                inputMode="numeric"
                pattern="[0-9]*"
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </div>

            {errors.otp && (
              <p className="mt-2 text-sm text-red-600 text-center">
                {errors.otp}
              </p>
            )}
          </div>

          <Button
            onClick={handleVerify}
            type="primary"
            size="large"
            loading={isLoading}
            className="w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            icon={!isLoading && <CheckCircleOutlined />}
          >
            {isLoading ? "Verifying..." : "Verify & Login"}
          </Button>

          <div className="text-center">
            <Link href="/login">
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                className="text-gray-600 hover:text-gray-800"
              >
                Back to Login
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Didn't receive the code? Check your spam folder or{" "}
              <button
                onClick={handleResendCode}
                disabled={isResending || countdown > 0}
                className="text-blue-600 hover:text-blue-700 underline disabled:text-gray-400 disabled:no-underline"
              >
                request a new one
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginVerifyPage;
