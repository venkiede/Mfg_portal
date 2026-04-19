import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, CheckSquare, Loader2, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageLayout, PageHeader, PageActions, PageContent } from '../components/ui/PageLayout';
import { Button } from '../components/ui/Button';

import dataService from '../services/dataService';

const TYPES = ['All', 'Thread', 'Document', 'Knowledge Base', 'Approval', 'FAQ'];
const STATUSES = ['All', 'Open', 'Pending Approval', 'Approved', 'Published'];
const PAGE_SIZE = 5;

const typeStyle = {
    'Thread': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Document': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    'Knowledge Base': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Approval': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'FAQ': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};
const statusVariant = s => {
    if (s === 'Approved' || s === 'Published') return 'success';
    if (s === 'Pending Approval' || s === 'Open') return 'warning';
    return 'default';
};

const Collaboration = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('All');
    const [status, setStatus] = useState('All');
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await dataService.getCollaboration();
                setRecords(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filtered = records.filter(r =>
        (type === 'All' || r.type === type) &&
        (status === 'All' || (r.lifecycle || r.status) === status) &&
        (r.title || '').toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const cur = Math.min(page, totalPages);
    const paged = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 size={32} className="animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <PageLayout>
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-20 w-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 border border-rose-100 shadow-sm">
                        <AlertTriangle size={36} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">Collaboration Offline</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">{error}</p>
                    <Button onClick={() => window.location.reload()} className="px-8 shadow-sm">
                        Retry Syncing
                    </Button>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <PageHeader
                title="Knowledge & Collaboration"
                subtitle="Company-wide threads, document lifecycle management, and shared intelligence."
            />

            <PageContent>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        ['Open Threads', records.filter(r => r.type === 'Thread' && (r.lifecycle || r.status) === 'Open').length, 'text-blue-600', 'bg-blue-50 dark:bg-blue-900/20'],
                        ['Pending Approvals', records.filter(r => (r.lifecycle || r.status) === 'Pending Approval' || r.approval === 'Pending Approval').length, 'text-amber-600', 'bg-amber-50 dark:bg-amber-900/20'],
                        ['Published Articles', records.filter(r => (r.lifecycle || r.status) === 'Published').length, 'text-emerald-600', 'bg-emerald-50 dark:bg-emerald-900/20'],
                        ['Total Repository', records.length, 'text-slate-700 dark:text-slate-200', 'bg-slate-100 dark:bg-slate-800'],
                    ].map(([label, val, tc, bg]) => (
                        <Card key={label}>
                            <div className={`p-6 h-full ${bg}`}>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 opacity-60 mb-2">{label}</p>
                                <p className={`text-3xl font-bold ${tc} tabular-nums`}>{val}</p>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <PageActions>
                    <div className="relative flex-1 max-w-sm">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input placeholder="Search intelligence…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="pl-9 pr-4 py-2 w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm transition-all" />
                    </div>
                    {[['Type', TYPES, type, setType], ['Status', STATUSES, status, setStatus]].map(([label, opts, val, set]) => (
                        <select key={label} value={val} onChange={e => { set(e.target.value); setPage(1); }}
                            className="text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm transition-all">
                            {opts.map(o => <option key={o}>{o}</option>)}
                        </select>
                    ))}
                </PageActions>

                {/* Table */}
                <Card>
                    <div className="responsive-table-container custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">Asset Title</th>
                                    <th className="px-5 py-4 font-semibold">Type</th>
                                    <th className="px-5 py-4 font-semibold hide-on-mobile-th">Author</th>
                                    <th className="px-5 py-4 font-semibold text-center whitespace-nowrap hide-on-mobile-th">Creation Date</th>
                                    <th className="px-5 py-4 font-semibold hide-on-mobile-th">Metadata</th>
                                    <th className="px-5 py-4 font-semibold text-center hide-on-mobile-th">Replies</th>
                                    <th className="px-5 py-4 font-semibold text-center hide-on-mobile-th">Approval</th>
                                    <th className="px-5 py-4 font-semibold text-center whitespace-nowrap hide-on-mobile-th">SLA (hrs)</th>
                                    <th className="px-5 py-4 font-semibold text-center">Lifecycle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {paged.length === 0 ? (
                                    <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-slate-400">No entries match your filters.</td></tr>
                                ) : paged.map(r => (
                                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                                            {r.title}
                                            <div className="text-xs text-slate-400 font-normal mt-0.5">{r.id}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeStyle[r.type] || 'bg-slate-100 text-slate-600'}`}>
                                                {r.type || '—'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 hide-on-mobile">{r.author || '—'}</td>
                                        <td className="px-5 py-4 text-center tabular-nums hide-on-mobile">{r.date || "N/A"}</td>
                                        <td className="px-5 py-4 hide-on-mobile">
                                            <div className="flex flex-wrap gap-1.5">
                                                {(r.metadata?.tags || r.tags || []).map(t => (
                                                    <span key={t} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium rounded uppercase tracking-tight">
                                                        {t}
                                                    </span>
                                                ))}
                                                {(!r.metadata?.tags?.length && !r.tags?.length) && r.metadata && (
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        {typeof r.metadata === 'object' ? Object.keys(r.metadata).join(', ') : r.metadata}
                                                    </span>
                                                )}
                                                {(!r.metadata?.tags?.length && !r.tags?.length && !r.metadata) && <span className="text-slate-400">—</span>}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center font-medium tabular-nums hide-on-mobile">{r.replies ?? "—"}</td>
                                        <td className="px-5 py-4 text-center hide-on-mobile">
                                            {r.approval ? (
                                                <span className="text-xs font-medium">{r.approval}</span>
                                            ) : r.approval_required ? (
                                                <CheckSquare size={16} strokeWidth={2.5} className="text-blue-600 mx-auto" />
                                            ) : (
                                                <span className="text-slate-300 dark:text-slate-700">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-center font-medium tabular-nums hide-on-mobile">{r.sla_hours ?? '—'}</td>
                                        <td className="px-5 py-4 text-center"><Badge variant={statusVariant(r.lifecycle || r.status)}>{r.lifecycle || r.status || '—'}</Badge></td>
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

export default Collaboration;
