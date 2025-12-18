import { NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/spotify-server';
import { addTracksToPlaylist } from '@/lib/spotify';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const access_token = await getSessionToken();

    if (!access_token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const { trackUris } = await request.json();

        if (!trackUris || !Array.isArray(trackUris)) {
            return NextResponse.json({ error: 'Track URIs required' }, { status: 400 });
        }

        await addTracksToPlaylist(access_token, id, trackUris);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Add to playlist error:', error);
        return NextResponse.json({ error: 'Failed to add tracks' }, { status: 500 });
    }
}
