import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Await params for Next.js 15
) {
    try {
        const { id } = await params;

        const strategies = await prisma.strategy.findMany({
            where: { sessionId: id },
            orderBy: { order: 'asc' }
        });

        return NextResponse.json({ strategies });
    } catch (error) {
        console.error('Failed to fetch strategies:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
