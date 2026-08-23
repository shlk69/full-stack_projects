import React from 'react';
import clsx from 'clsx';

export const Input = ({ className, error, ...props }) => {
    return (
        <div className="flex flex-col w-full">
            <input
                className={clsx(
                    "px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent",
                    error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500",
                    className
                )}
                {...props}
            />
            {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
        </div>
    );
};
