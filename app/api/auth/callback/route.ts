export const dynamic = 'force-dynamic';

import { getAccessToken } from '@/lib/spotify';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    try {
        const tokenResponse = await getAccessToken(code);
        const { access_token, expires_in } = tokenResponse;

        if (!access_token) {
            console.error("Token exchange failed:", tokenResponse);
            return NextResponse.json(tokenResponse, { status: 400 });
        }

        // 1. Determine redirect destination
        // Use origin of current request to ensure cookie domain matches perfectly
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
        const cleanAppUrl = appUrl.startsWith('http') ? appUrl.replace(/\/$/, '') : `https://${appUrl.replace(/\/$/, '')}`;

        console.log(`Callback successful. Redirecting to ${cleanAppUrl}`);

        // 2. Build the response with manual headers for maximum Vercel compatibility
        // Some Next.js versions have issues with response.cookies.set during redirects
        const maxAge = Number(expires_in) || 3600;

        // Construct standard Set-Cookie string
        const cookieOptions = [
            `access_token=${access_token}`,
            `Max-Age=${maxAge}`,
            `Path=/`,
            `HttpOnly`,
            `Secure`,
            `SameSite=Lax`
        ].join('; ');

        return new NextResponse(null, {
            status: 302,
            headers: {
                'Location': `${cleanAppUrl}/`,
                'Set-Cookie': cookieOptions,
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error) {
        console.error("Callback error:", error);
        return NextResponse.json({
            error: 'Authentication failed',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
