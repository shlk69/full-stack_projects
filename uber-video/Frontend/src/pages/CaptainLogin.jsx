import  { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
// import { CaptainDataContext } from "../context/CapatainContext";

const Captainlogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

//   const { setCaptain } = useContext(CaptainDataContext);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/login`,
        {
          email: email.trim(),
          password,
        },
      );

      const data = response.data;

      if (response.status === 200 && data.captain && data.token) {
        localStorage.setItem("token", data.token);
        setCaptain(data.captain);

        setEmail("");
        setPassword("");

        toast.success("Captain login successful!");

        navigate("/captain-home");
      } else {
        toast.error("Invalid response from server.");
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
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
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

      <div className="mx-auto w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <img
            className="mx-auto mb-5 h-20 w-auto max-w-[180px] object-contain"
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAMAAABC4vDmAAAAaVBMVEUAAAD////u7u7T09P5+fn19fU1NTVQUFDp6em2trYwMDBDQ0MhISHGxsbd3d1KSkpkZGSUlJQ+Pj6Dg4OoqKhdXV0TExO/v7+vr69ycnKfn58rKyvj4+PNzc1ra2sNDQ2MjIwaGhp6enrdT+nLAAAEl0lEQVR4nO2a57azKhCG7SUxxBJjNyb3f5GfMmABc2Lce6tnrXl+KYz4OrQBVBQEQRAEQRAEQRAEQZAfYCVVSyJnFF16lXZXl/ZCDzYUddbUFk3OOHXpqt5eWfTK3VyUMyPK6EXRqxRFoSgUhaL+D6I8O69ISaq0tmZLC+v0outV8ro+xql2y/XePn59NY3/y6IConLMNJYeiV2NZxtVNKQnXUppKRF9fGZK+4Eo31EnpFNvndJptt6rdumtlahL56vloiJVhIQje5uI2WY2FkW45t8Uxd1ktPDXanVv7msz+dFIVJ/4m6KA0o18P7vpXNWJWVtMs3PLuvyS+cofREGCri+Jgb4S5TQFy60vkKJDgleBRp7vNeC40hqLcqLrZ0HfiiL2kP28QRp8dwMvzYb8GFyXj0QRub/+XBS5TwxAiNk1dqscVRbjatKCz70ow1aW8oUo8UP13lXQMW/T7Lxv6yDqsljTF6Jy0SI2Wau6V71TRhS0Aqs7732vvxAlNdIn1aKdWdeTRmoYyAsmSltee8tFEdkkoB7ImMscnUyhUs2YiXIW9ryvRM2MeT6rVnmsHzDqvxR1k01i1r6D/xL1WiHKeicKVns/FqWuEaXAECM/EQmiZqqvpiYBMyWXWda0KTbaRFJ6Kogq5Uehofusod8Ub47HGlHwcvchJJ9KQZQqdWmY8LSQjUj6XTTgfC8KupAjvvKliqKk+sto+sVT7nR2NjLRYL0omLfUappamJIotZ6a3CGqa/ovIIK3Yx4Dfi9K4dP9uMiCB0xjUc4k/H3CjOZ0j3mgb7rgsR3u/hWinswpo2YVck3T0MUZTclPFlBBD8lYEc/BINb6L10hqh+QSRR2bdWzg35RIgR5Zs5KLiIWkSf3kTNa88yjt49zDp96WytK6ZchZZW4iW6qA2I4rCV5FEUuXySUPBL1eIqetvn5hUfH8WpRSqLK6IKo0pRtyPCiocZHsPpeJ4rHtiPcszj3vTTRpjqNyijkL9PXN3RKNv1Qp1GKwVOgUrETY2ITeZMi7hmZ5gc8f62odv1xGWolt7rAsUXrYlir7K7y7rVJ7y0ShFIZp6jq61jPh/xbVxRZIartMaEfpIkbvM7whacO2pCL7goSLWYTPufLsOIoT29BfR7POR4tSZzIEARBEAT5SMEWkoci6TZzJlHcAfBhR/9gvoJ91mZvGQI05jZWxYt/x5mu53Xvs+WW1O/2pXYFFl71Z8MtOcEG1Bd7zVtgmXztdyQi2qyks4adoc3KfLtHtxN0XCjnz9Z3A3Z+3bebrPsA+5lb/me2BLrxYR5sXHjSXSJSfLbckpA2q03/dXEM8xOwFyaflPydKGnT8B3mduPCclHfnExvJ2q7cCEstU84xtZD1eNqf+Dq095XfS5rQ+DgTPzrYGfgT4xjBQpwen2skCqENc2xlsp04jPl04U9gQP1Zm8ZE2oI8faWMcGDYHj+HGYnHvRMzDzWajSg80uzt4wJtna86QX+TSiPNRrA9saCf6I3pD7g9AI/e1XHWsNUpqaZztGW6118d6xGjiAIgiAIgiAIgiDI9vwDnr8/NDQ/o4UAAAAASUVORK5CYII="
            alt="Captain logo"
          />

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Welcome back, Captain
          </h1>

          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Sign in to start your journey.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8">
          <form onSubmit={submitHandler} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="captain-email"
                className="mb-2 block text-sm font-semibold text-gray-800">
                Email address
              </label>

              <input
                id="captain-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="captain-password"
                className="mb-2 block text-sm font-semibold text-gray-800">
                Password
              </label>

              <input
                id="captain-password"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
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

              {loading ? "Signing in..." : "Login as Captain"}
            </button>
          </form>

          {/* Captain Signup */}
          <p className="mt-6 text-center text-sm text-gray-600 sm:text-base">
            Join a fleet?{" "}
            <Link
              to="/captain-signup"
              className="font-semibold text-blue-600 transition hover:text-blue-800 hover:underline">
              Register as a Captain
            </Link>
          </p>
        </div>

        {/* User Login */}
        <div className="mt-5">
          <Link
            to="/login"
            className="flex w-full items-center justify-center rounded-xl bg-[#d5622d] px-4 py-3 text-base font-semibold text-white transition hover:bg-[#bd5122] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2">
            Sign in as User
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Captain Portal · Secure Account Access
        </p>
      </div>
    </div>
  );
};

export default Captainlogin;
