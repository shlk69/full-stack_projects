import React from 'react';
import clsx from 'clsx';

export const Button = ({ children, className, variant = 'primary', ...props }) => {
    const base = "px-4 py-2 rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
    };

    return (
        <button className={clsx(base, variants[variant], className)} {...props}>
            {children}
        </button>
    );
};
