export const Config = {
   metaGraphApiVersion: process.env.META_GRAPH_API_VERSION,
   messagingPhoneNumberId: process.env.MESSAGING_PHONE_NUMBER_ID,
   whatsAppBusinessApiToken: process.env.WHATSAPP_BUSINESS_API_TOKEN,
   otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES),
   otpLength: 6,
   devSkipOtp: process.env.NODE_ENV !== 'production' && process.env.DEV_SKIP_OTP === 'true',
   devOtpCode: process.env.DEV_OTP_CODE ?? '000000',
} as const;