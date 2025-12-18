'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedButton } from './ui/AnimatedButton';

interface CreatePlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export function CreatePlaylistModal({ isOpen, onClose, onCreated }: CreatePlaylistModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/playlists/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, isPublic }),
            });

            if (res.ok) {
                setName('');
                setDescription('');
                setIsPublic(false);
                onCreated();
                onClose();
            }
        } catch (error) {
            console.error('Failed to create playlist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[70]"
                    >
                        <div className="glass-panel rounded-2xl p-6 mx-4">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Create Playlist</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Name *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="My Awesome Playlist"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#b0fb5d] focus:outline-none transition-colors"
                                        maxLength={100}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Some cool songs I found..."
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#b0fb5d] focus:outline-none transition-colors resize-none"
                                        rows={3}
                                        maxLength={300}
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="isPublic"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                        className="w-4 h-4 rounded bg-white/5 border-white/10"
                                    />
                                    <label htmlFor="isPublic" className="text-sm text-gray-300">
                                        Make playlist public
                                    </label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <AnimatedButton
                                    onClick={handleCreate}
                                    disabled={!name.trim() || isLoading}
                                    variant="primary"
                                    className="flex-1"
                                >
                                    {isLoading ? 'Creating...' : 'Create'}
                                </AnimatedButton>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
