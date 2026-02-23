"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API_BASE from "@/lib/api";

export default function AnalyzePage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        const storedTheme = localStorage.getItem("theme") as 'light' | 'dark' | null;
        if (storedTheme) setTheme(storedTheme);

        const handleThemeChange = () => {
            const newTheme = localStorage.getItem("theme") as 'light' | 'dark' || 'dark';
            setTheme(newTheme);
        };
        window.addEventListener('themeChange', handleThemeChange);
        return () => window.removeEventListener('themeChange', handleThemeChange);
    }, []);

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        setErrorMsg(null);
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("file_name", selectedFile.name);

        const token = localStorage.getItem("access_token");
        try {
            const res = await fetch(`${API_BASE}/api/documents/upload/`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setResult(data);
                setSelectedFile(null);
            } else {
                // Handle DRF validation errors or generic errors
                let msg = "An error occurred during upload.";

                // If we have an error AND a detail, prioritize the detail for AI failures
                if (data.error === "AI Analysis failed." && data.detail) {
                    msg = `AI Analysis failed: ${data.detail}`;
                } else if (data.error) {
                    msg = data.error;
                } else if (data.detail) {
                    msg = data.detail;
                } else if (typeof data === 'object') {
                    const firstKey = Object.keys(data)[0];
                    if (firstKey) msg = `${firstKey}: ${data[firstKey][0]}`;
                }
                setErrorMsg(msg);
            }
        } catch (err: any) {
            console.error("Fetch Error:", err);
            setErrorMsg("Network error. Please make sure the backend server is running.");
        } finally {
            setUploading(false);
        }
    };

    const roles = ["Tenant", "Landlord", "Employee", "Employer", "Buyer", "Seller", "Freelancer", "Client", "Other"];

    return (
        <div className="p-10 max-w-6xl mx-auto w-full pb-24">
            <style>{`
              @keyframes fadeUpBlur {
                0% { opacity: 0; transform: translateY(20px); filter: blur(8px); }
                100% { opacity: 1; transform: translateY(0); filter: blur(0px); }
              }
              .animate-fade-up-blur {
                opacity: 0;
                animation: fadeUpBlur 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
            `}</style>

            {!result ? (
                // Upload View
                <div className="space-y-8 animate-fade-up-blur">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 mx-auto bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-500/20">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold mb-3 tracking-tight">Document Analysis</h1>
                        <p className="text-[var(--text-muted)] text-lg">Upload a document for AI-powered legal analysis and risk assessment</p>
                    </div>

                    {/* Upload Zone */}
                    <div className="border border-dashed border-blue-500/30 bg-[var(--card-bg)] rounded-3xl p-16 text-center hover:bg-[var(--nav-active)] hover:border-blue-500/50 transition-all shadow-lg relative cursor-pointer group">
                        <input
                            type="file"
                            id="file-upload"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                        <div className="w-16 h-16 mx-auto bg-[var(--background)] text-blue-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(59,130,246,0.2)] border border-[var(--card-border)] group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Upload Document</h3>
                        <p className="text-[var(--text-muted)] mb-6">Choose a file from your computer</p>

                        <div className="inline-block px-8 py-3 bg-[var(--background)] hover:bg-[var(--nav-active)] text-blue-500 border border-blue-500/30 rounded-xl transition-colors font-medium shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                            {selectedFile ? selectedFile.name : "Choose File"}
                        </div>

                        <p className="text-slate-500 text-sm mt-8">Supports PDF, Word Documents (.doc, .docx), and Text files (.txt)<br />Maximum file size: 10MB</p>
                    </div>

                    {/* Role Selection */}
                    <div className="mt-8">
                        <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Select Your Role</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {roles.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRole(r)}
                                    className={`p-4 rounded-xl flex items-center justify-between border transition-all ${role === r
                                        ? "border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                                        : "bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-muted)] hover:bg-[var(--background)] hover:border-blue-500/30 hover:text-blue-500"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <svg className={`w-5 h-5 ${role === r ? 'text-blue-400' : 'opacity-70'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                        <span className="font-medium">{r}</span>
                                    </div>
                                    {role === r && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {errorMsg && (
                        <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-3">
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            {errorMsg}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex justify-end pt-6">
                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile || !role || uploading}
                            className={`px-8 py-3.5 font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2
                                ${theme === 'dark' ? 'bg-white text-black hover:bg-slate-200' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'}`}
                        >
                            {uploading ? "Analyzing with AI..." : "Start Analysis"}
                            {!uploading && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>}
                        </button>
                    </div>
                </div>
            ) : (
                // Results View
                <div className="space-y-10 animate-fade-up-blur">

                    {/* Header Actions */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 tracking-tight">Analysis Complete</h1>
                            <p className="text-[var(--text-muted)]">Review the AI-generated risk assessment and insights below.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button onClick={() => setResult(null)} className="px-5 py-2.5 bg-[var(--card-bg)] hover:bg-[var(--nav-active)] text-[var(--foreground)] rounded-xl transition-colors border border-[var(--card-border)] text-sm font-medium shadow-sm">
                                Upload New Document
                            </button>
                            <button className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg
                                ${theme === 'dark' ? 'bg-white text-black hover:bg-slate-200' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Download PDF Report
                            </button>
                        </div>
                    </div>

                    {/* 1. Document Overview */}
                    <section className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-xl">
                        <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--background)] border border-[var(--card-border)]">1</div>
                            Document Overview
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Document Name</p>
                                <p className="text-white font-semibold truncate text-lg" title={result.file_name}>{result.file_name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Upload Date</p>
                                <p className="text-white font-semibold text-lg">{new Date(result.created_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Document Type</p>
                                <p className="text-white font-semibold text-lg">{result.document_type || "Unknown Contract"}</p>
                            </div>
                            <div className="bg-[var(--background)] border-[var(--card-border)] rounded-2xl p-5 md:-mt-5 md:col-span-2 shadow-inner flex flex-col justify-center">
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Overall Risk Score</p>
                                    <span className={`text-xs px-2.5 py-1 rounded-md font-bold ${result.risk_level === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                                        result.risk_level === 'Medium' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.2)]' :
                                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                        }`}>{result.risk_level} Risk</span>
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className={`text-5xl font-black tracking-tight ${result.risk_level === 'High' ? 'text-red-500' :
                                        result.risk_level === 'Medium' ? 'text-orange-400' :
                                            'text-emerald-400'
                                        }`}>{result.overall_risk_score}</span>
                                    <span className="text-slate-500 font-medium mb-1.5 align-bottom">/ 100</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* 2. Risk Assessment Details */}
                        <section className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-3xl p-8 backdrop-blur-xl shadow-xl">
                            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#0f172a] border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(249,115,22,0.15)]">2</div>
                                Risk Assessment Breakdown
                            </h2>
                            <div className="space-y-7">
                                {Object.entries(result.analysis_data?.risk_assessment || {}).map(([key, rawValue]) => {
                                    const value = rawValue as number;
                                    const label = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                    const isHigh = value > 60;
                                    return (
                                        <div key={key}>
                                            <div className="flex justify-between text-sm font-medium mb-3">
                                                <span className="text-slate-300">{label}</span>
                                                <span className={isHigh ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>{value}%</span>
                                            </div>
                                            <div className="w-full bg-[var(--background)] rounded-full h-2.5 overflow-hidden">
                                                <div className={`h-full rounded-full ${isHigh ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} style={{ width: `${value}%` }}></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>

                        {/* 3 & 4. Missing Clauses & Legal Threats */}
                        <div className="space-y-8 flex flex-col">
                            <section className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-3xl p-8 backdrop-blur-xl shadow-xl flex-1 max-h-[400px] overflow-y-auto">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#0f172a] border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.15)]">3</div>
                                    Missing Clauses
                                </h2>
                                <ul className="space-y-4">
                                    {result.analysis_data?.missing_clauses?.map((clause: string, i: number) => (
                                        <li key={i} className="flex items-start gap-4 text-sm text-slate-300 bg-[var(--background)] border-[var(--card-border)] p-4 rounded-xl">
                                            <svg className="w-5 h-5 text-red-500 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.3)] rounded-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            <span className="font-medium leading-relaxed">{clause}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-3xl p-8 backdrop-blur-xl shadow-xl flex-1 max-h-[400px] overflow-y-auto">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#0f172a] border border-red-500/20 text-red-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.15)]">4</div>
                                    Legal Threats / Red Flags
                                </h2>
                                <ul className="space-y-4">
                                    {result.analysis_data?.legal_threats?.map((threat: string, i: number) => (
                                        <li key={i} className="flex items-start gap-4 text-sm text-slate-300 bg-[var(--background)] border-[var(--card-border)] p-4 rounded-xl">
                                            <svg className="w-5 h-5 text-orange-500 shrink-0 shadow-[0_0_10px_rgba(249,115,22,0.3)] rounded-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                            <span className="font-medium leading-relaxed">{threat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    </div>

                    {/* 5. Clause by Clause */}
                    <section className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-3xl p-8 backdrop-blur-xl shadow-xl">
                        <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#0f172a] border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.15)]">5</div>
                            Clause-by-Clause Breakdown
                        </h2>
                        <div className="overflow-x-auto rounded-xl border border-white/5">
                            <table className="w-full text-left text-sm text-slate-400">
                                <thead className="text-xs uppercase bg-[var(--nav-active)] text-slate-300 tracking-wider">
                                    <tr>
                                        <th className="px-6 py-5 font-semibold">Clause Name</th>
                                        <th className="px-6 py-5 font-semibold w-32">Status</th>
                                        <th className="px-6 py-5 font-semibold w-40">Risk Rating</th>
                                        <th className="px-6 py-5 font-semibold">Comments / Explanation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.analysis_data?.clause_breakdown?.map((item: any, i: number) => (
                                        <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors bg-[var(--card-bg)]/40">
                                            <td className="px-6 py-5 font-medium text-white">{item.clause_name}</td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1.5 rounded-md text-xs font-semibold border ${item.status === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    item.status === 'Missing' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                                                        'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                    }`}>{item.status}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1.5 rounded-md text-xs font-bold border ${item.risk_rating === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                                                    item.risk_rating === 'Medium' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]' :
                                                        'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                                                    }`}>{item.risk_rating}</span>
                                            </td>
                                            <td className="px-6 py-5 leading-relaxed font-medium">{item.comments}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* 7. AI Insights */}
                    <section className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.05)]">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] transform translate-x-1/3 -translate-y-1/3 pointer-events-none rounded-full" />
                        <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            AI Insights & Explanations
                        </h2>

                        <div className="grid lg:grid-cols-2 gap-10 relative z-10">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">Plain-Language Explanation</h3>
                                    <p className="text-slate-300 leading-relaxed bg-[#0f172a] p-6 rounded-2xl border border-white/5 font-medium">{result.analysis_data?.ai_insights?.plain_language_explanation}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">Risk Summary</h3>
                                    <p className="text-slate-300 leading-relaxed bg-[#0f172a] p-6 rounded-2xl border border-white/5 font-medium">{result.analysis_data?.ai_insights?.risk_explanation_summary}</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 shadow-[0_0_10px_rgba(16,185,129,0.3)] rounded-full text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Suggested Improvements
                                    </h3>
                                    <ul className="space-y-3">
                                        {result.analysis_data?.ai_insights?.suggested_improvements?.map((item: string, i: number) => (
                                            <li key={i} className="flex gap-4 text-sm font-medium text-slate-300 bg-[#0f172a] p-4 rounded-xl border border-white/5">
                                                <span className="text-emerald-500 shrink-0 select-none">•</span> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 shadow-[0_0_10px_rgba(59,130,246,0.3)] rounded-full text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                        Recommended Additions
                                    </h3>
                                    <ul className="space-y-3">
                                        {result.analysis_data?.ai_insights?.recommended_additions?.map((item: string, i: number) => (
                                            <li key={i} className="flex gap-4 text-sm font-medium text-slate-300 bg-[#0f172a] p-4 rounded-xl border border-white/5">
                                                <span className="text-blue-500 shrink-0 select-none">+</span> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            )}
        </div>
    );
}
