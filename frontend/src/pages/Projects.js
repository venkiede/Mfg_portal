import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ChevronLeft, ChevronRight, ExternalLink, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PageLayout, PageHeader, PageActions, PageContent } from '../components/ui/PageLayout';

import dataService from '../services/dataService';

const STATUSES = ['All', 'On Track', 'At Risk', 'Delayed'];
const PAGE_SIZE = 5;

const LIFECYCLE_STAGES = ['Initiation', 'Planning', 'Execution', 'Monitoring', 'Closure'];

const INITIAL_FORM = {
    name: '',
    description: '',
    start_date: '',
    manager: '',
    lifecycle_stage: 'Planning',
};

const healthVariant = s => {
    if (s === 'On Track') return 'success';
    if (s === 'At Risk') return 'warning';
    if (s === 'Delayed') return 'danger';
    return 'default';
};

const stageColor = {
    'Planning': 'bg-slate-100 text-slate-600',
    'R&D': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'NPI': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Production': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Closed': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const Projects = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [page, setPage] = useState(1);

    // Modal & form state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
    const [submitting, setSubmitting] = useState(false);
    const [deleteFeedback, setDeleteFeedback] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await dataService.getProjects(user?.id);
                setRecords(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [user?.id]);

    const canCreate = user?.role !== 'Viewer';

    const filtered = records.filter(p => {
        const matchSearch =
            (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.manager || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All' || p.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safeCurrentPage = Math.min(page, totalPages);
    const paginated = filtered.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);

    const validateForm = () => {
        const err = {};
        if (!formData.name?.trim()) err.name = 'Project name is required';
        if (!formData.manager?.trim()) err.manager = 'Owner is required';
        if (!formData.start_date) err.start_date = 'Start date is required';
        if (!formData.lifecycle_stage) err.lifecycle_stage = 'Lifecycle stage is required';
        setFormErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleOpenModal = () => {
        setFormData(INITIAL_FORM);
        setFormErrors({});
        setSubmitStatus(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData(INITIAL_FORM);
        setFormErrors({});
        setSubmitStatus(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        setSubmitStatus(null);
        try {
            const payload = {
                name: formData.name.trim(),
                manager: formData.manager.trim(),
                status: 'On Track',
                progress: 0,
                due_date: formData.start_date,
                lifecycle_stage: formData.lifecycle_stage,
            };
            const created = await dataService.addProject(payload, user?.id);
            setRecords(prev => [created, ...prev]);
            setSubmitStatus('success');
            setTimeout(handleCloseModal, 800);
        } catch (err) {
            setSubmitStatus('error');
            setFormErrors({ submit: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (project) => {
        if (!window.confirm(`Delete project "${project.name}"? This cannot be undone.`)) return;
        try {
            await dataService.deleteProject(project.id, user?.id);
            setRecords(prev => prev.filter(p => p.id !== project.id));
            setDeleteFeedback({ type: 'success', message: `Project "${project.name}" deleted successfully.` });
            setTimeout(() => setDeleteFeedback(null), 4000);
        } catch (err) {
            setDeleteFeedback({ type: 'error', message: err.message });
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
                <div className="flex flex-col items-center justify-center py-20 text-center text-rose-500">
                    <AlertTriangle size={36} className="mb-4" />
                    <p className="font-bold">Failed to load projects</p>
                    <p className="text-sm opacity-70 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>Retry Connection</Button>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <PageHeader
                    title="Projects Portfolio"
                    subtitle="Manage and track all manufacturing projects globally."
                />
                {canCreate && (
                    <Button onClick={handleOpenModal} className="shrink-0 shadow-sm">
                        <Plus size={16} className="mr-2" /> New Project
                    </Button>
                )}
            </div>

            <PageContent>
                {deleteFeedback && (
                    <div className={`mb-4 p-4 rounded-xl text-sm font-medium ${
                        deleteFeedback.type === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200'
                            : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-200'
                    }`}>
                        {deleteFeedback.message}
                    </div>
                )}
                <PageActions>
                    <div className="relative flex-1 max-w-xs">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search projects…"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm transition-all"
                    >
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                </PageActions>

                <Card>
                    <div className="responsive-table-container custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">Project</th>
                                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200 hide-on-mobile-th">Manager</th>
                                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">Lifecycle Stage</th>
                                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">Health</th>
                                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200 hide-on-mobile-th">Due Date</th>
                                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-16 text-center text-slate-400">
                                            <Search size={32} className="mx-auto mb-3 opacity-30" />
                                            <p className="font-semibold">No projects found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((project) => (
                                        <tr key={project.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">{project.name}</td>
                                            <td className="px-5 py-4 text-slate-600 dark:text-slate-400 hide-on-mobile">{project.manager}</td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColor[project.lifecycle_stage] || stageColor['Planning']}`}>
                                                    {project.lifecycle_stage}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4"><Badge variant={healthVariant(project.status)}>{project.status}</Badge></td>
                                            <td className="px-5 py-4 text-slate-500 tabular-nums hide-on-mobile">{project.due_date}</td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/project/${project.id}`)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <ExternalLink size={13} /> Details
                                                    </button>
                                                    {canCreate && (
                                                        <button
                                                            onClick={() => handleDelete(project)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                            title="Delete project"
                                                        >
                                                            <Trash2 size={13} /> Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {filtered.length > PAGE_SIZE && (
                        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                            <span className="text-xs text-slate-500">
                                Showing {(safeCurrentPage - 1) * PAGE_SIZE + 1}–{Math.min(safeCurrentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
                            </span>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setPage(p => p - 1)} disabled={safeCurrentPage === 1} className="p-2 rounded-lg text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-colors shadow-sm"><ChevronLeft size={16} /></button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                    <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${n === safeCurrentPage ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'}`}>{n}</button>
                                ))}
                                <button onClick={() => setPage(p => p + 1)} disabled={safeCurrentPage === totalPages} className="p-2 rounded-lg text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-colors shadow-sm"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    )}
                </Card>
            </PageContent>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Create New Project">
                <form onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Project Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter project name"
                                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-900 dark:text-slate-100 placeholder-slate-400 ${formErrors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'}`}
                            />
                            {formErrors.name && <p className="mt-1 text-xs text-rose-500">{formErrors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Brief project description"
                                rows={3}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Start Date *</label>
                            <input
                                type="date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-900 dark:text-slate-100 ${formErrors.start_date ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'}`}
                            />
                            {formErrors.start_date && <p className="mt-1 text-xs text-rose-500">{formErrors.start_date}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Owner *</label>
                            <input
                                type="text"
                                name="manager"
                                value={formData.manager}
                                onChange={handleInputChange}
                                placeholder="Project owner / manager"
                                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-900 dark:text-slate-100 placeholder-slate-400 ${formErrors.manager ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'}`}
                            />
                            {formErrors.manager && <p className="mt-1 text-xs text-rose-500">{formErrors.manager}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Lifecycle Stage *</label>
                            <select
                                name="lifecycle_stage"
                                value={formData.lifecycle_stage}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-900 dark:text-slate-100 cursor-pointer ${formErrors.lifecycle_stage ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'}`}
                            >
                                {LIFECYCLE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            {formErrors.lifecycle_stage && <p className="mt-1 text-xs text-rose-500">{formErrors.lifecycle_stage}</p>}
                        </div>
                        {formErrors.submit && (
                            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm">
                                {formErrors.submit}
                            </div>
                        )}
                        {submitStatus === 'success' && (
                            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm">
                                Project created successfully.
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <Button type="button" variant="ghost" onClick={handleCloseModal} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? <><Loader2 size={16} className="animate-spin mr-2 inline" /> Creating...</> : 'Create Project'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </PageLayout>
    );
};

export default Projects;
