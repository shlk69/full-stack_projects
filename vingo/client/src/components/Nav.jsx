import React, { useState } from "react";
import {useNavigate} from 'react-router-dom'
import { HiLocationMarker } from "react-icons/hi";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart, FiLogOut, FiPackage } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {toast} from 'react-toastify'
import api from "../api";
import { setUserData } from "../redux/user.slice";

function Nav() {
  const { userData, city } = useSelector((state) => state.user);
  

  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogout = async () => {
    try {
      const result = api.get("/auth/signout", {
          withCredentials:true
      });
      dispatch(setUserData(null))
      toast.success('Logged out successfully')
    } catch (error) {
      console.log('Error while logging out ', error.message)
      toast.error('Unable to logout')
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-[80px] z-[9999] bg-[#fff9f6] px-4 md:px-6">
      <div className="w-full max-w-[1400px] h-full mx-auto flex items-center">
        {/* ================= LEFT ================= */}
        <div className="flex-1 flex items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-[#ff4d2d]">
            Vingo
          </h1>
        </div>

        {/* ================= MOBILE ICONS ================= */}
        <div className="flex md:hidden items-center gap-4 mr-4">
          {/* Location */}
          <button className="cursor-pointer" aria-label="Location">
            <HiLocationMarker size={23} className="text-[#ff4d2d]" />
          </button>

          {/* Search */}
          <button
            onClick={() => setSearchOpen((prev) => !prev)}
            className="cursor-pointer"
            aria-label="Search">
            <IoIosSearch size={25} className="text-[#ff4d2d]" />
          </button>
        </div>

        {/* ================= DESKTOP SEARCH ================= */}
        <div className="hidden md:flex w-[55%] lg:w-[45%] xl:w-[40%] h-[52px] bg-white rounded-xl shadow-lg items-center">
          {/* Location */}
          <div className="w-[32%] min-w-0 flex items-center gap-2 px-3 border-r border-gray-300">
            <HiLocationMarker size={22} className="text-[#ff4d2d] shrink-0" />

                      <span className="truncate text-gray-600 text-sm">{ city}</span>
          </div>

          {/* Search */}
          <div className="flex-1 flex items-center gap-2 px-3 min-w-0">
            <IoIosSearch size={24} className="text-[#ff4d2d] shrink-0" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search delicious food..."
              className="w-full min-w-0 outline-none text-gray-700 text-sm placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="flex-1 flex items-center justify-end gap-4 md:gap-6">
          {/* Cart */}
          <div className="relative cursor-pointer">
            <FiShoppingCart size={24} className="text-[#ff4d2d]" />

            <span className="absolute -right-2 -top-3 text-xs font-semibold text-[#ff4d2d]">
              0
            </span>
          </div>

          {/* Desktop My Orders */}
          <button
            className="
              hidden md:flex
              items-center gap-2
              px-3 py-2
              rounded-lg
              bg-[#ff4d2d]/10
              text-[#ff4d2d]
              text-sm
              font-medium
              hover:bg-[#ff4d2d]/20
              transition
            ">
            <FiPackage size={17} />
            My Orders
          </button>

          {/* ================= PROFILE ================= */}
          <div className="relative">
            {/* Avatar */}
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="
                w-10 h-10
                rounded-full
                flex items-center justify-center
                bg-[#ff4d2d]
                text-white
                text-lg
                shadow-md
                font-semibold
                cursor-pointer
              ">
              {userData?.fullName?.slice(0, 1)?.toUpperCase() || "U"}
            </button>

            {/* ================= PROFILE DROPDOWN ================= */}
            {profileOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-[52px]
                  w-[220px]
                  bg-white
                  rounded-xl
                  shadow-xl
                  border border-gray-100
                  overflow-hidden
                  z-[10000]
                ">
                {/* User Information */}
                <div className="px-4 py-4 border-b border-gray-100">
                  <p className="font-semibold text-gray-800 truncate">
                    {userData?.fullName || "User"}
                  </p>

                  {userData?.email && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {userData.email}
                    </p>
                  )}
                </div>

                {/* My Orders */}
                <button
                  className="
                    w-full
                    flex items-center gap-3
                    px-4 py-3
                    text-gray-700
                    hover:bg-[#fff4ef]
                    hover:text-[#ff4d2d]
                    transition
                    text-left
                  ">
                  <FiPackage size={18} />
                  <span>My Orders</span>
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="
                    w-full
                    flex items-center gap-3
                    px-4 py-3
                    text-gray-700
                    hover:bg-red-50
                    hover:text-red-500
                    transition
                    text-left
                  ">
                  <FiLogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MOBILE SEARCH BOX ================= */}
      {searchOpen && (
        <div
          className="
            md:hidden
            absolute
            top-[80px]
            left-0
            w-full
            px-4
            py-3
            bg-[#fff9f6]
            shadow-md
          ">
          <div
            className="
              w-full
              h-[50px]
              bg-white
              rounded-xl
              shadow-lg
              flex
              items-center
              gap-2
              px-3
            ">
            <IoIosSearch size={24} className="text-[#ff4d2d] shrink-0" />

            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search delicious food..."
              className="
                w-full
                outline-none
                text-gray-700
                text-sm
                placeholder:text-gray-400
              "
            />
          </div>
        </div>
      )}
    </nav>
  );
}

export default Nav;
