import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { CaptainDataContext } from "../context/CaptainContext";

const CaptainSignup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { captain, setCaptain } = useContext(CaptainDataContext)
  

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const [vehicleColor, setVehicleColor] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (loading) return;

    const captainData = {
      fullname: {
        firstname: firstName.trim(),
        lastname: lastName.trim(),
      },
      email: email.trim(),
      password,
      vehicle: {
        color: vehicleColor.trim(),
        plate: vehiclePlate.trim(),
        capacity: Number(vehicleCapacity),
        vehicleType,
      },
    };

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/register`,
        captainData,
      );

      if (response.status === 201) {
        const data = response.data;

        if (!data.captain || !data.token) {
          toast.error("Invalid response from server.");
          return;
        }

        localStorage.setItem("token", data.token);

        // Keep registration and login context in sync
        window.dispatchEvent(new Event("captainRegistered"));

        toast.success("Captain account created successfully!");

        navigate("/captain-home");
      } else {
        toast.error("Unable to create your account.");
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 409) {
        toast.error(message || "An account with this email already exists.");
      } else if (status === 400 || status === 422) {
        toast.error(message || "Please check your registration details.");
      } else if (status === 401 || status === 403) {
        toast.error(message || "Registration is not authorized.");
      } else if (status >= 500) {
        toast.error("Server error. Please try again later.");
      } else if (!error.response) {
        toast.error("Cannot connect to the server. Check your connection.");
      } else {
        toast.error(message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:opacity-60";

  const labelClass = "mb-2 block text-sm font-semibold text-gray-700";

  return (
    <div className="min-h-screen bg-[#f7f7f7] px-4 py-8 sm:px-6 lg:py-12">
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

      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <Link to="/captain-login" aria-label="Go to captain login">
            <img
              className="mx-auto mb-5 h-20 w-auto max-w-[180px] object-contain"
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAMAAABC4vDmAAAAaVBMVEUAAAD////u7u7T09P5+fn19fU1NTVQUFDp6em2trYwMDBDQ0MhISHGxsbd3d1KSkpkZGSUlJQ+Pj6Dg4OoqKhdXV0TExO/v7+vr69ycnKfn58rKyvj4+PNzc1ra2sNDQ2MjIwaGhp6enrdT+nLAAAEl0lEQVR4nO2a57azKhCG7SUxxBJjNyb3f5GfMmABc2Lce6tnrXl+KYz4OrQBVBQEQRAEQRAEQRAEQZAfYCVVSyJnFF16lXZXl/ZCDzYUddbUFk3OOHXpqt5eWfTK3VyUMyPK6EXRqxRFoSgUhaL+D6I8O69ISaq0tmZLC+v0outV8ro+xql2y/XePn59NY3/y6IConLMNJYeiV2NZxtVNKQnXUppKRF9fGZK+4Eo31EnpFNvndJptt6rdumtlahL56vloiJVhIQje5uI2WY2FkW45t8Uxd1ktPDXanVv7msz+dFIVJ/4m6KA0o18P7vpXNWJWVtMs3PLuvyS+cofREGCri+Jgb4S5TQFy60vkKJDgleBRp7vNeC40hqLcqLrZ0HfiiL2kP28QRp8dwMvzYb8GFyXj0QRub/+XBS5TwxAiNk1dqscVRbjatKCz70ow1aW8oUo8UP13lXQMW/T7Lxv6yDqsljTF6Jy0SI2Wau6V71TRhS0Aqs7732vvxAlNdIn1aKdWdeTRmoYyAsmSltee8tFEdkkoB7ImMscnUyhUs2YiXIW9ryvRM2MeT6rVnmsHzDqvxR1k01i1r6D/xL1WiHKeicKVns/FqWuEaXAECM/EQmiZqqvpiYBMyWXWda0KTbaRFJ6Kogq5Uehofusod8Ub47HGlHwcvchJJ9KQZQqdWmY8LSQjUj6XTTgfC8KupAjvvKliqKk+sto+sVT7nR2NjLRYL0omLfUappamJIotZ6a3CGqa/ovIIK3Yx4Dfi9K4dP9uMiCB0xjUc4k/H3CjOZ0j3mgb7rgsR3u/hWinswpo2YVck3T0MUZTclPFlBBD8lYEc/BINb6L10hqh+QSRR2bdWzg35RIgR5Zs5KLiIWkSf3kTNa88yjt49zDp96WytK6ZchZZW4iW6qA2I4rCV5FEUuXySUPBL1eIqetvn5hUfH8WpRSqLK6IKo0pRtyPCiocZHsPpeJ4rHtiPcszj3vTTRpjqNyijkL9PXN3RKNv1Qp1GKwVOgUrETY2ITeZMi7hmZ5gc8f62odv1xGWolt7rAsUXrYlir7K7y7rVJ7y0ShFIZp6jq61jPh/xbVxRZIartMaEfpIkbvM7whacO2pCL7goSLWYTPufLsOIoT29BfR7POR4tSZzIEARBEAT5SMEWkoci6TZzJlHcAfBhR/9gvoJ91mZvGQI05jZWxYt/x5mu53Xvs+WW1O/2pXYFFl71Z8MtOcEG1Bd7zVtgmXztdyQi2qyks4adoc3KfLtHtxN0XCjnz9Z3A3Z+3bebrPsA+5lb/me2BLrxYR5sXHjSXSJSfLbckpA2q03/dXEM8xOwFyaflPydKGnT8B3mduPCclHfnExvJ2q7cCEstU84xtZD1eNqf+Dq095XfS5rQ+DgTPzrYGfgT4xjBQpwen2skCqENc2xlsp04jPl04U9gQP1Zm8ZE2oI8faWMcGDYHj+HGYnHvRMzDzWajSg80uzt4wJtna86QX+TSiPNRrA9saCf6I3pD7g9AI/e1XHWsNUpqaZztGW6118d6xGjiAIgiAIgiAIgiDI9vwDnr8/NDQ/o4UAAAAASUVORK5CYII="
              alt="Captain logo"
            />
          </Link>

          <Link
            to="/login"
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400">
            User login
          </Link>
        </header>

        <div className="grid overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Welcome Panel */}
          <section className="relative hidden overflow-hidden bg-[#171717] p-7 text-white sm:p-10 lg:flex lg:flex-col lg:justify-between lg:p-12">
            <div className="pointer-events-none absolute -right-16 -top-12 h-56 w-56 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-orange-400/10 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-orange-400" />
                <span className="text-xs font-semibold tracking-widest text-gray-200">
                  CAPTAIN PARTNER
                </span>
              </div>

              <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Drive your
                <br />
                future.
                <br />
                <span className="text-orange-400">Your journey</span>
                <br />
                starts here.
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-7 text-gray-300 sm:text-base">
                Create your captain account, register your vehicle, and get
                ready to hit the road.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-orange-400">
                    01
                  </span>
                  <span className="text-sm text-gray-200">
                    Enter your personal details
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-orange-400">
                    02
                  </span>
                  <span className="text-sm text-gray-200">
                    Add your vehicle information
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-orange-400">
                    03
                  </span>
                  <span className="text-sm text-gray-200">
                    Create your captain account
                  </span>
                </div>
              </div>

              <div className="mt-10 border-t border-white/10 pt-5">
                <p className="text-xs leading-6 text-gray-400">
                  Your next journey begins with one simple step.
                </p>
              </div>
            </div>
          </section>

          {/* Registration Form */}
          <section className="p-5 sm:p-8 lg:p-10">
            <div className="mb-7">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                Get started
              </p>

              <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Create your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Fill in your details to register as a captain.
              </p>
            </div>

            <form onSubmit={submitHandler} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="mb-4 text-sm font-bold text-gray-900">
                  Personal information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className={labelClass}>
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      placeholder="Enter first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={inputClass}
                      maxLength={50}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className={labelClass}>
                      Last name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      placeholder="Enter last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={inputClass}
                      maxLength={50}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="email" className={labelClass}>
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mt-4">
                  <label htmlFor="password" className={labelClass}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                    />

                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-orange-500">
                      {showPassword ? (
                        // Eye-off icon
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round">
                          <path d="M3 3l18 18" />
                          <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                          <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.5 9 7-.2 1.2-1.1 2.8-2.5 4" />
                          <path d="M6.6 6.6C4.1 8 2.4 10.4 2 12c.3 1.6 3.8 7 10 7 1.2 0 2.3-.2 3.3-.6" />
                        </svg>
                      ) : (
                        // Eye icon
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round">
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Use at least 6 characters.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Vehicle Information */}
              <div>
                <h3 className="mb-4 text-sm font-bold text-gray-900">
                  Vehicle information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="vehicleColor" className={labelClass}>
                      Vehicle color
                    </label>
                    <input
                      id="vehicleColor"
                      type="text"
                      placeholder="e.g. White"
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      className={inputClass}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="vehiclePlate" className={labelClass}>
                      Registration plate
                    </label>
                    <input
                      id="vehiclePlate"
                      type="text"
                      placeholder="e.g. MP09AB1234"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      className={inputClass}
                      maxLength={20}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="vehicleCapacity" className={labelClass}>
                      Passenger capacity
                    </label>
                    <input
                      id="vehicleCapacity"
                      type="number"
                      min="1"
                      max="50"
                      step="1"
                      placeholder="e.g. 4"
                      value={vehicleCapacity}
                      onChange={(e) => setVehicleCapacity(e.target.value)}
                      className={inputClass}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="vehicleType" className={labelClass}>
                      Vehicle type
                    </label>
                    <select
                      id="vehicleType"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className={inputClass}
                      required
                      disabled={loading}>
                      <option value="" disabled>
                        Select vehicle
                      </option>
                      <option value="car">Car</option>
                      <option value="auto">Auto</option>
                      <option value="moto">Motorcycle</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60">
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

                {loading ? "Creating account..." : "Create Captain Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to="/captain-login"
                className="font-semibold text-orange-600 transition hover:text-orange-700 hover:underline">
                Login here
              </Link>
            </p>
          </section>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-gray-400">
          By registering, you agree to your platform's applicable terms and
          privacy policy.
        </p>
      </div>
    </div>
  );
};

export default CaptainSignup;
