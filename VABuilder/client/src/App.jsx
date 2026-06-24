import React, { useEffect, useState, useRef } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Builder from "./pages/Builder";
import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import axios from "axios";
import ProtectedRoute from "./components/protectedRoute";
import { Toaster } from "react-hot-toast";
import { Billing } from "./pages/Billing";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const retryAttempted = useRef(false);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem("token");

      if (!token || token === "null" || token === "undefined") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/user/current-user`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        // The response structure is { success, message, data: user }
        setUser(response.data.data);
        setLoading(false);
      } catch (error) {
        console.log(
          "Auth check failed:",
          error.response?.data?.message || error.message,
        );
        setUser(null);
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  // If token exists but user isn't loaded, try fetching user
  useEffect(() => {
    if (!loading && !user && !retryAttempted.current) {
      const token = localStorage.getItem("token");
      if (token && token !== "null" && token !== "undefined") {
        retryAttempted.current = true;
        const retryFetch = async () => {
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_SERVER_URL}/api/user/current-user`,
              { withCredentials: true },
            );
            // The response structure is { success, message, data: user }
            setUser(response.data.data);
          } catch (error) {
            console.log("Failed to fetch user:", error.message);
            localStorage.removeItem("token");
          }
        };
        retryFetch();
      }
    }
  }, [loading, user]);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <Navbar setUser={setUser} user={user} />
              <Routes>
                <Route path="/" element={<Home user={user} />} />
                <Route
                  path="/builder"
                  element={<Builder user={user} setUser={setUser} />}
                />
                <Route
                  path="/billing"
                  element={<Billing user={user} setUser={setUser} />}
                />
                <Route path="/*" element={<Navigate to="/" replace />} />
              </Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
