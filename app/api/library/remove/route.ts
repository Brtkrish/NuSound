import { NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/spotify-server';
import { removeTrack } from '@/lib/spotify';

export async function POST(request: Request) {
    const access_token = await getSessionToken();

    if (!access_token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { trackId } = await request.json();

        if (!trackId) {
            return NextResponse.json({ error: 'Track ID required' }, { status: 400 });
        }

        await removeTrack(access_token, trackId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Remove track error:', error);
        return NextResponse.json({ error: 'Failed to remove track' }, { status: 500 });
    }
}
