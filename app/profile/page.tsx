import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ProfileUI } from '@/components/ProfileUI';

export default async function ProfilePage() {
    const cookieStore = await cookies();
    const access_token = cookieStore.get('access_token')?.value;

    if (!access_token) {
        redirect('/api/auth/login');
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    let profile = null;
    let topArtists = [];
    let topTracks = [];

    try {
        const res = await fetch(`${appUrl}/api/profile`, {
            headers: { Cookie: `access_token=${access_token}` },
            next: { revalidate: 0 }
        });

        if (res.ok) {
            const data = await res.json();
            profile = data.profile;
            topArtists = data.topArtists;
            topTracks = data.topTracks;
        }
    } catch (e) {
        console.error("Failed to fetch server-side profile:", e);
    }

    if (!profile) {
        redirect('/api/auth/login');
    }

    return <ProfileUI profile={profile} topArtists={topArtists} topTracks={topTracks} />;
}
