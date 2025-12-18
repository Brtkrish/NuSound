import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
import { getSavedTracks } from '@/lib/spotify';

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const access_token = cookieStore.get('access_token')?.value;

    if (!access_token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch only 50 liked songs for performance
        const res = await getSavedTracks(access_token, 50, 0);
        const data = await res.json();

        const tracks = (data.items || []).map((item: any) => ({
            id: item.track.id,
            title: item.track.name,
            artist: item.track.artists.map((a: any) => a.name).join(', '),
            album: item.track.album.name,
            coverUrl: item.track.album.images[0]?.url || '',
            addedAt: item.added_at,
        }));

        return NextResponse.json(tracks);
    } catch (error) {
        console.error('Library fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch library' }, { status: 500 });
    }
}
