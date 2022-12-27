import { ApiProperty } from '@nestjs/swagger';

export class BrandNameDuplicateResDto {
    @ApiProperty({ default: 6021 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class BrandNameCheckResDto {
    @ApiProperty({ default: 6031 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class BrandNameCheckFailResDto {
    @ApiProperty({ default: 6032 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class EnglishBrandNameCheckResDto {
    @ApiProperty({ default: 6033 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class EnglishBrandNameCheckFailResDto {
    @ApiProperty({ default: 6034 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
