import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LikedSongsUI } from '@/components/LikedSongsUI';

export default async function LikedSongsPage() {
    const cookieStore = await cookies();
    const access_token = cookieStore.get('access_token')?.value;

    if (!access_token) {
        redirect('/api/auth/login');
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    let tracks = [];
    try {
        const res = await fetch(`${appUrl}/api/library`, {
            headers: { Cookie: `access_token=${access_token}` },
            next: { revalidate: 0 }
        });

        if (res.ok) {
            tracks = await res.json();
        }
    } catch (e) {
        console.error("Failed to fetch server-side liked songs:", e);
    }

    return <LikedSongsUI tracks={tracks} />;
}
