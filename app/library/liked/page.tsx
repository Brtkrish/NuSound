import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LikedSongsUI } from '@/components/LikedSongsUI';
import { getLikedTracksAction } from '@/lib/spotify-server';

export default async function LikedSongsPage() {
    const cookieStore = await cookies();
    const access_token = cookieStore.get('access_token')?.value;

    if (!access_token) {
        redirect('/api/auth/login');
    }

    let tracks: any[] = [];
    try {
        tracks = await getLikedTracksAction(access_token);
    } catch (e) {
        console.error("Failed to fetch server-side liked songs:", e);
    }

    return <LikedSongsUI tracks={tracks} />;
}
