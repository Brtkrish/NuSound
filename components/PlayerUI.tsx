'use client';

import { usePlayer } from './PlayerProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import Image from 'next/image';

export default function PlayerUI() {
    const { player, isPaused, currentTrack, isActive } = usePlayer();

    if (!isActive || !currentTrack) return null;

    const {
        name: trackName,
        album: { images },
        artists
    } = currentTrack;

    const albumArt = images[0]?.url;
    const artistName = artists.map((a: any) => a.name).join(', ');

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="fixed bottom-0 left-0 right-0 h-20 md:h-24 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center px-3 md:px-6 z-50 text-white"
            >
                {/* Track Info */}
                <div className="flex items-center gap-2 md:gap-4 flex-1 md:w-1/3 min-w-0">
                    {albumArt && (
                        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-md overflow-hidden shadow-lg border border-white/10 flex-shrink-0">
                            <Image src={albumArt} alt={trackName} fill className="object-cover" />
                        </div>
                    )}
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs md:text-sm truncate">{trackName}</span>
                        <span className="text-xs text-white/50 truncate">{artistName}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3 md:gap-6 md:w-1/3">
                    <button
                        onClick={() => player.previousTrack()}
                        className="text-white/50 hover:text-white transition hidden md:block"
                    >
                        <SkipBack size={20} />
                    </button>

                    <button
                        onClick={() => player.togglePlay()}
                        className="w-10 h-10 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition active:scale-95"
                    >
                        {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
                    </button>

                    <button
                        onClick={() => player.nextTrack()}
                        className="text-white/50 hover:text-white transition hidden md:block"
                    >
                        <SkipForward size={20} />
                    </button>
                </div>

                {/* Volume - Hidden on mobile */}
                <div className="hidden md:flex items-center justify-end gap-2 w-1/3 text-white/50">
                    <Volume2 size={16} />
                    <div className="w-24 h-1 bg-white/20 rounded-full">
                        <div className="w-1/2 h-full bg-white rounded-full"></div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
