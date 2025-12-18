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
    console.log('Search Query:', query);
    console.log('Access Token exists:', !!access_token);

    if (!access_token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Search for the track
        const searchRes = await searchTracks(access_token, query, 1);

        if (!searchRes.ok) {
            const errorText = await searchRes.text();
            console.error('Spotify Search API Error:', searchRes.status, errorText);
            return NextResponse.json({ error: 'Spotify Search failed', details: errorText }, { status: searchRes.status });
        }

        const searchData = await searchRes.json();
        console.log('Search Results Count:', searchData.tracks?.items?.length || 0);

        if (!searchData.tracks || !searchData.tracks.items || searchData.tracks.items.length === 0) {
            return NextResponse.json({ tracks: [], related: [] });
        }

        const mainTrack = searchData.tracks.items[0];
        const seedTrackId = mainTrack.id;

        // 2. Get recommendations based on this track
        const recRes = await getRecommendationsBySeeds(access_token, [seedTrackId], 20);

        let relatedTracks = [];
        if (recRes.ok) {
            const recData = await recRes.json();
            relatedTracks = recData.tracks || [];
        } else {
            const recError = await recRes.text();
            console.error('Spotify Recommendations API Error:', recRes.status, recError);
        }

        const formatTrack = (t: any) => ({
            id: t.id,
            title: t.name,
            artist: t.artists[0]?.name || 'Unknown Artist',
            album: t.album?.name || 'Unknown Album',
            coverUrl: t.album?.images?.[0]?.url || '',
            popularity: t.popularity || 0,
        });

        return NextResponse.json({
            tracks: searchData.tracks.items.map(formatTrack),
            related: relatedTracks.map(formatTrack),
        });

    } catch (error: any) {
        console.error('Search API error:', error);
        return NextResponse.json({ error: 'Search failed', details: error.message }, { status: 500 });
    }
}
