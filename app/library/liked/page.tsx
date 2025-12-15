"use client";
import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Play, Heart, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayer } from '@/components/PlayerProvider';
import Link from 'next/link';

interface SavedTrack {
    id: string;
    title: string;
    artist: string;
    album: string;
    coverUrl: string;
    addedAt: string;
}

export default function LikedSongsPage() {
    const [tracks, setTracks] = useState<SavedTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const { playTrack } = usePlayer();

    useEffect(() => {
        fetchLikedSongs();
    }, []);

    const fetchLikedSongs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/library');
            if (res.status === 401) {
                window.location.href = '/api/auth/login';
                return;
            }
            const data = await res.json();
            setTracks(data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <Link href="/library" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
                <ArrowLeft size={20} />
                Back to Library
            </Link>

            <div className="flex items-end gap-6 mb-12">
                <div className="w-52 h-52 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-2xl">
                    <Heart className="w-24 h-24 text-white fill-white" />
                </div>
                <div>
                    <p className="text-sm text-gray-400 mb-2">PLAYLIST</p>
                    <h1 className="text-5xl md:text-7xl font-bold mb-4">Liked Songs</h1>
                    <p className="text-gray-300">{tracks.length} songs</p>
                </div>
            </div>

            {/* Tracks */}
            {loading ? (
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="glass-panel h-20 rounded-xl animate-pulse bg-white/5" />
                    ))}
                </div>
            ) : tracks.length === 0 ? (
                <div className="text-center py-20">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 text-lg">No liked songs yet.</p>
                    <p className="text-gray-500 text-sm mt-2">Start exploring and like your favorites!</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {tracks.map((track, index) => (
                        <TrackRow key={track.id} track={track} index={index} onPlay={() => playTrack(`spotify:track:${track.id}`)} />
                    ))}
                </div>
            )}
        </div>
    );
}

function TrackRow({ track, index, onPlay }: { track: SavedTrack; index: number; onPlay: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.02 }}
        >
            <GlassCard className="group flex items-center gap-4 hover:bg-white/10 transition-colors px-4 py-3">
                <span className="text-gray-500 w-8 text-center">{index + 1}</span>

                <div
                    className="relative w-12 h-12 rounded overflow-hidden shadow-lg cursor-pointer flex-shrink-0"
                    onClick={onPlay}
                >
                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{track.title}</h3>
                    <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                </div>

                <div className="hidden md:block flex-1 min-w-0">
                    <p className="text-sm text-gray-400 truncate">{track.album}</p>
                </div>

                <div className="text-sm text-gray-500">
                    {new Date(track.addedAt).toLocaleDateString()}
                </div>
            </GlassCard>
        </motion.div>
    );
}
