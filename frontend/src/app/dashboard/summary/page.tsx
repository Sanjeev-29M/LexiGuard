"use client";

import { useEffect, useState } from "react";
import API_BASE from "@/lib/api";

interface AIInsights {
    plain_language_explanation?: string;
    risk_explanation_summary?: string;
    suggested_improvements?: string[];
}

interface DocumentData {
    id: number;
    title: string;
    file_name?: string;
    uploaded_at: string;
    created_at?: string;
    analysis_data?: {
        ai_insights?: AIInsights;
    };
}

export default function SummaryPage() {
    const [documents, setDocuments] = useState<DocumentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchDocs = async () => {
            const token = localStorage.getItem("access_token");
            try {
                const res = await fetch(`${API_BASE}/api/documents/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    // Filter out docs without analysis data
                    const analyzedDocs = data.filter((doc: any) => doc.analysis_data);
                    setDocuments(analyzedDocs);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, []);

    const filteredDocs = documents.filter(doc =>
        doc.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="p-10 flex justify-center text-white">Generating AI reports...</div>;

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {/* Left Sidebar - Report Navigation */}
            <div className="w-80 border-r border-[var(--card-border)] bg-[var(--card-bg)] flex flex-col shrink-0">
                <div className="p-6 border-b border-[var(--card-border)]">
                    <h2 className="text-lg font-bold mb-4">Report Center</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search reports..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50"
                        />
                        <svg className="w-4 h-4 absolute right-3 top-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {filteredDocs.map(doc => (
                        <a
                            key={doc.id}
                            href={`#doc-${doc.id}`}
                            className="block p-3 rounded-lg hover:bg-[var(--nav-active)] transition-colors text-sm font-medium border border-transparent hover:border-[var(--card-border)]"
                        >
                            <div className="truncate text-[var(--foreground)]">{doc.file_name || doc.title}</div>
                            <div className="text-[10px] text-slate-500 mt-1">{new Date(doc.uploaded_at || doc.created_at || "").toLocaleDateString()}</div>
                        </a>
                    ))}
                    {filteredDocs.length === 0 && (
                        <p className="text-center text-xs text-slate-500 mt-10">No reports match your search.</p>
                    )}
                </div>
            </div>

            {/* Right Content - Report Details */}
            <div className="flex-1 overflow-y-auto bg-[var(--background)]">
                <div className="p-10 max-w-4xl mx-auto space-y-12 pb-32">
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold mb-2">Detailed AI Summaries</h1>
                        <p className="text-[var(--text-muted)]">Professional analysis and plain-English translations for all your legal assets.</p>
                    </div>

                    {documents.length === 0 ? (
                        <div className="p-20 text-center bg-[var(--card-bg)] border-[var(--card-border)] rounded-3xl">
                            <div className="w-16 h-16 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1.001.293.707V19a2 2 0 01-2 2z"></path></svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No Reports Available</h3>
                            <p className="text-slate-400">Head over to the Analyze section to generate your first professional report.</p>
                        </div>
                    ) : (
                        filteredDocs.map((doc) => {
                            const insights = doc.analysis_data?.ai_insights;
                            if (!insights) return null;

                            return (
                                <section
                                    key={doc.id}
                                    id={`doc-${doc.id}`}
                                    className="scroll-mt-10 animate-fade-up-blur group"
                                >
                                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                                        {/* Report Header */}
                                        <div className="p-8 border-b border-[var(--card-border)] bg-gradient-to-r from-blue-500/5 to-transparent">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-[10px] uppercase font-black tracking-widest text-blue-500 mb-2 block">Premium Analysis Report</span>
                                                    <h2 className="text-2xl font-bold text-[var(--foreground)]">{doc.file_name || doc.title}</h2>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-bold text-slate-500 mb-1">REF: #{doc.id}</div>
                                                    <div className="text-[11px] text-slate-600 font-medium">{new Date(doc.uploaded_at || doc.created_at || "").toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Report Sections */}
                                        <div className="p-8 space-y-10">
                                            {/* Summary Section */}
                                            <div className="grid md:grid-cols-2 gap-10">
                                                <div className="space-y-4">
                                                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                        Risk Intelligence
                                                    </h3>
                                                    <div className="text-slate-300 leading-relaxed text-sm bg-[var(--background)]/50 p-6 rounded-2xl border border-[var(--card-border)] shadow-inner">
                                                        {insights.risk_explanation_summary || "Automated risk intelligence unavailable for this document."}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                        Plain Language Translation
                                                    </h3>
                                                    <div className="text-slate-300 leading-relaxed text-sm bg-[var(--background)]/50 p-6 rounded-2xl border border-[var(--card-border)] shadow-inner">
                                                        {insights.plain_language_explanation || "Simplified translation unavailable for this document."}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Improvements Section */}
                                            {insights.suggested_improvements && insights.suggested_improvements.length > 0 && (
                                                <div className="pt-6 border-t border-[var(--card-border)]">
                                                    <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        Strategic Recommendations
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {insights.suggested_improvements.map((item: string, i: number) => (
                                                            <div key={i} className="flex gap-4 text-xs font-medium text-slate-300 bg-[var(--background)]/30 p-4 rounded-xl border border-[var(--card-border)] hover:bg-[var(--background)] transition-colors">
                                                                <span className="text-emerald-500 shrink-0 select-none">✓</span> {item}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
