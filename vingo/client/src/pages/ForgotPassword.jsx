import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email,setEmail] = useState('')
    const navigate = useNavigate();
    const [loading,setLoading] = useState(false)
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
            Forgot Password
          </h1>
        </div>
        <p className="text-gray-500 text-sm mb-5 leading-relaxed">
          Enter the email address associated with your account. We will send a
          6-digit verification code to reset your password.
        </p>

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
      </div>
    </div>
  );
};

export default ForgotPassword;
