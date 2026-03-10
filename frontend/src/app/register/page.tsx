"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API_BASE from "@/lib/api";

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Step 1: Register
            const res = await fetch(`${API_BASE}/api/auth/register/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password, is_staff: isAdmin }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error("Registration error details:", errorData);

                // Extract error message from DRF's common formats
                let errorMsg = "Registration failed";
                if (typeof errorData === 'object') {
                    const firstError = Object.values(errorData)[0];
                    if (Array.isArray(firstError)) {
                        errorMsg = firstError[0];
                    } else if (typeof firstError === 'string') {
                        errorMsg = firstError;
                    } else if (errorData.detail) {
                        errorMsg = errorData.detail;
                    }
                }
                throw new Error(errorMsg);
            }

            // Step 2: Auto-login with same credentials
            const loginRes = await fetch(`${API_BASE}/api/auth/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!loginRes.ok) {
                // Registration worked but login failed — redirect to login page
                router.push("/login");
                return;
            }

            const data = await loginRes.json();
            localStorage.setItem("access_token", data.access);
            localStorage.setItem("refresh_token", data.refresh);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to register");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md p-8 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl relative z-10">
                <div className="mb-10 text-center">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] mb-4">
                        L
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
                    <p className="text-slate-400 mt-2">Start analyzing documents with LexiGuard</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="block text-sm font-medium text-slate-300">Username</label>
                            <button
                                type="button"
                                onClick={() => setIsAdmin(!isAdmin)}
                                className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded transition-all duration-300 ${isAdmin ? 'bg-violet-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'bg-slate-800 text-slate-500 hover:text-slate-400'}`}
                            >
                                {isAdmin ? 'Admin Mode' : 'Admin?'}
                            </button>
                        </div>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                            placeholder="Choose a username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                            placeholder="you@company.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                            placeholder="Create a strong password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Creating account..." : "Sign up"}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-400">
                    Already have an account?{" "}
                    <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
