import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function GET(request: Request) {
    const url = new URL('/', request.url);
    const response = NextResponse.redirect(url);

    response.headers.append('Set-Cookie', serialize('access_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: -1,
        path: '/'
    }));

    return response;
}
