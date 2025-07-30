import {WhatsAppService} from '@/lib/server/whatsapp.service';
import {Appointment} from '@/entities/Appointment';
import {format} from 'date-fns';

enum MessageTemplate {
    USER_OTP = 'user_otp',
    APPOINTMENT_CONFIRMATION = 'appointment_confirmation', // To Client
    APPOINTMENT_NOTIFICATION = 'appointment_notification', // To Barber
    APPOINTMENT_REMINDER = 'appointment_reminder', // To Client
}

export class MessagingService extends WhatsAppService {
    public static async sendAppointmentConfirmation(
        {
            clientPhoneNumber,
            clientName,
            service,
            barber,
            date,
            time
        }: Appointment,
    ) {
        await MessagingService.sendMessage(
            clientPhoneNumber,
            MessageTemplate.APPOINTMENT_CONFIRMATION,
            [
                {type: 'text', text: clientName},
                {type: 'text', text: service.name},
                {type: 'text', text: barber.fullName},
                {type: 'date_time', date_time: {fallback_value: format(date, 'dd/MM/yy')}},
                {type: 'date_time', date_time: {fallback_value: time}},
            ]
        );
    }

    public static async sendAppointmentNotification(
        {
            barber,
            clientName,
            service,
            date,
            time,
            clientPhoneNumber,
        }: Appointment,
    ) {
        await MessagingService.sendMessage(
            barber.phoneNumber,
            MessageTemplate.APPOINTMENT_NOTIFICATION,
            [
                {type: 'text', text: clientName},
                {type: 'text', text: service.name},
                {type: 'date_time', date_time: {fallback_value: format(date, 'dd/MM/yy')}},
                {type: 'date_time', date_time: {fallback_value: time}},
                {type: 'text', text: clientPhoneNumber},
            ]
        );
    }
}