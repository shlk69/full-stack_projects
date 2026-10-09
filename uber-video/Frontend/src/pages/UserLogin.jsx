import  { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { UserDataContext } from "../context/UserContext";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

//   const { setUser } = useContext(UserDataContext);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/login`,
        {
          email: email.trim(),
          password,
        },
      );

      if (response.status === 200) {
        const data = response.data;

        if (!data.token || !data.user) {
          toast.error("Invalid response from server.");
          return;
        }

        localStorage.setItem("token", data.token);
        setUser(data.user);

        toast.success("Login successful! Welcome back.");

        setEmail("");
        setPassword("");

        navigate("/home");
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 401 || status === 400) {
        toast.error(message || "Invalid email or password.");
      } else if (status === 403) {
        toast.error(message || "Access denied.");
      } else if (status >= 500) {
        toast.error("Server error. Please try again later.");
      } else if (!error.response) {
        toast.error("Unable to connect. Check your internet connection.");
      } else {
        toast.error(message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            padding: "14px 16px",
            fontSize: "14px",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
        }}
      />

      <div className="mx-auto w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <img
            className="mx-auto mb-5 h-20 w-auto max-w-[180px] object-contain"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYQy-OIkA6In0fTvVwZADPmFFibjmszu2A0g&s"
            alt="App logo"
          />

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Sign in to continue your journey.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8">
          <form onSubmit={submitHandler} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-800">
                Email address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-800">
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
              {loading && (
                <svg
                  className="h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}

              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* Signup Link */}
          <p className="mt-6 text-center text-sm text-gray-600 sm:text-base">
            New here?
            <Link
              to="/signup"
              className="font-semibold text-blue-600 transition hover:text-blue-800 hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        {/* Captain Login */}
        <div className="mt-5">
          <Link
            to="/captain-login"
            className="flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-base font-semibold text-white transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2">
            Sign in as Captain
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Secure login · Access your account anytime
        </p>
      </div>
    </div>
  );
};

export default UserLogin;
