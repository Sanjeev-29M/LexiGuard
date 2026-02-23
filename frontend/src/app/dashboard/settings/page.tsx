"use client";

import { useState } from "react";

export default function SettingsPage() {
    const [profile, setProfile] = useState({
        name: "Sanjeev",
        email: "sanjeevm292087@gmail.com",
        company: "LexiGuard Inc."
    });

    const [preferences, setPreferences] = useState({
        darkMode: typeof window !== 'undefined' ? localStorage.getItem('theme') !== 'light' : true
    });

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setMessage("Profile saved successfully!");
            setTimeout(() => setMessage(""), 3000);
        }, 1000);
    };

    const togglePreference = (key: keyof typeof preferences) => {
        const newValue = !preferences[key];
        setPreferences(prev => ({ ...prev, [key]: newValue }));

        if (key === 'darkMode') {
            const theme = newValue ? 'dark' : 'light';
            localStorage.setItem('theme', theme);
            // Dispatch custom event to notify layout
            window.dispatchEvent(new Event('themeChange'));
        }
    };

    return (
        <div className="p-10 max-w-4xl mx-auto w-full pb-24 animate-in fade-in duration-500">
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
                <p className="text-[var(--text-muted)]">Manage your profile information and application preferences.</p>
            </div>

            {message && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {message}
                </div>
            )}

            <div className="space-y-8">

                {/* Profile Section */}
                <section className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-2xl p-8 backdrop-blur-sm">
                    <h2 className="text-xl font-bold mb-6 border-b border-[var(--card-border)] pb-4">Profile Information</h2>
                    <form onSubmit={handleSaveProfile} className="space-y-5">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--background)] border-[var(--card-border)] text-[var(--foreground)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Company Name</label>
                                <input
                                    type="text"
                                    value={profile.company}
                                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--background)] border-[var(--card-border)] text-[var(--foreground)]"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Email Address</label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                className="w-full px-4 py-3 bg-[var(--background)] border-[var(--card-border)] text-[var(--foreground)]"
                            />
                        </div>
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </section>

                {/* Preferences Section */}
                <section className="bg-[var(--card-bg)] border-[var(--card-border)] rounded-2xl p-8 backdrop-blur-sm">
                    <h2 className="text-xl font-bold mb-6 border-b border-[var(--card-border)] pb-4">Application Preferences</h2>
                    <div className="space-y-6">

                        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--background)] border border-[var(--card-border)]">
                            <div>
                                <h3 className="font-semibold">Dark Mode</h3>
                                <p className="text-sm text-[var(--text-muted)] mt-1">Switch between light and dark theme for the entire application.</p>
                            </div>
                            <button
                                onClick={() => togglePreference('darkMode')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${preferences.darkMode ? 'bg-blue-500' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${preferences.darkMode ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                    </div>
                </section>


            </div>
        </div>
    );
}
