import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { logoutUser } = useContext(AuthContext);

    return (
        <nav className="bg-white border-b h-16 flex items-center justify-between px-6 shrink-0 z-10 w-full">
            <div className="font-bold text-xl text-blue-600">ScaleAI</div>
            <div>
                <button onClick={logoutUser} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                    Sign Out
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
