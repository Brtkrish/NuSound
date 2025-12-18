import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ProfileUI } from '@/components/ProfileUI';
import { getProfileAction } from '@/lib/spotify-server';

export default async function ProfilePage() {
    const cookieStore = await cookies();
    const access_token = cookieStore.get('access_token')?.value;

    if (!access_token) {
        redirect('/api/auth/login');
    }

    let profile = null;
    let topArtists: any[] = [];
    let topTracks: any[] = [];

    try {
        const data = await getProfileAction(access_token);
        profile = data.profile;
        topArtists = data.topArtists;
        topTracks = data.topTracks;
    } catch (e) {
        console.error("Failed to fetch server-side profile:", e);
    }

    if (!profile) {
        redirect('/api/auth/login');
    }

    return <ProfileUI profile={profile} topArtists={topArtists} topTracks={topTracks} />;
}
