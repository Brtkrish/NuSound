import { getAccessToken } from '@/lib/spotify';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    try {
        const tokenResponse = await getAccessToken(code);
        const { access_token, refresh_token, expires_in } = tokenResponse;

        if (!access_token) {
            console.error("Token exchange failed:", tokenResponse);
            return NextResponse.json(tokenResponse, { status: 400 });
        }

        // 1. Determine app URL with protocol safety
        let appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Ensure appUrl has protocol
        if (!appUrl.startsWith('http')) {
            appUrl = `https://${appUrl}`;
        }

        // Remove trailing slash to prevent double slashes
        const cleanAppUrl = appUrl.replace(/\/$/, '');
        console.log(`Redirecting to: ${cleanAppUrl}/ after successful login`);

        const response = NextResponse.redirect(`${cleanAppUrl}/`);

        // 2. Set cookies with broad compatibility
        // SameSite=Lax is standard for first-party session cookies
        // SameSite=None is often blocked by browsers unless specifically needed for cross-site
        response.cookies.set('access_token', access_token, {
            httpOnly: true,
            secure: true, // Required for sameSite: 'none' or 'lax' over HTTPS
            path: '/',
            maxAge: Number(expires_in) || 3600,
            sameSite: 'lax',
        });

        return response;
    } catch (error) {
        console.error("Callback error:", error);
        return NextResponse.json({ error: 'Failed to authenticate', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
