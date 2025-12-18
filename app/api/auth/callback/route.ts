export const dynamic = 'force-dynamic';

import { getAccessToken } from '@/lib/spotify';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
        const cleanAppUrl = appUrl.startsWith('http') ? appUrl.replace(/\/$/, '') : `https://${appUrl.replace(/\/$/, '')}`;

        // 2. Use native Next.js cookies() helper
        const cookieStore = await cookies();
        const maxAge = Number(expires_in) || 3600;

        // 🟢 FIX: Save raw token. Do NOT Base64 encode (it causes size bloat > 4096 bytes)
        cookieStore.set('sp_token', access_token, {
            httpOnly: true,
            secure: true,
            path: '/',
            maxAge: maxAge,
            sameSite: 'lax',
        });

        // Set canaries for diagnostic depth
        cookieStore.set('callback_canary', 'active', {
            httpOnly: true,
            secure: true,
            path: '/',
            maxAge: 3600,
            sameSite: 'lax',
        });

        cookieStore.set('token_len', String(access_token.length), {
            path: '/',
            maxAge: 3600,
        });

        // HTML payload for "Safe Redirect" technique
        // (Ensures cookies are set before the redirect happens)
        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Authenticating...</title>
                    <meta http-equiv="refresh" content="0;url=${cleanAppUrl}/">
                    <style>
                        body { background: #000; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                        .loader { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #b0fb5d; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin-right: 12px; }
                        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    </style>
                </head>
                <body>
                    <div class="loader"></div>
                    <p>Completing login...</p>
                    <script>
                        setTimeout(() => { window.location.href = "${cleanAppUrl}/"; }, 300);
                    </script>
                </body>
            </html>
        `;

        return new NextResponse(html, {
            status: 200,
            headers: {
                'Content-Type': 'text/html',
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