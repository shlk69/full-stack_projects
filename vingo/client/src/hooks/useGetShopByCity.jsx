import { useEffect } from "react";
import api from "../api";
import { useDispatch, useSelector } from "react-redux";
import { setShopsInMyCity } from "../redux/user.slice";

const useGetCurrentUser = () => {
    const dispatch = useDispatch();
    const {city} = useSelector(state=>state.user)

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const result = await api.get(`/shop/get-by-city/${city}`, {
          withCredentials: true,
        });
        dispatch(setShopsInMyCity(result.data));
      } catch (err) {
        console.error("Failed to fetch current user:", err.message);
      }
    };

    fetchShop();
  }, [city]);
};

export default useGetCurrentUser;
