import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Config } from '@/lib/config';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const service = await prisma.service.findUnique({
      where: { id }
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('Received update request:', { id, body });

    // Validate required fields
    const { name, duration_minutes, price, suspended } = body;
    if (!name || !duration_minutes || !price) {
      return NextResponse.json(
        { error: 'Name, description, duration_minutes, and price are required' },
        { status: 400 }
      );
    }

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id }
    });

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Update the service
    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        duration_minutes: Number(duration_minutes),
        price: Number(price),
        ...(suspended !== undefined && { suspended: Boolean(suspended) })
      }
    });

    console.log('Service updated successfully:', service);
    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    return NextResponse.json({ 
      error: 'Failed to update service',
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // The placeholder itself must never be deleted.
    if (id === Config.removedServiceId) {
      return NextResponse.json(
        { error: 'לא ניתן למחוק שירות זה' },
        { status: 400 }
      );
    }

    // Protect upcoming appointments: block the delete if any exist (today onward).
    // The barber should suspend the service instead of wiping future bookings.
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const futureCount = await prisma.appointment.count({
      where: { service_id: id, date: { gte: startOfToday } }
    });

    if (futureCount > 0) {
      return NextResponse.json(
        { error: 'לא ניתן למחוק שירות עם תורים עתידיים. השהו את השירות במקום' },
        { status: 409 }
      );
    }

    // No future appointments: reassign the past ones to the "removed service"
    // placeholder so their records survive, then delete the real service.
    await prisma.$transaction([
      prisma.appointment.updateMany({
        where: { service_id: id },
        data: { service_id: Config.removedServiceId }
      }),
      prisma.service.delete({ where: { id } })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'לא ניתן למחוק שירות עם תורים קיימים' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'מחיקת השירות נכשלה' }, { status: 500 });
  }
} 