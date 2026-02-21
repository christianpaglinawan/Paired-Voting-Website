import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ passcode: string }> }
) {
    try {
        const { passcode } = await params;

        const session = await prisma.session.findUnique({
            where: { passcode: passcode.toUpperCase() }
        });

        if (!session) {
            return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 });
        }

        const participantToken = crypto.randomUUID();

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
