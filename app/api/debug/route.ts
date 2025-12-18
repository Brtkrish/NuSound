import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const sp_token = cookieStore.get('sp_token');
    const access_token = cookieStore.get('access_token');
    const token_len = cookieStore.get('token_len');

    // Decode sp_token if present for display
    let decodedPreview = null;
    if (sp_token?.value) {
        try {
            const decoded = Buffer.from(sp_token.value, 'base64').toString('utf-8');
            decodedPreview = `${decoded.substring(0, 10)}...`;
        } catch (e) {
            decodedPreview = "DECODE_FAILED";
        }
    }

    const allCookies = cookieStore.getAll();
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const currentUrl = `${protocol}://${host}`;

    return NextResponse.json({
        hasSPToken: !!sp_token,
        hasAccessToken: !!access_token,
        spTokenPreview: decodedPreview,
        tokenLen: token_len?.value || "Unknown",
        allCookieNames: allCookies.map(c => c.name),
        cookieCount: allCookies.length,
        environment: process.env.NODE_ENV,
        host: host,
        appUrlEnv: process.env.NEXT_PUBLIC_APP_URL || 'Not Set',
        currentUrl: currentUrl,
        match: process.env.NEXT_PUBLIC_APP_URL === currentUrl ? "YES" : "NO",
        timestamp: new Date().toISOString(),
        rawHeaders: Array.from(request.headers.keys()).filter(k => !k.includes('auth') && !k.includes('cookie')),
    }, {
        headers: { 'Vary': 'Cookie', 'Cache-Control': 'no-store' }
    });
}
