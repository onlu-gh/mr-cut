import createFetch from '@vercel/fetch'
import {Config} from '@/lib/config';
import fetch, {Headers} from 'node-fetch';

interface TextParameter {
    type: "text";
    text: string;
}

interface DateTimeParameter {
    type: "date_time";
    date_time: {
        fallback_value: string;
    };
}

type MessageParameter = TextParameter | DateTimeParameter;

export class WhatsAppService {
    private static fetch = createFetch({default: fetch, Headers});

    protected static async sendMessage(recipientPhoneNumber: string, templateName: string, params: MessageParameter[]) {
        try {
            const url = `https://graph.facebook.com/${Config.metaGraphApiVersion}/${Config.messagingPhoneNumberId}/messages`;
            console.log(`Sending ${templateName} message to ${recipientPhoneNumber}`);

            await WhatsAppService.fetch(
                url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${Config.whatsAppBusinessApiToken}`,
                    },
                    body: JSON.stringify({
                        "messaging_product": "whatsapp",
                        "recipient_type": "individual",
                        "to": recipientPhoneNumber,
                        "type": "template",
                        "template": {
                            "name": templateName,
                            "language": {
                                "code": "he"
                            },
                            "components": [
                                {
                                    "type": "body",
                                    "parameters": params,
                                }
                            ]
                        }
                    })
                }
            );
        } catch (e) {
            console.error(e.message);
        }
    }
}