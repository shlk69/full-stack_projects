import { useEffect,useDispatch } from "react";
import api from "../api";
import { setMyShopData } from "../redux/ownerSlice";




function useGetMyshop() {
    const dispatch = useDispatch();
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
    }, [])

}

export default useGetMyshop;
