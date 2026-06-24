import React from "react";
import { HiOutlineMicrophone, HiOutlineSparkles } from "react-icons/hi";
import { HiCodeBracketSquare, HiOutlineBolt } from "react-icons/hi2";
import { FcGoogle } from "react-icons/fc";
import logo from "../assets/newlogo.png";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const features = [
    {
      icon: <HiOutlineMicrophone />,
      title: "Voice AI",
      desc: "Natural real-time voice conversations.",
    },
    {
      icon: <HiOutlineSparkles />,
      title: "Smart Navigation",
      desc: "Navigate pages using voice commands",
    },
    {
      icon: <HiCodeBracketSquare />,
      title: "Easy Embed",
      desc: "Add assistant using one script.",
    },
    {
      icon: <HiOutlineBolt />,
      title: "Fast response",
      desc: "Optimized Gemini AI responses.",
    },
  ];

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const { displayName, email } = result.user;

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/google`,
        {
          name: displayName,
          email,
        },
        { withCredentials: true },
      );
      localStorage.setItem("token", response.data.data.token);

      setUser(response.data.data.user);
      toast.success("Logged in successfully");

      // Wait longer to ensure state propagates through component tree
      setTimeout(() => {
        navigate("/");
      }, 300);
    } catch (error) {
      toast.error("Login failed");
      console.log(error.message);
    }
  };
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-white to-emerald-50 flex items-center justify-center p-6 md:p-12 overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Div */}
          <div className="flex flex-col justify-center">
            {/* Tag */}
            <div className="self-start inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-200 bg-purple-50 text-purple-600 text-xs sm:text-sm font-medium tracking-wide shadow-xs">
              <HiOutlineSparkles className="animate-pulse" />
              AI Voice Assistant Platform
            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-[#081028] tracking-tight">
              Build AI Assistants
              <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-emerald-500">
                & Use in your website
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#475569] leading-relaxed max-w-xl">
              Give your website a voice in 60 seconds to guide visitors and
              close sales.
            </p>

            <button
              onClick={handleLogin}
              className="mt-8 h-14 sm:h-16 px-8 self-start rounded-2xl bg-gradient-to-r from-purple-500 to-emerald-500 text-white text-base sm:text-lg font-semibold flex items-center gap-4 shadow-[0_20px_50px_rgba(139,92,246,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer">
              <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full p-1.5 shrink-0">
                <FcGoogle className="w-full h-full" />
              </div>
              <span>Continue with Google</span>
            </button>

            {/* Subtext */}
            <p className="mt-4 text-xs sm:text-sm text-[#64748b] pl-1 font-medium">
              Unlock 200 free AI responses on signup.
            </p>
          </div>

          {/* Right Div */}
          <div className="relative ">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200/50 to-emerald-200/40 blur-[120px]" />
            <div className="relative rounded-[40px] border border-black/5 bg-white shadow-[0_20px_80px_rgba(0,0,0,0.06)] p-8 overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="mt-2 text-3xl font-bold text-[#081028]">
                    Features
                  </h2>
                </div>
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-purple-500 to-emerald-500 flex items-center justify-center shadow-[0_10px_40px_rgba(139,92,246,0.25)] p-3">
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="mt-10 space-y-5">
                {features.map(({ icon, title, desc }, index) => (
                  <div
                    key={index}
                    className="flex gap-5 items-center rounded-3xl border border-black/5 bg-[#f8fafc] p-5">
                    <div className="min-w-[60px] h-[60px] rounded-2xl bg-gradient-to-r from-purple-500 to-emerald-500 text-white text-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(139,92,246,0.20)]">
                      {icon}
                    </div>

                    {/* Added these fields so your title and description show up as well */}
                    <div className="flex flex-col">
                      <h4 className="font-bold text-[#081028] text-base">
                        {title}
                      </h4>
                      <p className="text-sm text-[#64748b] mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
