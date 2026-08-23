import axiosClient from './axiosClient';

export const login = (data) => axiosClient.post('/auth/login', data).then(res => res.data);
export const register = (data) => axiosClient.post('/auth/register', data).then(res => res.data);
