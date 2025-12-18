"use client";
import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Play, Music2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayer } from '@/components/PlayerProvider';
import Link from 'next/link';

interface PlaylistTrack {
    id: string;
    title: string;
    artist: string;
    album: string;
    coverUrl: string;
    addedAt: string;
}

interface PlaylistUIProps {
    tracks: PlaylistTrack[];
}

export function PlaylistUI({ tracks }: PlaylistUIProps) {
    const { playTrack } = usePlayer();

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto min-h-screen">
            <Link href="/library" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
                <ArrowLeft size={20} />
                Back to Library
            </Link>

            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-12">
                <div className="w-40 h-40 md:w-52 md:h-52 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-2xl flex-shrink-0">
                    <Music2 className="w-20 h-20 md:w-24 md:h-24 text-gray-600" />
                </div>
                <div className="text-center md:text-left">
                    <p className="text-sm text-gray-400 mb-2">PLAYLIST</p>
                    <h1 className="text-4xl md:text-7xl font-bold mb-4">Playlist</h1>
                    <p className="text-gray-300">{tracks.length} songs</p>
                </div>
            </div>

            {tracks.length === 0 ? (
                <div className="text-center py-20">
                    <Music2 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 text-lg">This playlist is empty.</p>
                    <p className="text-gray-500 text-sm mt-2">Add songs from Discover!</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {tracks.map((track, index) => (
                        <TrackRow
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
            )}
        </div>
    );
}

function TrackRow({ track, index, onPlay }: { track: PlaylistTrack; index: number; onPlay: () => void }) {
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
