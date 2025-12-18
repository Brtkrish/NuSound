import { getRecommendationsAction, getSessionToken } from '@/lib/spotify-server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const access_token = await getSessionToken();

    if (!access_token) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const formattedTracks = await getRecommendationsAction(access_token);
        return NextResponse.json(formattedTracks, {
            headers: { 'Vary': 'Cookie' }
        });
    } catch (error: any) {
        console.error("Recommendations API Error:", error);
        return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }
}
