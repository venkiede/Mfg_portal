import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export const PageHeader = ({ title, subtitle, icon, backTo }) => {
    const navigate = useNavigate();
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-3">
                {backTo && (
                    <button
                        onClick={() => navigate(backTo)}
                        className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                )}
                {icon && <div className="text-blue-600">{icon}</div>}
                <h1 className="page-title line-clamp-1">
                    {title}
                </h1>
            </div>
            {subtitle && (
                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-3xl leading-relaxed">
                    {subtitle}
                </p>
            )}
        </div>
    );
};

export const PageActions = ({ children }) => (
    <div className="flex flex-wrap items-center gap-3">
        {children}
    </div>
);

export const PageContent = ({ children, className }) => (
    <div className={`space-y-8 ${className || ''}`}>
        {children}
    </div>
);

export const PageLayout = ({ children }) => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
            {children}
        </div>
    </div>
);
