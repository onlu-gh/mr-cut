import {NextResponse} from 'next/server';
import {AppointmentService} from '@/services/appointment.service';
import {prisma} from '@/lib/prisma';
import {MessagingService} from '@/services/messaging.service';
import {Appointment} from '@/entities/Appointment';

const appointmentService = new AppointmentService();

export async function GET(request) {
    try {
        const {searchParams} = new URL(request.url);
        const barberId = searchParams.get('barberId');
        const clientPhoneNumber = searchParams.get('clientPhoneNumber');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const appointments = await prisma.appointment.findMany({
            where: {
                ...barberId && {barber_id: barberId},
                ...clientPhoneNumber && {client_phone_number: clientPhoneNumber},
                ...(startDate || endDate) && {
                    date: {
                        ...startDate && {gte: new Date(startDate).toISOString()},
                        ...endDate && {lte: new Date(endDate).toISOString()},
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

        const {client_name, client_phone_number, barber_id, service_id, date, time, status} = data;

        if (!(client_name && client_phone_number && barber_id && service_id && date && time)) {
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
                    select: {
                        firstName: true,
                        lastName: true,
                        phone_number: true
                    }
                }
            }
        });
        const createdAppointment = new Appointment(appointment);

        void MessagingService.sendAppointmentConfirmation(createdAppointment);
        void MessagingService.sendAppointmentNotification(createdAppointment);

        return NextResponse.json(appointment, {status: 201});
    } catch (error) {
        console.error('Error creating appointment:', error);
        return NextResponse.json(
            {error: 'Failed to create appointment: ' + error.message},
            {status: 500}
        );
    }
} 