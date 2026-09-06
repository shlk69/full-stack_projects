import { useEffect } from "react";
import api from "../api";
import { useDispatch, useSelector } from "react-redux";


const useUpdateLocation = () => {
  const dispatch = useDispatch();
  const {userData} = useSelector((state) => state.user);
  useEffect(() => {
   useEffect(() => {
     const updateLocation = async (lat, lon) => {
       const result = await api.post(
         `/user/update-location`,
         { lat, lon },
         { withCredentials: true },
       );
       console.log(result.data);
     };

     navigator.geolocation.watchPosition((pos) => {
       updateLocation(pos.coords.latitude, pos.coords.longitude);
     });
   }, [userData]);

  }, [userData]);
};

export default useUpdateLocation;
