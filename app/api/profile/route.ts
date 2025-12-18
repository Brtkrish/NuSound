import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
import { getUserProfile, getTopTracks } from '@/lib/spotify';

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const access_token = cookieStore.get('access_token')?.value;

    if (!access_token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const [profileRes, topTracksRes] = await Promise.all([
            getUserProfile(access_token),
            getTopTracks(access_token),
        ]);

        const profileData = await profileRes.json();
        const topTracksData = await topTracksRes.json();

        // Extract top artists from top tracks
        const artistMap = new Map();
        topTracksData.items.forEach((track: any) => {
            track.artists.forEach((artist: any) => {
                if (!artistMap.has(artist.id)) {
                    artistMap.set(artist.id, {
                        id: artist.id,
                        name: artist.name,
                        image: '', // Would need separate API call for artist images
                    });
                }
            });
        });

        const profile = {
            displayName: profileData.display_name || 'User',
            email: profileData.email,
            image: profileData.images?.[0]?.url || '',
            country: profileData.country || 'N/A',
            followers: profileData.followers?.total || 0,
            product: profileData.product || 'free',
        };

        const topArtists = Array.from(artistMap.values()).slice(0, 10);

        const topTracks = topTracksData.items.map((track: any) => ({
            id: track.id,
            title: track.name,
            artist: track.artists.map((a: any) => a.name).join(', '),
            coverUrl: track.album.images[0]?.url || '',
        }));

        return NextResponse.json({
            profile,
            topArtists,
            topTracks,
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}
