import React from "react";
import { Link } from "react-router-dom";

const Start = () => {
  return (
    <div className="min-h-screen bg-[#171717]">
      <div className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#171717]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1619059558110-c45be64b73ae?q=80&w=2574&auto=format&fit=crop')",
          }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />

        {/* Logo */}
        <header className="relative z-10 p-5 sm:p-8 lg:p-10">
          <img
            className="h-auto w-20 object-contain sm:w-24"
            src="https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoid2VhcmVcL2ZpbGVcLzhGbTh4cU5SZGZUVjUxYVh3bnEyLnN2ZyJ9:weare:F1cOF9Bps96cMy7r9Y2d7affBYsDeiDoIHfqZrbcxAw?width=1200&height=417"
            alt="Uber"
          />
        </header>

        {/* Bottom Welcome Card */}

        {/* Centered Welcome Card */}
        <main className="relative z-10 flex min-h-screen w-full items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-xl">
            <div className="rounded-2xl bg-white p-6 shadow-2xl sm:p-8 md:p-10 lg:max-w-xl lg:rounded-3xl">
              <p className="mb-3 text-xs font-bold tracking-[0.2em] text-orange-500 sm:text-sm">
                YOUR JOURNEY STARTS HERE
              </p>

              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                Get Started
                <br />
                with <span className="text-orange-500">Uber.</span>
              </h1>

              <p className="mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base sm:leading-7">
                Get where you need to go with a simple, convenient ride
                experience.
              </p>

              <Link
                to="/login"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-orange-500/20 transition duration-200 hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/30 active:scale-[0.99] sm:py-4">
                Continue
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14m-7-7 7 7-7 7"
                  />
                </svg>
              </Link>

              <p className="mt-4 text-center text-xs text-gray-400 sm:text-sm">
                Fast. Simple. Ready when you are.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Start;
