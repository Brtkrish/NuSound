import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DiscoverUI } from '@/components/DiscoverUI';

export default async function DiscoverPage() {
    const cookieStore = await cookies();
    const access_token = cookieStore.get('access_token')?.value;

    if (!access_token) {
        redirect('/api/auth/login');
    }

    // Fetch initial data server-side
    // Using absolute URL to ensure it works in all environments
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    let initialTracks = [];
    try {
        const res = await fetch(`${appUrl}/api/recommendations`, {
            cache: 'no-store'
        });

        if (res.ok) {
            initialTracks = await res.json();
        }
    } catch (e) {
        console.error("Failed to fetch server-side recommendations:", e);
    }

    return <DiscoverUI initialTracks={initialTracks} />;
}
