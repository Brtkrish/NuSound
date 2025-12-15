'use client';

import { usePlayer } from './PlayerProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Repeat, Shuffle } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function PlayerUI() {
    const { player, isPaused, currentTrack, isActive } = usePlayer();
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(50);
    const [isMuted, setIsMuted] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isShuffled, setIsShuffled] = useState(false);
    const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: context, 2: track

    useEffect(() => {
        if (!player) return;

        const interval = setInterval(async () => {
            const state = await player.getCurrentState();
            if (state) {
                setPosition(state.position);
                setDuration(state.duration);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [player]);

    if (!isActive || !currentTrack) return null;

    const {
        name: trackName,
        album: { images },
        artists,
        uri: trackUri
    } = currentTrack;

    const albumArt = images[0]?.url;
    const artistName = artists.map((a: any) => a.name).join(', ');

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPosition = parseInt(e.target.value);
        setPosition(newPosition);
        player?.seek(newPosition);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        player?.setVolume(newVolume / 100);
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        if (isMuted) {
            player?.setVolume(volume / 100);
            setIsMuted(false);
        } else {
            player?.setVolume(0);
            setIsMuted(true);
        }
    };

    const toggleLike = async () => {
        const trackId = trackUri.split(':')[2];
        const endpoint = isLiked ? '/api/library/remove' : '/api/library/save';

        setIsLiked(!isLiked);

        try {
            await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackId }),
            });
        } catch (error) {
            console.error('Failed to toggle like:', error);
            setIsLiked(!isLiked); // Revert on error
        }
    };

    const toggleShuffle = async () => {
        const newShuffle = !isShuffled;
        setIsShuffled(newShuffle);
        // Note: Spotify SDK doesn't have shuffle control, would need Web API
    };

    const cycleRepeat = () => {
        const next = (repeatMode + 1) % 3;
        setRepeatMode(next);
        // Note: Spotify SDK doesn't have repeat control, would need Web API
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 z-50 text-white pb-safe"
            >
                {/* Progress Bar */}
                <div className="px-3 md:px-6 pt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <span className="w-10 text-right">{formatTime(position)}</span>
                        <input
                            type="range"
                            min="0"
                            max={duration}
                            value={position}
                            onChange={handleSeek}
                            className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:scale-110"
                        />
                        <span className="w-10">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Main Player */}
                <div className="flex items-center px-3 md:px-6 pb-3">
                    {/* Track Info */}
                    <div className="flex items-center gap-2 md:gap-4 flex-1 md:w-1/3 min-w-0">
                        {albumArt && (
                            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-md overflow-hidden shadow-lg border border-white/10 flex-shrink-0">
                                <Image src={albumArt} alt={trackName} fill className="object-cover" />
                            </div>
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-bold text-xs md:text-sm truncate">{trackName}</span>
                            <span className="text-xs text-white/50 truncate">{artistName}</span>
                        </div>
                        <button
                            onClick={toggleLike}
                            className="hidden md:block p-2 hover:scale-110 transition-transform"
                        >
                            <Heart
                                size={20}
                                className={isLiked ? 'fill-[#b0fb5d] text-[#b0fb5d]' : 'text-white/50'}
                            />
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col items-center gap-2 md:w-1/3">
                        <div className="flex items-center justify-center gap-2 md:gap-4">
                            <button
                                onClick={toggleShuffle}
                                className={`hidden md:block transition-colors ${isShuffled ? 'text-[#b0fb5d]' : 'text-white/50 hover:text-white'}`}
                            >
                                <Shuffle size={16} />
                            </button>

                            <button
                                onClick={() => player.previousTrack()}
                                className="text-white/50 hover:text-white transition"
                            >
                                <SkipBack size={20} />
                            </button>

                            <button
                                onClick={() => player.togglePlay()}
                                className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition active:scale-95"
                            >
                                {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
                            </button>

                            <button
                                onClick={() => player.nextTrack()}
                                className="text-white/50 hover:text-white transition"
                            >
                                <SkipForward size={20} />
                            </button>

                            <button
                                onClick={cycleRepeat}
                                className={`hidden md:block transition-colors ${repeatMode > 0 ? 'text-[#b0fb5d]' : 'text-white/50 hover:text-white'}`}
                            >
                                <Repeat size={16} />
                                {repeatMode === 2 && <span className="text-xs absolute">1</span>}
                            </button>
                        </div>
                    </div>

                    {/* Volume */}
                    <div className="hidden md:flex items-center justify-end gap-2 w-1/3">
                        <button onClick={toggleMute} className="text-white/50 hover:text-white transition">
                            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                        />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
