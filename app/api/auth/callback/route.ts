export const dynamic = 'force-dynamic';

import { getAccessToken } from '@/lib/spotify';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

    try {
        const tokenResponse = await getAccessToken(code);
        const { access_token, expires_in } = tokenResponse;

        if (!access_token) return NextResponse.json(tokenResponse, { status: 400 });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
        const cleanAppUrl = appUrl.startsWith('http') ? appUrl.replace(/\/$/, '') : `https://${appUrl.replace(/\/$/, '')}`;

        // 1. Prepare the HTML Redirect
        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Authenticating...</title>
                    <meta http-equiv="refresh" content="0;url=${cleanAppUrl}/">
                </head>
                <body style="background:#000;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;">
                    <p>Securing session...</p>
                </body>
            </html>
        `;

        // 2. Create the Response Object FIRST
        const response = new NextResponse(html, {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
        });

        // 3. Set Cookies DIRECTLY on the response (Bypasses some Vercel stripping issues)
        const maxAge = Number(expires_in) || 3600;
        const encodedToken = Buffer.from(access_token).toString('base64');
        const CHUNK_SIZE = 1000; // Keep it tiny!

        // Chunking Logic
        for (let i = 0; i < encodedToken.length; i += CHUNK_SIZE) {
            const chunk = encodedToken.slice(i, i + CHUNK_SIZE);
            const name = encodedToken.length <= CHUNK_SIZE ? 'sp_token' : `sp_token.${Math.floor(i / CHUNK_SIZE)}`;

            response.cookies.set(name, chunk, {
                httpOnly: false, // Keep false for now so you can verify
                secure: true,
                path: '/',
                maxAge: maxAge,
                sameSite: 'lax',
            });
        }

        // Save Count
        const totalChunks = Math.ceil(encodedToken.length / CHUNK_SIZE);
        if (totalChunks > 1) {
            response.cookies.set('sp_token_chunks', String(totalChunks), {
                httpOnly: false,
                secure: true,
                path: '/',
                maxAge: maxAge,
                sameSite: 'lax',
            });
        }

        return response;

    } catch (error) {
        console.error("Auth Error:", error);
        return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
    }
}