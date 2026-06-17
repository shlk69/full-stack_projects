import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api'

export const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
})