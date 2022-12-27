import { LedgerType } from './../../../../entity/enum/enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSellerReqDto {
    @ApiProperty()
    password: string;

    @ApiProperty()
    newPassword: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    residentNumber: string;
}

export class UpdateEnglishSellerReqDto {
    @ApiProperty()
    password: string;

    @ApiProperty()
    newPassword: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    verifyCode: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    countryCode: string;

    @ApiProperty()
    phone: string;
}

export class UpdateBrandReqDto {
    @ApiProperty()
    brandStory: string;

    @ApiProperty()
    englishBrandStory: string;

    @ApiProperty()
    instagram?: string;

    @ApiProperty({ required: false, description: '브랜드 이미지' })
    profile?: Object;
}

export class UpdateLedgerReqDto {
    @ApiProperty()
    bankName: string;

    @ApiProperty()
    bankAccount: string;

    @ApiProperty()
    depositor: string;
}

export class UpdateEnglishLedgerReqDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    ledgerType: LedgerType;

    @ApiProperty()
    ledgerEmail: string;
}
