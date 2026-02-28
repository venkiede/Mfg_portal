import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ArrowLeft, RefreshCw, AlertTriangle, Calendar, User, Clock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { Modal } from '../components/ui/Modal';
import { PageLayout, PageHeader, PageActions, PageContent } from '../components/ui/PageLayout';
import HistoryTimeline from '../components/HistoryTimeline';

import dataService from '../services/dataService';

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Action States
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchProject = useCallback(async () => {
        setLoading(true);
        try {
            const data = await dataService.getProjectById(id, user.id);
            setProject(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }, [id, user.id]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    const updateStatus = async () => {
        setIsUpdating(true);
        const nextStatus = project.status === "On Track" ? "At Risk" : "Delayed";
        try {
            await dataService.updateProject(id, { status: nextStatus }, user.id);
            await fetchProject();
            setIsStatusModalOpen(false);
        } catch (e) {
            console.error(e);
            alert("Update failed: " + e.message);
        } finally {
            setIsUpdating(false);
        }
    }

    if (loading) return <Loader />;

    if (error) return (
        <PageLayout>
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-20 w-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 border border-rose-100 shadow-sm">
                    <AlertTriangle size={36} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">Access Denied or Not Found</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">{error}</p>
                <Button onClick={() => navigate(-1)} variant="secondary" className="px-8 shadow-sm">
                    <ArrowLeft size={16} className="mr-2" /> Back to Safety
                </Button>
            </div>
        </PageLayout>
    );

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'history', label: 'Activity History' }
    ];

    return (
        <PageLayout>
            {/* Standardized Header Section */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <PageHeader
                    title={project.name}
                    subtitle={`Governance and lifecycle tracking for ${project.name}. Managed by ${project.manager}.`}
                    backTo="/dashboard"
                    icon={<Badge className="px-3 py-1 font-bold">{project.status}</Badge>}
                />

                <PageActions>
                    <Button
                        variant="secondary"
                        onClick={async () => {
                            try {
                                await dataService.downloadProjectBundle(project.id, user.id);
                            } catch (e) {
                                alert('Download failed: ' + (e.message || 'Unknown error'));
                            }
                        }}
                        className="shadow-sm"
                    >
                        <Download size={16} className="mr-2" /> Download Bundle
                    </Button>
                    {(user.permissions?.includes("edit_projects") || user.permissions?.includes("all")) && (
                        <Button
                            variant="secondary"
                            onClick={() => setIsStatusModalOpen(true)}
                            className="shadow-sm"
                        >
                            <RefreshCw size={16} className="mr-2" /> Change Status
                        </Button>
                    )}
                </PageActions>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs font-bold uppercase tracking-widest text-slate-400 -mt-4 mb-2">
                <span className="flex items-center"><User size={14} className="mr-2 opacity-70" /> {project.manager}</span>
                <span className="flex items-center"><Calendar size={14} className="mr-2 opacity-70" /> Due {project.due_date}</span>
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded tracking-normal">ID: {project.id}</span>
            </div>

            <PageContent>
                {/* Tabs */}
                <div className="border-b border-slate-200 dark:border-slate-800">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    relative py-4 px-1 text-sm font-bold tracking-tight transition-colors outline-none
                                    ${activeTab === tab.id
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                                    }
                                `}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'overview' ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="md:col-span-2 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />
                                    <CardHeader>
                                        <CardTitle>Core Project Intelligence</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-8">
                                        <div className="grid grid-cols-2 gap-y-8 gap-x-6">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Technical ID</p>
                                                <p className="font-mono text-slate-900 dark:text-slate-100">#{project.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Portfolio Health</p>
                                                <Badge>{project.status}</Badge>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Provisioned On</p>
                                                <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center">
                                                    <Clock size={14} className="mr-2 text-slate-400" />
                                                    {new Date(project.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Last Audit Event</p>
                                                <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center">
                                                    <Clock size={14} className="mr-2 text-slate-400" />
                                                    {new Date(project.updated_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Milestone Progress</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col items-center justify-center space-y-6 py-4">
                                            <div className="relative h-36 w-36 flex items-center justify-center">
                                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                                    <circle
                                                        cx="72" cy="72" r="64"
                                                        className="stroke-slate-100 dark:stroke-slate-800"
                                                        strokeWidth="12" fill="none"
                                                    />
                                                    <motion.circle
                                                        cx="72" cy="72" r="64"
                                                        className={`
                                                            ${project.status === 'On Track' ? 'stroke-emerald-500' :
                                                                project.status === 'At Risk' ? 'stroke-amber-500' :
                                                                    project.status === 'Delayed' ? 'stroke-rose-500' : 'stroke-blue-500'}
                                                        `}
                                                        strokeWidth="12" fill="none"
                                                        strokeLinecap="round"
                                                        initial={{ strokeDasharray: "402.12", strokeDashoffset: "402.12" }}
                                                        animate={{ strokeDashoffset: 402.12 - (402.12 * project.progress) / 100 }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                    />
                                                </svg>
                                                <div className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">
                                                    {project.progress}%
                                                </div>
                                            </div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center leading-relaxed">
                                                Estimated Delivery<br />
                                                <span className="text-slate-900 dark:text-slate-200">{project.due_date}</span>
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Governance Audit Trail</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <HistoryTimeline history={project.status_history} changelog={project.change_log} />
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                </AnimatePresence>
            </PageContent>

            {/* Interactive Status Modal */}
            <Modal
                isOpen={isStatusModalOpen}
                onClose={() => !isUpdating && setIsStatusModalOpen(false)}
                title="Status Transition Authority"
            >
                <div className="space-y-6">
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        Authorized personnel only. Transitional logic for <strong>{project.name}</strong> will trigger portfolio reassessments.
                    </p>
                    <div className="flex bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl items-center gap-6 border border-slate-100 dark:border-slate-800 shadow-inner">
                        <div className="flex-1 text-center">
                            <Badge className="mb-2 block mx-auto w-max px-3 py-1 font-bold">{project.status}</Badge>
                            <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">Present</span>
                        </div>
                        <ArrowLeft size={16} className="text-slate-300 rotate-180 shrink-0" />
                        <div className="flex-1 text-center">
                            <Badge className="mb-2 block mx-auto w-max px-3 py-1 font-bold">{project.status === "On Track" ? "At Risk" : "Delayed"}</Badge>
                            <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">Target</span>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <Button
                        variant="ghost"
                        onClick={() => setIsStatusModalOpen(false)}
                        disabled={isUpdating}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={updateStatus}
                        isLoading={isUpdating}
                        className="shadow-lg shadow-blue-500/20"
                    >
                        Authorize Transition
                    </Button>
                </div>
            </Modal>
        </PageLayout>
    );
};

export default ProjectDetail;
