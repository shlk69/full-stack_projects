import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
// import { UserDataContext } from "../context/UserContext";

const UserSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

//   const { setUser } = useContext(UserDataContext);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (loading) return;

    const newUser = {
      fullname: {
        firstname: firstName.trim(),
        lastname: lastName.trim(),
      },
      email: email.trim(),
      password,
    };

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/register`,
        newUser,
      );

      if (response.status === 201) {
        const data = response.data;

        if (!data.user || !data.token) {
          toast.error("Invalid response from server.");
          return;
        }

        localStorage.setItem("token", data.token);
        setUser(data.user);

        toast.success("Account created successfully!");
        navigate("/home");
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 409) {
        toast.error(message || "An account with this email already exists.");
      } else if (status === 400 || status === 422) {
        toast.error(message || "Please check your entered details.");
      } else if (status === 401 || status === 403) {
        toast.error(message || "Registration is not authorized.");
      } else if (status >= 500) {
        toast.error("Server error. Please try again later.");
      } else if (!error.response) {
        toast.error("Unable to connect. Check your internet connection.");
      } else {
        toast.error(message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            padding: "14px 16px",
            fontSize: "14px",
          },
        }}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center p-3 sm:p-6 lg:p-8">
        <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">
          {/* Left Welcome Panel: hidden below desktop */}
          <section className="relative hidden overflow-hidden bg-[#171717] p-10 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
            <div className="pointer-events-none absolute -right-16 -top-12 h-56 w-56 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-orange-400/10 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-orange-400" />
                <span className="text-xs font-semibold tracking-widest text-gray-200">
                  WELCOME ABOARD
                </span>
              </div>

              <h1 className="text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
                Your journey
                <br />
                starts <span className="text-orange-400">here.</span>
              </h1>

              <p className="mt-5 max-w-sm text-base leading-7 text-gray-300">
                Create your account and get started with a simple, seamless
                experience.
              </p>

              <div className="mt-10 space-y-5">
                {[
                  "Create your personal account",
                  "Access your dashboard",
                  "Get started in minutes",
                ].map((item, index) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sm font-semibold text-orange-400">
                      0{index + 1}
                    </span>
                    <span className="text-sm text-gray-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-10 border-t border-white/10 pt-5">
              <p className="text-xs leading-6 text-gray-400">
                A better experience begins with your first step.
              </p>
            </div>
          </section>

          {/* Signup Form: visible on every screen size */}
          <section className="flex min-w-0 flex-col justify-center p-5 sm:p-8 md:p-10 lg:p-12">
            <div className="mx-auto w-full max-w-md">
              {/* Logo and Heading */}
              <div className="mb-8 text-center">
                <img
                  className="mx-auto mb-5 h-16 w-auto max-w-[160px] object-contain sm:h-20"
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYQy-OIkA6In0fTvVwZADPmFFibjmszu2A0g&s"
                  alt="App logo"
                />

                <p className="mb-2 text-xs font-bold tracking-[0.2em] text-orange-500">
                  GET STARTED
                </p>

                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                  Create your account
                </h2>

                <p className="mt-2 text-sm text-gray-500 sm:text-base">
                  Join us and get started today.
                </p>
              </div>

              <form onSubmit={submitHandler} className="space-y-5">
                {/* Name Fields */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Full name
                  </label>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input
                      type="text"
                      name="firstName"
                      autoComplete="given-name"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={loading}
                      required
                      maxLength={50}
                      className="w-full min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60"
                    />

                    <input
                      type="text"
                      name="lastName"
                      autoComplete="family-name"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={loading}
                      required
                      maxLength={50}
                      className="w-full min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="signup-email"
                    className="mb-2 block text-sm font-semibold text-gray-800">
                    Email address
                  </label>

                  <input
                    id="signup-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="signup-password"
                    className="mb-2 block text-sm font-semibold text-gray-800">
                    Password
                  </label>

                  <input
                    id="signup-password"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    minLength={8}
                    className="w-full min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    Use at least 8 characters.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/25 disabled:cursor-not-allowed disabled:opacity-60">
                  {loading && (
                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
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

                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>

              {/* Login Link */}
              <p className="mt-6 text-center text-sm text-gray-600 sm:text-base">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-orange-600 transition hover:text-orange-700 hover:underline">
                  Login here
                </Link>
              </p>

              <p className="mx-auto mt-7 max-w-sm text-center text-xs leading-relaxed text-gray-400">
                By creating an account, you agree to our terms of service and
                privacy policy.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;
