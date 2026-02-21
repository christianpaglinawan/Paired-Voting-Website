import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { sessionId, strategyId, rating } = await request.json();

        await prisma.vote.create({
            data: {
                sessionId,
                participantId: 'temp-user',
                type: 'performance',
                data: JSON.stringify({ strategyId, rating })
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save performance vote:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
