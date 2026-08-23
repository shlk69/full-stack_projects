import axiosClient from './axiosClient';

export const getPosts = (params) => axiosClient.get('/posts', { params }).then(res => res.data);
export const updatePost = (id, data) => axiosClient.patch(`/posts/${id}`, data).then(res => res.data);
export const schedulePost = (id, scheduledFor) => axiosClient.patch(`/posts/${id}/schedule`, { scheduledFor }).then(res => res.data);
