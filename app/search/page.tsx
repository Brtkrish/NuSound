import { SearchUI } from '@/components/SearchUI';
import { getSessionToken } from '@/lib/spotify-server';
import { redirect } from 'next/navigation';

export default async function SearchPage() {
    const access_token = await getSessionToken();

    if (!access_token) {
        redirect('/api/auth/login');
    }

    return <SearchUI />;
}
