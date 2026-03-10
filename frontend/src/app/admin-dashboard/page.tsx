"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API_BASE from "@/lib/api";

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("access_token");
            const isStaff = localStorage.getItem("is_staff") === "true";
            if (!token || !isStaff) {
                router.push("/login");
                return false;
            }
            return token;
        };

        const fetchData = async () => {
            const token = checkAuth();
            if (!token) return;

            try {
                // Fetch Stats
                const statsRes = await fetch(`${API_BASE}/api/admin/stats/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (statsRes.ok) {
                    setStats(await statsRes.json());
                } else {
                    throw new Error("Failed to fetch system stats");
                }

                // Fetch Users
                const usersRes = await fetch(`${API_BASE}/api/admin/users/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (usersRes.ok) {
                    setUsers(await usersRes.json());
                } else {
                    throw new Error("Failed to fetch users list");
                }
            } catch (err: any) {
                setError(err.message || "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    if (loading) return <div className="min-h-screen bg-[#060b14] flex items-center justify-center text-white">Loading Admin Panel...</div>;

    return (
        <div className="min-h-screen bg-[#060b14] text-slate-50 p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Admin Control Center</h1>
                        <p className="text-slate-400">System-wide overview and user management</p>
                    </div>
                    <Link href="/dashboard" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-all border border-slate-700">
                        Back to My Dashboard
                    </Link>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center">
                        {error}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-[#0a101d] border border-white/10 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            </div>
                            <p className="text-slate-400 font-medium">Total Users</p>
                        </div>
                        <p className="text-4xl font-bold">{stats?.total_users || 0}</p>
                    </div>
                    <div className="bg-[#0a101d] border border-white/10 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            </div>
                            <p className="text-slate-400 font-medium">Total Documents</p>
                        </div>
                        <p className="text-4xl font-bold">{stats?.total_documents || 0}</p>
                    </div>
                    <div className="bg-[#0a101d] border border-white/10 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            </div>
                            <p className="text-slate-400 font-medium">Critical Risks</p>
                        </div>
                        <p className="text-4xl font-bold text-red-400">{stats?.high_risk_documents || 0}</p>
                    </div>
                </div>

                {/* User Table */}
                <div className="bg-[#0a101d] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold">LexiGuard Users</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-widest">
                                    <th className="px-6 py-4 font-semibold">Username</th>
                                    <th className="px-6 py-4 font-semibold">Email</th>
                                    <th className="px-6 py-4 font-semibold">Role</th>
                                    <th className="px-6 py-4 font-semibold">Docs</th>
                                    <th className="px-6 py-4 font-semibold">Last Login</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-bold text-xs">
                                                    {user.username[0].toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-white">{user.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm">{user.email || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            {user.is_staff ? (
                                                <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] uppercase font-bold rounded-md border border-blue-500/20">Admin</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-slate-800 text-slate-500 text-[10px] uppercase font-bold rounded-md">User</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-white/5 px-2 py-1 rounded text-sm font-medium">{user.document_count}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs">
                                            {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/admin-dashboard/users/${user.id}`} className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                                                View Data →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
