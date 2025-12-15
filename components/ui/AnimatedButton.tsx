"use client";
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
    className?: string;
    icon?: ReactNode;
    disabled?: boolean;
}

export const AnimatedButton = ({ children, onClick, variant = 'primary', className, icon, disabled = false }: AnimatedButtonProps) => {
    const baseStyles = "px-6 py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-all";

    const variants = {
        primary: "bg-[#b0fb5d] text-black hover:shadow-[0_0_20px_rgba(176,251,93,0.4)]",
        secondary: "glass-panel text-white hover:bg-white/10",
        ghost: "bg-transparent text-gray-400 hover:text-white"
    };

    return (
        <motion.button
            whileHover={disabled ? {} : { scale: 1.05 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            className={cn(baseStyles, variants[variant], disabled && "opacity-50 cursor-not-allowed", className)}
        >
            {icon && <span>{icon}</span>}
            {children}
        </motion.button>
    );
};
