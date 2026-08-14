import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#1E293B',
          color: '#fff',
          border: '1px solid #334155'
        }
      }} />
    </AuthProvider>
  </React.StrictMode>,
)
