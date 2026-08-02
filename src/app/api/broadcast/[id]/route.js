import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const message = await prisma.broadcastMessage.findUnique({
      where: { id: Number(id) },
    });

    if (!message) {
      return NextResponse.json({ error: 'Broadcast message not found' }, { status: 404 });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error fetching broadcast message:', error);
    return NextResponse.json({ error: 'Failed to fetch broadcast message' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { content, active } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const isActive = Boolean(active);

    const message = await prisma.$transaction(async (tx) => {
      const existing = await tx.broadcastMessage.findUnique({
        where: { id: Number(id) },
      });

      if (!existing) {
        const notFound = new Error('Broadcast message not found');
        notFound.code = 'P2025';
        throw notFound;
      }

      const data = { content, active: isActive };

      if (isActive && !existing.active) {
        // Activation: shift all currently active messages down, put this one first.
        await tx.broadcastMessage.updateMany({
          where: { active: true },
          data: { order: { increment: 1 } },
        });
        data.order = 0;
      } else if (!isActive && existing.active) {
        // Deactivation: message leaves the ordered list.
        data.order = null;
      }

      return tx.broadcastMessage.update({
        where: { id: Number(id) },
        data,
      });
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error updating broadcast message:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Broadcast message not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update broadcast message' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.broadcastMessage.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting broadcast message:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Broadcast message not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete broadcast message' }, { status: 500 });
  }
}
