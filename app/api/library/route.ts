import { getLikedTracksAction, getSessionToken } from '@/lib/spotify-server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const access_token = await getSessionToken();

    if (!access_token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const tracks = await getLikedTracksAction(access_token, 50);
        return NextResponse.json(tracks);
    } catch (error) {
        console.error('Library fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch library' }, { status: 500 });
    }
}
