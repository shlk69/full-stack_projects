import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import { useSelector } from "react-redux";
import Home from "./pages/Home";
import useGetCity from "./hooks/useGetCity";
import useGetMyshop from "./hooks/useGetMyShop";
import CreateEditShop from "./pages/CreateEditShop";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import useGetItemByCity from "./hooks/useGetItemByCity";
import useGetShopByCity from "./hooks/useGetShopByCity";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import OrderPlaced from "./pages/OrderPlaced";
import MyOrders from "./pages/MyOrders";

function App() {
  useGetCurrentUser()
  useGetCity()
  useGetMyshop()
  useGetItemByCity()
    useGetShopByCity()
  const { userData } = useSelector(state => state.user)
  return (
    <>
      <Routes>
        <Route
          path="/signup"
          element={!userData ? <SignUp /> : <Navigate to={"/"} />}
        />
        <Route
          path="/signin"
          element={!userData ? <SignIn /> : <Navigate to={"/"} />}
        />
        <Route
          path="/forgot-password"
          element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />}
        />
        <Route
          path="/"
          element={userData ? <Home /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/create-edit-shop"
          element={userData ? <CreateEditShop /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/add-item"
          element={userData ? <AddItem /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/edit-item/:id"
          element={userData ? <EditItem /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/cart"
          element={userData ? <CartPage /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/checkout"
          element={userData ? <Checkout /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/order-placed"
          element={userData ? <OrderPlaced /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/my-orders"
          element={userData ? <MyOrders /> : <Navigate to={"/signin"} />}
        />
      </Routes>

      {/* Global Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;
