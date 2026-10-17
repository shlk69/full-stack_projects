import { SERVER_URL } from "./config";
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Builder from "./pages/Builder";
import { Billing } from "./pages/Billing";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token") && !["null", "undefined"].includes(localStorage.getItem("token"))));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') return;
    const controller = new AbortController();
    axios.get(SERVER_URL + '/api/user/current-user', { withCredentials: true, signal: controller.signal, headers: { Authorization: 'Bearer ' + token } })
      .then(({ data }) => setUser(data.data))
      .catch(error => { if (error.code !== 'ERR_CANCELED') { setUser(null); if (error.response?.status === 401) localStorage.removeItem('token'); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
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
              <Navbar user={user} setUser={setUser} />

              <Routes>
                <Route path="/" element={<Home user={user} />} />

                <Route
                  path="/builder"
                  element={<Builder key={user?._id} user={user} setUser={setUser} />}
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
