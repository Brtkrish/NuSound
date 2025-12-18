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

        // 🟢 FIX: PREPARE DATA FOR CLIENT-SIDE SAVING
        // We do NOT set headers here. We pass the data to the browser via HTML.
        const encodedToken = Buffer.from(access_token).toString('base64');
        const maxAge = Number(expires_in) || 3600;

        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Authenticating...</title>
                    <style>
                        body { background: #000; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
                        .loader { width: 48px; height: 48px; border: 5px solid #FFF; border-bottom-color: #1DB954; border-radius: 50%; animation: rotation 1s linear infinite; margin-bottom: 20px; }
                        @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    </style>
                </head>
                <body>
                    <span class="loader"></span>
                    <p>Finalizing secure session...</p>
                    
                    <script>
                        // 🟢 CLIENT-SIDE COOKIE LOGIC
                        // This runs in your browser, bypassing Vercel's header limits.
                        
                        const token = "${encodedToken}";
                        const maxAge = ${maxAge};
                        const CHUNK_SIZE = 1500;
                        
                        function setCookie(name, value) {
                            // "Lax" is fine here because we are technically on the same site now (the callback page)
                            document.cookie = name + "=" + value + "; path=/; max-age=" + maxAge + "; secure; samesite=lax";
                        }

                        try {
                            // 1. Chunk the token
                            const chunks = [];
                            for (let i = 0; i < token.length; i += CHUNK_SIZE) {
                                chunks.push(token.slice(i, i + CHUNK_SIZE));
                            }

                            // 2. Save Chunks
                            chunks.forEach((chunk, index) => {
                                const name = chunks.length === 1 ? 'sp_token' : ('sp_token.' + index);
                                setCookie(name, chunk);
                            });

                            // 3. Save Count
                            if (chunks.length > 1) {
                                setCookie('sp_token_chunks', chunks.length);
                            }

                            // 4. Redirect to Home
                            console.log("Cookies saved. Redirecting...");
                            setTimeout(() => {
                                window.location.href = "${cleanAppUrl}/";
                            }, 500);
                            
                        } catch (e) {
                            console.error("Cookie Error:", e);
                            document.body.innerHTML = "<p style='color:red'>Browser Error: " + e.message + "</p>";
                        }
                    </script>
                </body>
            </html>
        `;

        return new NextResponse(html, {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
        });

    } catch (error) {
        console.error("Auth Error:", error);
        return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
    }
}