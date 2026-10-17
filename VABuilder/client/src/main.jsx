import { SERVER_URL } from "./config";
import axios from "axios";
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  const base = SERVER_URL;
  if (token && !['null', 'undefined'].includes(token) && new URL(config.url || '/', window.location.origin).origin === new URL(base).origin) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
