export const dynamic = 'force-dynamic';

import { getAccessToken } from '@/lib/spotify';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Redis from 'ioredis';
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
            return NextResponse.json({ error: 'Authentication failed' }, { status: 400 });
        }

        // 1. Generate Session ID
        const sessionId = uuidv4();

        // 2. Connect to Redis
        if (!process.env.REDIS_URL) {
            console.error("REDIS_URL is missing");
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const redis = new Redis(process.env.REDIS_URL);

        // 3. Save Session (Securely)
        const sessionData = JSON.stringify({ access_token, refresh_token });
        await redis.set(`session:${sessionId}`, sessionData, 'EX', expires_in || 3600);
        await redis.quit();

        // 4. Save Cookie
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

        // 5. Redirect to Home
        const html = `
            <!DOCTYPE html>
            <html>
                <head><meta http-equiv="refresh" content="0;url=${cleanAppUrl}/"></head>
                <body style="background:#000;color:#fff;"></body>
            </html>
        `;

        return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html' } });

    } catch (error) {
        console.error("Auth Error:", error);
        // Generic error for the user, detailed log for you
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}