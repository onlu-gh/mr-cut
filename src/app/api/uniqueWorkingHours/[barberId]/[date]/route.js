import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

export async function GET(request, {params}) {
    try {
        const {barberId, date} = await params;
        const uniqueWorkingHours = await prisma.uniqueWorkingHours.findUnique({
            where: {
                barber_id: barberId,
                date,
            },
        });

        if (!uniqueWorkingHours) {
            return NextResponse.json({error: 'uniqueWorkingHours object not found'}, {status: 404});
        }

        return NextResponse.json(uniqueWorkingHours);
    } catch (error) {
        console.error('Error fetching unique working hours:', error);
        return NextResponse.json({error: 'Failed to fetch unique working hours'}, {status: 500});
    }
}

export async function PUT(request, {params}) {
    try {
        const {barberId, date} = await params;
        const body = await request.json();
        console.log('Received update request:', {barberId, date, body});

        // Validate required fields
        const {start, end, midday_windows} = body;
        if (!(start || end || midday_windows)) {
            return NextResponse.json(
                {error: 'saving unique working hours without any overrides is not allowed'},
                {status: 400}
            );
        }

        // Update the appointment
        const uniqueWorkingHours = await prisma.uniqueWorkingHours.update({
            where: {
                barber_id: barberId,
                date,
            },
            data: {
                start,
                end,
                midday_windows,
            }
        });

        console.log('unique working hours updated successfully:', uniqueWorkingHours);
        return NextResponse.json(uniqueWorkingHours);
    } catch (error) {
        console.error('Error updating unique working hours:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({error: 'uniqueWorkingHours object not found'}, {status: 404});
        }
        return NextResponse.json({
            error: 'Failed to update unique working hours',
            details: error.message
        }, {status: 500});
    }
}

export async function DELETE(request, {params}) {
    try {
        const {barberId, date} = await params;
        await prisma.uniqueWorkingHours.delete({
            where: {
                barber_id: barberId,
                date,
            },
        });

        return NextResponse.json({success: true});
    } catch (error) {
        console.error('Error deleting unique working hours:', error);
        return NextResponse.json({error: 'Failed to delete unique working hours'}, {status: 500});
    }
} 