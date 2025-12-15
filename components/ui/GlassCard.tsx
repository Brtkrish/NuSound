"use client";
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    hoverEffect?: boolean;
}

export const GlassCard = ({ children, className, onClick, hoverEffect = false }: GlassCardProps) => {
    return (
        <motion.div
            whileHover={hoverEffect ? { scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' } : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={onClick}
            className={cn(
                'glass-panel rounded-2xl p-6 transition-colors',
                onClick && 'cursor-pointer',
                className
            )}
        >
            {children}
        </motion.div>
    );
};
