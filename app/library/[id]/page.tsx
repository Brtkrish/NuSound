import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PlaylistUI } from '@/components/PlaylistUI';
import { getPlaylistTracksAction } from '@/lib/spotify-server';

export default async function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const access_token = cookieStore.get('access_token')?.value;

    if (!access_token) {
        redirect('/api/auth/login');
    }

    let tracks: any[] = [];
    try {
        tracks = await getPlaylistTracksAction(access_token, id);
    } catch (e) {
        console.error("Failed to fetch server-side playlist tracks:", e);
    }

    return <PlaylistUI tracks={tracks} />;
}
