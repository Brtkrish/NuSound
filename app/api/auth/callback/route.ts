import { getAccessToken } from '@/lib/spotify';
import { NextResponse } from 'next/server';

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

        // Create the response object (FAIL LOUD if env is missing)
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;

        if (!appUrl) {
            throw new Error("NEXT_PUBLIC_APP_URL is not defined");
        }

        const response = NextResponse.redirect(`${appUrl}/`);

        response.cookies.set('access_token', access_token, {
            httpOnly: true,
            secure: true,
            path: '/',
            maxAge: expires_in,
            sameSite: 'none',
        });

        // In a real app we'd also store the refresh token securely

        return response;
    } catch (error) {
        return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 });
    }
}
