import { NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/spotify-server';
import { getPlaylistTracks } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const access_token = await getSessionToken();

    if (!access_token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const res = await getPlaylistTracks(access_token, id);
        const data = await res.json();

        const tracks = data.items.map((item: any) => ({
            id: item.track.id,
            title: item.track.name,
            artist: item.track.artists.map((a: any) => a.name).join(', '),
            album: item.track.album.name,
            coverUrl: item.track.album.images[0]?.url || '',
            addedAt: item.added_at,
        }));

        return NextResponse.json(tracks);
    } catch (error) {
        console.error('Playlist tracks fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch playlist tracks' }, { status: 500 });
    }
}
