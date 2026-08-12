import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Config } from '@/lib/config';

export async function GET() {
  try {
    // Placeholder row is internal-only: never listed, booked, or selected.
    const services = await prisma.service.findMany({
      where: { id: { not: Config.removedServiceId } },
    });

    // Flag services that have upcoming appointments (today onward); those can't
    // be deleted (the barber must suspend them instead).
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const futureGroups = await prisma.appointment.groupBy({
      by: ['service_id'],
      where: { date: { gte: startOfToday } },
      _count: { _all: true },
    });

    const futureByService = new Map(
      futureGroups.map((group) => [group.service_id, group._count._all])
    );

    const withFlags = services.map((service) => ({
      ...service,
      hasFutureAppointments: (futureByService.get(service.id) ?? 0) > 0,
    }));

    return NextResponse.json(withFlags);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, duration_minutes, price } = await request.json();

    // Validate required fields
    if (!name || !duration_minutes || !price) {
      return NextResponse.json(
        { error: 'Name, description, duration_minutes, and price are required' },
        { status: 400 }
      );
    }

    // Create the service
    const service = await prisma.service.create({
      data: {
        name,
        duration_minutes,
        price
      }
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}