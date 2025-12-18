import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
import { getUserPlaylists } from '@/lib/spotify';

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const access_token = cookieStore.get('access_token')?.value;

    if (!access_token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const res = await getUserPlaylists(access_token);
        const data = await res.json();

        const playlists = data.items.map((playlist: any) => ({
            id: playlist.id,
            name: playlist.name,
            description: playlist.description || '',
            images: playlist.images,
            trackCount: playlist.tracks.total,
            owner: playlist.owner.display_name,
            isPublic: playlist.public,
        }));

        return NextResponse.json(playlists);
    } catch (error) {
        console.error('Playlist fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
    }
}
