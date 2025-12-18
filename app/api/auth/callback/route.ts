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
        // Use origin of current request to ensure cookie domain matches perfectly
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
        const cleanAppUrl = appUrl.startsWith('http') ? appUrl.replace(/\/$/, '') : `https://${appUrl.replace(/\/$/, '')}`;

        console.log(`Setting cookies and preparing redirect to ${cleanAppUrl}`);

        // 2. Use native Next.js cookies() helper (most robust way in Next.js 15)
        const cookieStore = await cookies();
        const maxAge = Number(expires_in) || 3600;

        // Set the real token
        cookieStore.set('access_token', access_token, {
            httpOnly: true,
            secure: true,
            path: '/',
            maxAge: maxAge,
            sameSite: 'lax',
        });

        // Set a canary cookie to verify the header is reaching the browser
        cookieStore.set('callback_canary', 'active', {
            httpOnly: true,
            secure: true,
            path: '/',
            maxAge: 3600,
            sameSite: 'lax',
        });

        // HTML payload for "Safe Redirect"
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
                        console.log("Cookie drop successful. Redirecting...");
                        setTimeout(() => { window.location.href = "${cleanAppUrl}/"; }, 300);
                    </script>
                </body>
            </html>
        `;

        return new NextResponse(html, {
            status: 200, // 200 OK is much more reliable for Set-Cookie than 302
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
