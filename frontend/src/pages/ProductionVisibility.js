import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Activity, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageLayout, PageHeader, PageActions, PageContent } from '../components/ui/PageLayout';
import { Button } from '../components/ui/Button';
import dataService from '../services/dataService';

const SITES = ['All', 'Plant A — Monterrey', 'Plant B — Penang', 'Plant C — Chennai'];
const SHIFTS = ['All', 'Morning', 'Afternoon', 'Night'];
const PAGE_SIZE = 5;

const yieldColor = v => v >= 95 ? 'bg-emerald-500' : v >= 85 ? 'bg-amber-500' : 'bg-red-500';
const capColor = v => {
    const val = v <= 1 ? v * 100 : v;
    return val >= 85 ? 'bg-blue-500' : val >= 70 ? 'bg-amber-500' : 'bg-red-400';
};

const ProductionVisibility = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [site, setSite] = useState('All');
    const [shift, setShift] = useState('All');
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await dataService.getProductionVisibility();
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
        (site === 'All' || r.site === site) &&
        (shift === 'All' || r.shift === shift) &&
        ((r.line || '').toLowerCase().includes(search.toLowerCase()) || (r.site || '').toLowerCase().includes(search.toLowerCase()))
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const cur = Math.min(page, totalPages);
    const paged = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

    const avg = key => filtered.length ? (filtered.reduce((s, r) => s + (r[key] || 0), 0) / filtered.length).toFixed(1) : '—';

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Activity size={32} className="animate-spin text-blue-500" />
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
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">Data Access Error</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">{error}</p>
                    <Button onClick={() => window.location.reload()} className="px-8 shadow-sm">
                        <RefreshCw size={16} className="mr-2" /> Retry Connection
                    </Button>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <PageHeader
                title="Production Visibility"
                subtitle="Multi-site line performance, yield, and capacity."
            />

            <PageContent>
                {/* KPI strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        ['Yield Efficiency', '%', avg('yield_pct'), 'text-emerald-600', 'bg-emerald-50 dark:bg-emerald-900/20'],
                        ['Variance/Rework', '%', avg('rework_pct'), 'text-amber-600', 'bg-amber-50 dark:bg-amber-900/20'],
                        ['Utilization', '%', avg('capacity_utilization_pct'), 'text-blue-600', 'bg-blue-50 dark:bg-blue-900/20'],
                        ['Aggregated Defects', 'units', filtered.reduce((s, r) => s + (r.defects || 0), 0), 'text-rose-600', 'bg-rose-50 dark:bg-rose-900/20'],
                    ].map(([label, unit, val, tc, bg]) => (
                        <Card key={label}>
                            <div className={`p-6 h-full ${bg}`}>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 opacity-60 mb-2">{label}</p>
                                <p className={`text-3xl font-bold ${tc} tabular-nums tracking-tighter`}>{val}<span className="text-sm font-bold ml-1 opacity-50 uppercase tracking-widest">{unit}</span></p>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <PageActions>
                    <div className="relative max-w-sm flex-1">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input placeholder="Search site or line…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="pl-9 pr-4 py-2 w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm transition-all" />
                    </div>
                    {[['Site Origin', SITES, site, setSite], ['Operational Shift', SHIFTS, shift, setShift]].map(([label, opts, val, set]) => (
                        <select key={label} value={val} onChange={e => { set(e.target.value); setPage(1); }}
                            className="text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm transition-all min-w-[160px]">
                            {opts.map(o => <option key={o}>{o}</option>)}
                        </select>
                    ))}
                </PageActions>

                {/* Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">Site / Line</th>
                                    <th className="px-5 py-4 font-semibold">Shift</th>
                                    <th className="px-5 py-4 font-semibold">Date</th>
                                    <th className="px-5 py-4 font-semibold text-center">WIP</th>
                                    <th className="px-5 py-4 font-semibold text-center">Output</th>
                                    <th className="px-5 py-4 font-semibold w-40">Yield %</th>
                                    <th className="px-5 py-4 font-semibold w-40">Capacity %</th>
                                    <th className="px-5 py-4 font-semibold text-center">Rework %</th>
                                    <th className="px-5 py-4 font-semibold text-center">Defects</th>
                                    <th className="px-5 py-4 font-semibold text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {paged.length === 0 ? (
                                    <tr><td colSpan={10} className="px-5 py-12 text-center text-sm text-slate-400">No records match your filters.</td></tr>
                                ) : paged.map(r => (
                                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-slate-900 dark:text-slate-100">{r.site}</div>
                                            <div className="text-xs text-slate-400">{r.line}</div>
                                        </td>
                                        <td className="px-5 py-4">{r.shift}</td>
                                        <td className="px-5 py-4 tabular-nums">{r.date}</td>
                                        <td className="px-5 py-4 text-center tabular-nums">{r.wip_units}</td>
                                        <td className="px-5 py-4 text-center tabular-nums">{r.output_units}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                    <div className={`h-full rounded-full ${yieldColor(r.yield_pct)}`} style={{ width: `${r.yield_pct}%` }} />
                                                </div>
                                                <span className="text-xs font-medium tabular-nums text-slate-700 dark:text-slate-300 w-10 text-right">{r.yield_pct}%</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                    <div className={`h-full rounded-full ${capColor(r.capacity_utilization_pct)}`} style={{ width: `${r.capacity_utilization_pct}%` }} />
                                                </div>
                                                <span className="text-xs font-medium tabular-nums text-slate-700 dark:text-slate-300 w-10 text-right">{r.capacity_utilization_pct}%</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 tabular-nums text-center font-medium">{r.rework_pct}%</td>
                                        <td className="px-5 py-4 text-slate-900 dark:text-slate-100 tabular-nums text-center">{r.defects ?? '—'}</td>
                                        <td className="px-5 py-4 text-center"><Badge variant={r.status === 'On Track' ? 'success' : r.status === 'At Risk' ? 'warning' : 'danger'}>{r.status}</Badge></td>
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

export default ProductionVisibility;
