import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { auth } from "../../firebase";
import api from "../api";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/user.slice";

function SignUp() {
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const dispatch = useDispatch()

  const handleGoogleAuth = async () => {
    try {
      if (!mobile) {
        return setErrorMsg(
          "You have to provide mobile number with google auth",
        );
      }
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { data } = await api.post(
        `/auth/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
          role,
          mobile,
        },
        { withCredentials: true },
      );
      dispatch(setUserData(data));
      setErrorMsg('')
    } catch (error) {
      console.log(error.message);
      setErrorMsg('Internal server error');
    }
  };

  const navigate = useNavigate();

  const signupHandler = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (
      !fullName.trim() ||
      !email.trim() ||
      !mobile.trim() ||
      !password.trim()
    ) {
      setErrorMsg("All fields are required!");
      return;
    }

    try {
      setLoading(true);
      const {data} = await api.post(
        "/auth/signup",
        { fullName, email, password, role, mobile },
        { withCredentials: true },
      );
      dispatch(setUserData(data));

      if (result.status === 201 || result.status === 200) {
        navigate("/signin");
      }
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message ||
        error.message ||
        "Something went wrong!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ backgroundColor: bgColor }}>
      {/* Wrapped in a standard form element to leverage standard HTML validation */}
      <form
        onSubmit={signupHandler}
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[1px]"
        style={{ border: `1px solid ${borderColor}` }}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: primaryColor }}>
          {" "}
          Vingo{" "}
        </h1>
        <p className="text-gray-600 mb-6">
          Create your account to get started with delicious food deliveries
        </p>

        {/* Error Alert Display */}
        {errorMsg && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg font-medium animate-pulse">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* fullName */}
        <div className="mb-4">
          <label
            htmlFor="fullName"
            className="block text-gray-700 font-medium mb-1">
            {" "}
            Full Name{" "}
          </label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:border-orange-500 outline-none"
            placeholder="Enter your Full name"
            style={{ border: `1px solid ${borderColor}` }}
          />
        </div>

        {/* email */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-1">
            {" "}
            Email{" "}
          </label>
          <input
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:border-orange-500 outline-none"
            placeholder="Enter your Email"
            style={{ border: `1px solid ${borderColor}` }}
          />
        </div>

        {/* mobileNumber */}
        <div className="mb-4">
          <label
            htmlFor="mobileNumber"
            className="block text-gray-700 font-medium mb-1">
            {" "}
            Mobile Number{" "}
          </label>
          <input
            required
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            type="tel"
            className="w-full border rounded-lg px-3 py-2 focus:border-orange-500 outline-none"
            placeholder="Enter your Mobile Number"
            style={{ border: `1px solid ${borderColor}` }}
          />
        </div>

        {/* password */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 font-medium mb-1">
            {" "}
            Password{" "}
          </label>
          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none pr-10"
              placeholder="Enter your password"
              style={{ border: `1px solid ${borderColor}` }}
            />
            <button
              type="button" // Prevents unintentional form submission
              className="absolute right-3 cursor-pointer top-[14px] text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}>
              {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </div>

        {/* role */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            {" "}
            Select Role :){" "}
          </label>
          <div className="flex gap-2">
            {["user", "owner", "deliveryBoy"].map((r) => (
              <button
                key={r}
                type="button" // Prevents unintentional form submission
                className="flex-1 border cursor-pointer rounded-lg px-3 py-2 text-center font-medium transition-colors capitalized text-sm"
                onClick={() => setRole(r)}
                style={
                  role === r
                    ? {
                      backgroundColor: primaryColor,
                      color: "white",
                      border: `1px solid ${primaryColor}`,
                    }
                    : { border: `1px solid ${borderColor}`, color: "#555" }
                }>
                {r === "deliveryBoy" ? "Delivery Boy" : r}
              </button>
            ))}
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
              <span>Signing Up...</span>
            </>
          ) : (
            "Sign Up"
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
          <span>Sign up with Google</span>
        </button>

        <p
          className="text-center mt-6 cursor-pointer text-sm"
          onClick={() => navigate("/signin")}>
          Already have an account?{" "}
          <span className="font-semibold" style={{ color: primaryColor }}>
            Sign In
          </span>
        </p>
      </form>
    </div>
  );
}

export default SignUp;
