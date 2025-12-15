"use client";
import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Bell, Moon, Sun, Volume2, Languages, Shield, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [audioQuality, setAudioQuality] = useState('high');
    const [language, setLanguage] = useState('en');

    return (
        <div className="p-4 md:p-12 max-w-4xl mx-auto min-h-screen">
            {/* Header */}
            <div className="mb-12">
                <h1 className="text-3xl md:text-5xl font-bold mb-2">
                    <span className="gradient-text">Settings</span>
                </h1>
                <p className="text-gray-400">Customize your NuSound experience.</p>
            </div>

            {/* Settings Sections */}
            <div className="space-y-6">
                {/* Account Info */}
                <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Info className="w-5 h-5 text-[#b0fb5d]" />
                        <h2 className="text-xl font-bold">Account Information</h2>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Connected Service</span>
                            <span className="font-medium">Spotify</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Account Type</span>
                            <span className="font-medium">Premium</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">API Version</span>
                            <span className="font-medium">v1.0</span>
                        </div>
                    </div>
                </GlassCard>

                {/* Appearance */}
                <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        {darkMode ? <Moon className="w-5 h-5 text-[#b0fb5d]" /> : <Sun className="w-5 h-5 text-[#b0fb5d]" />}
                        <h2 className="text-xl font-bold">Appearance</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Dark Mode</p>
                                <p className="text-sm text-gray-400">Use dark theme (Light mode coming soon)</p>
                            </div>
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`relative w-14 h-8 rounded-full transition-colors ${darkMode ? 'bg-[#b0fb5d]' : 'bg-white/20'}`}
                            >
                                <motion.div
                                    animate={{ x: darkMode ? 26 : 2 }}
                                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                                />
                            </button>
                        </div>
                    </div>
                </GlassCard>

                {/* Audio Settings */}
                <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Volume2 className="w-5 h-5 text-[#b0fb5d]" />
                        <h2 className="text-xl font-bold">Audio Quality</h2>
                    </div>
                    <div className="space-y-3">
                        {['low', 'medium', 'high', 'very-high'].map((quality) => (
                            <button
                                key={quality}
                                onClick={() => setAudioQuality(quality)}
                                className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${audioQuality === quality
                                        ? 'bg-[#b0fb5d]/20 border border-[#b0fb5d]'
                                        : 'bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium capitalize">{quality.replace('-', ' ')}</p>
                                        <p className="text-xs text-gray-400">
                                            {quality === 'low' && '24kbit/s'}
                                            {quality === 'medium' && '96kbit/s'}
                                            {quality === 'high' && '160kbit/s'}
                                            {quality === 'very-high' && '320kbit/s'}
                                        </p>
                                    </div>
                                    {audioQuality === quality && (
                                        <div className="w-2 h-2 rounded-full bg-[#b0fb5d]" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </GlassCard>

                {/* Notifications */}
                <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Bell className="w-5 h-5 text-[#b0fb5d]" />
                        <h2 className="text-xl font-bold">Notifications</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">New Recommendations</p>
                                <p className="text-sm text-gray-400">Get notified when we find new music for you</p>
                            </div>
                            <button
                                onClick={() => setNotifications(!notifications)}
                                className={`relative w-14 h-8 rounded-full transition-colors ${notifications ? 'bg-[#b0fb5d]' : 'bg-white/20'}`}
                            >
                                <motion.div
                                    animate={{ x: notifications ? 26 : 2 }}
                                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                                />
                            </button>
                        </div>
                    </div>
                </GlassCard>

                {/* Language */}
                <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Languages className="w-5 h-5 text-[#b0fb5d]" />
                        <h2 className="text-xl font-bold">Language</h2>
                    </div>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#b0fb5d] transition-colors"
                    >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="ja">日本語</option>
                    </select>
                </GlassCard>

                {/* Privacy */}
                <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-5 h-5 text-[#b0fb5d]" />
                        <h2 className="text-xl font-bold">Privacy & Data</h2>
                    </div>
                    <div className="space-y-3 text-sm text-gray-300">
                        <p>NuSound uses cookies to authenticate with Spotify and provide personalized recommendations.</p>
                        <p>Your listening data is fetched from Spotify and is not stored on our servers.</p>
                        <div className="pt-4 flex gap-3">
                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                                Privacy Policy
                            </button>
                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                                Terms of Service
                            </button>
                        </div>
                    </div>
                </GlassCard>

                {/* About */}
                <GlassCard className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-tr from-[#b0fb5d] to-[#0affff]" />
                    <h3 className="text-xl font-bold mb-2">NuSound v1.0</h3>
                    <p className="text-sm text-gray-400 mb-4">Your personal music discovery companion</p>
                    <p className="text-xs text-gray-500">
                        Built with Next.js • Powered by Spotify
                    </p>
                </GlassCard>
            </div>
        </div>
    );
}
