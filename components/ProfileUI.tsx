"use client";
import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { User, Music, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface UserProfile {
    displayName: string;
    email: string;
    image: string;
    country: string;
    followers: number;
    product: string;
}

interface TopArtist {
    id: string;
    name: string;
    image: string;
}

interface TopTrack {
    id: string;
    title: string;
    artist: string;
    coverUrl: string;
}

interface ProfileUIProps {
    profile: UserProfile;
    topArtists: TopArtist[];
    topTracks: TopTrack[];
}

export function ProfileUI({ profile, topArtists, topTracks }: ProfileUIProps) {
    return (
        <div className="p-4 md:p-12 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="mb-12">
                <h1 className="text-3xl md:text-5xl font-bold mb-2">
                    Your <span className="gradient-text">Profile</span>
                </h1>
                <p className="text-gray-400">Manage your account and view your listening stats.</p>
            </div>

            {/* Profile Card */}
            <GlassCard className="p-6 md:p-8 mb-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Avatar */}
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-gradient-to-br from-[#b0fb5d] to-[#0affff] flex items-center justify-center flex-shrink-0">
                        {profile.image ? (
                            <Image src={profile.image} alt={profile.displayName} width={160} height={160} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-16 h-16 md:w-20 md:h-20 text-black" />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold mb-2">{profile.displayName}</h2>
                        <p className="text-gray-400 mb-4">{profile.email}</p>

                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            <div className="px-4 py-2 bg-white/5 rounded-lg">
                                <span className="text-xs text-gray-400">Plan</span>
                                <p className="font-bold capitalize">{profile.product}</p>
                            </div>
                            <div className="px-4 py-2 bg-white/5 rounded-lg">
                                <span className="text-xs text-gray-400">Followers</span>
                                <p className="font-bold">{profile.followers}</p>
                            </div>
                            <div className="px-4 py-2 bg-white/5 rounded-lg">
                                <span className="text-xs text-gray-400">Country</span>
                                <p className="font-bold uppercase">{profile.country}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Top Artists */}
                <GlassCard className="p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Music className="w-5 h-5 text-[#b0fb5d]" />
                        Top Artists
                    </h3>
                    <div className="space-y-3">
                        {topArtists.slice(0, 5).map((artist, index) => (
                            <motion.div
                                key={artist.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                <span className="text-gray-500 w-6">{index + 1}</span>
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                                    {artist.image ? (
                                        <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Music className="w-5 h-5 text-gray-600" />
                                        </div>
                                    )}
                                </div>
                                <span className="font-medium truncate">{artist.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>

                {/* Top Tracks */}
                <GlassCard className="p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-[#b0fb5d]" />
                        Top Tracks
                    </h3>
                    <div className="space-y-3">
                        {topTracks.slice(0, 5).map((track, index) => (
                            <motion.div
                                key={track.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                <span className="text-gray-500 w-6">{index + 1}</span>
                                <div className="w-10 h-10 rounded overflow-hidden bg-gray-800 flex-shrink-0">
                                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium truncate text-sm">{track.title}</p>
                                    <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
