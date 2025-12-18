import { redirect } from 'next/navigation';
import { LibraryUI } from '@/components/LibraryUI';
import { getPlaylistsAction, getLikedTracksAction, getSessionToken } from '@/lib/spotify-server';

export default async function LibraryPage() {
    const access_token = await getSessionToken();

    if (!access_token) {
        redirect('/api/auth/login');
    }

    let initialPlaylists = [];
    let initialLikedCount = 0;

    try {
        const [playlists, likedTracks] = await Promise.all([
            getPlaylistsAction(access_token!),
            getLikedTracksAction(access_token!)
        ]);
        initialPlaylists = playlists;
        initialLikedCount = likedTracks.length;
    } catch (e) {
        console.error("Failed to fetch server-side library:", e);
    }

    return <LibraryUI initialPlaylists={initialPlaylists} initialLikedCount={initialLikedCount} />;
}
