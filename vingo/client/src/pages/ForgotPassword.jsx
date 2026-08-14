import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6]">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <div className="flex items-center gap-4 mb-4">
          <IoIosArrowRoundBack
            onClick={() => navigate("/signin")}
            size={30}
            className="text-[#ff4d2d]"
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full border rounded-lg px-3 py-2 focus:border-orange-500 outline-none border-gray-200"
              placeholder="Enter your Email"
            />
            <button
              className={`w-full font-semibold mt-4 py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}>
              Send Verification Code
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
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:border-orange-500 outline-none border-gray-200"
              placeholder="Enter 6-digit code"
            />
            <button
              className="w-full font-semibold mt-4 py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer">
              Verify Code
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full border rounded-lg px-3 py-2 focus:border-orange-500 outline-none border-gray-200"
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                className="w-full border rounded-lg px-3 py-2 focus:border-orange-500 outline-none border-gray-200"
                placeholder="Confirm your new password"
              />
            </div>
            <button
              className="w-full font-semibold mt-4 py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer">
              Update Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
