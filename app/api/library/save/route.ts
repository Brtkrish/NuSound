import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
import { saveTrack } from '@/lib/spotify';

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const access_token = cookieStore.get('access_token')?.value;

    if (!access_token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { trackId } = await request.json();

        if (!trackId) {
            return NextResponse.json({ error: 'Track ID required' }, { status: 400 });
        }

        await saveTrack(access_token, trackId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Save track error:', error);
        return NextResponse.json({ error: 'Failed to save track' }, { status: 500 });
    }
}
