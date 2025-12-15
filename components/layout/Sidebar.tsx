"use client";
import React from 'react';
import { Home, Compass, User, Disc3, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Compass, label: 'Discover', href: '/discover' },
    { icon: Disc3, label: 'Library', href: '/library' },
    { icon: User, label: 'Profile', href: '/profile' },
];

export const Sidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 glass-panel border-r border-white/10 z-50 hidden md:flex flex-col p-6">
            <div className="flex items-center gap-3 mb-12">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#b0fb5d] to-[#0affff]" />
                <h1 className="text-2xl font-bold tracking-tighter">NuSound</h1>
            </div>

            <nav className="flex-1 space-y-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-colors relative overflow-hidden",
                                    isActive ? "text-black font-bold" : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="absolute inset-0 bg-[#b0fb5d] z-0"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <item.icon className="w-5 h-5 z-10 relative" />
                                <span className="z-10 relative">{item.label}</span>
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto">
                <button className="flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-white transition-colors w-full">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </button>
            </div>
        </aside>
    );
};
