import React from 'react';
import { redirect } from 'next/navigation';
import { PlaylistUI } from '@/components/PlaylistUI';
import { getPlaylistTracksAction, getSessionToken } from '@/lib/spotify-server';

export default async function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const access_token = await getSessionToken();

    if (!access_token) {
        redirect('/api/auth/login');
    }

    let tracks: any[] = [];
    try {
        tracks = await getPlaylistTracksAction(access_token!, id);
    } catch (e) {
        console.error("Failed to fetch server-side playlist tracks:", e);
    }

    return <PlaylistUI tracks={tracks} />;
}
