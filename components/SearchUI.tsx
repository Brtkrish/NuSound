"use client";
import React, { useState, useEffect } from 'react';
import { Search, Play, RefreshCw, Music2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { usePlayer } from '@/components/PlayerProvider';
import { LikeButton } from '@/components/LikeButton';
import { AddToPlaylistButton } from '@/components/AddToPlaylistButton';

interface Track {
    id: string;
    title: string;
    artist: string;
    album: string;
    coverUrl: string;
    popularity: number;
}

export function SearchUI() {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [results, setResults] = useState<{ tracks: Track[], related: Track[] } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { playTrack } = usePlayer();


    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (debouncedQuery.trim()) {
            performSearch(debouncedQuery);
        } else {
            setResults(null);
        }
    }, [debouncedQuery]);

    const performSearch = async (q: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            } else {
                const errorData = await res.json();
                setError(errorData.error || 'Failed to search');
            }
        } catch (error) {
            console.error('Search failed:', error);
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto min-h-screen pb-32">
            {/* Header / Search Bar */}
            <div className="flex flex-col gap-8 mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">
                        Find <span className="gradient-text">NuSound</span>
                    </h1>
                    <p className="text-gray-400">Search for a song and discover its universe.</p>
                </div>

                <div className="relative group max-w-2xl">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#b0fb5d] transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="What are you looking for?"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#b0fb5d]/20 focus:border-[#b0fb5d]/40 transition-all placeholder:text-gray-600"
                    />
                    {loading && (
                        <div className="absolute inset-y-0 right-4 flex items-center">
                            <RefreshCw className="w-5 h-5 text-[#b0fb5d] animate-spin" />
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8 flex items-center gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                            !
                        </div>
                        <p>{error}</p>
                    </motion.div>
                )}

                {!results && !loading && !error && (

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <Sparkles className="w-10 h-10 text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-400">Your next obsession is waiting</h2>
                        <p className="text-gray-500 max-w-sm mt-2">Start typing to explore related tracks and hidden gems.</p>
                    </motion.div>
                )}

                {results && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-12"
                    >
                        {/* Direct Match */}
                        {results.tracks.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Search size={18} className="text-[#b0fb5d]" />
                                    Top Result
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {results.tracks.map((track) => (
                                        <TrackCard
                                            key={track.id}
                                            track={track}
                                            onPlay={() => playTrack(`spotify:track:${track.id}`)}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Related Tracks */}
                        {results.related.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <RefreshCw size={18} className="text-[#0affff]" />
                                        Related Discoveries
                                    </h2>
                                    <span className="text-xs text-gray-500 uppercase tracking-widest">Powered by NuSound AI</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {results.related.map((track, idx) => (
                                        <TrackCard
                                            key={track.id}
                                            track={track}
                                            index={idx}
                                            onPlay={() => {
                                                const trackUris = results.related.slice(idx).map(t => `spotify:track:${t.id}`);
                                                playTrack(trackUris);
                                            }}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function TrackCard({ track, index, onPlay }: { track: Track; index?: number; onPlay: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index ? index * 0.05 : 0 }}
        >
            <GlassCard className="group p-3 flex items-center gap-4 hover:bg-white/10 transition-all border-white/5 hover:border-white/10">
                <div
                    className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer shadow-xl"
                    onClick={onPlay}
                >
                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-6 h-6 text-[#b0fb5d] fill-[#b0fb5d]" />
                    </div>
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm truncate pr-2">{track.title}</h3>
                    <p className="text-xs text-[#b0fb5d] font-medium truncate">{track.artist}</p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <LikeButton trackId={track.id} />
                    <AddToPlaylistButton trackId={track.id} />
                </div>
            </GlassCard>
        </motion.div>
    );
}
