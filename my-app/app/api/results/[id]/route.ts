import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const sessionId = params.id;

        // Fetch all strategies and votes for this session
        const strategies = await prisma.strategy.findMany({
            where: { sessionId }
        });

        const votes = await prisma.vote.findMany({
            where: { sessionId }
        });

        // Score aggregations
        const importanceScores: Record<string, number> = {};
        const performanceScores: Record<string, { sum: number, count: number }> = {};

        strategies.forEach(s => {
            importanceScores[s.id] = 0;
            performanceScores[s.id] = { sum: 0, count: 0 };
        });

        // Calculate votes
        votes.forEach(vote => {
            const data = JSON.parse(vote.data);

            if (vote.type === 'importance') {
                const { strategyA, strategyB, choice } = data;
                if (choice === 'A') importanceScores[strategyA] += 1;
                else if (choice === 'B') importanceScores[strategyB] += 1;
                else if (choice === 'Neutral') {
                    importanceScores[strategyA] += 0.5;
                    importanceScores[strategyB] += 0.5;
                }
            } else if (vote.type === 'performance') {
                const { strategyId, rating } = data;
                performanceScores[strategyId].sum += rating;
                performanceScores[strategyId].count += 1;
            }
        });

        // Format output
        const results = strategies.map(s => {
            const perfAvg = performanceScores[s.id].count > 0
                ? performanceScores[s.id].sum / performanceScores[s.id].count
                : 0;

            return {
                id: s.id,
                text: s.text,
                importance: importanceScores[s.id],
                performance: perfAvg
            };
        });

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Failed to get results:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
