"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API_BASE from "@/lib/api";

export default function UserDataView({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("access_token");
            const isStaff = localStorage.getItem("is_staff") === "true";
            if (!token || !isStaff) {
                router.push("/login");
                return null;
            }
            return token;
        };

        const fetchData = async () => {
            const token = checkAuth();
            if (!token) return;

            try {
                const res = await fetch(`${API_BASE}/api/admin/users/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    setData(await res.json());
                } else {
                    throw new Error("Failed to fetch user documents");
                }
            } catch (err: any) {
                setError(err.message || "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    if (loading) return <div className="min-h-screen bg-[#060b14] flex items-center justify-center text-white">Loading User Documents...</div>;

    return (
        <div className="min-h-screen bg-[#060b14] text-slate-50 p-10 font-sans">
            <div className="max-w-5xl mx-auto">
                <Link href="/admin-dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Admin Dashboard
                </Link>

                {error ? (
                    <div className="p-8 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-center">
                        {error}
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-6 mb-12 bg-white/5 p-8 rounded-3xl border border-white/10">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-500/20">
                                {data?.user?.username?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold mb-1">{data?.user?.username}</h1>
                                <p className="text-slate-400">{data?.user?.email || 'No email provided'}</p>
                                <div className="flex gap-4 mt-3">
                                    <div className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20 uppercase tracking-wider">
                                        User ID: {id}
                                    </div>
                                    <div className="px-3 py-1 bg-white/5 text-slate-400 text-xs font-bold rounded-full border border-white/10 uppercase tracking-wider">
                                        {data?.documents?.length || 0} Documents
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Uploaded Documents & Analysis
                        </h2>

                        <div className="space-y-4">
                            {data?.documents?.length === 0 ? (
                                <div className="p-12 text-center bg-white/2 border border-dashed border-white/10 rounded-2xl text-slate-500">
                                    No documents found for this user.
                                </div>
                            ) : (
                                data.documents.map((doc: any) => (
                                    <div key={doc.id} className="bg-[#0a101d] border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all group">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg mb-0.5">{doc.file_name}</h3>
                                                    <p className="text-sm text-slate-400">{doc.document_type || 'Unknown Type'}</p>
                                                    <p className="text-[11px] text-slate-600 mt-2 uppercase tracking-tighter">Uploaded on {new Date(doc.created_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mb-2 inline-block ${doc.risk_level === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                        doc.risk_level === 'Medium' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                                                            'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                    }`}>
                                                    {doc.risk_level} Risk
                                                </div>
                                                <div className="text-2xl font-black text-white">{doc.overall_risk_score}/100</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
