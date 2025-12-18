import { NextResponse } from "next/server";

export async function GET() {
    let appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!appUrl.startsWith('http')) {
        appUrl = `https://${appUrl}`;
    }

    const cleanAppUrl = appUrl.replace(/\/$/, '');
    const response = NextResponse.redirect(`${cleanAppUrl}/`);

    // Clear everything
    response.cookies.set("sp_token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    response.cookies.set("access_token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    response.cookies.set("token_len", "", {
        path: "/",
        maxAge: 0,
    });

    return response;
}
