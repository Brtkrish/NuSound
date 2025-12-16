'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface LikeButtonProps {
    trackId: string;
    initialLiked?: boolean;
}

export function LikeButton({ trackId, initialLiked = false }: LikeButtonProps) {
    const [isLiked, setIsLiked] = useState(initialLiked);
    const [isLoading, setIsLoading] = useState(false);

    const toggleLike = async () => {
        // Optimistic update
        const previousState = isLiked;
        setIsLiked(!isLiked);
        setIsLoading(true);

        try {
            const endpoint = isLiked ? '/api/library/remove' : '/api/library/save';
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackId }),
                credentials: 'include',
            });

            if (!res.ok) {
                throw new Error('Failed to update');
            }
        } catch (error) {
            console.error('Failed to update like status:', error);
            // Revert on error
            setIsLiked(previousState);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.button
            onClick={toggleLike}
            disabled={isLoading}
            className="p-3 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
            whileTap={{ scale: 0.9 }}
        >
            <Heart
                size={20}
                className={`transition-colors ${isLiked ? 'fill-[#b0fb5d] text-[#b0fb5d]' : 'text-gray-400 hover:text-[#b0fb5d]'
                    }`}
            />
        </motion.button>
    );
}
