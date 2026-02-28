import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, ArrowLeft, ScrollText, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { AuthContext } from '../../context/AuthContext';
import { PageLayout, PageHeader, PageActions, PageContent } from '../../components/ui/PageLayout';
import { Button } from '../../components/ui/Button';

import dataService from '../../services/dataService';

const MODULES = ['All', 'Project Tracking', 'User Management', 'Quality', 'Projects', 'Compliance', 'Supply Chain'];
const PAGE_SIZE = 6;

const actionColor = a => {
    const m = {
        Created: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        Updated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        Closed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        Uploaded: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
        Deactivated: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        Flagged: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    };
    return m[a] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
};

const SystemLogs = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [module, setModule] = useState('All');
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await dataService.getSystemLogs(user?.role);
                setLogs(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [user?.role]);

    const filtered = logs.filter(l =>
        (module === 'All' || l.module === module) &&
        ((l.detail || '').toLowerCase().includes(search.toLowerCase()) ||
            (l.entity || '').toLowerCase().includes(search.toLowerCase()) ||
            (l.user || '').toLowerCase().includes(search.toLowerCase()))
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const cur = Math.min(page, totalPages);
    const paged = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;
    if (error) return <div className="p-8 text-center text-rose-500 font-medium">Error: {error}</div>;

    return (
        <PageLayout>
            <PageHeader
                title="Global Audit Trail"
                subtitle="Complete system logs tracking every administrative action and module change."
                icon={<ScrollText size={24} className="text-violet-600" />}
                backTo="/admin"
            />

            <PageContent>
                <PageActions>
                    <div className="relative flex-1 max-w-sm">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input placeholder="Search audit logs…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="pl-9 pr-4 py-2 w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm transition-all" />
                    </div>
                    {[['Module', MODULES, module, setModule]].map(([label, opts, val, set]) => (
                        <select key={label} value={val} onChange={e => { set(e.target.value); setPage(1); }}
                            className="text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm transition-all">
                            {opts.map(o => <option key={o}>{o}</option>)}
                        </select>
                    ))}
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-nowrap">
                        {filtered.length} Logs Found
                    </span>
                </PageActions>

                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">Timestamp</th>
                                    <th className="px-5 py-4 font-semibold">User</th>
                                    <th className="px-5 py-4 font-semibold">Module</th>
                                    <th className="px-5 py-4 font-semibold">Action</th>
                                    <th className="px-5 py-4 font-semibold">Entity</th>
                                    <th className="px-5 py-4 font-semibold">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {paged.length === 0 ? (
                                    <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400 font-medium">No log entries match your filters.</td></tr>
                                ) : paged.map(l => (
                                    <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs whitespace-nowrap tabular-nums">{l.timestamp}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                                                    {l.user.charAt(0)}
                                                </div>
                                                <span className="text-slate-900 dark:text-slate-200 font-semibold text-xs whitespace-nowrap">{l.user}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-slate-600 dark:text-slate-400 text-xs font-medium uppercase tracking-tight bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                {l.module}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${actionColor(l.action)}`}>
                                                {l.action}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-400 font-medium">{l.entity}</td>
                                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs max-w-xs truncate font-medium" title={l.detail}>{l.detail}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {filtered.length > PAGE_SIZE && (
                        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                            <span className="text-xs text-slate-500">{(cur - 1) * PAGE_SIZE + 1}–{Math.min(cur * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setPage(p => p - 1)} disabled={cur === 1} className="p-2 rounded-lg text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-colors shadow-sm"><ChevronLeft size={16} /></button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                    <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${n === cur ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'}`}>{n}</button>
                                ))}
                                <button onClick={() => setPage(p => p + 1)} disabled={cur === totalPages} className="p-2 rounded-lg text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-colors shadow-sm"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    )}
                </Card>
            </PageContent>
        </PageLayout>
    );
};

export default SystemLogs;
