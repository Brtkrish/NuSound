import { getAccessToken } from '@/lib/spotify';
import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    try {
        const tokenResponse = await getAccessToken(code);
        console.log("Token Response:", tokenResponse);
        const { access_token, refresh_token, expires_in } = tokenResponse;

        if (!access_token) {
            return NextResponse.json(tokenResponse, { status: 400 });
        }

        // Create the response object
        const response = NextResponse.redirect(new URL('/', request.url));

        // Set cookies
        const cookieString = serialize('access_token', access_token, {
            httpOnly: true,
            secure: true,
            path: '/',
            maxAge: expires_in,
            sameSite: 'none',
        });

        console.log('Setting cookie with config:', {
            httpOnly: true,
            secure: true,
            nodeEnv: process.env.NODE_ENV,
            path: '/',
            maxAge: expires_in,
            sameSite: 'none',
        });
        console.log('Cookie string:', cookieString.substring(0, 100) + '...');

        response.headers.append('Set-Cookie', cookieString);

        // In a real app we'd also store the refresh token securely

        return response;
    } catch (error) {
        return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 });
    }
}
