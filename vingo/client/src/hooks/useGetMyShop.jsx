import { useEffect,useDispatch } from "react";
import api from "../api";
import { setMyShopData } from "../redux/ownerSlice";
import { useSelector } from "react-redux";




function useGetMyshop() {
    const dispatch = useDispatch();
    const {userData} = useSelector(state=>state.user)
    useEffect(() => {
        const fetchShop = async () => {
            try {
                const {data} = await api.get('/shop/get-my', {
                    withCredentials: true,
                });
                dispatch(setMyShopData(data))
            } catch (error) {
                console.log(error);
            }
        };
        fetchShop();
    }, [userData])

}

export default useGetMyshop;
