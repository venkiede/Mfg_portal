import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchApi } from '../api';

const GlobalSearch = ({ userId }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const search = async () => {
            if (query.length < 2) {
                setResults([]);
                setIsOpen(false);
                return;
            }
            try {
                const res = await searchApi.search(query, userId);
                setResults(res.data);
                setIsOpen(true);
            } catch (err) {
                console.error("Search error", err);
            }
        };

        const timeoutId = setTimeout(search, 300);
        return () => clearTimeout(timeoutId);
    }, [query, userId]);

    return (
        <div className="relative w-full max-w-md" ref={searchRef}>
            <div className="relative flex items-center">
                <Search className="absolute left-3 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search projects, documents..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-transparent rounded-full text-sm focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                    >
                        {results.length > 0 ? (
                            <div className="py-2">
                                {results.map(r => (
                                    <div
                                        key={`${r.type}-${r.id}`}
                                        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                        onClick={() => {
                                            if (r.type === 'project') window.location.href = `/project/${r.id}`;
                                            setIsOpen(false);
                                        }}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{r.title}</span>
                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{r.type}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{r.description}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                No results found for "{query}"
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GlobalSearch;
