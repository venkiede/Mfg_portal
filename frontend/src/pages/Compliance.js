import { ShieldCheck, AlertTriangle, XCircle, Download, FileCheck, ClipboardList, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PageLayout, PageHeader, PageActions, PageContent } from '../components/ui/PageLayout';
import React, { useState, useEffect, useContext } from "react";
import { jsPDF } from "jspdf";
import { AuthContext } from '../context/AuthContext';
import { Modal } from '../components/ui/Modal';
import dataService from '../services/dataService';
import { downloadCsv } from '../utils/csvExport';

const AUDITS = [
    { date: '2026-01-14', type: 'Internal Audit', findings: 2, status: 'Closed' },
    { date: '2025-11-05', type: 'External Audit', findings: 0, status: 'Passed' },
    { date: '2025-09-20', type: 'Supplier Audit', findings: 5, status: 'Open' },
];

const statusVariant = (s) => {
    if (s === 'On Track' || s === 'Closed' || s === 'Passed') return 'success';
    if (s === 'At Risk' || s === 'Open') return 'warning';
    return 'danger';
};

const Compliance = () => {
    const { user } = useContext(AuthContext);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloadError, setDownloadError] = useState(null);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await dataService.getQualityManagement();
                setRecords(data.filter(i => i.type === 'Certification') || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const total = records.length;
    const expiring = records.filter(c => c.status === 'At Risk').length;
    const expired = records.filter(c => c.status === 'Delayed').length;

    const handleDownload = async () => {
        setDownloadError(null);
        if (!user?.id) {
            setDownloadError('Please log in to download.');
            return;
        }
        try {
            await dataService.downloadComplianceBundle(user.id);
        } catch (err) {
            setDownloadError(err.message || 'Download failed');
        }
    };

    const handleDownloadCertificate = (cert) => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;

        // ─── Border ───
        doc.setLineWidth(1);
        doc.setDrawColor(44, 62, 80);
        doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));

        doc.setLineWidth(0.3);
        doc.rect(margin + 2, margin + 2, pageWidth - (margin * 2) - 4, pageHeight - (margin * 2) - 4);

        // ─── Content ───
        let y = 50;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(28);
        doc.setTextColor(44, 62, 80);
        doc.text("Nexgile Manufacturing Pvt Ltd", pageWidth / 2, y, { align: "center" });

        y += 20;
        doc.setFontSize(22);
        doc.setTextColor(52, 73, 94);
        doc.text("Compliance Certification", pageWidth / 2, y, { align: "center" });

        y += 15;
        doc.setDrawColor(200, 200, 200);
        doc.line(pageWidth / 2 - 40, y, pageWidth / 2 + 40, y);

        y += 20;
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text("This is to certify that", pageWidth / 2, y, { align: "center" });

        y += 12;
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(cert.title || "N/A", pageWidth / 2, y, { align: "center" });

        y += 12;
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text(`Complies with the standard: ${cert.standard || "N/A"}`, pageWidth / 2, y, { align: "center" });

        y += 20;
        doc.setFontSize(12);
        doc.text(`Issued Date: ${new Date().toLocaleDateString()}`, pageWidth / 2 - 40, y, { align: "center" });
        doc.text(`Expiry Date: ${cert.expiry_date || "N/A"}`, pageWidth / 2 + 40, y, { align: "center" });

        y += 30;
        doc.setDrawColor(100, 100, 100);
        doc.line(pageWidth / 2 - 30, y, pageWidth / 2 + 30, y);
        y += 5;
        doc.setFontSize(10);
        doc.text("Authorized Signature", pageWidth / 2, y, { align: "center" });

        doc.setLineWidth(0.5);
        doc.setDrawColor(44, 62, 80);
        doc.circle(pageWidth - 45, pageHeight - 45, 15);
        doc.setFontSize(8);
        doc.text("OFFICIAL", pageWidth - 45, pageHeight - 46, { align: "center" });
        doc.text("SEAL", pageWidth - 45, pageHeight - 42, { align: "center" });

        const fileName = `certificate_${cert.title.replace(/\s+/g, '_')}.pdf`;
        doc.save(fileName);
    };

    const handleViewCertificate = (cert) => {
        setSelectedCertificate(cert);
        setIsModalOpen(true);
    };

    const handleExport = () => {
        try {
            const columns = ['title', 'standard', 'expiry_date', 'status', 'owner', 'issued_by'];
            downloadCsv(records, 'compliance_register', columns);
        } catch (err) {
            console.error('CSV export failed:', err);
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
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">Compliance Feed Offline</h2>
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
                title="Compliance & Certification"
                subtitle="Certification status and audit trail overview."
            />

            <PageContent>
                {/* Summary KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <div className="p-6 flex items-center gap-4 bg-blue-50 dark:bg-blue-900/10 h-full">
                            <div className="p-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200/50 dark:shadow-none">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 opacity-80">Total Certificates</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">{total}</p>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="p-6 flex items-center gap-4 bg-amber-50 dark:bg-amber-900/10 h-full">
                            <div className="p-3 rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-200/50 dark:shadow-none">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 opacity-80">Expiring Soon</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">{expiring}</p>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="p-6 flex items-center gap-4 bg-rose-50 dark:bg-rose-900/10 h-full">
                            <div className="p-3 rounded-xl bg-rose-500 text-white shadow-lg shadow-rose-200/50 dark:shadow-none">
                                <XCircle size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 opacity-80">Expired / Delayed</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">{expired}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Actions */}
                <PageActions>
                    <div className="flex-1" />
                    {downloadError && (
                        <span className="text-sm text-rose-600 dark:text-rose-400 font-medium">{downloadError}</span>
                    )}
                    <Button onClick={handleExport} variant="ghost" className="shadow-sm">
                        <Download size={15} className="mr-2" /> Export CSV
                    </Button>
                    <Button onClick={handleDownload} variant="secondary" className="shadow-sm">
                        <ShieldCheck size={15} className="mr-2" /> Download Bundle
                    </Button>
                </PageActions>

                {/* Certificates Table */}
                <Card className="overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/20">
                        <FileCheck size={17} className="text-blue-600" />
                        <h2 className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">Certification Register</h2>
                    </div>
                    <div className="responsive-table-container custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">Certificate Name</th>
                                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200 text-center hide-on-mobile-th">Standard</th>
                                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">Expiry Date</th>
                                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200 text-center">Status</th>
                                    <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {records.map((cert) => (
                                    <tr key={cert.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">{cert.title}</td>
                                        <td className="px-5 py-4 text-center hide-on-mobile">
                                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                                                {cert.standard}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 tabular-nums">{cert.expiry_date}</td>
                                        <td className="px-5 py-4 text-center"><Badge variant={statusVariant(cert.status)}>{cert.status}</Badge></td>
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                onClick={() => handleViewCertificate(cert)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-white transition-all shadow-sm"
                                            >
                                                <Download size={13} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Audit Trail */}
                <Card className="overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/20">
                        <ClipboardList size={17} className="text-blue-600" />
                        <h2 className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">Recent Audits</h2>
                    </div>
                    <div className="responsive-table-container custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-4 table-header">Date</th>
                                    <th className="px-5 py-4 table-header">Audit Type</th>
                                    <th className="px-5 py-4 table-header text-center hide-on-mobile-th">Findings</th>
                                    <th className="px-5 py-4 table-header text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {AUDITS.map((audit, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-4 table-cell tabular-nums">{audit.date || "N/A"}</td>
                                        <td className="px-5 py-4 table-cell font-medium text-slate-900 dark:text-slate-100">{audit.type || "N/A"}</td>
                                        <td className="px-5 py-4 text-center table-cell hide-on-mobile">
                                            {audit.findings} finding{audit.findings !== 1 ? 's' : ''}
                                        </td>
                                        <td className="px-5 py-4 text-center"><Badge variant={statusVariant(audit.status)}>{audit.status || "N/A"}</Badge></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </PageContent>

            {/* Certificate Preview Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Certificate Preview"
                className="max-w-[700px] w-[90%] max-h-[85vh]"
            >
                {selectedCertificate && (
                    <div className="flex flex-col h-full max-h-[calc(85vh-8rem)]">
                        <div className="flex-1 overflow-y-auto p-2 sm:p-6 bg-slate-50/30 dark:bg-slate-900/10">
                            <div className="transform scale-[0.85] sm:scale-90 origin-top transition-transform duration-300">
                                <div className="border-8 border-double border-slate-200 p-8 text-center bg-white dark:bg-slate-800/40 rounded-lg relative overflow-hidden shadow-sm">
                                    {/* Watermark/Seal Placeholder */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                                        <ShieldCheck size={300} />
                                    </div>

                                    <div className="space-y-8 relative z-10">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-1">
                                                Nexgile Manufacturing Pvt Ltd
                                            </h2>
                                            <div className="h-px w-24 bg-blue-500 mx-auto" />
                                        </div>

                                        <div>
                                            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">
                                                Compliance Certification
                                            </h1>
                                            <p className="text-sm text-slate-500 italic">This is to certify that</p>
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                                {selectedCertificate.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                                                has been successfully verified and complies with the following industry standard:
                                            </p>
                                            <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-2">
                                                {selectedCertificate.standard}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8 pt-4">
                                            <div className="text-left border-l-2 border-slate-200 pl-4">
                                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Issued Date</p>
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                                                    {new Date().toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right border-r-2 border-slate-200 pr-4">
                                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Expiry Date</p>
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                                                    {selectedCertificate.expiry_date}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-10 flex items-end justify-between px-4">
                                            <div className="text-center">
                                                <div className="w-32 h-px bg-slate-300 mb-2" />
                                                <p className="text-[10px] text-slate-400 uppercase font-bold">Authorized Signature</p>
                                            </div>

                                            <div className="h-16 w-16 border-2 border-blue-600/20 rounded-full flex items-center justify-center -rotate-12">
                                                <div className="text-[8px] font-black text-blue-600/40 text-center leading-none uppercase">
                                                    Official<br />Seal
                                                </div>
                                            </div>

                                            <div className="text-center">
                                                <p className="text-[9px] font-mono text-slate-300 uppercase">Cert ID: CERT-{selectedCertificate.id || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end items-center gap-3 p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-xs font-bold uppercase tracking-wider">
                                Close
                            </Button>
                            <Button
                                onClick={() => handleDownloadCertificate(selectedCertificate)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-500/20"
                            >
                                <Download size={14} className="mr-2" /> Download Certificate
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </PageLayout>
    );
};

export default Compliance;
