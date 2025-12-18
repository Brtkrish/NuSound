export const dynamic = 'force-dynamic';

import { getAccessToken } from '@/lib/spotify';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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
        const cookieStore = await cookies();
        const maxAge = Number(expires_in) || 3600;

        // 🛡️ HYBRID FIX: Base64 Encode (Safety) + Chunking (Size)
        const encodedToken = Buffer.from(access_token).toString('base64');
        const CHUNK_SIZE = 3000; // Safe size under 4KB limit
        const tokenChunks = [];

        for (let i = 0; i < encodedToken.length; i += CHUNK_SIZE) {
            tokenChunks.push(encodedToken.slice(i, i + CHUNK_SIZE));
        }

        // Save Chunks
        tokenChunks.forEach((chunk, index) => {
            const cookieName = tokenChunks.length === 1 ? 'sp_token' : `sp_token.${index}`;
            cookieStore.set(cookieName, chunk, {
                httpOnly: true, // Secure it again
                secure: true,
                path: '/',
                maxAge: maxAge,
                sameSite: 'lax',
            });
        });

        // Save Count
        if (tokenChunks.length > 1) {
            cookieStore.set('sp_token_chunks', String(tokenChunks.length), {
                httpOnly: true,
                secure: true,
                path: '/',
                maxAge: maxAge,
                sameSite: 'lax',
            });
        }

        // Diagnostic: Save the ORIGINAL length so we know exactly how big it is
        cookieStore.set('debug_token_len', String(access_token.length), { path: '/', maxAge: 3600 });

        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Authenticating...</title>
                    <meta http-equiv="refresh" content="0;url=${cleanAppUrl}/">
                    <style>body { background: #000; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; }</style>
                </head>
                <body><p>Redirecting...</p><script>setTimeout(() => { window.location.href = "${cleanAppUrl}/"; }, 100);</script></body>
            </html>
        `;

        return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html' } });

    } catch (error) {
        return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
    }
}