import { NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/spotify-server';
import { getPlaylistsAction } from '@/lib/spotify-server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const access_token = await getSessionToken();

    if (!access_token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const playlists = await getPlaylistsAction(access_token);
        return NextResponse.json(playlists);
    } catch (error) {
        console.error('Playlist fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
    }
}
