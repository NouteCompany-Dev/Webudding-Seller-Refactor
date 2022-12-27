import { LedgerType, Tier } from '../../../../entity/enum/enum';

export class RegisterSellerReqDto {
    email: string;
    password: string;
    phone: string;
    residentNumber: string;
    country: string;
    type: boolean;
    name: string;
    businessNumber: number;
    brandName: string;
    englishBrandName: string;
    brandStory: string;
    brandImage: string;
    bankName: string;
    bankAccount: string;
    tier: Tier;
    ledgerType: LedgerType;
    ledgerEmail: string;
    recommendBrandName: string;
    instagram: string;
    agreeMarketing: boolean;
    agreeReceiveEmail: boolean;
    agreeReceiveText: boolean;
    bankOriginalName: string;
    bankPath: string;
    licenseOriginalName: string;
    licensePath: string;
    businessOriginalName: string;
    businessPath: string;
    certificateOriginalName: string;
    certificatePath: string;
    legalRepresentOriginalName: string;
    legalRepresentPath: string;
    familyOriginalName: string;
    familyPath: string;
}
