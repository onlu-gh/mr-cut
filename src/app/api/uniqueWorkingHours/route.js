import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

export async function GET(request) {
    try {
        const {searchParams} = new URL(request.url);
        const barberId = searchParams.get('barberId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const uniqueWorkingHours = await prisma.uniqueWorkingHours.findMany({
            where: {
                barber_id: barberId,
                ...(startDate || endDate) && {
                    date: {
                        ...startDate && {gte: new Date(startDate).toISOString()},
                        ...endDate && {lte: new Date(endDate).toISOString()},
                    }
                }
            },
        });

        return NextResponse.json(uniqueWorkingHours);
    } catch (error) {
        console.error('Error fetching unique working hours:', error);
        return NextResponse.json(
            {error: 'Failed to fetch unique working hours'},
            {status: 500}
        );
    }
}