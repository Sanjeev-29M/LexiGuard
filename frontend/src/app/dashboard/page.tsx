"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import API_BASE from "@/lib/api";

export default function DashboardOverview() {
    const [stats, setStats] = useState({ total: 0, processed: 0, riskAlerts: 0, pending: 0 });
    const [recentDocs, setRecentDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) return;

            try {
                // Fetch Stats
                const statsRes = await fetch(`${API_BASE}/api/documents/stats/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }

                // Fetch Recent Activity (last 5 docs)
                const docsRes = await fetch(`${API_BASE}/api/documents/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (docsRes.ok) {
                    const docsData = await docsRes.json();
                    setRecentDocs(docsData.slice(0, 5));
                }
            } catch (err) {
                console.error("Dashboard fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="p-10 max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold mb-2 tracking-tight">Dashboard</h1>
                    <p className="text-[var(--text-muted)]">Welcome back! Here's your legal document overview.</p>
                </div>
                <Link href="/dashboard/analyze" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    New Document
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-4 gap-6 mb-10">
                <div className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <div>
                        <p className="text-[var(--text-muted)] text-xs">Total Documents</p>
                        <p className="text-2xl font-bold text-[var(--foreground)]">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <div>
                        <p className="text-[var(--text-muted)] text-xs">Processed Today</p>
                        <p className="text-2xl font-bold text-[var(--foreground)]">{stats.processed}</p>
                    </div>
                </div>
                <div className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <div>
                        <p className="text-[var(--text-muted)] text-xs">Risk Alerts</p>
                        <p className="text-2xl font-bold text-[var(--foreground)]">{stats.riskAlerts}</p>
                    </div>
                </div>
                <div className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                        <p className="text-[var(--text-muted)] text-xs">Pending Review</p>
                        <p className="text-2xl font-bold text-[var(--foreground)]">{stats.pending}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8 mb-10">
                <div className="col-span-1 space-y-4">
                    <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">Quick Actions</h2>

                    <Link href="/dashboard/analyze" className="block p-5 bg-[var(--card-bg)] border-[var(--card-border)] rounded-xl hover:bg-[var(--nav-active)] transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-500 text-[var(--foreground)] flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-[var(--foreground)]">Analyze Document</h3>
                                <p className="text-xs text-[var(--text-muted)] mt-1">Upload and analyze a new legal document</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/dashboard/documents" className="block p-5 bg-[var(--card-bg)] border-[var(--card-border)] rounded-xl hover:bg-[var(--nav-active)] transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-violet-500 text-[var(--foreground)] flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-[var(--foreground)]">View Documents</h3>
                                <p className="text-xs text-[var(--text-muted)] mt-1">Manage your uploaded documents</p>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="col-span-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-[var(--foreground)]">Recent Activity</h2>
                        <Link href="/dashboard/documents" className="text-sm text-blue-400 hover:text-blue-300">View all</Link>
                    </div>

                    <div className="flex-1">
                        {recentDocs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-[var(--card-border)]">
                                <svg className="w-12 h-12 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                <p className="text-[var(--text-muted)] text-sm">No recent activity. Upload your first document to get started!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentDocs.map((doc) => (
                                    <Link
                                        key={doc.id}
                                        href="/dashboard/summary"
                                        className="flex items-center justify-between p-4 bg-[var(--background)] border border-[var(--card-border)] rounded-xl hover:bg-[var(--nav-active)] transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[var(--foreground)] truncate max-w-[200px]">{doc.file_name}</p>
                                                <p className="text-[11px] text-[var(--text-muted)]">{doc.document_type || "Commercial Lease"}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xs font-bold ${doc.risk_level === 'High' ? 'text-red-400' : doc.risk_level === 'Medium' ? 'text-orange-400' : 'text-emerald-400'}`}>
                                                {doc.risk_level} Risk
                                            </p>
                                            <p className="text-[10px] text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
