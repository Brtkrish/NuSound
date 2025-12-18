import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'set') {
        const response = new NextResponse(JSON.stringify({ message: "Test cookie set. Please refresh this page." }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

        // Use the most standard cookie setting possible
        response.headers.append('Set-Cookie', 'debug_test=active; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600');

        return response;
    }

    const cookieHeader = request.headers.get('cookie') || 'None';

    return NextResponse.json({
        cookieHeader,
        instructions: "To test: visit /api/debug/test-cookie?action=set, then visit this URL again without the parameter."
    });
}
