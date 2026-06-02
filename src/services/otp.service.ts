import {prisma} from '@/lib/prisma';
import {Otp} from '@/entities/Otp';

export class OtpService {
   static async findByPhone(phoneNumber: string): Promise<Otp | null> {
      const row = await prisma.otp.findUnique({where: {phone_number: phoneNumber}});

      if (!row) return null;

      return Otp.fromJSON(row);
   }

   static async upsert(phoneNumber: string, code: string): Promise<Otp> {
      const row = await prisma.otp.upsert({
         where: {phone_number: phoneNumber},
         update: {code, generated_at: new Date()},
         create: {phone_number: phoneNumber, code, generated_at: new Date()},
      });

      return Otp.fromJSON(row);
   }

   static async verify(phoneNumber: string, code: string): Promise<boolean> {
      const otp = await OtpService.findByPhone(phoneNumber);

      if (!otp) return false;
      if (otp.isExpired()) return false;
      if (otp.code !== code) return false;

      await OtpService.deleteByPhone(phoneNumber);

      return true;
   }

   static async deleteByPhone(phoneNumber: string): Promise<void> {
      await prisma.otp.delete({where: {phone_number: phoneNumber}});
   }
}