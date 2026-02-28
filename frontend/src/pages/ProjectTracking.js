import React, { useState, useEffect } from 'react';
import {
    BarChart2,
    Search,
    Plus,
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PageLayout, PageHeader, PageContent, PageActions } from '../components/ui/PageLayout';
import dataService from '../services/dataService';

const PHASES = ['All', 'R&D', 'NPI', 'Production'];
const HEALTH = ['All', 'Green', 'Yellow', 'Red'];
const PAGE_SIZE = 5;

const healthVariant = h => {
    if (h === 'Green') return 'success';
    if (h === 'Yellow') return 'warning';
    return 'danger';
};

const phaseColor = p => {
    switch (p) {
        case 'R&D': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
        case 'NPI': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        case 'Production': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        default: return 'bg-slate-100 text-slate-600';
    }
};

const ProjectTracking = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [phase, setPhase] = useState('All');
    const [health, setHealth] = useState('All');
    const [page, setPage] = useState(1);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({
        project_name: '',
        owner: '',
        phase: 'R&D',
        portfolio_health: 'Green',
        target_date: '',
        progress: 0,
        bom_count: 0,
        eco_logs: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await dataService.getProjectTracking();
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
        (phase === 'All' || r.phase === phase) &&
        (health === 'All' || r.portfolio_health === health) &&
        (r.project_name || '').toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const cur = Math.min(page, totalPages);
    const paged = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

    const handleAddProject = async (e) => {
        e.preventDefault();
        try {
            const projectToAdd = {
                ...newProject,
                id: `PT-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            };
            const created = await dataService.addProjectTracking(projectToAdd);
            setRecords([created, ...records]);
            setIsModalOpen(false);
            setNewProject({
                project_name: '',
                owner: '',
                phase: 'R&D',
                portfolio_health: 'Green',
                target_date: '',
                progress: 0,
                bom_count: 0,
                eco_logs: 0
            });
        } catch (err) {
            alert('Error adding project: ' + err.message);
        }
    };

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
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">Data Access Error</h2>
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
                title="Strategic Project Tracking"
                subtitle="High-level portfolio management from R&D through NPI and full-scale Production."
            />

            <PageContent>
                {/* Summary KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        ['Green Health', 'Operating normally', records.filter(r => r.portfolio_health === 'Green').length, 'text-emerald-600 dark:text-emerald-400', 'bg-emerald-50 dark:bg-emerald-900/20'],
                        ['Needs Attention', 'Minor variances detected', records.filter(r => r.portfolio_health === 'Yellow').length, 'text-amber-600 dark:text-amber-400', 'bg-amber-50 dark:bg-amber-900/20'],
                        ['Critical Risk', 'Immediate action required', records.filter(r => r.portfolio_health === 'Red').length, 'text-rose-600 dark:text-rose-400', 'bg-rose-50 dark:bg-rose-900/20'],
                    ].map(([label, desc, val, tc, bg]) => (
                        <Card key={label}>
                            <div className={`p-6 flex items-center justify-between ${bg}`}>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 opacity-60 mb-2">{label}</p>
                                    <p className={`text-4xl font-bold ${tc} tabular-nums tracking-tighter`}>{val}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{desc}</p>
                                </div>
                                <div className="p-3 bg-white/50 dark:bg-black/20 rounded-2xl shadow-sm">
                                    <BarChart2 size={24} className={`${tc} opacity-80`} />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <PageActions>
                    <div className="relative flex-1 max-w-sm">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input placeholder="Search projects…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="pl-9 pr-4 py-2.5 w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm" />
                    </div>
                    {[['Phase', PHASES, phase, setPhase], ['Health', HEALTH, health, setHealth]].map(([label, opts, val, set]) => (
                        <select key={label} value={val} onChange={e => { set(e.target.value); setPage(1); }}
                            className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm transition-all min-w-[140px]">
                            {opts.map(o => <option key={o}>{o}</option>)}
                        </select>
                    ))}
                    <div className="flex-1" />
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} className="mr-2" /> Add Project
                    </Button>
                </PageActions>

                {/* Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">Project</th>
                                    <th className="px-5 py-4 font-semibold">Phase</th>
                                    <th className="px-5 py-4 font-semibold">Health</th>
                                    <th className="px-5 py-4 font-semibold">Owner</th>
                                    <th className="px-5 py-4 font-semibold w-44">Progress</th>
                                    <th className="px-5 py-4 font-semibold text-center">BOM</th>
                                    <th className="px-5 py-4 font-semibold text-center">ECOs</th>
                                    <th className="px-5 py-4 font-semibold">Target Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {paged.length === 0 ? (
                                    <tr><td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-400">No records match your filters.</td></tr>
                                ) : paged.map(r => (
                                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">{r.project_name}
                                            <div className="text-xs text-slate-400 font-normal">{r.id}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${phaseColor(r.phase)}`}>{r.phase}</span>
                                        </td>
                                        <td className="px-5 py-4"><Badge variant={healthVariant(r.portfolio_health)}>{r.portfolio_health}</Badge></td>
                                        <td className="px-5 py-4">{r.owner}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${r.portfolio_health === 'Green' ? 'bg-emerald-500' : r.portfolio_health === 'Yellow' ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${r.progress}%` }} />
                                                </div>
                                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 w-8 text-right tabular-nums">{r.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center font-medium">{r.bom_count ?? "—"}</td>
                                        <td className="px-5 py-4 text-center font-medium">{r.eco_logs ?? "—"}</td>
                                        <td className="px-5 py-4 tabular-nums">{r.target_date}</td>
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

            {/* Add Project Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Project"
            >
                <form onSubmit={handleAddProject} className="space-y-5">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Project Name</label>
                            <input
                                required
                                type="text"
                                value={newProject.project_name}
                                onChange={e => setNewProject({ ...newProject, project_name: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-slate-100"
                                placeholder="Enter project name..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Owner / Manager</label>
                            <input
                                required
                                type="text"
                                value={newProject.owner}
                                onChange={e => setNewProject({ ...newProject, owner: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-slate-100"
                                placeholder="Manager name..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phase</label>
                                <select
                                    value={newProject.phase}
                                    onChange={e => setNewProject({ ...newProject, phase: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-slate-100 cursor-pointer"
                                >
                                    {PHASES.filter(p => p !== 'All').map(p => <option key={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Due Date</label>
                                <input
                                    required
                                    type="date"
                                    value={newProject.target_date}
                                    onChange={e => setNewProject({ ...newProject, target_date: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-slate-100"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Create Project
                        </Button>
                    </div>
                </form>
            </Modal>
        </PageLayout>
    );
};

export default ProjectTracking;
