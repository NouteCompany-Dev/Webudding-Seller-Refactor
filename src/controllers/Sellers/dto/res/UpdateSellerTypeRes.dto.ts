import { ApiProperty } from '@nestjs/swagger';

export class UploadSellerFileResDto {
    @ApiProperty({ default: 6141 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class UpdateSellerTypeFailDto {
    @ApiProperty({ default: 6142 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class CheckResidentNumberResDto {
    @ApiProperty({ default: 6151 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class UpdateCorpTypeFailDto {
    @ApiProperty({ default: 6152 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
