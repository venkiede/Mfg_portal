import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageLayout, PageHeader, PageContent } from '../components/ui/PageLayout';
import DashboardChart from '../components/DashboardChart';

import dataService from '../services/dataService';

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true); setError(null);
            try {
                const data = await dataService.getProjects(user.id);
                if (!cancelled) setProjects(data);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [user.id]);

    const barColor = s => s === 'On Track' ? 'bg-emerald-400' : s === 'At Risk' ? 'bg-amber-400' : 'bg-rose-400';

    // ─── Chart Data Mocking based on Role ───────────────────────────────────
    const renderCharts = () => {
        if (user.role === 'Admin') {
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DashboardChart
                        title="Project Status Distribution"
                        subtitle="Overall portfolio health across all active modules"
                        data={[
                            { name: 'On Track', value: 12 },
                            { name: 'At Risk', value: 4 },
                            { name: 'Delayed', value: 2 },
                            { name: 'Completed', value: 8 }
                        ]}
                    />
                    <DashboardChart
                        title="Production Performance"
                        subtitle="Key efficiency metrics for current shift"
                        unit="%"
                        data={[
                            { name: 'Yield', value: 98.2 },
                            { name: 'Rework', value: 1.4 },
                            { name: 'Defect Rate', value: 0.4 }
                        ]}
                        colors={['#10b981', '#f59e0b', '#f43f5e']}
                    />
                    <DashboardChart
                        title="Quality Issues Trend"
                        subtitle="Open vs closed quality compliance records"
                        data={[
                            { name: 'Open Issues', value: 5 },
                            { name: 'Closed (MTD)', value: 14 },
                            { name: 'CAPA Pending', value: 3 }
                        ]}
                        colors={['#f43f5e', '#10b981', '#3b82f6']}
                    />
                    <DashboardChart
                        title="Supply Chain Overview"
                        subtitle="Logistics and procurement status"
                        data={[
                            { name: 'On-time', value: 28 },
                            { name: 'Delayed', value: 3 },
                            { name: 'Pending PO', value: 12 }
                        ]}
                    />
                </div>
            );
        }

        if (user.role === 'Engineer') {
            return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <DashboardChart
                        title="Assigned Projects"
                        subtitle="Status of your current project assignments"
                        data={[
                            { name: 'On Track', value: 4 },
                            { name: 'At Risk', value: 1 },
                            { name: 'Delayed', value: 0 }
                        ]}
                    />
                    <DashboardChart
                        title="Line Yield Performance"
                        subtitle="Comparison across assigned production lines"
                        unit="%"
                        data={[
                            { name: 'Line A', value: 99.1 },
                            { name: 'Line B', value: 97.4 },
                            { name: 'Line C', value: 98.8 }
                        ]}
                        colors={['#3b82f6']}
                    />
                    <DashboardChart
                        title="Open Quality Issues"
                        subtitle="NCRs and CAPAs requiring engineering review"
                        data={[
                            { name: 'Critical', value: 1 },
                            { name: 'High', value: 2 },
                            { name: 'Medium', value: 1 }
                        ]}
                        colors={['#f43f5e', '#f59e0b', '#3b82f6']}
                    />
                </div>
            );
        }

        if (user.role === 'Viewer') {
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DashboardChart
                        title="Portfolio Summary"
                        subtitle="Snapshot of organization-wide project health"
                        data={[
                            { name: 'Healthy', value: 18 },
                            { name: 'Warning', value: 5 },
                            { name: 'Critical', value: 2 }
                        ]}
                        colors={['#10b981', '#f59e0b', '#f43f5e']}
                    />
                    <DashboardChart
                        title="Production Output"
                        subtitle="Aggregated production targets vs actuals"
                        data={[
                            { name: 'Target', value: 500 },
                            { name: 'Actual', value: 488 }
                        ]}
                        colors={['#94a3b8', '#3b82f6']}
                    />
                </div>
            );
        }

        if (user.role === 'Customer') {
            return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <DashboardChart
                        title="Orders Status"
                        subtitle="Current status of your active production orders"
                        data={[
                            { name: 'On Track', value: 3 },
                            { name: 'Processing', value: 2 },
                            { name: 'Shipped', value: 5 }
                        ]}
                        colors={['#10b981', '#3b82f6', '#8b5cf6']}
                    />
                    <DashboardChart
                        title="Shipment Reliability"
                        subtitle="On-time delivery performance for your account"
                        unit="%"
                        data={[
                            { name: 'On Time', value: 96 },
                            { name: 'Delayed', value: 4 }
                        ]}
                        colors={['#10b981', '#f43f5e']}
                    />
                    <DashboardChart
                        title="RMA Requests"
                        subtitle="Status of active return authorizations"
                        data={[
                            { name: 'In Review', value: 1 },
                            { name: 'Received', value: 1 },
                            { name: 'Resolved', value: 2 }
                        ]}
                    />
                </div>
            );
        }

        return null;
    };

    return (
        <PageLayout>
            <PageHeader
                title={`Welcome back, ${user.name}`}
                subtitle={`Executive overview of your ${user.role.toLowerCase()} operations.`}
            />

            <PageContent>
                {/* ── Charts Grid ─────────────────────────────────────── */}
                {renderCharts()}

                {/* ── Active Pipeline ──────────────────────────────────── */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Active Pipeline</CardTitle>
                        {loading && <Loader2 size={15} className="animate-spin text-blue-400" />}
                    </CardHeader>

                    {error ? (
                        <div className="p-10 text-center text-sm text-rose-500">
                            {error} — <button onClick={() => window.location.reload()} className="underline font-medium">Retry</button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-5 py-4 font-semibold">Project Name</th>
                                        <th className="px-5 py-4 font-semibold">Customer</th>
                                        <th className="px-5 py-4 font-semibold text-center">Status</th>
                                        <th className="px-5 py-4 font-semibold w-64">Progress</th>
                                        <th className="px-5 py-4 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {loading && projects.length === 0
                                        ? Array.from({ length: 3 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-5 py-6"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-40" /></td>
                                                <td className="px-5 py-6"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-24" /></td>
                                                <td className="px-5 py-6"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-16 mx-auto" /></td>
                                                <td className="px-5 py-6"><div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full w-full" /></td>
                                                <td className="px-5 py-6"><div className="h-6 w-6 bg-slate-100 dark:bg-slate-800 rounded-full ml-auto" /></td>
                                            </tr>
                                        ))
                                        : projects.length === 0
                                            ? <tr><td colSpan={5} className="text-center py-12 text-slate-400">No projects found.</td></tr>
                                            : projects.map(project => (
                                                <tr
                                                    key={project.id}
                                                    onClick={() => navigate(`/project/${project.id}`)}
                                                    className="cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                                                >
                                                    <td className="px-5 py-5">
                                                        <div className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                                                            {project.name}
                                                        </div>
                                                        <div className="text-xs text-slate-400 mt-0.5 font-normal">Due {project.due_date}</div>
                                                    </td>
                                                    <td className="px-5 py-5">{project.manager}</td>
                                                    <td className="px-5 py-5 text-center"><Badge>{project.status}</Badge></td>
                                                    <td className="px-5 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                                <div className={`h-full rounded-full ${barColor(project.status)} shadow-sm`} style={{ width: `${project.progress}%` }} />
                                                            </div>
                                                            <span className="text-xs font-bold tabular-nums text-slate-600 dark:text-slate-400 w-10 text-right">{project.progress}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-5 text-right">
                                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                            <ChevronRight size={14} strokeWidth={3} />
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </PageContent>
        </PageLayout>
    );
};

export default Dashboard;
