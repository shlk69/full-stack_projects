import React, { useEffect, useState } from "react";
import { FaLocationDot, FaPlus } from "react-icons/fa6";
import { FiShoppingCart } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { RxCross2 } from "react-icons/rx";
import { TbReceipt2 } from "react-icons/tb";
import api from "../api";
import { setSearchItems, setUserData } from "../redux/user.slice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Nav() {
  const { userData, city, cartItems } = useSelector((state) => state.user);

  const { myShopData } = useSelector((state) => state.owner);

  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = async () => {
    try {
      await api.get("/auth/signout", {
        withCredentials: true,
      });

      toast.success("Logged out successfully");
      dispatch(setUserData(null));
    } catch (error) {
      toast.error(error?.message || "Logout failed");
    }
  };

  // =========================
  // SEARCH ITEMS
  // =========================
  const handleSearchItems = async () => {
    try {
      const result = await api.get(
        `/item/search-items?query=${query}&city=${city}`,
        {
          withCredentials: true,
        },
      );

      console.log(result.data);

      dispatch(setSearchItems(result.data));
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // SEARCH EFFECT
  // =========================
  useEffect(() => {
    if (query.trim()) {
      handleSearchItems();
    } else {
      dispatch(setSearchItems(null));
    }
  }, [query, city, dispatch]);

  // =========================
  // RETURN
  // =========================
  return (
    <div className="w-full h-[80px] flex items-center justify-between md:justify-center gap-[30px] px-[20px] fixed top-0 z-[9999] bg-[#fff9f6] overflow-visible">
      {/* =========================================
          MOBILE SEARCH OVERLAY
      ========================================= */}
      {showSearch && userData?.role === "user" && (
        <div className="fixed top-[80px] left-[5%] flex w-[90%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px]">
          {/* LOCATION */}
          <div className="flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400">
            <FaLocationDot size={25} className="text-[#ff4d2d]" />

            <div className="w-[80%] truncate text-gray-600">{city}</div>
          </div>

          {/* SEARCH INPUT */}
          <div className="w-[80%] flex items-center gap-[10px]">
            <IoIosSearch size={25} className="text-[#ff4d2d]" />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="search delicious food..."
              className="px-[10px] text-gray-700 outline-0 w-full"
            />
          </div>
        </div>
      )}

      {/* =========================================
          LOGO
      ========================================= */}
      <h1 className="text-3xl font-bold mb-2 text-[#ff4d2d]">Vingo</h1>

      {/* =========================================
          DESKTOP SEARCH BAR
      ========================================= */}
      {userData?.role === "user" && (
        <div className="hidden md:flex md:w-[60%] lg:w-[40%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px]">
          {/* LOCATION */}
          <div className="flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400">
            <FaLocationDot size={25} className="text-[#ff4d2d]" />

            <div className="w-[80%] truncate text-gray-600">{city}</div>
          </div>

          {/* SEARCH */}
          <div className="w-[80%] flex items-center gap-[10px]">
            <IoIosSearch size={25} className="text-[#ff4d2d]" />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="search delicious food..."
              className="px-[10px] text-gray-700 outline-0 w-full"
            />
          </div>
        </div>
      )}

      {/* =========================================
          RIGHT SIDE
      ========================================= */}
      <div className="flex items-center gap-4">
        {/* =====================================
            MOBILE SEARCH ICON
        ===================================== */}
        {userData?.role === "user" &&
          (showSearch ? (
            <RxCross2
              size={25}
              className="text-[#ff4d2d] md:hidden cursor-pointer"
              onClick={() => {
                setShowSearch(false);
                setQuery("");
              }}
            />
          ) : (
            <IoIosSearch
              size={25}
              className="text-[#ff4d2d] md:hidden cursor-pointer"
              onClick={() => setShowSearch(true)}
            />
          ))}

        {/* =====================================
            OWNER SECTION
        ===================================== */}
        {userData?.role === "owner" ? (
          <>
            {/* ADD FOOD ITEM */}
            {myShopData && (
              <>
                {/* DESKTOP */}
                <button
                  onClick={() => navigate("/add-item")}
                  className="hidden md:flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]">
                  <FaPlus size={20} />
                  <span>Add Food Item</span>
                </button>

                {/* MOBILE */}
                <button
                  onClick={() => navigate("/add-item")}
                  className="md:hidden flex items-center p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]">
                  <FaPlus size={20} />
                </button>
              </>
            )}

            {/* MY ORDERS DESKTOP */}
            <div className="hidden md:flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium">
              <TbReceipt2 size={20} />

              <span onClick={() => navigate("/my-orders")}>My Orders</span>

              <span className="absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-[6px] py-[1px]">
                0
              </span>
            </div>

            {/* MY ORDERS MOBILE */}
            <div className="md:hidden flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium">
              <TbReceipt2 onClick={() => navigate("/my-orders")} size={20} />

              <span className="absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-[6px] py-[1px]">
                0
              </span>
            </div>
          </>
        ) : (
          <>
            {/* =================================
                USER CART
            ================================= */}
            {userData?.role === "user" && (
              <div
                onClick={() => navigate("/cart")}
                className="relative cursor-pointer">
                <FiShoppingCart size={25} className="text-[#ff4d2d]" />

                <span className="absolute right-[-9px] top-[-12px] text-[#ff4d2d]">
                  {cartItems?.length || 0}
                </span>
              </div>
            )}

            {/* =================================
                USER MY ORDERS
            ================================= */}
            <button
              onClick={() => navigate("/my-orders")}
              className="hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium">
              My Orders
            </button>
          </>
        )}

        {/* =====================================
            PROFILE AVATAR
        ===================================== */}
        <div
          onClick={() => setShowInfo((prev) => !prev)}
          className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[18px] shadow-xl font-semibold cursor-pointer">
          {userData?.fullName?.slice(0, 1)}
        </div>

        {/* =====================================
            PROFILE DROPDOWN
        ===================================== */}
        {showInfo && (
          <div
            className={`fixed top-[80px] right-[10px] w-[180px] bg-white shadow-2xl rounded-xl p-[20px] flex flex-col gap-[10px] z-[9999] ${
              userData?.role === "deliveryBoy"
                ? "md:right-[20%] lg:right-[40%]"
                : "md:right-[10%] lg:right-[25%]"
            }`}>
            {/* NAME */}
            <div className="text-[17px] font-semibold">
              {userData?.fullName}
            </div>

            {/* MOBILE MY ORDERS */}
            <div
              onClick={() => navigate("/my-orders")}
              className="md:hidden text-[#ff4d2d] font-semibold cursor-pointer">
              My Orders
            </div>

            {/* LOGOUT */}
            <div
              onClick={handleLogout}
              className="text-[#ff4d2d] font-semibold cursor-pointer">
              Log Out
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Nav;
