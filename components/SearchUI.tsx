"use client";
import React, { useState, useEffect } from 'react';
import { Search, Play, RefreshCw, Music2, Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
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
    const [results, setResults] = useState<Track[] | null>(null);
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
            setError(null);
        }
    }, [debouncedQuery]);

    const performSearch = async (q: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data.tracks || []);
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
        <div className="px-4 py-8 md:p-12 max-w-7xl mx-auto min-h-screen pb-32">

            {/* Header / Search Bar */}
            <div className="flex flex-col gap-8 mb-12">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">
                        Find <span className="gradient-text">NuSound</span>
                    </h1>
                    <p className="text-gray-400">Search for a song and explore its universe.</p>
                </motion.div>

                <div className="relative group max-w-2xl">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#b0fb5d] transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Song, artist, or album..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#b0fb5d]/20 focus:border-[#b0fb5d]/40 transition-all placeholder:text-gray-600 shadow-2xl"
                    />
                    {loading && (
                        <div className="absolute inset-y-0 right-4 flex items-center">
                            <Loader2 className="w-5 h-5 text-[#b0fb5d] animate-spin" />
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-8 flex items-center gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 font-bold">!</div>
                        <p>{error}</p>
                    </motion.div>
                )}

                {!results && !loading && !error && (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 shadow-inner">
                            <Sparkles className="w-10 h-10 text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-400">Your next obsession is waiting</h2>
                        <p className="text-gray-500 max-w-sm mt-2">Start typing to explore related tracks and hidden gems.</p>
                    </motion.div>
                )}

                {results && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Music2 size={18} className="text-[#b0fb5d]" />
                                Search Results
                            </h2>
                            <span className="text-xs text-gray-500 uppercase tracking-widest">{results.length} tracks found</span>
                        </div>

                        <div className="flex flex-col gap-4">
                            {results.map((track, idx) => (
                                <ExpandableTrackCard
                                    key={track.id}
                                    track={track}
                                    index={idx}
                                    onPlay={() => playTrack(`spotify:track:${track.id}`)}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ExpandableTrackCard({ track, index, onPlay }: { track: Track; index: number; onPlay: () => void }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [recommendations, setRecommendations] = useState<Track[]>([]);
    const [loadingRecs, setLoadingRecs] = useState(false);
    const { playTrack } = usePlayer();

    const toggleExpand = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const nextState = !isExpanded;
        setIsExpanded(nextState);

        if (nextState && recommendations.length === 0) {
            fetchRecommendations();
        }
    };

    const fetchRecommendations = async () => {
        setLoadingRecs(true);
        try {
            const res = await fetch(`/api/recommendations/seed?trackId=${track.id}`);
            if (res.ok) {
                const data = await res.json();
                setRecommendations(data);
            } else {
                const err = await res.text();
                console.error('Failed to fetch recommendations:', res.status, err);
            }
        } catch (error) {
            console.error('Failed to fetch recommendations error:', error);
        } finally {
            setLoadingRecs(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            layout
            className="w-full"
        >
            <GlassCard className="group overflow-hidden border-white/5 hover:border-white/10 transition-colors shadow-xl">
                {/* Main Card */}
                <div className="p-4 flex items-center gap-4">
                    <div
                        className="relative w-16 h-16 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 cursor-pointer group/image"
                        onClick={onPlay}
                    >
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="w-7 h-7 text-[#b0fb5d] fill-[#b0fb5d]" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0" onClick={onPlay}>
                        <h3 className="font-bold text-lg truncate pr-2 group-hover:text-[#b0fb5d] transition-colors cursor-pointer">{track.title}</h3>
                        <p className="text-gray-400 font-medium truncate">{track.artist}</p>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <div className="flex items-center scale-90 sm:scale-100">
                            <LikeButton trackId={track.id} />
                            <AddToPlaylistButton trackId={track.id} />
                        </div>

                        <button
                            onClick={toggleExpand}
                            className={`p-2 sm:p-3 rounded-full flex items-center gap-2 text-xs sm:text-sm font-bold transition-all ${isExpanded
                                ? 'bg-[#b0fb5d] text-black shadow-[0_0_20px_rgba(176,251,93,0.3)]'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <Sparkles size={16} className={isExpanded ? 'animate-pulse' : ''} />
                            <span className="hidden lg:inline">{isExpanded ? 'Showing Similar' : 'Show Similar'}</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    </div>
                </div>

                {/* Expanded Section */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-black/20 border-t border-white/5"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={16} className="text-[#b0fb5d]" />
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-[#b0fb5d]">NuSound Discoveries</h4>
                                    </div>
                                    {loadingRecs && <Loader2 className="w-4 h-4 text-[#b0fb5d] animate-spin" />}
                                </div>

                                {loadingRecs ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
                                        ))}
                                    </div>
                                ) : recommendations.length === 0 ? (
                                    <div className="text-center py-4 bg-white/5 rounded-xl border border-dashed border-white/10">
                                        <p className="text-gray-500 text-sm italic">NuSound couldn't find similar vibes for this track yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {recommendations.map((rec, i) => (
                                            <motion.div
                                                key={rec.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="group/rec bg-white/5 hover:bg-white/10 p-2 rounded-xl flex items-center gap-3 transition-colors cursor-pointer border border-transparent hover:border-white/10 shadow-lg"
                                                onClick={() => {
                                                    const trackUris = recommendations.slice(i).map(t => `spotify:track:${t.id}`);
                                                    playTrack(trackUris);
                                                }}
                                            >
                                                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 shadow-inner">
                                                    <img src={rec.coverUrl} alt={rec.title} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/rec:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Play className="w-4 h-4 text-[#b0fb5d] fill-[#b0fb5d]" />
                                                    </div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h5 className="text-xs font-bold truncate">{rec.title}</h5>
                                                    <p className="text-[10px] text-gray-500 truncate">{rec.artist}</p>
                                                </div>
                                                <div className="opacity-0 group-hover/rec:opacity-100 transition-opacity pr-2 scale-75">
                                                    <LikeButton trackId={rec.id} />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>
        </motion.div>
    );
}
