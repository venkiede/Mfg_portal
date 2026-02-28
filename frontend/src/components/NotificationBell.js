import React, { useContext, useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationContext } from '../context/NotificationContext';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead } = useContext(NotificationContext);
    const [isOpen, setIsOpen] = useState(false);
    const bellRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bellRef.current && !bellRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={bellRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
            >
                <Bell size={20} />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-900"
                        >
                            {unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden z-50 origin-top-right"
                    >
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Notifications</h3>
                            {unreadCount > 0 && <span className="text-xs text-blue-600 dark:text-blue-400">{unreadCount} unread</span>}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-sm text-gray-500">You're caught up!</div>
                            ) : (
                                notifications.map(n => (
                                    <div
                                        key={n.id}
                                        onClick={() => !n.read_status && markAsRead(n.id)}
                                        className={`p-4 border-b border-gray-50 dark:border-gray-800/50 transition-colors ${n.read_status
                                                ? 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                : 'bg-blue-50/50 dark:bg-blue-900/10 text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {!n.read_status && <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
                                            <div className="flex-1">
                                                <div className="text-[10px] font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400 mb-1">
                                                    {n.type.replace('_', ' ')}
                                                </div>
                                                <div className="text-sm mb-1">{n.message}</div>
                                                <div className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
