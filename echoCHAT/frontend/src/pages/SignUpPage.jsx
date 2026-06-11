import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { axiosInstance } from "../lib/axios";

const SignUpPage = () => {
  const navigate = useNavigate()
  const [signupData, setSignupData] = useState({
    fullname: "",
    email: "",
    password: "",
  });
 
  const queryClient = useQueryClient()
  const { isPending, mutate, error } = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post('/auth/signup', signupData)
      return response.data
    },
    onSuccess:() => queryClient.invalidateQueries({queryKey:['authUser']})
 })
   
  const handleSignup = (e) => {
    e.preventDefault();
    mutate()
  };

  return (
    <div
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="forest">
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* SIGNUP FORM - LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* LOGO & BRAND HEADER */}
          <div className="flex items-center gap-3 mb-8">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <img
                src="/hero.png"
                alt="logo"
                className="size-20 object-contain"
              />
            </div>
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider inline-block">
              echoCHAT
            </span>
          </div>

          <div className="w-full">
            <form onSubmit={handleSignup}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Create an Account</h2>
                  <p className="text-sm opacity-70">
                    Join echoCHAT and start your language learning adventure!
                  </p>
                </div>

                {/* Input fields */}
                <div className="space-y-3">
                  {/* Fullname */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Full Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="input input-bordered w-full"
                      value={signupData.fullname}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          fullname: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  {/* email */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="john@gmail.com"
                      className="input input-bordered w-full"
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="**********"
                      className="input input-bordered w-full"
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          password: e.target.value,
                        })
                      }
                      required
                    />

                    <p className="text-xs opacity-70 mt-1">
                      Password must be 6 characters long
                    </p>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full">
                  {isPending?'Signing-up...':'Create Account'}
                </button>

                <div className="text-center mt-4">
                  <p className="text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>


         {/* SIGNUP FORM - RIGHT SIDE */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            {/* Illustration */}
            <div className="relative aspect-square max-w-sm mx-auto">
              <img
                src="/i.png"
                alt="Language connection illustration"
                className="w-full h-full"
              />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">
                Connect with language partners worldwide
              </h2>
              <p className="opacity-70">
                Practice conversations, make friends, and improve your language
                skills together
              </p>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default SignUpPage;
