import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, ArrowLeft, UserPlus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { AuthContext } from '../../context/AuthContext';
import { PageLayout, PageHeader, PageActions, PageContent } from '../../components/ui/PageLayout';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

import dataService from '../../services/dataService';

const ROLES = ['Admin', 'Engineer', 'Viewer', 'Customer'];
const PAGE_SIZE = 6;

const UserManagement = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [editId, setEditId] = useState(null);
    const [editRole, setEditRole] = useState('');
    const [page, setPage] = useState(1);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        role: 'Viewer',
        department: 'General'
    });

    const fetchUsers = useCallback(async () => {
        try {
            const data = await dataService.getUsers(currentUser?.role);
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentUser?.role]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filtered = users.filter(u =>
        (roleFilter === 'All' || u.role === roleFilter) &&
        (u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.role.toLowerCase().includes(search.toLowerCase()))
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const cur = Math.min(page, totalPages);
    const paged = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

    const handleAddUser = (e) => {
        e.preventDefault();
        const userToAdd = {
            ...newUser,
            id: users.length + 1,
            status: 'Active',
            last_login: 'Never'
        };
        setUsers([userToAdd, ...users]);
        setIsModalOpen(false);
        setNewUser({ name: '', email: '', role: 'Viewer', department: 'General' });
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await dataService.deleteUser(id, currentUser?.role);
            fetchUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    const updateUser = async (id, payload) => {
        try {
            await dataService.updateUser(id, payload, currentUser?.role);
            fetchUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    const toggleStatus = (u) => {
        const newStatus = u.status === 'Active' ? 'Inactive' : 'Active';
        updateUser(u.id, { status: newStatus });
    };

    const startEdit = u => { setEditId(u.id); setEditRole(u.role); };
    const saveEdit = id => { updateUser(id, { role: editRole }); setEditId(null); };

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;
    if (error) return <div className="p-8 text-center text-rose-500 font-medium">Error: {error}</div>;

    return (
        <PageLayout>
            <PageHeader
                title="User Governance"
                subtitle="Administer system access, modify security roles, and manage account lifecycles."
                backTo="/admin"
            />

            <PageContent>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        ['Total Users', users.length, 'text-blue-600', 'bg-blue-50 dark:bg-blue-900/20'],
                        ['Active Access', users.filter(u => u.status === 'Active').length, 'text-emerald-600', 'bg-emerald-50 dark:bg-emerald-900/20'],
                        ['Inactive/Locked', users.filter(u => u.status === 'Inactive').length, 'text-rose-600', 'bg-rose-50 dark:bg-rose-900/20'],
                        ['Defined Roles', ROLES.length, 'text-violet-600', 'bg-violet-50 dark:bg-violet-900/20'],
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
                        <input placeholder="Search users by name, email, or role…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="pl-9 pr-4 py-2.5 w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm transition-all" />
                    </div>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <UserPlus size={18} className="mr-2" /> Add New User
                    </Button>
                </PageActions>

                {/* Users Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">User</th>
                                    <th className="px-5 py-4 font-semibold text-center">Department</th>
                                    <th className="px-5 py-4 font-semibold">Role</th>
                                    <th className="px-5 py-4 font-semibold">Last Login</th>
                                    <th className="px-5 py-4 font-semibold">Status</th>
                                    <th className="px-5 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {paged.length === 0 ? (
                                    <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">No users found match your search.</td></tr>
                                ) : paged.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</div>
                                                    <div className="text-xs text-slate-400 font-normal">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center text-slate-600 dark:text-slate-400">
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-medium text-slate-500">{u.department}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {editId === u.id ? (
                                                <div className="flex items-center gap-2">
                                                    <select value={editRole} onChange={e => setEditRole(e.target.value)}
                                                        className="text-xs border border-blue-400 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                                                        {ROLES.map(r => <option key={r}>{r}</option>)}
                                                    </select>
                                                    <button onClick={() => saveEdit(u.id)} className="text-xs text-blue-600 font-bold hover:underline">Save</button>
                                                    <button onClick={() => setEditId(null)} className="text-xs text-slate-400 font-medium hover:underline">Cancel</button>
                                                </div>
                                            ) : (
                                                <Badge>{u.role}</Badge>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 tabular-nums">{u.last_login}</td>
                                        <td className="px-5 py-4">
                                            <Badge variant={u.status === 'Active' ? 'success' : 'danger'}>{u.status}</Badge>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button title="Toggle status" onClick={() => toggleStatus(u)}
                                                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                                                    {u.status === 'Active'
                                                        ? <ToggleRight size={20} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                                                        : <ToggleLeft size={20} className="text-slate-300 group-hover:scale-110 transition-transform" />}
                                                </button>
                                                <button title="Edit role" onClick={() => startEdit(u)}
                                                    className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors group">
                                                    <Pencil size={16} className="group-hover:scale-110 transition-transform" />
                                                </button>
                                                <button title="Delete" onClick={() => deleteUser(u.id)}
                                                    className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 transition-colors group">
                                                    <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                                                </button>
                                            </div>
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

            {/* Add User Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New User"
            >
                <form onSubmit={handleAddUser} className="space-y-5">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                            <input
                                required
                                type="text"
                                value={newUser.name}
                                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-slate-100 transition-all"
                                placeholder="Enter user's full name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                            <input
                                required
                                type="email"
                                value={newUser.email}
                                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-slate-100 transition-all"
                                placeholder="user@company.com"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
                                <select
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-slate-100 cursor-pointer"
                                >
                                    {ROLES.map(r => <option key={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Department</label>
                                <input
                                    required
                                    type="text"
                                    value={newUser.department}
                                    onChange={e => setNewUser({ ...newUser, department: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-slate-100 transition-all"
                                    placeholder="e.g. QA, Ops, Engineering"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Create User
                        </Button>
                    </div>
                </form>
            </Modal>
        </PageLayout>
    );
};

export default UserManagement;
