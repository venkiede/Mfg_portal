import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ScrollText, CheckSquare, Shield } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { PageLayout, PageHeader, PageContent } from '../../components/ui/PageLayout';

const TILES = [
    {
        path: '/admin/users',
        label: 'User Management',
        desc: 'Add, edit roles, activate or deactivate users',
        icon: Users,
        color: 'text-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
        path: '/admin/logs',
        label: 'System Logs',
        desc: 'Global audit trail across all modules',
        icon: ScrollText,
        color: 'text-violet-600',
        bg: 'bg-violet-50 dark:bg-violet-900/20',
    },
    {
        path: '/admin/approvals',
        label: 'Approval Center',
        desc: 'Approve stage changes, ECOs, quality closures',
        icon: CheckSquare,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
];

const AdminPanel = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <PageLayout>
            <PageHeader
                title="Portal Administration"
                subtitle="System-level configuration, user governance, and global audit trails."
            />

            <PageContent>
                {/* Admin identity strip */}
                <Card className="bg-blue-600 border-none shadow-lg shadow-blue-200 dark:shadow-none mb-2 overflow-hidden">
                    <div className="flex items-center gap-4 px-6 py-5 text-white bg-gradient-to-r from-blue-600 to-indigo-700">
                        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-black shrink-0 border border-white/30 backdrop-blur-md">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-lg font-bold tracking-tight">{user.name}</p>
                            <p className="text-xs text-blue-100 font-medium opacity-80 uppercase tracking-widest">Administrator</p>
                        </div>
                        <div className="ml-auto hidden md:block">
                            <Shield size={40} className="text-white/10" />
                        </div>
                    </div>
                </Card>

                {/* Module tiles */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TILES.map(tile => {
                        const Icon = tile.icon;
                        return (
                            <button
                                key={tile.path}
                                onClick={() => navigate(tile.path)}
                                className="text-left group"
                            >
                                <Card className="h-full border border-slate-200 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                                    <div className="p-8">
                                        <div className={`inline-flex p-3.5 rounded-2xl ${tile.bg} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon size={24} className={tile.color} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {tile.label}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{tile.desc}</p>
                                    </div>
                                </Card>
                            </button>
                        );
                    })}
                </div>
            </PageContent>
        </PageLayout>
    );
};

export default AdminPanel;
