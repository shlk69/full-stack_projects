import { Route, Routes, useNavigate } from "react-router";
import "./index.css";
import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";

import { Navigate } from "react-router";
import {Toaster} from 'react-hot-toast'
import PageLoader from "./components/PageLoader.jsx";
import { getAuthUser } from "./lib/api.js";
import useAuthUser from "./hooks/useAuthUser.js";

const App = () => {
   
  const { isLoading, authUser } = useAuthUser()
  
  const authenticatedUser = Boolean(authUser)
  const isOnboarded = authUser?.isOnboarded
  
  if(isLoading) return <PageLoader/>

  return (
    <div className="h-screen" data-theme="night">
      <Routes>
        <Route
          path="/"
          element={
            authenticatedUser && isOnboarded ? (
              <HomePage />
            ) : (
              <Navigate to={authenticatedUser ? "/onboarding" : "/login"} />
            )
          }
        />
        <Route
          path="/signup"
          element={!authenticatedUser ? <SignUpPage /> : <Navigate to={
            isOnboarded ? ('/') : ('/onboarding')} />}
        />
        <Route
          path="/login"
          element={!authenticatedUser ? <LoginPage /> : <Navigate to={
            isOnboarded?('/'):('/onboarding')
          } />}
        />
        <Route
          path="/notifications"
          element={
            authenticatedUser ? <NotificationsPage /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/call"
          element={authenticatedUser ? <CallPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat"
          element={authenticatedUser ? <ChatPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/onboarding"
          element={
            authenticatedUser ? (
              !isOnboarded ? (
                <OnboardingPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </div>
  );
};

export default App;
