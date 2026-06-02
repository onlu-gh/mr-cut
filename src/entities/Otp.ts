import {Config} from '@/lib/config';

export class Otp {
   EXPIRY_MINUTES: number = Config.otpExpiryMinutes;

   phoneNumber: string;
   code: string;
   generatedAt: Date;

   constructor({
                  phoneNumber,
                  code,
                  generatedAt = new Date(),
               }: {
      phoneNumber: string;
      code: string;
      generatedAt?: Date;
   }) {
      this.phoneNumber = phoneNumber;
      this.code = code;
      this.generatedAt = generatedAt;
   }

   get expiresAt(): Date {
      console.log(this.generatedAt, this.EXPIRY_MINUTES);
      return new Date(this.generatedAt.getTime() + this.EXPIRY_MINUTES * 60 * 1000);
   }

   isExpired(): boolean {
      return new Date() > this.expiresAt;
   }

   toJSON() {
      return {
         phoneNumber: this.phoneNumber,
         code: this.code,
         generatedAt: this.generatedAt,
      };
   }

   static fromJSON(json: Record<string, any>): Otp {
      return new Otp({
         phoneNumber: json.phone_number,
         code: json.code,
         generatedAt: new Date(json.generated_at),
      });
   }
}