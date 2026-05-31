import React, { useEffect, useState } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Builder from "./pages/Builder";
import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import axios from "axios";
import ProtectedRoute from "./components/protectedRoute";
import { Toaster } from 'react-hot-toast'
import { Billing } from "./pages/Billing";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem("token");

      if (!token || token === "null" || token === "undefined") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/user/current-user`,
          {
            withCredentials: true,
          },
        );
        setUser(response.data.user);
        setLoading(false)
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
