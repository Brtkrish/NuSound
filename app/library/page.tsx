import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LibraryUI } from '@/components/LibraryUI';

export default async function LibraryPage() {
    const cookieStore = await cookies();
    const access_token = cookieStore.get('access_token')?.value;

    if (!access_token) {
        redirect('/api/auth/login');
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    let initialPlaylists = [];
    let initialLikedCount = 0;

    try {
        const [playlistsRes, likedRes] = await Promise.all([
            fetch(`${appUrl}/api/playlists`, {
                headers: { Cookie: `access_token=${access_token}` },
                next: { revalidate: 0 }
            }),
            fetch(`${appUrl}/api/library`, {
                headers: { Cookie: `access_token=${access_token}` },
                next: { revalidate: 0 }
            })
        ]);

        if (playlistsRes.ok) initialPlaylists = await playlistsRes.json();
        if (likedRes.ok) {
            const likedData = await likedRes.json();
            initialLikedCount = Array.isArray(likedData) ? likedData.length : 0;
        }
    } catch (e) {
        console.error("Failed to fetch server-side library:", e);
    }

    return <LibraryUI initialPlaylists={initialPlaylists} initialLikedCount={initialLikedCount} />;
}
