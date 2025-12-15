import { getTopTracks, getRecommendations } from '@/lib/spotify';
import { NextResponse } from 'next/server';
import { parse } from 'cookie';

export async function GET(request: Request) {
    const cookies = parse(request.headers.get('cookie') || '');
    const access_token = cookies.access_token;

    if (!access_token) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        // 1. Get Seeds (Top Tracks)
        const topTracksRes = await getTopTracks(access_token);
        const topTracksData = await topTracksRes.json();

        if (!topTracksData.items) {
            throw new Error('Failed to fetch seeds');
        }

        const seeds = topTracksData.items.map((t: any) => t.id);

        // 2. Get Recommendations
        const recsRes = await getRecommendations(access_token, seeds);
        if (!recsRes) {
            return NextResponse.json([]);
        }
        const recsData = await recsRes.json();

        // 3. Format Response to match our App's Schema
        const formattedTracks = recsData.tracks.map((t: any) => ({
            id: t.id,
            title: t.name,
            artist: t.artists[0].name,
            album: t.album.name,
            coverUrl: t.album.images[0]?.url,
            duration: '0:00', // Spotify returns duration_ms, simplifying for now
            popularity: t.popularity,
        }));

        return NextResponse.json(formattedTracks);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
    }
}
