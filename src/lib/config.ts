export const Config = {
    metaGraphApiVersion: process.env.META_GRAPH_API_VERSION,
    messagingPhoneNumberId: process.env.MESSAGING_PHONE_NUMBER_ID,
    whatsAppBusinessApiToken: process.env.WHATSAPP_BUSINESS_API_TOKEN,
} as const;