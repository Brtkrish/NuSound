import { NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/spotify-server';
import { getRecommendationsBySeeds } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get('trackId');
    const artistId = searchParams.get('artistId');

    if (!trackId) {
        return NextResponse.json({ error: 'trackId required' }, { status: 400 });
    }

    const access_token = await getSessionToken();
    if (!access_token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('Fetching recommendations for seeds:', { trackId, artistId });
        const seedArtists = artistId ? [artistId] : [];
        let recRes = await getRecommendationsBySeeds(access_token, [trackId], seedArtists, 10);

        let recData = null;
        if (recRes.ok) {
            recData = await recRes.json();
        }

        // Fallback: If no tracks found with both seeds, try with just trackId
        if ((!recData || !recData.tracks || recData.tracks.length === 0) && artistId) {
            console.log('No results with track + artist seeds. Retrying with only trackId...');
            const fallbackRes = await getRecommendationsBySeeds(access_token, [trackId], [], 10);
            if (fallbackRes.ok) {
                recData = await fallbackRes.json();
            } else {
                console.error('Fallback Spotify Recommendations API Error:', fallbackRes.status);
            }
        }

        if (!recData) {
            console.error('Spotify Recommendations API failed or returned no data');
            return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: recRes.status });
        }

        console.log('Recommendations received count:', recData.tracks?.length || 0);

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
