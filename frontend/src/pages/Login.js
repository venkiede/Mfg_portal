import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Factory, Loader2, Mail, User, ChevronDown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ROLES = ['Admin', 'Engineer'];

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', username: '', role: 'Admin' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address';
        if (!form.username.trim() || form.username.length < 2) e.username = 'Display name must be at least 2 characters';
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        await new Promise(r => setTimeout(r, 500));
        login(form);
        navigate('/');
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    return (
        <div className="min-h-screen h-screen w-screen overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Subtle background accents */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl" />
            </div>

            {/* Login card */}
            <div
                className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-950 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                style={{ animation: 'loginFadeIn 0.35s ease-out both' }}
            >
                {/* Blue top accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />

                <div className="px-8 py-8">
                    {/* Brand */}
                    <div className="flex flex-col items-center mb-7">
                        <div className="p-3 bg-blue-600 rounded-xl shadow-md shadow-blue-500/20 mb-4">
                            <Factory size={26} className="text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                            Welcome to Mfg Portal
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to continue</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="email"
                                    placeholder="you@company.com"
                                    value={form.email}
                                    onChange={e => handleChange('email', e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-gray-800 transition-all ${errors.email
                                            ? 'border-red-400 dark:border-red-500 focus:ring-red-500/20'
                                            : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-400'
                                        }`}
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
                        </div>

                        {/* Display Name */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                Display Name
                            </label>
                            <div className="relative">
                                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    value={form.username}
                                    onChange={e => handleChange('username', e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-gray-800 transition-all ${errors.username
                                            ? 'border-red-400 dark:border-red-500 focus:ring-red-500/20'
                                            : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-400'
                                        }`}
                                />
                            </div>
                            {errors.username && <p className="text-red-500 text-xs mt-1.5">{errors.username}</p>}
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                Role
                            </label>
                            <div className="relative">
                                <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <select
                                    value={form.role}
                                    onChange={e => handleChange('role', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white dark:focus:bg-gray-800 appearance-none transition-all cursor-pointer"
                                >
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
                        Simulation mode — no real credentials required
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes loginFadeIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Login;
