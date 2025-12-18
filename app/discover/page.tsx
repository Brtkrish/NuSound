import { redirect } from 'next/navigation';
import { DiscoverUI } from '@/components/DiscoverUI';
import { getRecommendationsAction, getSessionToken } from '@/lib/spotify-server';

export default async function DiscoverPage() {
    const access_token = await getSessionToken();

    if (!access_token) {
        redirect('/api/auth/login');
    }

    let initialTracks = [];
    try {
        initialTracks = await getRecommendationsAction(access_token!);
    } catch (e) {
        console.error("Failed to fetch server-side recommendations:", e);
    }

    return <DiscoverUI initialTracks={initialTracks} />;
}
