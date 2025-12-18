import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function GET() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
        throw new Error("NEXT_PUBLIC_APP_URL is not defined");
    }

    const response = NextResponse.redirect(`${appUrl}/`);

    response.headers.append(
        "Set-Cookie",
        serialize("access_token", "", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: 0, // immediately expire
        })
    );

    return response;
}
