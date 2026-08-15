import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Imported toast
import api from "../api";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Email masking function helper
  const getMaskedEmail = (str) => {
    if (!str.includes("@")) return str;
    return str.replace(/^(..)(.*)(@.*)$/, "$1***$3");
  };

  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const result = await api.post(
        `/auth/send-otp`,
        { email },
        { withCredentials: true },
      );
      toast.success("Verification code sent successfully!");
      setStep(2);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to send OTP. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter the verification code.");
      return;
    }

    setLoading(true);
    try {
      const result = await api.post(
        `/auth/verify-otp`,
        { email, otp },
        { withCredentials: true },
      );
      toast.success("OTP verified successfully!");
      setStep(3);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Invalid or expired OTP.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const result = await api.post(
        `/auth/reset-otp`,
        { email, password },
        { withCredentials: true },
      );
      toast.success("Password reset successful! Redirecting to login...");

      // Delay navigation slightly so user can read the success message
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to reset password.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6]">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <div className="flex items-center gap-4 mb-4">
          <IoIosArrowRoundBack
            onClick={() => navigate("/signin")}
            size={30}
            className="text-[#ff4d2d] cursor-pointer"
          />
          <h1 className="text-2xl font-bold text-center text-gray-700">
            {step === 1 && "Forgot Password"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "Reset Password"}
          </h1>
        </div>
        <p className="text-gray-500 text-sm mb-5 leading-relaxed">
          {step === 1 &&
            "Enter the email address associated with your account. We will send a 6-digit verification code to reset your password."}
          {step === 2 &&
            "Please check your inbox and enter the verification code sent to your email."}
          {step === 3 &&
            "Create and confirm a secure new password for your account to finish the recovery process."}
        </p>

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-1">
              Email Address
            </label>
            <input
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full border rounded-lg px-3 py-2 focus:border-orange-500 outline-none border-gray-200 disabled:bg-gray-100"
              placeholder="Enter your Email"
            />
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className={`w-full font-semibold mt-4 py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed`}>
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </div>
        )}

        {/* STEP 2: Enter Verification Code */}
        {step === 2 && (
          <div className="mb-4">
            <label
              htmlFor="otp"
              className="block text-gray-700 font-medium mb-1">
              Enter the code that we have sent on {getMaskedEmail(email)}
            </label>
            <input
              required
              disabled={loading}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:border-orange-500 outline-none border-gray-200 disabled:bg-gray-100"
              placeholder="Enter 6-digit code"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full font-semibold mt-4 py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed">
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </div>
        )}

        {/* STEP 3: Update Password */}
        {step === 3 && (
          <div className="mb-4 text-left">
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-1">
                New Password
              </label>
              <input
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full border rounded-lg px-3 py-2 focus:border-orange-500 outline-none border-gray-200 disabled:bg-gray-100"
                placeholder="Enter your new password"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 font-medium mb-1">
                Confirm Password
              </label>
              <input
                required
                disabled={loading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                className="w-full border rounded-lg px-3 py-2 focus:border-orange-500 outline-none border-gray-200 disabled:bg-gray-100"
                placeholder="Confirm your new password"
              />
            </div>
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full font-semibold mt-4 py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
