import { ApiProperty } from '@nestjs/swagger';
import { BusinessOption, LedgerType, SellerType } from 'src/entity/enum/enum';

export class RegisterSellerReqDto {
    @ApiProperty({ format: 'email' })
    email: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    phone: string;

    @ApiProperty({ type: 'enum', enum: SellerType })
    sellerType: SellerType;

    @ApiProperty({ type: 'enum', enum: BusinessOption })
    businessOption: BusinessOption;

    @ApiProperty()
    bankName: string;

    @ApiProperty()
    bankAccount: string;

    @ApiProperty()
    depositor: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    instagram?: string;

    @ApiProperty()
    representativeName?: string;

    @ApiProperty({ description: 'yymmdd-xxxxxxx' })
    residentNumber?: string;

    @ApiProperty()
    businessNumber?: string;

    @ApiProperty()
    businessName?: string;
}

export class RegisterEnglishSellerReqDto {
    @ApiProperty({ format: 'email' })
    email: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    instagram?: string;

    @ApiProperty()
    residentNumber: string;

    @ApiProperty()
    countryCode: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    ledgerType: LedgerType;

    @ApiProperty()
    ledgerEmail: string;
}

export class AddInfoSellerReqDto {
    @ApiProperty()
    sellerId: number;

    @ApiProperty()
    brandName: string;

    @ApiProperty()
    englishBrandName: string;

    @ApiProperty({ description: '브랜드 이미지' })
    profile: File[];

    @ApiProperty()
    brandStory: string;

    @ApiProperty()
    englishBrandStory: string;

    @ApiProperty({ description: '법인인감증명서' })
    certificate?: File[];

    @ApiProperty({ description: '법정대리인' })
    legalRepresent?: File[];

    @ApiProperty({ description: '가족관계증명서' })
    family?: File[];

    @ApiProperty({ description: '법정대리인 인감 증명서F' })
    legalRepresentCertificate?: File[];
}

export class AddInfoEnglishSellerReqDto {
    @ApiProperty()
    sellerId: number;

    @ApiProperty()
    englishBrandName: string;

    @ApiProperty({ description: '브랜드 이미지' })
    profile: File[];

    @ApiProperty()
    englishBrandStory: string;
}
