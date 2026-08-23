import React from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { LayoutDashboard, Edit3, Calendar, Settings } from 'lucide-react';

const Sidebar = () => {
    const links = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Editor', path: '/editor', icon: <Edit3 size={20} /> },
        { name: 'Calendar', path: '/calendar', icon: <Calendar size={20} /> },
        { name: 'Brand Voice', path: '/brand-voice', icon: <Settings size={20} /> },
    ];

    return (
        <div className="w-64 bg-white border-r h-full flex flex-col pt-6 z-0 hidden md:flex shrink-0">
            <nav className="flex flex-col gap-2 px-4">
                {links.map((link) => (
                    <NavLink
                        key={link.name}
                        to={link.path}
                        className={({ isActive }) => clsx(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                            isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        {link.icon}
                        {link.name}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
