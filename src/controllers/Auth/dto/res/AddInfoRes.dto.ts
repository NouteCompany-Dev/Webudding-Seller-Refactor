import { ApiProperty } from '@nestjs/swagger';

export class BrandNameDuplicateResDto {
    @ApiProperty({ default: 6021 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class EnglishBrandNameDuplicateResDto {
    @ApiProperty({ default: 6022 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class AddInfoFailResDto {
    @ApiProperty({ default: 6023 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class DuplicateEnglishBrandNameResDto {
    @ApiProperty({ default: 6024 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
