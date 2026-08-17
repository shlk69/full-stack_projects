import { useEffect, useState } from 'react'
import api from '../api'

const useGetCurrentUser = () => {
    useEffect(() => {
        const fetchUser = async () => {
            try {

                const response = await api.get('/user/current', {
                    withCredentials: true
                })
                console.log(response)
            } catch (err) {
                console.error("Failed to fetch current user:", err)
            }
        }

        fetchUser()
    }, [])
}

export default useGetCurrentUser
