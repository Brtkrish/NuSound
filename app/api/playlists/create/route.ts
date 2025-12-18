import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
import { createPlaylist, getUserProfile } from '@/lib/spotify';

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const access_token = cookieStore.get('access_token')?.value;

    if (!access_token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, description, isPublic } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Playlist name required' }, { status: 400 });
        }

        // Get user ID first
        const profileRes = await getUserProfile(access_token);
        const profile = await profileRes.json();

        const res = await createPlaylist(access_token, profile.id, name, description || '', isPublic ?? false);
        const data = await res.json();

        return NextResponse.json({
            id: data.id,
            name: data.name,
            description: data.description,
            images: data.images,
        });
    } catch (error) {
        console.error('Create playlist error:', error);
        return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
    }
}
