import axios from "axios";
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  const base = import.meta.env.VITE_SERVER_URL;
  if (token && base && config.url?.startsWith(base)) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
