import { cookies } from 'next/headers';
import { getUserPlaylists, getSavedTracks, getUserProfile, getTopTracks, getRelatedArtists, getArtistTopTracks, getNewReleases, getPlaylistTracks } from './spotify';

/**
 * Robustly retrieves the Spotify access token from cookies.
 * Handles both Single Cookie (small tokens) and Chunked Cookies (large tokens).
 * Also handles Base64 decoding for the new safe storage format.
 */
export async function getSessionToken() {
    const cookieStore = await cookies();

    let rawToken = '';

    // 1. Try to assemble chunked token
    const chunkCount = cookieStore.get('sp_token_chunks')?.value;
    if (chunkCount) {
        const count = parseInt(chunkCount, 10);
        for (let i = 0; i < count; i++) {
            const chunk = cookieStore.get(`sp_token.${i}`)?.value;
            if (chunk) rawToken += chunk;
        }
    } else {
        // 2. Try single token
        rawToken = cookieStore.get('sp_token')?.value || '';

        // 3. Fallback: try to manually find chunks if count is missing
        if (!rawToken) {
            const firstChunk = cookieStore.get('sp_token.0')?.value;
            if (firstChunk) {
                rawToken = firstChunk;
                let nextIndex = 1;
                while (true) {
                    const nextChunk = cookieStore.get(`sp_token.${nextIndex}`)?.value;
                    if (!nextChunk) break;
                    rawToken += nextChunk;
                    nextIndex++;
                }
            }
        }
    }

    // 4. Decode the result (since we Base64 encoded it in the callback)
    if (rawToken) {
        try {
            return Buffer.from(rawToken, 'base64').toString('utf-8');
        } catch (e) {
            console.error("Token decoding failed, returning raw", e);
            return rawToken; // Fallback to raw if it wasn't encoded
        }
    }

    // 5. Legacy Fallback
    return cookieStore.get('access_token')?.value || null;
}

// ---------------------------------------------------------
// DATA ACTIONS (Restored)
// ---------------------------------------------------------

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
        topArtists: [],
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