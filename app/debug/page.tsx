"use client";
import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Shield, Database, Globe, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function DebugPage() {
    const [debugData, setDebugData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/debug');
            const data = await res.json();
            setDebugData(data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    if (loading) return <div className="p-10 text-center animate-pulse">Loading Diagnostics...</div>;

    const envMatches = debugData?.rawCookieHeader ? "Detected" : "None";

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-4xl font-bold mb-2">System <span className="gradient-text">Diagnostics</span></h1>
                <p className="text-gray-400 text-lg">Detailed state analysis for production troubleshooting.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="text-[#b0fb5d]" />
                        <h2 className="text-xl font-bold">Session State</h2>
                    </div>

                    <div className="space-y-4">
                        <StatusRow
                            label="Access Token Cookie"
                            status={debugData?.hasAccessToken ? "Valid Path" : "Missing"}
                            success={debugData?.hasAccessToken}
                        />
                        <StatusRow
                            label="HttpOnly Context"
                            status={debugData?.rawCookieHeader ? "Active" : "Stripped/Missing"}
                            success={!!debugData?.rawCookieHeader}
                        />
                        {debugData?.accessTokenValue && (
                            <div className="text-xs text-gray-500 bg-black/20 p-2 rounded font-mono">
                                Segment: {debugData.accessTokenValue}
                            </div>
                        )}
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Globe className="text-purple-400" />
                        <h2 className="text-xl font-bold">Environment</h2>
                    </div>

                    <div className="space-y-4">
                        <StatusRow label="Runtime Mode" status={debugData?.environment || "Unknown"} success={true} />
                        <StatusRow label="Current Time" status={new Date(debugData?.timestamp).toLocaleTimeString()} success={true} />
                        <StatusRow
                            label="Cookie Persistence"
                            status={debugData?.cookieCount > 0 ? `${debugData.cookieCount} Cookies` : "None"}
                            success={debugData?.cookieCount > 0}
                        />
                    </div>
                </GlassCard>
            </div>

            <GlassCard className="p-8 border-yellow-500/30">
                <div className="flex items-center gap-3 mb-4 text-yellow-500">
                    <AlertTriangle />
                    <h2 className="text-xl font-bold">Critical Verification</h2>
                </div>
                <p className="text-gray-400 mb-6">
                    If "Session State" is missing after you login, your <strong>NEXT_PUBLIC_APP_URL</strong> or <strong>SPOTIFY_REDIRECT_URI</strong> is likely mismatched between Spotify and Vercel.
                </p>
                <div className="bg-black/40 rounded-xl p-4 font-mono text-sm overflow-x-auto text-gray-300">
                    <div className="mb-2">Cookie Names Found:</div>
                    <div className="flex flex-wrap gap-2">
                        {debugData?.allCookieNames?.map((name: string) => (
                            <span key={name} className="px-2 py-1 bg-white/10 rounded">{name}</span>
                        ))}
                        {(!debugData?.allCookieNames || debugData.allCookieNames.length === 0) && "No cookies detected in request"}
                    </div>
                </div>
            </GlassCard>

            <button
                onClick={fetchData}
                className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors flex items-center justify-center gap-2 border border-white/10"
            >
                <RefreshCw size={18} />
                Refresh Snapshot
            </button>
        </div>
    );
}

function StatusRow({ label, status, success }: { label: string; status: string; success: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-gray-400">{label}</span>
            <div className="flex items-center gap-2">
                <span className={success ? "text-white" : "text-red-400 font-bold"}>{status}</span>
                {success ? <CheckCircle2 size={16} className="text-[#b0fb5d]" /> : <AlertTriangle size={16} className="text-red-400" />}
            </div>
        </div>
    );
}
