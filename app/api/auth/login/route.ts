import { getAuthorizationUrl } from '@/lib/spotify';
import { NextResponse } from 'next/server';

export async function GET() {
    const url = getAuthorizationUrl();
    console.log("Redirecting to Spotify with URL:", url);
    return NextResponse.redirect(url);
}
