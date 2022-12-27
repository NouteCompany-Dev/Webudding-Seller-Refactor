import { ApiProperty } from '@nestjs/swagger';

export class BrandNameCheckReqDto {
    @ApiProperty()
    brandName: string;
}

export class EnglishBrandNameCheckReqDto {
    @ApiProperty()
    englishBrandName: string;
}
