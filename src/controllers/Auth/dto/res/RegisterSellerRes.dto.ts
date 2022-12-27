import { ApiProperty } from '@nestjs/swagger';

export class EmailDuplicateResDto {
    @ApiProperty({ default: 6001 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class PhoneDuplicateResDto {
    @ApiProperty({ default: 6002 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class AccountDuplicateResDto {
    @ApiProperty({ default: 6003 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class RegistSellerFailDto {
    @ApiProperty({ default: 6004 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class VerifyEnglishEmailCodeFailDto {
    @ApiProperty({ default: 6005 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class EnglishEmailDuplicateResDto {
    @ApiProperty({ default: 6006 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class EnglishPhoneDuplicateResDto {
    @ApiProperty({ default: 6007 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class RegistEnglishSellerFailDto {
    @ApiProperty({ default: 6008 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
