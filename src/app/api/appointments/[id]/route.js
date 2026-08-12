import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {prisma} from '@/lib/prisma';
import {MessagingService} from '@/services/messaging.service';
import {Appointment} from '@/entities/Appointment';
import {isAppointmentWithin30Minutes} from '@/utils';

export async function GET(request, {params}) {
    try {
        const {id} = params;
        const appointment = await prisma.appointment.findUnique({
            where: {id}
        });

        if (!appointment) {
            return NextResponse.json({error: 'Appointment not found'}, {status: 404});
        }

        return NextResponse.json(appointment);
    } catch (error) {
        console.error('Error fetching appointment:', error);
        return NextResponse.json({error: 'Failed to fetch appointment'}, {status: 500});
    }
}

export async function PUT(request, {params}) {
    try {
        const {id} = await params;
        const body = await request.json();
        console.log('Received update request:', {id, body});

        // Validate required fields
        const {client_name, client_phone_number, date, time, barber_id, service_id} = body;
        if (!(client_name && client_phone_number && barber_id && date && time && service_id)) {
            return NextResponse.json(
                {error: 'client_id, client_name, client_phone_number, barber_id, date, time and serviceId are required'},
                {status: 400}
            );
        }

        // Check if appointment exists
        const existingAppointment = await prisma.appointment.findUnique({
            where: {id}
        });

        if (!existingAppointment) {
            return NextResponse.json({error: 'Appointment not found'}, {status: 404});
        }

        // Update the appointment
        const appointment = await prisma.appointment.update({
            where: {id},
            data: {
                client_name,
                client_phone_number,
                date: new Date(date).toISOString(),
                time,
                service_id,
                barber_id,
            }
        });

        console.log('Appointment updated successfully:', appointment);
        return NextResponse.json(appointment);
    } catch (error) {
        console.error('Error updating appointment:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({error: 'Appointment not found'}, {status: 404});
        }
        return NextResponse.json({
            error: 'Failed to update appointment',
            details: error.message
        }, {status: 500});
    }
}

export async function DELETE(request, {params}) {
    try {
        const {id} = await params;
        const {isDeletedByClient} = await request.json();

        // Derive the caller's role from the auth cookie instead of trusting the
        // client-supplied isDeletedByClient flag. NOTE: userData is currently an
        // unsigned/forgeable cookie — this stops flag-flipping but not forged-cookie
        // impersonation; the pending signed-session/JWT fix closes that.
        const userDataCookie = (await cookies()).get('userData')?.value;
        const callerId = userDataCookie ? JSON.parse(decodeURI(userDataCookie)).id : undefined;
        const caller = callerId ? await prisma.user.findUnique({where: {id: callerId}}) : null;
        const isManagement = caller?.role === 'ADMIN' || caller?.role === 'BARBER';

        const record = await prisma.appointment.findUnique({
            where: {id},
            include: {
                barber: {
                    select: {
                        phone_number: true
                    }
                }
            }
        });

        if (record == null) {
            return NextResponse.json({error: 'Appointment not found'}, {status: 404});
        }

        const appointment = new Appointment(record);

        // Clients cannot cancel within 30 minutes of the appointment; enforce server-side.
        // Management (admin/barber) bypass the window.
        if (!isManagement && isAppointmentWithin30Minutes(appointment)) {
            return NextResponse.json(
                {error: 'לא ניתן לבצע ביטול פחות מחצי שעה ממועד התור, נא צרו קשר עם המספרה'},
                {status: 403}
            );
        }

        await prisma.appointment.delete({
            where: {id}
        });

        if (isDeletedByClient) {
            void MessagingService.sendAppointmentCancellationNotification(appointment).catch(() => (
                console.error('Error sending cancellation whatsapp notification to barber. appointmentId: ', appointment.id)
            ));
        }

        return NextResponse.json({success: true});
    } catch (error) {
        console.error('Error deleting appointment:', error);
        return NextResponse.json({error: 'Failed to delete appointment'}, {status: 500});
    }
} 