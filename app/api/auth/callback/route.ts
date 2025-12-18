export const dynamic = 'force-dynamic';

import { getAccessToken } from '@/lib/spotify';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Redis from 'ioredis'; // 🟢 CHANGED
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

        // 1. Generate Session ID
        const sessionId = uuidv4();

        // 2. Connect to Redis using the REDIS_URL you already have
        if (!process.env.REDIS_URL) {
            throw new Error("REDIS_URL is missing from Environment Variables");
        }
        const redis = new Redis(process.env.REDIS_URL);

        // 3. Save Session
        const sessionData = JSON.stringify({ access_token, refresh_token });
        // 'EX' means expire in seconds
        await redis.set(`session:${sessionId}`, sessionData, 'EX', expires_in || 3600);

        // Close connection to keep Vercel happy
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

        // 5. Redirect
        const html = `
            <!DOCTYPE html>
            <html>
                <head><meta http-equiv="refresh" content="0;url=${cleanAppUrl}/"></head>
                <body style="background:#000;color:#fff;"><p>Login successful...</p></body>
            </html>
        `;

        return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html' } });

    } catch (error: any) {
        console.error("Redis Auth Error:", error);
        return NextResponse.json({
            error: 'Auth failed',
            details: error.message
        }, { status: 500 });
    }
}