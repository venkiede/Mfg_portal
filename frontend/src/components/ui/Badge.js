import React from 'react';
import { cn } from './Button';

export const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
    const variants = {
        default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        warning: "bg-amber-50  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400",
        danger: "bg-rose-50   text-rose-700   dark:bg-rose-900/30   dark:text-rose-400",
        primary: "bg-blue-50   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400",
    };

    // Auto-map common status strings
    let runtimeVariant = variant;
    if (typeof props.children === 'string') {
        const t = props.children.toLowerCase();
        if (t === 'on track' || t === 'active' || t === 'approved' || t === 'published' || t === 'repaired' || t === 'closed') runtimeVariant = 'success';
        if (t === 'at risk' || t === 'expiring soon' || t === 'pending' || t === 'in transit' || t === 'in review' || t === 'open' || t === 'pending approval' || t === 'under diagnosis' || t === 'notice issued' || t === 'replacement shipped') runtimeVariant = 'warning';
        if (t === 'delayed' || t === 'inactive' || t === 'rejected' || t === 'obsolescence risk') runtimeVariant = 'danger';
        if (t === 'engineer' || t === 'npi' || t === 'in progress') runtimeVariant = 'primary';
    }

    return (
        <span
            ref={ref}
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                variants[runtimeVariant],
                className
            )}
            {...props}
        />
    );
});
Badge.displayName = "Badge";
