import { useEffect,useDispatch } from "react";
import api from "../api";




function useGetMyshop() {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchShop = async () => {
            try {
                const result = await api.get('/shop/get-my', {
                    withCredentials: true,
                });
                dispatch(setUserData(result.data));
            } catch (error) {
                console.log(error);
            }
        };
        fetchShop();
    }, [])

}

export default useGetMyshop;
