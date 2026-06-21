import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { toast } from "react-hot-toast";
import Loader from "../component/Loader";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { UserContext } from "../context/user.context";



const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const navigate = useNavigate();
  const {setUser} = useContext(UserContext)

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await axios.post("/users/login", {
        email,
        password,
      });


      localStorage.setItem('token', resizeBy.data.token)
      setUser(res.data.user)
      toast.success("Logged in successfully");
      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );

      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100 selection:bg-indigo-500/30">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-8 shadow-xl backdrop-blur-md">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-200">
            Welcome back
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Please enter your details to sign in
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300">
                Email address
              </label>

              <input
                id="email"
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-2.5 text-slate-200 placeholder-slate-500 transition-colors focus:border-indigo-500/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/80 disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300">
                Password
              </label>

              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-2.5 pr-12 text-slate-200 placeholder-slate-500 transition-colors focus:border-indigo-500/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/80 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-indigo-400">
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-indigo-600 py-2.5 font-medium text-white transition-colors duration-200 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? (
              <>
                <Loader />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Redirect Question */}
        <div className="text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="font-medium text-indigo-400 transition-colors hover:text-indigo-300 focus:outline-none">
            Create one
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
