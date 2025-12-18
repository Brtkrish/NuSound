import { cookies } from 'next/headers';
import { getUserPlaylists, getSavedTracks, getUserProfile, getTopTracks, getRelatedArtists, getArtistTopTracks, getNewReleases, getPlaylistTracks } from './spotify';

/**
 * Robustly retrieves the Spotify access token from cookies.
 * Handles decoding from Base64 if using the new 'sp_token' format.
 */
export async function getSessionToken() {
    const cookieStore = await cookies();

    // 1. Try the new sp_token format (Base64 encoded)
    const sp_token = cookieStore.get('sp_token')?.value;
    if (sp_token) {
        try {
            return Buffer.from(sp_token, 'base64').toString('utf-8');
        } catch (e) {
            console.error("Failed to decode sp_token:", e);
        }
    }

    // 2. Fallback to legacy access_token for transition period
    return cookieStore.get('access_token')?.value || null;
}

export async function getPlaylistsAction(access_token: string) {
    const res = await getUserPlaylists(access_token);
    if (!res.ok) throw new Error('Failed to fetch playlists');
    const data = await res.json();

    return data.items.map((playlist: any) => ({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description || '',
        images: playlist.images,
        trackCount: playlist.tracks.total,
        owner: playlist.owner.display_name,
        isPublic: playlist.public,
    }));
}

export async function getLikedTracksAction(access_token: string, limit = 50) {
    const res = await getSavedTracks(access_token, limit, 0);
    if (!res.ok) throw new Error('Failed to fetch library');
    const data = await res.json();

    return (data.items || []).map((item: any) => ({
        id: item.track.id,
        title: item.track.name,
        artist: item.track.artists.map((a: any) => a.name).join(', '),
        album: item.track.album.name,
        coverUrl: item.track.album.images[0]?.url || '',
        addedAt: item.added_at,
    }));
}

export async function getRecommendationsAction(access_token: string) {
    // 1. Get Seeds (Top Tracks)
    const topTracksRes = await getTopTracks(access_token);
    if (!topTracksRes.ok) throw new Error('Failed to fetch seeds');

    const topTracksData = await topTracksRes.json();
    if (!topTracksData.items || topTracksData.items.length === 0) {
        // Fallback to new releases if no top tracks
        const fallbackRes = await getNewReleases(access_token);
        const fallbackData = await fallbackRes.json();
        return fallbackData.albums.items.map((album: any) => ({
            id: album.id,
            title: album.name,
            artist: album.artists[0].name,
            album: album.name,
            coverUrl: album.images[0]?.url,
            duration: '0:00',
            popularity: 50,
        }));
    }

    const allSeedIds = topTracksData.items.map((t: any) => t.artists[0].id);
    const selectedSeeds = allSeedIds.sort(() => 0.5 - Math.random()).slice(0, 3);

    // Graph Expansion
    let artistPool: string[] = [...selectedSeeds];
    await Promise.all(selectedSeeds.map(async (seedId: string) => {
        const relatedRes = await getRelatedArtists(access_token, seedId);
        if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            if (relatedData.artists) {
                const relatedIds = relatedData.artists.slice(0, 4).map((a: any) => a.id);
                artistPool.push(...relatedIds);
            }
        }
    }));

    artistPool = Array.from(new Set(artistPool));
    let candidateTracks: any[] = [];
    await Promise.all(artistPool.map(async (artistId) => {
        const tracksRes = await getArtistTopTracks(access_token, artistId);
        if (tracksRes.ok) {
            const tracksData = await tracksRes.json();
            if (tracksData.tracks) {
                const validTracks = tracksData.tracks.filter((t: any) => t.popularity < 80);
                candidateTracks.push(...validTracks);
            }
        }
    }));

    const uniqueTracks = Array.from(new Map(candidateTracks.map(t => [t.id, t])).values());
    const shuffledTracks = uniqueTracks.sort(() => Math.random() - 0.5);
    const selectedTracks = shuffledTracks.slice(0, 20);

    return selectedTracks.map((t: any) => ({
        id: t.id,
        title: t.name,
        artist: t.artists[0].name,
        album: t.album.name,
        coverUrl: t.album.images[0]?.url,
        duration: '0:00',
        popularity: t.popularity,
    }));
}

export async function getProfileAction(access_token: string) {
    const profileRes = await getUserProfile(access_token);
    if (!profileRes.ok) throw new Error('Failed to fetch profile');
    const profile = await profileRes.json();

    const topTracksRes = await getTopTracks(access_token);
    const topTracksData = await topTracksRes.json();

    return {
        profile,
        topArtists: [], // We can add this later if needed
        topTracks: topTracksData.items.map((t: any) => ({
            id: t.id,
            title: t.name,
            artist: t.artists[0].name,
            album: t.album.name,
            coverUrl: t.album.images[0]?.url,
        }))
    };
}

export async function getPlaylistTracksAction(access_token: string, playlist_id: string) {
    const res = await getPlaylistTracks(access_token, playlist_id);
    if (!res.ok) throw new Error('Failed to fetch playlist tracks');
    const data = await res.json();

    return (data.items || []).map((item: any) => ({
        id: item.track.id,
        title: item.track.name,
        artist: item.track.artists.map((a: any) => a.name).join(', '),
        album: item.track.album.name,
        coverUrl: item.track.album.images[0]?.url || '',
        addedAt: item.added_at,
    }));
}
