"use client";
import React, { useState } from 'react';
import { Home, Compass, User, Disc3, Settings, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Compass, label: 'Discover', href: '/discover' },
    { icon: Disc3, label: 'Library', href: '/library' },
    { icon: User, label: 'Profile', href: '/profile' },
];

export const Sidebar = () => {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const NavContent = () => (
        <>
            <div className="flex items-center gap-3 mb-8 md:mb-12">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#b0fb5d] to-[#0affff]" />
                <h1 className="text-2xl font-bold tracking-tighter">NuSound</h1>
            </div>

            <nav className="flex-1 space-y-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
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

            <div className="mt-auto space-y-2">
                <Link href="/settings">
                    <button className="flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-white transition-colors w-full">
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                    </button>
                </Link>
                <Link href="/api/auth/logout">
                    <button className="flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-red-500 transition-colors w-full">
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                    </button>
                </Link>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="w-64 h-screen fixed left-0 top-0 glass-panel border-r border-white/10 z-[60] hidden md:flex flex-col p-6">
                <NavContent />
            </aside>

            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden fixed top-4 right-4 z-[70] p-3 glass-panel rounded-xl shadow-2xl active:scale-95 transition-transform"
            >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
                        />
                        <motion.aside
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="md:hidden fixed left-0 top-0 w-72 h-screen glass-panel border-r border-white/10 z-[60] flex flex-col p-6"
                        >
                            <NavContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
