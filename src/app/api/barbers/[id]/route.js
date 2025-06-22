import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

export async function GET(request, {params}) {
    try {
        const {id} = await params;

        const barber = await prisma.barber.findUnique({
            where: {id},
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        phone_number: true,
                        role: true
                    }
                }
            }
        });

        if (!barber) {
            return NextResponse.json(
                {error: 'Barber not found'},
                {status: 404}
            );
        }

        // Format the response
        const formattedBarber = {
            id: barber.id,
            firstName: barber.firstName || barber.user.firstName,
            lastName: barber.lastName || barber.user.lastName,
            phone_number: barber.phone_number,
            specialties: barber.specialties,
            workingHours: barber.working_hours,
            photo_url: barber.photo_url,
            bio: barber.bio,
            created_at: barber.created_at,
            updated_at: barber.updated_at
        };

        return NextResponse.json(formattedBarber);
    } catch (error) {
        console.error('Error fetching barber:', error);
        return NextResponse.json(
            {error: 'Failed to fetch barber'},
            {status: 500}
        );
    }
}

export async function PUT(request, {params}) {
    try {
        const {id} = await params;
        const body = await request.json();
        console.log('Received update request:', {id, body});

        // Validate required fields
        const {first_name, last_name, phone_number, working_hours} = body;
        if (!first_name || !last_name || !phone_number || !working_hours) {
            return NextResponse.json(
                {error: 'first_name, last_name, phone_number, and working_hours are required'},
                {status: 400}
            );
        }

        // Check if barber exists
        const existingBarber = await prisma.barber.findUnique({
            where: {id}
        });

        if (!existingBarber) {
            return NextResponse.json({error: 'Barber not found'}, {status: 404});
        }

        // Update the barber
        const barber = await prisma.barber.update({
            where: {id},
            data: {
                firstName:first_name,
                lastName:last_name,
                phone_number,
                working_hours,
            }
        });

        console.log('Barber updated successfully:', barber);
        return NextResponse.json(barber);
    } catch (error) {
        console.error('Error updating barber:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({error: 'Barber not found'}, {status: 404});
        }
        return NextResponse.json({
            error: 'Failed to update barber',
            details: error.message
        }, {status: 500});
    }
}

export async function DELETE(request, {params}) {
    try {
        const {id} = params;
        await prisma.barber.delete({
            where: {id}
        });

        return NextResponse.json({success: true});
    } catch (error) {
        console.error('Error deleting barber:', error);
        return NextResponse.json({error: 'Failed to delete barber'}, {status: 500});
    }
}