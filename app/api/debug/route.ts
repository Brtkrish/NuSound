import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const access_token = cookieStore.get('access_token');

    // Get all cookies
    const allCookies = cookieStore.getAll();

    return NextResponse.json({
        hasAccessToken: !!access_token,
        accessTokenValue: access_token?.value ? `${access_token.value.substring(0, 20)}...` : null,
        allCookieNames: allCookies.map(c => c.name),
        cookieCount: allCookies.length,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
}
