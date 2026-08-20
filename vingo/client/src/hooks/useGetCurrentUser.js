import { useEffect, useState } from 'react'
import api from '../api'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/user.slice'

const useGetCurrentUser = () => {
   const dispatch = useDispatch()

    useEffect(() => {
        const fetchUser = async () => {
            try {

                const result = await api.get('/user/current', {
                    withCredentials: true
                })
                dispatch(setUserData(result.data))
            } catch (err) {
                console.error("Failed to fetch current user:", err.message)
            }
        }

        fetchUser()
    }, [])
}

export default useGetCurrentUser
