import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { toast } from "react-hot-toast";
import Loader from "../component/Loader";
import { MdVisibility, MdVisibilityOff, MdErrorOutline } from "react-icons/md";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await axios.post("/users/register", {
        email,
        password,
      });

      toast.success("Account created successfully");
      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );

      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100 selection:bg-indigo-500/30 relative overflow-hidden">
      {/* Animated background elements */}
      <div
        className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animation: "float 8s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animation: "float 10s ease-in-out infinite 2s" }}
      />

      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-8 shadow-xl backdrop-blur-md relative z-10 animate-slideInUp">
        {/* Header */}
        <div className="text-center space-y-2 animate-slideInDown">
          <h2 className="text-3xl font-bold tracking-tight text-slate-100">
            Create an account
          </h2>
          <p className="text-sm text-slate-400">
            Join us and start building amazing things
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 animate-slideInDown flex items-center gap-2">
            <MdErrorOutline className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Email Field */}
            <div
              className="animate-slideInUp"
              style={{ animationDelay: "0.1s" }}>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2">
                Email address
              </label>
              <div className="relative group">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-2.5 text-slate-200 placeholder-slate-500 transition-all duration-200 focus:border-indigo-500/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 hover:border-slate-700 group-focus-within:border-indigo-500/80"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                  <svg
                    className="w-5 h-5 text-indigo-400"
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path d="M2.93 5.93a1 1 0 011.414 0L10 11.657l5.657-5.657a1 1 0 011.414 1.414L11.414 13l5.657 5.657a1 1 0 01-1.414 1.414L10 14.414l-5.657 5.657a1 1 0 01-1.414-1.414L8.586 13 2.93 7.343a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div
              className="animate-slideInUp"
              style={{ animationDelay: "0.2s" }}>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-2.5 pr-12 text-slate-200 placeholder-slate-500 transition-all duration-200 focus:border-indigo-500/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 hover:border-slate-700 group-focus-within:border-indigo-500/80"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center text-slate-500 hover:text-indigo-400 transition-colors duration-200 focus:outline-none group-focus-within:text-indigo-400"
                  aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? (
                    <MdVisibilityOff className="w-5 h-5" />
                  ) : (
                    <MdVisibility className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Password must be at least 6 characters long
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full group relative rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 py-2.5 font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-indigo-600/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none animate-slideInUp flex items-center justify-center gap-3 overflow-hidden"
            style={{ animationDelay: "0.3s" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative">
              {loading ? (
                <>
                  <Loader />
                  Creating Account...
                </>
              ) : (
                "Sign up"
              )}
            </span>
          </button>
        </form>

        {/* Redirect Question */}
        <div
          className="text-center text-sm text-slate-400 animate-slideInUp"
          style={{ animationDelay: "0.4s" }}>
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="font-semibold text-indigo-400 transition-colors hover:text-indigo-300 focus:outline-none hover:underline">
            Log in
          </button>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slideInDown {
          animation: slideInDown 0.6s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;
