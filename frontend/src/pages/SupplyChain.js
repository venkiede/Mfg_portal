import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageLayout, PageHeader, PageActions, PageContent } from '../components/ui/PageLayout';
import { Button } from '../components/ui/Button';

import dataService from '../services/dataService';

const PO_STATUSES = ['All', 'Delivered', 'In Transit', 'Delayed', 'Pending'];
const LIFECYCLES = ['All', 'Active', 'Obsolescence Risk'];
const PAGE_SIZE = 5;

const poVariant = s => {
    if (s === 'Delivered') return 'success';
    if (s === 'In Transit' || s === 'Pending') return 'warning';
    return 'danger';
};

const lcStyle = lc => lc === 'Active'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';

const ScoreBar = ({ val }) => (
    <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden w-16 shadow-inner">
            <div className={`h-full rounded-full ${val >= 90 ? 'bg-emerald-500' : val >= 75 ? 'bg-amber-500' : 'bg-rose-500'} shadow-sm`} style={{ width: `${val}%` }} />
        </div>
        <span className="text-xs font-bold tabular-nums text-slate-700 dark:text-slate-300 w-6">{val}</span>
    </div>
);

const SupplyChain = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [poStatus, setPoStatus] = useState('All');
    const [lc, setLc] = useState('All');
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await dataService.getSupplyChain();
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
        (poStatus === 'All' || r.po_status === poStatus) &&
        (lc === 'All' || r.lifecycle_status === lc) &&
        ((r.supplier_name || '').toLowerCase().includes(search.toLowerCase()) || (r.part_category || '').toLowerCase().includes(search.toLowerCase()))
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
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">Supply Chain Outage</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">{error}</p>
                    <Button onClick={() => window.location.reload()} className="px-8 shadow-sm">
                        Retry Syncing
                    </Button>
                </div>
            </PageLayout>
        );
    }

    const totalPOValue = filtered.reduce((s, r) => s + (r.po_value_usd || 0), 0).toLocaleString();

    return (
        <PageLayout>
            <PageHeader
                title="Global Supply Chain"
                subtitle="End-to-end visibility into procurement, supplier performance, and inventory health."
            />

            <PageContent>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        ['Active Suppliers', records.filter(r => r.lifecycle_status === 'Active').length, 'text-blue-600', 'bg-blue-50 dark:bg-blue-900/20'],
                        ['PO Value (USD)', `$${totalPOValue}`, 'text-emerald-600', 'bg-emerald-50 dark:bg-emerald-900/20'],
                        ['Delayed POs', records.filter(r => r.po_status === 'Delayed').length, 'text-rose-600', 'bg-rose-50 dark:bg-rose-900/20'],
                        ['Obsolescence Risk', records.filter(r => r.lifecycle_status === 'Obsolescence Risk').length, 'text-orange-600', 'bg-orange-50 dark:bg-orange-900/20'],
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
                        <input placeholder="Search supplier or part…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="pl-9 pr-4 py-2 w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm transition-all" />
                    </div>
                    {[['PO Status', PO_STATUSES, poStatus, setPoStatus], ['Lifecycle', LIFECYCLES, lc, setLc]].map(([label, opts, val, set]) => (
                        <select key={label} value={val} onChange={e => { set(e.target.value); setPage(1); }}
                            className="text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm transition-all">
                            {opts.map(o => <option key={o}>{o}</option>)}
                        </select>
                    ))}
                </PageActions>

                {/* Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">Vendor & Asset</th>
                                    <th className="px-5 py-4 font-semibold">Category</th>
                                    <th className="px-5 py-4 font-semibold text-center">Country</th>
                                    <th className="px-5 py-4 font-semibold">Purchase Order</th>
                                    <th className="px-5 py-4 font-semibold">Value</th>
                                    <th className="px-5 py-4 font-semibold text-center">Transit Status</th>
                                    <th className="px-5 py-4 font-semibold w-32">Quality Index</th>
                                    <th className="px-5 py-4 font-semibold w-32">Aggregated</th>
                                    <th className="px-5 py-4 font-semibold text-center">Inv.</th>
                                    <th className="px-5 py-4 font-semibold text-center">Lifecycle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {paged.length === 0 ? (
                                    <tr><td colSpan={10} className="px-5 py-12 text-center text-sm text-slate-400">No records match your filters.</td></tr>
                                ) : paged.map(r => (
                                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                                            {r.supplier_name}
                                            <div className="text-xs text-slate-400 font-normal mt-0.5">{r.id}</div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{r.part_category}</td>
                                        <td className="px-5 py-4 text-center text-slate-600 dark:text-slate-400">{r.country}</td>
                                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">{r.po_number}</td>
                                        <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100 tabular-nums">${(r.po_value_usd || 0).toLocaleString()}</td>
                                        <td className="px-5 py-4 text-center"><Badge variant={poVariant(r.po_status)}>{r.po_status}</Badge></td>
                                        <td className="px-5 py-4"><ScoreBar val={r.quality_score} /></td>
                                        <td className="px-5 py-4"><ScoreBar val={r.overall_score} /></td>
                                        <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100 tabular-nums text-center">{r.inventory_on_hand}</td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${lcStyle(r.lifecycle_status)}`}>
                                                {r.lifecycle_status}
                                            </span>
                                        </td>
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

export default SupplyChain;
