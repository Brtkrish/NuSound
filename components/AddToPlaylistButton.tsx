'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddToPlaylistButtonProps {
    trackId: string;
}

interface Playlist {
    id: string;
    name: string;
}

export function AddToPlaylistButton({ trackId }: AddToPlaylistButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && playlists.length === 0) {
            fetchPlaylists();
        }
    }, [isOpen]);

    const fetchPlaylists = async () => {
        try {
            const res = await fetch('/api/playlists');
            if (res.ok) {
                const data = await res.json();
                setPlaylists(data);
            }
        } catch (error) {
            console.error('Failed to fetch playlists:', error);
        }
    };

    const handleAddToPlaylist = async (playlistId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/playlists/${playlistId}/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackUris: [`spotify:track:${trackId}`] }),
            });

            if (res.ok) {
                setIsOpen(false);
                // Could add a toast notification here
            }
        } catch (error) {
            console.error('Failed to add to playlist:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="p-3 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                whileTap={{ scale: 0.9 }}
            >
                <Plus size={20} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-64 glass-panel rounded-xl p-2 z-50 max-h-80 overflow-y-auto"
                        >
                            {playlists.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-gray-400 text-center">
                                    No playlists yet
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {playlists.map((playlist) => (
                                        <button
                                            key={playlist.id}
                                            onClick={() => handleAddToPlaylist(playlist.id)}
                                            disabled={loading}
                                            className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm disabled:opacity-50"
                                        >
                                            {playlist.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
