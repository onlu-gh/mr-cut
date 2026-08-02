import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request) {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0 || ids.some((id) => !Number.isInteger(id))) {
      return NextResponse.json({ error: 'ids must be a non-empty array of integers' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const active = await tx.broadcastMessage.findMany({
        where: { active: true },
        select: { id: true },
      });

      const activeIds = new Set(active.map((message) => message.id));
      if (activeIds.size !== ids.length || ids.some((id) => !activeIds.has(id))) {
        const conflict = new Error('Active messages changed, please reload and try again');
        conflict.status = 409;
        throw conflict;
      }

      for (const [index, id] of ids.entries()) {
        await tx.broadcastMessage.update({
          where: { id },
          data: { order: index },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering broadcast messages:', error);
    if (error.status === 409) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to reorder broadcast messages' }, { status: 500 });
  }
}
