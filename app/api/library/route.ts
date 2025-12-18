import { getLikedTracksAction } from '@/lib/spotify-server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const access_token = cookieStore.get('access_token')?.value;

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
