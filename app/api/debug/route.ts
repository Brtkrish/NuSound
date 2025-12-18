import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const access_token = cookieStore.get('access_token');

    // Get all cookies
    const allCookies = cookieStore.getAll();

    // Also check raw cookie header
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const currentUrl = `${protocol}://${host}`;

    return NextResponse.json({
        hasAccessToken: !!access_token,
        accessTokenValue: access_token?.value ? `${access_token.value.substring(0, 10)}...` : null,
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
