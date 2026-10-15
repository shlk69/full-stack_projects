import { API_BASE_URL } from "./config";
import axios from 'axios';
export const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use(config => { config.headers.Authorization = 'Bearer ' + localStorage.getItem('token'); return config; });
export const errorText = error => error.response?.data?.message || 'Unable to complete request. Please retry.';
export async function downloadReceipt(role, id) {
  const { data } = await api.get('/trips/' + role + '/' + id + '/receipt', { responseType: 'blob' });
  const url = URL.createObjectURL(data); const link = document.createElement('a');
  link.href = url; link.download = 'ride-' + id + '-receipt.html'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
