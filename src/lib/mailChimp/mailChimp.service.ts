import Mailchimp from '@mailchimp/mailchimp_transactional';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class MailChimpService {
    async registerTemplate(name: string, email: string) {
        try {
            const result = await Mailchimp(process.env.MAIL_CHIMP_API_KEY).messages.sendTemplate({
                template_name: '입점 신청완료',
                template_content: [
                    {
                        name: 'brand_name',
                        content: name,
                    },
                ],
                message: {
                    subject: `[위버딩] ${name} 작가님의 입점신청이 완료되었습니다.`,
                    from_email: 'contact@noutecompany.com',
                    from_name: 'Webudding',
                    to: [
                        {
                            email: email,
                        },
                    ],
                },
            });
            return result[0].status;
        } catch (err) {
            console.log(err);
        }
    }

    async enRegisterTemplate(name: string, email: string) {
        try {
            const result = await Mailchimp(process.env.MAIL_CHIMP_API_KEY).messages.sendTemplate({
                template_name: 'seller-application submitted',
                template_content: [
                    {
                        name: 'brand_name',
                        content: name,
                    },
                ],
                message: {
                    subject: `[WeBudding] Your application has been submitted`,
                    from_email: 'contact@noutecompany.com',
                    from_name: 'Webudding',
                    to: [
                        {
                            email: email,
                        },
                    ],
                },
            });
            return result[0].status;
        } catch (err) {
            console.log(err);
        }
    }
}
