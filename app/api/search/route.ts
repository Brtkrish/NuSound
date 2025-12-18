import { NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/spotify-server';
import { searchTracks, getRecommendationsBySeeds } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    const access_token = await getSessionToken();
    if (!access_token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Search for the track
        const searchRes = await searchTracks(access_token, query, 1);
        const searchData = await searchRes.json();

        if (!searchData.tracks || searchData.tracks.items.length === 0) {
            return NextResponse.json({ tracks: [], related: [] });
        }

        const mainTrack = searchData.tracks.items[0];
        const seedTrackId = mainTrack.id;

        // 2. Get recommendations based on this track
        const recRes = await getRecommendationsBySeeds(access_token, [seedTrackId], 20);
        const recData = await recRes.json();

        const formatTrack = (t: any) => ({
            id: t.id,
            title: t.name,
            artist: t.artists[0].name,
            album: t.album.name,
            coverUrl: t.album.images[0]?.url,
            popularity: t.popularity,
        });

        return NextResponse.json({
            tracks: searchData.tracks.items.map(formatTrack),
            related: (recData.tracks || []).map(formatTrack),
        });

    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
