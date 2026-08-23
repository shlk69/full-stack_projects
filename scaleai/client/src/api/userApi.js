import axiosClient from './axiosClient';

export const getBrandVoice = () => axiosClient.get('/user/brand-voice').then(res => res.data);
export const updateBrandVoice = (data) => axiosClient.put('/user/brand-voice', data).then(res => res.data);
