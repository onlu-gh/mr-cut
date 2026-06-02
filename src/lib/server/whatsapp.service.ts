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

export type MessageParameter = TextParameter | DateTimeParameter;

interface WhatsappTemplateProperties {
   name: string;
   languageCode: 'he' | 'en';
}

interface ButtonProps {
   sub_type: 'url';
   parameters: MessageParameter[];
}

export class WhatsAppService {
   private static fetch = createFetch({default: fetch, Headers});

   protected static async sendMessage(recipientPhoneNumber: string, templateProps: WhatsappTemplateProperties, bodyParams: MessageParameter[], headerParams?: MessageParameter[], buttons?: ButtonProps[]) {
      try {
         const url = `https://graph.facebook.com/${Config.metaGraphApiVersion}/${Config.messagingPhoneNumberId}/messages`;
         console.log(`Sending ${templateProps.name} message to ${recipientPhoneNumber}`);

         const components = [
            {
               type: 'body',
               parameters: bodyParams,
            },
            ...(buttons ? (
                     buttons.map((buttonProps, index) => ({
                           type: 'button',
                           index: String(index),
                           ...buttonProps,
                        })
                     )
                  ) :
                  []
            ),
         ];

         Array.isArray(headerParams) && components.push({
            type: 'header',
            parameters: headerParams
         });

         console.log({
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${Config.whatsAppBusinessApiToken}`,
            },
            body: JSON.stringify({
               messaging_product: 'whatsapp',
               recipient_type: 'individual',
               to: recipientPhoneNumber,
               type: 'template',
               template: {
                  name: templateProps.name,
                  language: {
                     code: templateProps.languageCode,
                  },
                  components,
               }
            }),
         });

         await WhatsAppService.fetch(
            url,
            {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${Config.whatsAppBusinessApiToken}`,
               },
               body: JSON.stringify({
                  messaging_product: 'whatsapp',
                  recipient_type: 'individual',
                  to: recipientPhoneNumber,
                  type: 'template',
                  template: {
                     name: templateProps.name,
                     language: {
                        code: templateProps.languageCode,
                     },
                     components,
                  }
               }),
            }
         );
      } catch (e) {
         console.error(e.message);
      }
   }
}