import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle your login logic here
    console.log("Logging in with:", { email, password });
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Email Field */}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-2.5 text-slate-200 placeholder-slate-500 transition-colors focus:border-indigo-500/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/80"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-2.5 text-slate-200 placeholder-slate-500 transition-colors focus:border-indigo-500/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/80"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white transition-colors duration-200 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
            Sign in
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
