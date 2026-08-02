import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const messages = await prisma.broadcastMessage.findMany({
      orderBy: [
        { active: 'desc' },
        { order: { sort: 'asc', nulls: 'last' } },
        { updated_at: 'desc' },
      ],
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching broadcast messages:', error);
    return NextResponse.json({ error: 'Failed to fetch broadcast messages' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { content, active } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const isActive = Boolean(active);

    const message = await prisma.$transaction(async (tx) => {
      if (isActive) {
        await tx.broadcastMessage.updateMany({
          where: { active: true },
          data: { order: { increment: 1 } },
        });
      }

      return tx.broadcastMessage.create({
        data: {
          content,
          active: isActive,
          order: isActive ? 0 : null,
        },
      });
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error creating broadcast message:', error);
    return NextResponse.json({ error: 'Failed to create broadcast message' }, { status: 500 });
  }
}
