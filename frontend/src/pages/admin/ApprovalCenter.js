import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Clock, CheckSquare, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { AuthContext } from '../../context/AuthContext';
import { PageLayout, PageHeader, PageActions, PageContent } from '../../components/ui/PageLayout';
import { Button } from '../../components/ui/Button';

import dataService from '../../services/dataService';

const TYPES = ['All', 'Project Stage Change', 'Quality Closure', 'Compliance Renewal', 'ECO Change'];
const STATUSES = ['All', 'Pending', 'Approved', 'Rejected'];

const priorityStyle = p => {
    if (p === 'Critical') return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
    if (p === 'High') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    if (p === 'Medium') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
};

const typeStyle = {
    'Project Stage Change': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    'Quality Closure': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Compliance Renewal': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    'ECO Change': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const statusVariant = s => s === 'Approved' ? 'success' : s === 'Rejected' ? 'danger' : 'warning';

const ApprovalCenter = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [typeF, setTypeF] = useState('All');
    const [statF, setStatF] = useState('All');
    const [actionFeedback, setActionFeedback] = useState(null);

    const fetchApprovals = useCallback(async () => {
        try {
            const data = await dataService.getApprovals(user?.role);
            setItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user?.role]);

    useEffect(() => {
        fetchApprovals();
    }, [fetchApprovals]);

    const decide = async (id, decision) => {
        setActionFeedback(null);
        try {
            await dataService.updateApproval(id, { status: decision, reviewed_by: user?.name || 'Admin' }, user?.role);
            setActionFeedback({ type: 'success', message: `Request ${decision.toLowerCase()} successfully.` });
            fetchApprovals();
            setTimeout(() => setActionFeedback(null), 3000);
        } catch (err) {
            setActionFeedback({ type: 'error', message: err.message });
        }
    };

    const filtered = items.filter(a =>
        (typeF === 'All' || a.type === typeF) &&
        (statF === 'All' || a.status === statF)
    );

    const pendingCount = items.filter(a => a.status === 'Pending').length;

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;
    if (error) return <div className="p-8 text-center text-rose-500 font-medium">Error: {error}</div>;

    return (
        <PageLayout>
            <PageHeader
                title="Action Approval Center"
                subtitle="Review, approve, or reject critical system changes and phase gates."
                icon={<CheckSquare size={24} className="text-emerald-600" />}
                backTo="/admin"
            />

            <PageContent>
                {actionFeedback && (
                    <div className={`mb-4 p-4 rounded-xl text-sm font-medium ${
                        actionFeedback.type === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    }`}>
                        {actionFeedback.message}
                    </div>
                )}
                {/* Filters */}
                <PageActions>
                    {[['Type', TYPES, typeF, setTypeF], ['Status', STATUSES, statF, setStatF]].map(([label, opts, val, set]) => (
                        <select key={label} value={val} onChange={e => set(e.target.value)}
                            className="text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm transition-all min-w-[160px]">
                            {opts.map(o => <option key={o}>{o}</option>)}
                        </select>
                    ))}
                    <div className="flex-1" />
                    <div className="flex items-center gap-3">
                        {pendingCount > 0 && (
                            <span className="inline-flex items-center px-4 py-2 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-900/20 text-xs font-semibold uppercase tracking-wider ring-1 ring-orange-100 dark:ring-orange-900/40 shadow-sm">
                                {pendingCount} Pending
                            </span>
                        )}
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                            {filtered.length} Total
                        </span>
                    </div>
                </PageActions>

                {/* Approval cards */}
                <div className="space-y-4">
                    {filtered.length === 0 && (
                        <Card>
                            <div className="p-16 text-center">
                                <CheckCircle2 size={40} className="mx-auto text-slate-200 mb-3" />
                                <p className="text-sm text-slate-400 font-medium">No approvals match your filters.</p>
                            </div>
                        </Card>
                    )}
                    {filtered.map(a => (
                        <Card key={a.id}>
                            <div className="p-6">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeStyle[a.type] || 'bg-slate-100 text-slate-600'}`}>
                                                {a.type}
                                            </span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityStyle(a.priority)}`}>
                                                {a.priority}
                                            </span>
                                            <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base tracking-tight">{a.entity_name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">{a.detail}</p>
                                        <div className="flex flex-wrap items-center gap-5 mt-4 text-xs text-slate-400 font-medium border-t border-slate-50 dark:border-slate-800/50 pt-3">
                                            <span className="flex items-center gap-1.5">
                                                Requested by <span className="text-slate-700 dark:text-slate-200 font-semibold">{a.requested_by}</span>
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={12} className="opacity-70" /> {a.requested_at}
                                            </span>
                                            <span className="bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">
                                                {a.entity}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {a.status === 'Pending' && (
                                        <div className="flex items-center gap-2 shrink-0 self-center">
                                            <button onClick={() => decide(a.id, 'Rejected')}
                                                className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl bg-white dark:bg-slate-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all border border-rose-100 dark:border-rose-900/40 shadow-sm">
                                                <XCircle size={14} strokeWidth={2.5} /> Reject
                                            </button>
                                            <button onClick={() => decide(a.id, 'Approved')}
                                                className="flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-md shadow-blue-200 dark:shadow-none">
                                                <CheckCircle2 size={14} strokeWidth={2.5} /> Approve
                                            </button>
                                        </div>
                                    )}
                                    {a.status !== 'Pending' && (
                                        <div className="shrink-0 text-[11px] font-semibold text-slate-400 uppercase tracking-widest italic self-center bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                            Review by {a.reviewed_by} on {a.reviewed_at?.split('T')[0]}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </PageContent>
        </PageLayout>
    );
};

export default ApprovalCenter;
