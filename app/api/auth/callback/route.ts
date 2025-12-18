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

        // 1. Prepare HTML Redirect (Meta Refresh)
        // We use a 1-second delay to give the browser time to process the "Set-Cookie" header
        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Authenticating...</title>
                    <meta http-equiv="refresh" content="1;url=${cleanAppUrl}/">
                </head>
                <body style="background:#000;color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">
                    <div style="width:40px;height:40px;border:4px solid #333;border-top:4px solid #1DB954;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:20px;"></div>
                    <p>Finalizing login...</p>
                    <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
                </body>
            </html>
        `;

        // 2. Create Response
        const response = new NextResponse(html, {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
        });

        // 3. Set Cookies with SameSite='None' (Crucial for OAuth Redirects)
        const maxAge = Number(expires_in) || 3600;
        const safeToken = encodeURIComponent(access_token);
        const CHUNK_SIZE = 1000;

        // Chunking Logic
        for (let i = 0; i < safeToken.length; i += CHUNK_SIZE) {
            const chunk = safeToken.slice(i, i + CHUNK_SIZE);
            const name = safeToken.length <= CHUNK_SIZE ? 'sp_token' : `sp_token.${Math.floor(i / CHUNK_SIZE)}`;

            response.cookies.set(name, chunk, {
                httpOnly: false, // Visible for debugging
                secure: true,    // Required for SameSite=None
                path: '/',
                maxAge: maxAge,
                sameSite: 'none', // 🟢 CRITICAL FIX: Allows cookie set from external redirect
            });
        }

        // Save Count
        const totalChunks = Math.ceil(safeToken.length / CHUNK_SIZE);
        if (totalChunks > 1) {
            response.cookies.set('sp_token_chunks', String(totalChunks), {
                httpOnly: false,
                secure: true,
                path: '/',
                maxAge: maxAge,
                sameSite: 'none', // 🟢 CRITICAL FIX
            });
        }

        return response;

    } catch (error) {
        console.error("Auth Error:", error);
        return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
    }
}