import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        // Generate a random 6-character alphanumeric passcode
        const passcode = crypto.randomBytes(3).toString('hex').toUpperCase();

        // For development, ensure a default facilitator exists
        let facilitator = await prisma.facilitator.findFirst();
        if (!facilitator) {
            facilitator = await prisma.facilitator.create({
                data: {
                    email: 'admin@pairedvoting.com',
                    passwordHash: 'dummyhash'
                }
            });
        }

        const session = await prisma.session.create({
            data: {
                passcode,
                facilitatorId: facilitator.id,
                status: 'waiting'
            }
        });

        return NextResponse.json({ session });
    } catch (error) {
        console.error('Failed to create session:', error);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }
}
