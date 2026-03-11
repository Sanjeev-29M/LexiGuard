"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function DocumentSummaryPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;
    const [doc, setDoc] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchDoc = async () => {
            const token = localStorage.getItem("access_token");
            try {
                const res = await fetch(`${API_BASE}/api/documents/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setDoc(data);
                } else {
                    const errorData = await res.json();
                    setError(errorData.detail || "Failed to fetch document summary.");
                }
            } catch (err) {
                console.error(err);
                setError("An error occurred while fetching the document.");
            } finally {
                setLoading(false);
            }
        };
        fetchDoc();
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-[var(--background)] text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-sm font-medium animate-pulse">Generating AI report #{id}...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center h-screen bg-[var(--background)] p-6">
            <div className="max-w-md w-full bg-[var(--card-bg)] border border-red-500/30 p-8 rounded-3xl text-center shadow-2xl">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Access Denied / Error</h2>
                <p className="text-slate-400 text-sm mb-6">{error}</p>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all text-sm font-semibold"
                >
                    Go Back
                </button>
            </div>
        </div>
    );

    if (!doc || !doc.analysis_data?.ai_insights) return (
        <div className="flex items-center justify-center h-screen bg-[var(--background)] p-6">
            <div className="max-w-md w-full bg-[var(--card-bg)] border border-[var(--card-border)] p-8 rounded-3xl text-center">
                <h2 className="text-xl font-bold text-white mb-2">No Analysis Found</h2>
                <p className="text-slate-400 text-sm">This document has not been analyzed yet.</p>
            </div>
        </div>
    );

    const insights = doc.analysis_data.ai_insights;

    return (
        <div className="min-h-screen bg-[var(--background)] p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <button onClick={() => router.back()} className="text-xs font-bold text-blue-500 mb-4 hover:underline flex items-center gap-1">
                            ← BACK TO REPORTS
                        </button>
                        <h1 className="text-3xl font-bold text-white">Document Analysis</h1>
                    </div>
                    <div className="text-right">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-black tracking-widest uppercase mb-2 inline-block">IDOR DEMO MODE</span>
                    </div>
                </div>

                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl overflow-hidden shadow-2xl animate-fade-up-blur">
                    {/* Report Header */}
                    <div className="p-8 border-b border-[var(--card-border)] bg-gradient-to-r from-blue-500/5 to-transparent">
                        <div className="flex justify-between items-start">
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

                    <div className="p-8 space-y-10">
                        {/* Summary Section */}
                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    Risk Intelligence
                                </h3>
                                <div className="text-slate-300 leading-relaxed text-sm bg-[var(--background)]/50 p-6 rounded-2xl border border-[var(--card-border)] shadow-inner">
                                    {insights.risk_explanation_summary || "Automated risk intelligence unavailable."}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    Plain Language Translation
                                </h3>
                                <div className="text-slate-300 leading-relaxed text-sm bg-[var(--background)]/50 p-6 rounded-2xl border border-[var(--card-border)] shadow-inner">
                                    {insights.plain_language_explanation || "Simplified translation unavailable."}
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
            </div>
        </div>
    );
}
