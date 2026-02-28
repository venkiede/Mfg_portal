import React from 'react';
import { cn } from './Button';
import { Loader2 } from 'lucide-react';

export const Loader = ({ className, size = 24 }) => {
    return (
        <div className={cn("flex items-center justify-center w-full h-full min-h-[50vh]", className)}>
            <Loader2 className="animate-spin text-blue-600 dark:text-blue-500" size={size} />
        </div>
    );
};

export const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-800", className)}
            {...props}
        />
    );
};
