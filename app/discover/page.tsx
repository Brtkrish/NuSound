import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DiscoverUI } from '@/components/DiscoverUI';
import { getRecommendationsAction } from '@/lib/spotify-server';

export default async function DiscoverPage() {
    const cookieStore = await cookies();
    const access_token = cookieStore.get('access_token')?.value;

    if (!access_token) {
        redirect('/api/auth/login');
    }

    let initialTracks = [];
    try {
        initialTracks = await getRecommendationsAction(access_token);
    } catch (e) {
        console.error("Failed to fetch server-side recommendations:", e);
    }

    return <DiscoverUI initialTracks={initialTracks} />;
}
