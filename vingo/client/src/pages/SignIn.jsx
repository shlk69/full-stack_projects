import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import api from "../api";
import { auth } from "../../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/user.slice";


function SignIn() {
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch()



  const signinHandler = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // 1. Validation check for empty fields
    if (!email.trim() || !password.trim()) {
      setErrorMsg("All fields are required!");
      return;
    }

    try {
      setLoading(true);
      const {data} = await api.post(
        "/auth/signin", 
        { email, password },
        { withCredentials: true },
      );
             dispatch(setUserData(data));

      if (result.status === 200 || result.status === 201) {
        navigate("/dashboard"); 
      }
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message ||
        error.message ||
        "Invalid email or password!",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider); 
      dispatch(setUserData(result.data));

    } catch (error) {
      console.log(error.message);
      setErrorMsg(error.message);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ backgroundColor: bgColor }}>
      <form
        onSubmit={signinHandler}
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[1px]"
        style={{ border: `1px solid ${borderColor}` }}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: primaryColor }}>
          Vingo
        </h1>
        <p className="text-gray-600 mb-6">
          Welcome back! Sign in to order delicious food deliveries
        </p>

        {/* Error Alert Display */}
        {errorMsg && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg font-medium animate-pulse">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* email */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-1">
            Email
          </label>
          <input
            required
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:border-orange-500 outline-none"
            placeholder="Enter your Email"
            style={{ border: `1px solid ${borderColor}` }}
          />
        </div>

        {/* password */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium">
              Password
            </label>
            <span
              className="text-xs font-medium cursor-pointer hover:underline text-gray-500"
              onClick={() => navigate("/forgot-password")}>
              Forgot Password?
            </span>
          </div>
          <div className="relative">
            <input
              required
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none pr-10"
              placeholder="Enter your password"
              style={{ border: `1px solid ${borderColor}` }}
            />
            <button
              type="button"
              className="absolute right-3 cursor-pointer top-[14px] text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}>
              {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full font-semibold py-2 rounded-lg transition duration-200 text-white cursor-pointer flex items-center justify-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          style={{ backgroundColor: primaryColor }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = hoverColor)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = primaryColor)
          }>
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Signing In...</span>
            </>
          ) : (
            "Sign In"
          )}
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm font-medium">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleAuth}
          className="cursor-pointer w-full flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 border-gray-400 hover:bg-gray-100">
          <FcGoogle size={20} />
          <span>Sign in with Google</span>
        </button>

        <p
          className="text-center mt-6 cursor-pointer text-sm"
          onClick={() => navigate("/signup")}>
          Don't have an account?{" "}
          <span className="font-semibold" style={{ color: primaryColor }}>
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
}

export default SignIn;
