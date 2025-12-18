"use client";
import React, { useState } from 'react';
import { Track } from '@/lib/data';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Play, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { LikeButton } from '@/components/LikeButton';
import { AddToPlaylistButton } from '@/components/AddToPlaylistButton';
import { usePlayer } from '@/components/PlayerProvider';

interface DiscoverUIProps {
    initialTracks: Track[];
}

export function DiscoverUI({ initialTracks }: DiscoverUIProps) {
    const [tracks, setTracks] = useState<Track[]>(initialTracks);
    const [loading, setLoading] = useState(false);
    const { playTrack } = usePlayer();

    const fetchData = async () => {
        setLoading(true);
        try {
            // We still need this for 'Refresh', but now the initial load is server-side
            const res = await fetch('/api/recommendations');
            if (res.status === 401) {
                window.location.href = '/api/auth/login';
                return;
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                setTracks(data);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tracks.map((track, index) => (
                    <RecommendationCard
                        key={track.id}
                        track={track}
                        index={index}
                        onPlay={() => {
                            const trackUris = tracks.slice(index).map(t => `spotify:track:${t.id}`);
                            playTrack(trackUris);
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

function RecommendationCard({ track, index, onPlay }: { track: Track; index: number; onPlay: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <GlassCard className="group flex items-center justify-between hover:bg-white/10 transition-colors p-3 md:p-4">
                <div className="flex items-center gap-4 min-w-0">
                    <div
                        className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden shadow-2xl cursor-pointer flex-shrink-0"
                        onClick={onPlay}
                    >
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-8 h-8 text-[#b0fb5d] fill-[#b0fb5d]" />
                        </div>
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-base md:text-lg truncate pr-2">{track.title}</h3>
                        <p className="text-[#b0fb5d] text-xs md:text-sm font-medium truncate">{track.artist}</p>
                        <p className="text-gray-500 text-[10px] md:text-xs mt-1 truncate">{track.album}</p>
                    </div>
                </div>

                <div className="flex items-center gap-1 md:gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <LikeButton trackId={track.id} />
                    <AddToPlaylistButton trackId={track.id} />
                </div>
            </GlassCard>
        </motion.div>
    )
}
