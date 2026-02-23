"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import API_BASE from "@/lib/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);

    const [user, setUser] = useState<{ username: string, email: string } | null>(null);
    const [showLogoutMenu, setShowLogoutMenu] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        setIsClient(true);
        const storedTheme = localStorage.getItem("theme") as 'light' | 'dark' | null;
        if (storedTheme) setTheme(storedTheme);

        const handleThemeChange = () => {
            const newTheme = localStorage.getItem("theme") as 'light' | 'dark' || 'dark';
            setTheme(newTheme);
        };

        window.addEventListener('themeChange', handleThemeChange);

        const token = localStorage.getItem("access_token");
        if (!token) {
            router.push("/login");
            return;
        }

        // Fetch User Profile
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/auth/profile/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };
        fetchProfile();

        return () => window.removeEventListener('themeChange', handleThemeChange);
    }, [router]);

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/");
    };

    if (!isClient) return null;

    const navItems = [
        { label: "Dashboard", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
        { label: "Analyze", href: "/dashboard/analyze", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
        { label: "Profile", href: "/dashboard/documents", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
        { label: "Summary", href: "/dashboard/summary", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
        { label: "Settings", href: "/dashboard/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
    ];

    return (
        <div className={`flex min-h-screen font-sans transition-colors duration-300 bg-[var(--background)] text-[var(--foreground)] ${theme === 'dark' ? '' : 'light'}`}>
            <style>{`
              @keyframes fadeUpBlur {
                0% { opacity: 0; transform: translateY(10px); filter: blur(4px); }
                100% { opacity: 1; transform: translateY(0); filter: blur(0px); }
              }
              .animate-fade-up-blur-fast {
                opacity: 0;
                animation: fadeUpBlur 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
            `}</style>

            {/* Sidebar */}
            <aside className={`w-64 border-r flex flex-col pt-6 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)] transition-colors duration-300 bg-[var(--sidebar-bg)] border-[var(--sidebar-border)]`}>
                <Link href="/" className="flex items-center gap-3 px-6 mb-10 animate-fade-up-blur-fast group cursor-pointer">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold transition-all shadow-lg
                        ${theme === 'dark' ? 'bg-[#0f172a] border-blue-500/30 text-blue-400 shadow-blue-500/10' : 'bg-blue-50 border-blue-200 text-blue-600 shadow-blue-500/5'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <div>
                        <h1 className={`text-xl font-bold tracking-tight leading-none group-hover:text-blue-500 transition-colors
                            ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>LexiGuard</h1>
                        <span className="text-[11px] text-slate-400 font-medium">Document Analysis</span>
                    </div>
                </Link>

                <nav className="flex-1 px-4 space-y-1 relative animate-fade-up-blur-fast" style={{ animationDelay: '100ms' }}>
                    {navItems.map((item) => {
                        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                            <Link
                                href={item.href}
                                key={item.label}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative
                  ${active
                                        ? (theme === 'dark' ? 'bg-[var(--nav-active)] text-white shadow-[inset_2px_0_0_rgba(59,130,246,1)]' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20')
                                        : (theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50')
                                    }`}
                            >
                                {active && theme === 'dark' && <div className="absolute right-3 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_5px_rgba(59,130,246,0.8)]" />}
                                <svg className={`w-5 h-5 ${active ? (theme === 'dark' ? 'text-blue-400' : 'text-white') : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                                </svg>
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* User Profile Footer */}
                <div className="relative mx-4 mb-6">
                    {showLogoutMenu && (
                        <div className={`absolute bottom-full left-0 w-full mb-2 border rounded-xl shadow-2xl overflow-hidden py-1 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200
                            bg-[var(--card-bg)] border-[var(--card-border)]`}>
                            <button
                                onClick={logout}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/5 transition-colors font-medium`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                Log Out
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => setShowLogoutMenu(!showLogoutMenu)}
                        className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all duration-200 border animate-fade-up-blur-fast
              ${theme === 'dark'
                                ? (showLogoutMenu ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10')
                                : (showLogoutMenu ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm')}`}
                        style={{ animationDelay: '200ms' }}
                    >
                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm transition-all
                            ${theme === 'dark' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-blue-100 border-blue-200 text-blue-600'}`}>
                            {user?.username?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{user?.username || "..."}</p>
                            <p className="text-[11px] text-slate-400 truncate">{user?.email || "..."}</p>
                        </div>
                        <svg className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showLogoutMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                        </svg>
                    </button>
                </div>
            </aside>

            {/* Main Container */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative pb-10">

                {/* Topbar */}
                <header className={`h-16 flex items-center justify-end px-8 z-10 border-b transition-colors duration-300 animate-fade-up-blur-fast
                    bg-[var(--sidebar-bg)] border-[var(--sidebar-border)]`} style={{ animationDelay: '300ms' }}>
                    <div className="flex items-center gap-6">
                        <Link href="/" className={`text-sm transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-blue-600'}`}>Home Page</Link>
                        <Link href="/dashboard/documents" className={`flex items-center gap-2 text-sm transition-colors ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-blue-600'}`}>
                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            {user?.username || "Loading..."}
                        </Link>
                        <button onClick={logout} className={`px-5 py-2 rounded-full border transition-all text-xs font-semibold flex items-center gap-2
                            ${theme === 'dark'
                                ? 'border-white/10 text-white hover:bg-white/5 shadow-[0_0_10px_rgba(255,255,255,0.05)]'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}>
                            <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            Sign Out
                        </button>
                    </div>
                </header>

                {/* Dynamic Content */}
                <main className="flex-1 overflow-y-auto w-full relative">
                    {children}
                </main>
            </div>
        </div>
    );
}
