import React, { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Builder from "./pages/Builder";
import { Billing } from "./pages/Billing";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/protectedRoute";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const retryAttempted = useRef(false);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("token");

    if (!token || token === "null" || token === "undefined") {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/user/current-user`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Fetched User:", response.data.data);

      setUser(response.data.data);
    } catch (error) {
      console.log("Current User API Failed");

      console.log("Status:", error.response?.status);

      console.log("Response:", error.response?.data);

      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!loading && !user && !retryAttempted.current) {
      retryAttempted.current = true;

      fetchCurrentUser();
    }
  }, [loading, user]);

  useEffect(() => {
    console.log("===============");
    console.log("USER STATE UPDATED");
    console.log(user);
    console.log("===============");
  }, [user]);

  return (
    <>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <Navbar user={user} setUser={setUser} />

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

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
