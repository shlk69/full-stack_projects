import axiosClient from './axiosClient';

export const generatePosts = (sourceId) => axiosClient.post('/ai/generate', { sourceId }).then(res => res.data);
