import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { sessionId, strategyA, strategyB, choice } = await request.json();

        // In a real app we'd validate the participantToken from cookies here

        // Record the vote
        await prisma.vote.create({
            data: {
                sessionId,
                participantId: 'temp-user', // Mocked user until full auth
                type: 'importance',
                data: JSON.stringify({ strategyA, strategyB, choice })
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save importance vote:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
