import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    async sendEmail(body: any) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const { email } = body;

        await this.mailerService.sendMail({
            to: email,
            from: 'dev@noutecompany.com',
            subject: 'WeBudding Verification Code',
            template: './confirmation',
            context: {
                code,
            },
        });

        return code;
    }
}
