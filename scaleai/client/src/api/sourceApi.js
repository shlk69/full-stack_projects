import axiosClient from './axiosClient';

export const getSources = () => axiosClient.get('/sources').then(res => res.data);
export const createSource = (data) => axiosClient.post('/sources', data).then(res => res.data);
export const deleteSource = (id) => axiosClient.delete(`/sources/${id}`).then(res => res.data);
