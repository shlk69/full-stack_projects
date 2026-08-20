import { useEffect, useState } from 'react'
import api from '../api'
import { useDispatch, useSelector } from 'react-redux'
import { setCity, setUserData } from '../redux/user.slice'
import axios from 'axios'

const useGetCity = () => {
    const dispatch = useDispatch()
    const userData = useSelector(state=>state.user)
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords
            const { data } = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${import.meta.env.VITE_GEOAPIKEY}`)
            dispatch(setCity(data.results[0].city))
        })
    }, [userData])

}

export default useGetCity
