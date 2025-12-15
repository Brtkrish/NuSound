"use client";
import React, { useEffect, useState } from 'react';
import { getRecommendations, Track } from '@/lib/data';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Play, RefreshCw, Plus, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DiscoverPage() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);

    // Simulate fetching data on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/recommendations');
            if (res.status === 401) {
                // Not logged in, redirect to login
                window.location.href = '/api/auth/login';
                return;
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                setTracks(data);
            } else {
                console.error("API returned invalid data format:", data);
                setTracks([]);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto min-h-screen">

            {/* Header */}
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">
                        Fresh <span className="gradient-text">Finds</span>
                    </h1>
                    <p className="text-gray-400">Curated based on your hidden taste profile.</p>
                </div>
                <AnimatedButton onClick={fetchData} variant="secondary" icon={<RefreshCw className={loading ? "animate-spin" : ""} size={18} />}>
                    Refresh
                </AnimatedButton>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="glass-panel h-32 rounded-2xl animate-pulse bg-white/5" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tracks.map((track, index) => (
                        <RecommendationCard key={track.id} track={track} index={index} />
                    ))}
                </div>
            )}
        </div>
    );
}

function RecommendationCard({ track, index }: { track: Track; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <GlassCard className="group flex items-center justify-between hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shadow-2xl">
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Play className="w-8 h-8 text-[#b0fb5d] fill-[#b0fb5d]" />
                        </div>
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-lg truncate pr-4">{track.title}</h3>
                        <p className="text-[#b0fb5d] text-sm font-medium">{track.artist}</p>
                        <p className="text-gray-500 text-xs mt-1">{track.album}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-3 rounded-full hover:bg-white/10 text-gray-400 hover:text-[#b0fb5d] transition-colors">
                        <Heart size={20} />
                    </button>
                    <button className="p-3 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <Plus size={20} />
                    </button>
                </div>
            </GlassCard>
        </motion.div>
    )
}
