import { DynamicModule, Module } from '@nestjs/common';
import { MailChimpService } from './mailChimp.service';

@Module({})
export class MailChimpModule {
    // static registerAsync(): DynamicModule {
    //     return {
    //         global: true,
    //         module: MailChimpModule,
    //         providers: [MailChimpService],
    //         exports: [MailChimpService]
    //     }
    // }
}
