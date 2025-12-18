import { NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/spotify-server';
import { getRecommendationsBySeeds } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get('trackId');

    if (!trackId) {
        return NextResponse.json({ error: 'trackId required' }, { status: 400 });
    }

    const access_token = await getSessionToken();
    if (!access_token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const recRes = await getRecommendationsBySeeds(access_token, [trackId], 10);

        if (!recRes.ok) {
            const errorText = await recRes.text();
            console.error('Spotify Recommendations API Error:', recRes.status, errorText);
            return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: recRes.status });
        }

        const recData = await recRes.json();

        const formatTrack = (t: any) => ({
            id: t.id,
            title: t.name,
            artist: t.artists[0]?.name || 'Unknown Artist',
            album: t.album?.name || 'Unknown Album',
            coverUrl: t.album?.images?.[0]?.url || '',
            popularity: t.popularity || 0,
        });

        return NextResponse.json((recData.tracks || []).map(formatTrack));

    } catch (error: any) {
        console.error('Recommendations API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
