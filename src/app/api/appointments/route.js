import {NextResponse} from 'next/server';
import {AppointmentService} from '@/services/appointment.service';
import {prisma} from '@/lib/prisma';

const appointmentService = new AppointmentService();

export async function GET(request) {
    try {
        const {searchParams} = new URL(request.url);
        const barberId = searchParams.get('barberId');
        const clientId = searchParams.get('clientId');
        const date = searchParams.get('date');

        const appointments = await prisma.appointment.findMany({
            where: {
                ...barberId && {barber_id: barberId},
                ...clientId && {client_id: clientId},
                ...date && {
                    date: {
                        gte: new Date(date),
                        lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
                    }
                }
            },
            include: {
                service: true,
                barber: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return NextResponse.json(
            {error: 'Failed to fetch appointments'},
            {status: 500}
        );
    }
}

export async function POST(request) {
    try {
        const data = await request.json();

        const {client_id, client_name, client_phone_number, barber_id, service_id, date, time, status} = data;

        if(!(client_id && client_name && client_phone_number && barber_id && service_id && date && time)){
            return NextResponse.json(
                {error: 'Missing appointment details'},
                {status: 400}
            );
        }

        // Check if the appointment slot is available

        const isAvailable = await appointmentService.checkAvailability(
            barber_id,
            date,
            time
        );

        if (!isAvailable) {
            return NextResponse.json(
                {error: 'This time slot is already booked'},
                {status: 400}
            );
        }

        // Create the appointment using Prisma
        const appointment = await prisma.appointment.create({
            data: {
                client_id,
                client_name,
                client_phone_number,
                barber_id,
                service_id,
                date: new Date(data.date).toISOString(),
                time: time,
                status: status,
            },
            include: {
                service: true,
                barber: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(appointment, {status: 201});
    } catch (error) {
        console.error('Error creating appointment:', error);
        return NextResponse.json(
            {error: 'Failed to create appointment: ' + error.message},
            {status: 500}
        );
    }
} 