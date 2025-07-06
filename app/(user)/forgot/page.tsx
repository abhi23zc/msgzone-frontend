"use client";

import { useState, useEffect } from "react";
import { Button, Input, message } from "antd";
import { InputOTP } from "antd-input-otp";
import {
  MailOutlined,
  LockOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Step = "email" | "otp" | "password";

const ForgotPage = () => {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otpValue, setOtpValue] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<{ 
    email?: string; 
    otp?: string; 
    password?: string;
    confirmPassword?: string;
  }>({});
  const router = useRouter();

  const { forgotPassword, verifyResetOtp, resetPassword } = useAuth();

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (currentStep === "email") {
      if (!email.trim()) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(email)) {
        newErrors.email = "Please enter a valid email address";
      }
    } else if (currentStep === "otp") {
      if (otpValue.join("").length !== 6) {
        newErrors.otp = "Please enter the complete 6-digit verification code";
      }
    } else if (currentStep === "password") {
      if (!validatePassword(newPassword)) {
        newErrors.password = "Password must be at least 6 characters long";
      }
      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await forgotPassword(email);
      if (res?.success) {
        setCurrentStep("otp");
        setCountdown(60); // 60 seconds countdown
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await verifyResetOtp(email, otpValue.join(""));
      if (res?.success && res?.data?.resetToken) {
        setResetToken(res.data.resetToken);
        setCurrentStep("password");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await resetPassword(resetToken, newPassword);
      if (res?.success) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
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
      const res = await forgotPassword(email);
      if (res?.success) {
        setCountdown(60);
        toast.success("OTP resent successfully!");
      }
    } catch (error) {
      message.error("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const renderEmailStep = () => (
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

      <Button
        onClick={handleSendOtp}
        type="primary"
        size="large"
        loading={isLoading}
        className="w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        icon={!isLoading && <MailOutlined />}
      >
        {isLoading ? "Sending..." : "Send Reset Code"}
      </Button>

      <div className="text-center">
        <Link href="/login" className="text-blue-600 hover:text-blue-700 text-sm">
          <ArrowLeftOutlined className="mr-1" />
          Back to Login
        </Link>
      </div>
    </div>
  );

  const renderOtpStep = () => (
    <div className="space-y-6">
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
              if (errors.otp) {
                setErrors((prev) => ({ ...prev, otp: undefined }));
              }
            }}
            value={otpValue}
            inputClassName="w-12 h-12 text-xl font-semibold rounded-lg text-center transition-all duration-200"
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
          <p className="mt-2 text-sm text-red-600 text-center">{errors.otp}</p>
        )}
      </div>

      <Button
        onClick={handleVerifyOtp}
        type="primary"
        size="large"
        loading={isLoading}
        className="w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        icon={!isLoading && <CheckCircleOutlined />}
      >
        {isLoading ? "Verifying..." : "Verify Code"}
      </Button>

      <div className="text-center">
        <Button
          type="link"
          onClick={() => setCurrentStep("email")}
          className="text-blue-600 hover:text-blue-700"
        >
          <ArrowLeftOutlined className="mr-1" />
          Back to Email
        </Button>
      </div>
    </div>
  );

  const renderPasswordStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          New Password
        </label>
        <Input.Password
          size="large"
          placeholder="Enter your new password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            if (errors.password) {
              setErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
          className={`rounded-lg transition-all duration-200 ${
            errors.password
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          }`}
          prefix={<LockOutlined className="text-gray-400" />}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm New Password
        </label>
        <Input.Password
          size="large"
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) {
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }
          }}
          className={`rounded-lg transition-all duration-200 ${
            errors.confirmPassword
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          }`}
          prefix={<LockOutlined className="text-gray-400" />}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      <Button
        onClick={handleResetPassword}
        type="primary"
        size="large"
        loading={isLoading}
        className="w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        icon={!isLoading && <CheckCircleOutlined />}
      >
        {isLoading ? "Resetting..." : "Reset Password"}
      </Button>

      <div className="text-center">
        <Button
          type="link"
          onClick={() => setCurrentStep("otp")}
          className="text-blue-600 hover:text-blue-700"
        >
          <ArrowLeftOutlined className="mr-1" />
          Back to Verification
        </Button>
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case "email":
        return "Forgot Password";
      case "otp":
        return "Verify Your Email";
      case "password":
        return "Reset Your Password";
      default:
        return "Forgot Password";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case "email":
        return "Enter your email address and we'll send you a verification code to reset your password";
      case "otp":
        return "Enter the 6-digit verification code we sent to your email address";
      case "password":
        return "Enter your new password to complete the reset process";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center mb-5">
            <LockOutlined className="text-blue-600 bg-blue-100 p-5 rounded-full" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {getStepTitle()}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            {getStepDescription()}
          </p>
        </div>

        {/* Step Content */}
        {currentStep === "email" && renderEmailStep()}
        {currentStep === "otp" && renderOtpStep()}
        {currentStep === "password" && renderPasswordStep()}

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Need help?{" "}
            <Link href="/contact" className="text-blue-600 hover:text-blue-700 underline">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPage;
