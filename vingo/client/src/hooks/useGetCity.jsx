import { useEffect, useState } from 'react'
import api from '../api'
import { useDispatch, useSelector } from 'react-redux'
import { setCity, setCurrentAdd, setState, setUserData } from '../redux/user.slice'
import axios from 'axios'

const useGetCity = () => {
    const dispatch = useDispatch()
    const userData = useSelector(state=>state.user)
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords
            const { data } = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${import.meta.env.VITE_GEOAPIKEY}`)
            dispatch(setCity(data.results[0].city))
            dispatch(setState(data.results[0].state))
            dispatch(
              setCurrentAdd(
                data.results[0].address_line2 || data.results[0].address_line2,
              ),
            );
        })
    }, [userData])

}

export default useGetCity
