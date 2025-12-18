import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
import { getPlaylistsAction } from '@/lib/spotify-server';

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const access_token = cookieStore.get('access_token')?.value;

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
