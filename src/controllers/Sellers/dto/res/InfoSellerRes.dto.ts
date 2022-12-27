import { ApiProperty } from '@nestjs/swagger';
import { SellerStatus } from 'src/entity/enum/enum';

export class InfoSellerSuccessObj {
    @ApiProperty({ format: 'email' })
    email: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    status: SellerStatus;

    @ApiProperty()
    name: string;

    @ApiProperty()
    brandName: string;

    @ApiProperty()
    englishBrandName: string;

    @ApiProperty()
    brandStory: string;

    @ApiProperty()
    brandImage: Object;

    @ApiProperty()
    depositor: string;

    @ApiProperty()
    bankName: string;

    @ApiProperty()
    bankAccount: string;

    @ApiProperty()
    tier: string;

    @ApiProperty()
    feeRatio: number;
}

export class InfoSellerSuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ type: InfoSellerSuccessObj })
    data: InfoSellerSuccessObj;
}

export class InfoSellerResDto {
    @ApiProperty({ default: 6101 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class InfoEnglishSellerResDto {
    @ApiProperty({ default: 6103 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class CheckPasswordFailDto {
    @ApiProperty({ default: 6111 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class InfoSellerFailDto {
    @ApiProperty({ default: 6102 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class EnglishSellerInfoFailDto {
    @ApiProperty({ default: 6104 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class CheckEnglishPasswordFailDto {
    @ApiProperty({ default: 6113 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class CheckEnglishEmailVerifyFailDto {
    @ApiProperty({ default: 6114 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class InfoEnglishSellerFailDto {
    @ApiProperty({ default: 6115 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class CheckSellerResDto {
    @ApiProperty({ default: 6121 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class InfoBrandFailDto {
    @ApiProperty({ default: 6122 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class SellerCheckResDto {
    @ApiProperty({ default: 6131 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class InfoLedgerFailDto {
    @ApiProperty({ default: 6132 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
