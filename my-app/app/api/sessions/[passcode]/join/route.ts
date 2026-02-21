import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(
    request: Request,
    { params }: { params: { passcode: string } }
) {
    try {
        const session = await prisma.session.findUnique({
            where: { passcode: params.passcode.toUpperCase() }
        });

        if (!session) {
            return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 });
        }

        // Generate a temporary participant token natively
        const participantToken = crypto.randomUUID();

        // Create a response and assign the token in an HTTP-only cookie
        const response = NextResponse.json({
            success: true,
            sessionId: session.id,
            participantToken
        });

        response.cookies.set('participantToken', participantToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });

        return response;
    } catch (error) {
        console.error('Failed to join session:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
