"use client";
import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Heart, Music2, Plus, Lock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CreatePlaylistModal } from '@/components/CreatePlaylistModal';

interface Playlist {
    id: string;
    name: string;
    description: string;
    images: any[];
    trackCount: number;
    owner: string;
    isPublic: boolean;
}

export default function LibraryPage() {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [likedCount, setLikedCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchLibrary();
    }, []);

    const fetchLibrary = async () => {
        setLoading(true);
        try {
            // Fetch playlists and liked songs in parallel
            const [playlistsRes, likedRes] = await Promise.all([
                fetch('/api/playlists', { credentials: 'include' }),
                fetch('/api/library', { credentials: 'include' }),
            ]);

            if (playlistsRes.status === 401 || likedRes.status === 401) {
                window.location.href = '/api/auth/login';
                return;
            }

            const playlistsData = await playlistsRes.json();
            const likedData = await likedRes.json();

            // Defensive null checks
            setPlaylists(Array.isArray(playlistsData) ? playlistsData : []);
            setLikedCount(Array.isArray(likedData) ? likedData.length : 0);
        } catch (e) {
            console.error('Library fetch error:', e);
            // Set defaults on error
            setPlaylists([]);
            setLikedCount(0);
        }
        setLoading(false);
    };

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">
                        Your <span className="gradient-text">Library</span>
                    </h1>
                    <p className="text-gray-400">All your playlists and saved music in one place.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#b0fb5d] text-black font-bold rounded-xl hover:scale-105 transition-transform"
                >
                    <Plus size={20} />
                    Create Playlist
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="glass-panel h-64 rounded-2xl animate-pulse bg-white/5" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {/* Liked Songs Card */}
                    <Link href="/library/liked">
                        <PlaylistCard
                            title="Liked Songs"
                            description={`${likedCount} liked songs`}
                            image={null}
                            icon={<Heart className="w-16 h-16 text-white fill-white" />}
                            iconBg="bg-gradient-to-br from-purple-600 to-blue-500"
                            index={0}
                        />
                    </Link>

                    {/* User Playlists */}
                    {playlists.map((playlist, index) => (
                        <Link key={playlist.id} href={`/library/${playlist.id}`}>
                            <PlaylistCard
                                title={playlist.name}
                                description={`${playlist.trackCount} tracks`}
                                image={playlist.images?.[0]?.url}
                                isPublic={playlist.isPublic}
                                index={index + 1}
                            />
                        </Link>
                    ))}
                </div>
            )}

            {/* Create Playlist Modal */}
            <CreatePlaylistModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={fetchLibrary}
            />
        </div>
    );
}

function PlaylistCard({
    title,
    description,
    image,
    icon,
    iconBg,
    isPublic,
    index,
}: {
    title: string;
    description: string;
    image?: string | null;
    icon?: React.ReactNode;
    iconBg?: string;
    isPublic?: boolean;
    index: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <GlassCard className="group cursor-pointer hover:bg-white/10 transition-all hover:scale-105 p-4">
                {/* Cover Art or Icon */}
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-gray-800 to-gray-900">
                    {image ? (
                        <img src={image} alt={title} className="w-full h-full object-cover" />
                    ) : icon ? (
                        <div className={`w-full h-full flex items-center justify-center ${iconBg}`}>
                            {icon}
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Music2 className="w-16 h-16 text-gray-600" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg truncate">{title}</h3>
                        {isPublic !== undefined && (
                            <span className="flex-shrink-0">
                                {isPublic ? (
                                    <Globe size={14} className="text-gray-400" />
                                ) : (
                                    <Lock size={14} className="text-gray-400" />
                                )}
                            </span>
                        )}
                    </div>
                    <p className="text-gray-400 text-sm truncate">{description}</p>
                </div>
            </GlassCard>
        </motion.div>
    );
}
