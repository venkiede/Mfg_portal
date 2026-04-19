import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageLayout, PageHeader, PageActions, PageContent } from '../components/ui/PageLayout';
import { Button } from '../components/ui/Button';

import dataService from '../services/dataService';

const TYPES = ['All', 'Certification', 'NCR', 'CAPA', 'Audit'];
const STATUSES = ['All', 'Active', 'Open', 'In Review', 'Expiring Soon', 'Closed'];
const PAGE_SIZE = 5;

const typeStyle = {
    'Certification': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'NCR': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'CAPA': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Audit': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const statusVariant = s => {
    if (s === 'Active' || s === 'Closed') return 'success';
    if (s === 'Expiring Soon' || s === 'In Review') return 'warning';
    return 'danger';
};

const QualityManagement = () => {
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
                const data = await dataService.getQualityManagement();
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
        (status === 'All' || r.status === status) &&
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
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">Data Retrieval Error</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">{error}</p>
                    <Button onClick={() => window.location.reload()} className="px-8 shadow-sm">
                        Retry Connection
                    </Button>
                </div>
            </PageLayout>
        );
    }

    const kpis = [
        ['Certifications', records.filter(r => r.type === 'Certification').length, 'text-blue-600', 'bg-blue-50 dark:bg-blue-900/20'],
        ['Open NCRs', records.filter(r => r.type === 'NCR' && r.status === 'Open').length, 'text-rose-600', 'bg-rose-50 dark:bg-rose-900/20'],
        ['Open CAPAs', records.filter(r => r.type === 'CAPA' && r.status !== 'Closed').length, 'text-amber-600', 'bg-amber-50 dark:bg-amber-900/20'],
        ['Upcoming Audits', records.filter(r => r.type === 'Audit' && r.status !== 'Closed').length, 'text-violet-600', 'bg-violet-50 dark:bg-violet-900/20'],
    ];

    return (
        <PageLayout>
            <PageHeader
                title="Quality & Governance"
                subtitle="Centralized management for Certifications, NCRs, CAPAs, and Audit protocols."
            />

            <PageContent>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpis.map(([label, val, tc, bg]) => (
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
                        <input placeholder="Search records…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
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
                                    <th className="px-5 py-4 font-semibold">Quality Record</th>
                                    <th className="px-5 py-4 font-semibold">Type</th>
                                    <th className="px-5 py-4 font-semibold text-center hide-on-mobile-th">Standard</th>
                                    <th className="px-5 py-4 font-semibold hide-on-mobile-th">Coordinator</th>
                                    <th className="px-5 py-4 font-semibold hide-on-mobile-th">Audit Date</th>
                                    <th className="px-5 py-4 font-semibold text-center hide-on-mobile-th">Findings</th>
                                    <th className="px-5 py-4 font-semibold text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {paged.length === 0 ? (
                                    <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">No records match your filters.</td></tr>
                                ) : paged.map(r => (
                                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                                            {r.title}
                                            <div className="text-xs text-slate-400 font-normal mt-0.5">{r.id}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeStyle[r.type] || 'bg-slate-100 text-slate-600'}`}>
                                                {r.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center hide-on-mobile">
                                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded">
                                                {r.standard}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 font-medium hide-on-mobile">{r.owner}</td>
                                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 tabular-nums hide-on-mobile">{r.issue_date}</td>
                                        <td className="px-5 py-4 text-center font-medium text-slate-900 dark:text-slate-100 tabular-nums hide-on-mobile">{r.ncr_count}</td>
                                        <td className="px-5 py-4 text-center"><Badge variant={statusVariant(r.status)}>{r.status}</Badge></td>
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

export default QualityManagement;
