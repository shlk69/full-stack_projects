import React from 'react';
import clsx from 'clsx';

export const Card = ({ children, className, ...props }) => (
    <div className={clsx("bg-white rounded-lg border shadow-sm p-4", className)} {...props}>
        {children}
    </div>
);
