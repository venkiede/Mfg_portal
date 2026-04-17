import React, { useContext, useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, FolderKanban, ShieldCheck,
    GitBranch, Activity, Star, Package, Wrench, MessageSquare,
    ChevronLeft, ChevronRight, Moon, Sun, Factory,
    LogOut, User as UserIcon, ChevronDown, Shield,
    Users, ScrollText, CheckSquare, Menu, X
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import GlobalSearch from './GlobalSearch';
import { cn } from './ui/Button';

const NAV = [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/projects', label: 'Projects', icon: FolderKanban },
    { path: '/compliance', label: 'Compliance', icon: ShieldCheck },
    { path: '/project-tracking', label: 'Project Tracking', icon: GitBranch },
    { path: '/production', label: 'Production Visibility', icon: Activity },
    { path: '/quality', label: 'Quality Management', icon: Star },
    { path: '/supply-chain', label: 'Supply Chain', icon: Package },
    { path: '/after-sales', label: 'After-Sales Service', icon: Wrench },
    { path: '/collaboration', label: 'Collaboration', icon: MessageSquare },
];

const ADMIN_NAV = [
    { path: '/admin', label: 'Admin Panel', icon: Shield },
    { path: '/admin/users', label: 'User Management', icon: Users },
    { path: '/admin/logs', label: 'System Logs', icon: ScrollText },
    { path: '/admin/approvals', label: 'Approval Center', icon: CheckSquare },
];

// ─── Reusable nav link ────────────────────────────────────────────────────────
const NavLink = ({ item, isSidebarOpen, isActive, onClick }) => {
    const Icon = item.icon;
    return (
        <Link
            to={item.path}
            onClick={onClick}
            title={!isSidebarOpen ? item.label : undefined}
            className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200 whitespace-nowrap',
                isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
            )}
        >
            <Icon size={16} className="shrink-0" />
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs truncate">
                        {item.label}
                    </motion.span>
                )}
            </AnimatePresence>
        </Link>
    );
};

const AdminNavLink = ({ item, isSidebarOpen, isActive, onClick }) => {
    const Icon = item.icon;
    return (
        <Link
            to={item.path}
            onClick={onClick}
            title={!isSidebarOpen ? item.label : undefined}
            className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200 whitespace-nowrap',
                isActive
                    ? 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
            )}
        >
            <Icon size={16} className="shrink-0" />
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs truncate">
                        {item.label}
                    </motion.span>
                )}
            </AnimatePresence>
        </Link>
    );
};

// ─── Layout ───────────────────────────────────────────────────────────────────
const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const { isDark, toggleTheme } = useContext(ThemeContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    useEffect(() => {
        const handler = e => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target))
                setIsUserMenuOpen(false);
        };
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setIsSidebarOpen(true);
            else setIsSidebarOpen(false);
        };
        document.addEventListener('mousedown', handler);
        window.addEventListener('resize', handleResize);
        return () => {
            document.removeEventListener('mousedown', handler);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleLogout = () => { logout(); navigate('/login'); };

    const isNavActive = path => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
    const isAdminNavActive = path => path === '/admin' ? location.pathname === '/admin' : (location.pathname.startsWith(path) && path !== '/admin');

    return (
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">

            {/* ── Overlay for mobile ───────────────────────────────── */}
            <AnimatePresence>
                {isMobile && isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30"
                    />
                )}
            </AnimatePresence>

            {/* ── Sidebar ──────────────────────────────────────────── */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 216 : (isMobile ? 0 : 60) }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className={cn(
                    "flex flex-col h-full bg-white dark:bg-slate-900 z-40 shrink-0 overflow-hidden",
                    isMobile ? "fixed left-0 top-0 bottom-0 shadow-2xl" : "relative border-r border-slate-200 dark:border-slate-800"
                )}
            >
                {/* Brand */}
                <div className="h-14 flex items-center px-3 border-b border-slate-100 dark:border-slate-800 gap-2.5 whitespace-nowrap shrink-0">
                    <div className="p-1.5 bg-blue-500 rounded-xl text-white shrink-0 shadow-sm">
                        <Factory size={16} />
                    </div>
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                                className="font-bold text-sm text-slate-800 dark:text-white truncate"
                            >
                                Mfg Portal
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
                    {NAV.map(item => (
                        <NavLink key={item.path} item={item} isSidebarOpen={isSidebarOpen} isActive={isNavActive(item.path)} onClick={() => isMobile && setIsSidebarOpen(false)} />
                    ))}

                    {/* Admin-only section */}
                    {user.role === 'Admin' && (
                        <>
                            <div className="mt-2 mb-1 px-2.5">
                                {isSidebarOpen
                                    ? <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Administration</p>
                                    : <div className="h-px bg-slate-200 dark:bg-slate-700" />}
                            </div>
                            {ADMIN_NAV.map(item => (
                                <AdminNavLink key={item.path} item={item} isSidebarOpen={isSidebarOpen} isActive={isAdminNavActive(item.path)} onClick={() => isMobile && setIsSidebarOpen(false)} />
                            ))}
                        </>
                    )}
                </nav>

                {/* Collapse toggle */}
                {!isMobile && (
                    <div className="p-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
                        <button
                            onClick={() => setIsSidebarOpen(v => !v)}
                            className="flex w-full items-center justify-center p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-all duration-200"
                        >
                            {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                        </button>
                    </div>
                )}
            </motion.aside>

            {/* ── Main ─────────────────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top bar */}
                <header className="h-14 shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 md:px-5 z-10 gap-3">
                    {isMobile && (
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                        >
                            <Menu size={20} />
                        </button>
                    )}
                    <div className="flex-1 max-w-sm">
                        <GlobalSearch userId={user.id} />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-all duration-200"
                        >
                            {isDark ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                        <NotificationBell />
                        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                        {/* User dropdown */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(v => !v)}
                                className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                            >
                                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="hidden md:flex flex-col items-start leading-none gap-0.5">
                                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{user.name}</span>
                                    <span className="text-xs text-slate-400">{user.role}</span>
                                </div>
                                <ChevronDown size={13} className="text-slate-400" />
                            </button>

                            <AnimatePresence>
                                {isUserMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 origin-top-right"
                                    >
                                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40">
                                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                                            <p className="text-xs text-slate-400 truncate">{user.email || user.role}</p>
                                        </div>
                                        <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <UserIcon size={14} className="text-slate-400" /> Profile
                                        </button>
                                        <div className="h-px bg-slate-100 dark:bg-slate-800 mx-3" />
                                        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                                            <LogOut size={14} /> Sign Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                        className="max-w-7xl mx-auto space-y-6"
                    >
                        <Outlet />
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
