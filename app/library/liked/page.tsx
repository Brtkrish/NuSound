import React from 'react';
import { redirect } from 'next/navigation';
import { LikedSongsUI } from '@/components/LikedSongsUI';
import { getLikedTracksAction, getSessionToken } from '@/lib/spotify-server';

export default async function LikedSongsPage() {
    const access_token = await getSessionToken();

    if (!access_token) {
        redirect('/api/auth/login');
    }

    let tracks: any[] = [];
    try {
        tracks = await getLikedTracksAction(access_token!);
    } catch (e) {
        console.error("Failed to fetch server-side liked songs:", e);
    }

    return <LikedSongsUI tracks={tracks} />;
}
