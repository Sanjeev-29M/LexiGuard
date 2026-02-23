"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import API_BASE from "@/lib/api";

interface DocumentData {
    id: number;
    file_name: string;
    document_type: string;
    risk_level: string;
    overall_risk_score: number;
    created_at: string;
    status: string;
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<DocumentData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDocs = async () => {
            const token = localStorage.getItem("access_token");
            try {
                const res = await fetch(`${API_BASE}/api/documents/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setDocuments(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, []);

    if (loading) return <div className="p-10 flex justify-center">Loading documents...</div>;

    return (
        <div className="p-10 max-w-7xl mx-auto w-full pb-24">
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-2">My Documents</h1>
                <p className="text-[var(--text-muted)]">View and manage all your uploaded legal documents.</p>
            </div>

            {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-12 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl">
                    <svg className="w-16 h-16 text-slate-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1.001.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <h3 className="text-xl font-semibold mb-2">No documents found</h3>
                    <p className="text-[var(--text-muted)] mb-6">You haven't uploaded any documents for analysis yet.</p>
                    <a href="/dashboard/analyze" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium">Upload Document</a>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map((doc) => (
                        <Link
                            key={doc.id}
                            href={`/dashboard/summary#doc-${doc.id}`}
                            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 hover:bg-[var(--nav-active)] transition-all group block cursor-pointer hover:shadow-lg hover:border-blue-500/30"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1.001.293.707V19a2 2 0 01-2 2z"></path></svg>
                                </div>
                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${doc.risk_level === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                    doc.risk_level === 'Medium' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    }`}>
                                    {doc.risk_level} Risk
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-[var(--foreground)] mb-1 truncate" title={doc.file_name}>{doc.file_name}</h3>
                            <p className="text-sm text-[var(--text-muted)] mb-4">{doc.document_type || "Document Type Unknown"}</p>

                            <div className="pt-4 border-t border-[var(--card-border)] flex justify-between items-center">
                                <span className="text-xs text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-[var(--text-muted)]">Score:</span>
                                    <span className={`text-sm font-bold ${doc.risk_level === 'High' ? 'text-red-500' :
                                        doc.risk_level === 'Medium' ? 'text-orange-400' :
                                            'text-emerald-400'
                                        }`}>{doc.overall_risk_score}/100</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
