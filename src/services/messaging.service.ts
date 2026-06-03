import {MessageParameter, WhatsAppService} from '@/lib/server/whatsapp.service';
import {Appointment} from '@/entities/Appointment';
import {format} from 'date-fns';

enum MessageTemplate {
   USER_OTP = 'general_verification_code',
   //TODO change to final form (remove '_temp') once appointment reminder logic is in place
   APPOINTMENT_CONFIRMATION = 'barber_shop_client_appointment_confirmation_temp', // To Client
   APPOINTMENT_NOTIFICATION = 'barber_shop_barber_appointment_notification', // To Barber
   APPOINTMENT_CANCELLATION_NOTIFICATION = 'barber_shop_barber_appointment_cancellation_notification', // To Barber
   APPOINTMENT_REMINDER = 'barber_shop_client_appointment_reminder', // To Client
}

export class MessagingService extends WhatsAppService {
   static HEADER_PARAMS: MessageParameter[] = [
      {type: 'text', text: 'Mr. Cut'},
   ];

   public static async sendUserOtp(
      {
         clientPhoneNumber,
         code,
      },
   ) {
      await MessagingService.sendMessage(
         clientPhoneNumber,
         {
            name: MessageTemplate.USER_OTP,
            languageCode: 'he',
         },
         [
            {type: 'text', text: code},
         ],
         undefined,
         [
            {
               sub_type: 'url',
               parameters: [
                  {type: 'text', text: code},
               ],
            },
         ],
      );
   }

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
         {
            name: MessageTemplate.APPOINTMENT_CONFIRMATION,
            languageCode: 'en',
         },
         [
            {type: 'text', text: clientName},
            {type: 'text', text: service.name},
            {type: 'text', text: barber.fullName},
            {type: 'date_time', date_time: {fallback_value: format(date, 'dd/MM/yy')}},
            {type: 'date_time', date_time: {fallback_value: time}},
         ],
         MessagingService.HEADER_PARAMS,
      );
   }

   public static async sendAppointmentNotification(
      {
         barber,
         clientName,
         service,
         date,
         time,
      }: Appointment,
   ) {
      await MessagingService.sendMessage(
         barber.phoneNumber,
         {
            name: MessageTemplate.APPOINTMENT_NOTIFICATION,
            languageCode: 'en',
         },
         [
            {type: 'text', text: barber.fullName},
            {type: 'text', text: clientName},
            {type: 'text', text: service.name},
            {type: 'date_time', date_time: {fallback_value: format(date, 'dd/MM/yy')}},
            {type: 'date_time', date_time: {fallback_value: time}},
         ],
         MessagingService.HEADER_PARAMS,
      );
   }

   public static async sendAppointmentCancellationNotification(
      {
         barber,
         clientName,
         date,
         time,
      }: Appointment,
   ) {
      await MessagingService.sendMessage(
         barber.phoneNumber,
         {
            name: MessageTemplate.APPOINTMENT_CANCELLATION_NOTIFICATION,
            languageCode: 'en',
         },
         [
            {type: 'text', text: clientName},
            {type: 'date_time', date_time: {fallback_value: format(date, 'dd/MM/yy')}},
            {type: 'date_time', date_time: {fallback_value: time}},
         ],
         MessagingService.HEADER_PARAMS,
      );
   }
}