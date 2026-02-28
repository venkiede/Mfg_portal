import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import Compliance from './pages/Compliance';
import ProjectTracking from './pages/ProjectTracking';
import ProductionVisibility from './pages/ProductionVisibility';
import QualityManagement from './pages/QualityManagement';
import SupplyChain from './pages/SupplyChain';
import AfterSales from './pages/AfterSales';
import Collaboration from './pages/Collaboration';
import Login from './pages/Login';
// Admin pages
import AdminPanel from './pages/admin/AdminPanel';
import UserManagement from './pages/admin/UserManagement';
import SystemLogs from './pages/admin/SystemLogs';
import ApprovalCenter from './pages/admin/ApprovalCenter';
import './App.css';

function RequireAuth({ children }) {
    const { user } = useContext(AuthContext);
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

function RequireAdmin({ children }) {
    const { user } = useContext(AuthContext);
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'Admin') return <Navigate to="/" replace />;
    return children;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
                <RequireAuth>
                    <NotificationProvider>
                        <Layout />
                    </NotificationProvider>
                </RequireAuth>
            }>
                {/* Standard routes */}
                <Route index element={<Dashboard />} />
                <Route path="project/:id" element={<ProjectDetail />} />
                <Route path="projects" element={<Projects />} />
                <Route path="compliance" element={<Compliance />} />
                <Route path="project-tracking" element={<ProjectTracking />} />
                <Route path="production" element={<ProductionVisibility />} />
                <Route path="quality" element={<QualityManagement />} />
                <Route path="supply-chain" element={<SupplyChain />} />
                <Route path="after-sales" element={<AfterSales />} />
                <Route path="collaboration" element={<Collaboration />} />

                {/* Admin-only routes — wrapped with RequireAdmin */}
                <Route path="admin" element={
                    <RequireAdmin><AdminPanel /></RequireAdmin>
                } />
                <Route path="admin/users" element={
                    <RequireAdmin><UserManagement /></RequireAdmin>
                } />
                <Route path="admin/logs" element={
                    <RequireAdmin><SystemLogs /></RequireAdmin>
                } />
                <Route path="admin/approvals" element={
                    <RequireAdmin><ApprovalCenter /></RequireAdmin>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
