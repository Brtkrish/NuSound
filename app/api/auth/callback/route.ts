export const dynamic = 'force-dynamic';

import { getAccessToken } from '@/lib/spotify';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

    try {
        const tokenResponse = await getAccessToken(code);
        const { access_token, expires_in, refresh_token } = tokenResponse;

        if (!access_token) {
            console.error("Token exchange failed:", tokenResponse);
            return NextResponse.json(tokenResponse, { status: 400 });
        }

        // 1. Generate a tiny Session ID (e.g., "550e8400-e29b...")
        const sessionId = uuidv4();

        // 2. Save the BIG token to your "nusound" KV Database
        // We set it to expire automatically when the token expires (3600 seconds)
        const sessionData = {
            access_token,
            refresh_token,
        };

        // This line talks to Vercel KV automatically using environment variables
        await kv.set(`session:${sessionId}`, sessionData, { ex: expires_in || 3600 });

        // 3. Save ONLY the tiny Session ID in the user's browser cookie
        // This is tiny (~36 bytes) so it will NEVER be blocked by Vercel
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
        const cleanAppUrl = appUrl.startsWith('http') ? appUrl.replace(/\/$/, '') : `https://${appUrl.replace(/\/$/, '')}`;
        const cookieStore = await cookies();

        cookieStore.set('session_id', sessionId, {
            httpOnly: true,
            secure: true,
            path: '/',
            maxAge: expires_in || 3600,
            sameSite: 'lax',
        });

        // 4. Redirect to Home
        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta http-equiv="refresh" content="0;url=${cleanAppUrl}/">
                    <title>Redirecting...</title>
                </head>
                <body style="background:#000;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">
                    <p>Secure login successful...</p>
                </body>
            </html>
        `;

        return new NextResponse(html, {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
        });

    } catch (error) {
        console.error("KV Auth Error:", error);
        return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
    }
}