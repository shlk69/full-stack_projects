import { useEffect, useDispatch } from "react";
import api from "../api";
import { useSelector } from "react-redux";
import { setMyOrders } from "../redux/user.slice";

function useGetMyOrders() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get("/order/my-orders", {
          withCredentials: true,
        });
        dispatch(setMyOrders(data));
      } catch (error) {
        console.log(error);
      }
    };
    fetchOrder();
  }, [userData]);
}

export default useGetMyOrders;
