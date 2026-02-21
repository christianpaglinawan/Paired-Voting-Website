import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { sessionId, strategies } = await req.json();

        if (!sessionId || !strategies || !Array.isArray(strategies) || strategies.length < 2) {
            return NextResponse.json({ error: 'Invalid input. At least 2 strategies are required.' }, { status: 400 });
        }

        // Clear existing strategies for this session to allow bulk overwrite
        await prisma.strategy.deleteMany({
            where: { sessionId }
        });

        const createdStrategies = await prisma.strategy.createMany({
            data: strategies.map((text: string, index: number) => ({
                sessionId,
                text,
                order: index
            }))
        });

        return NextResponse.json({ success: true, count: createdStrategies.count });
    } catch (error) {
        console.error('Failed to create strategies:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
