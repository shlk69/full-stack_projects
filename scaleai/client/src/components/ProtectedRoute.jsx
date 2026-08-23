import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const ProtectedRoute = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/auth" />;
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default ProtectedRoute;
