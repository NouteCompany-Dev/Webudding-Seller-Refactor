import { ApiProperty } from '@nestjs/swagger';

export class UploadThumbResDto {
    @ApiProperty({ default: 6201 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class UploadSaleResDto {
    @ApiProperty({ default: 6202 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class ProductDetailResDto {
    @ApiProperty({ default: 6203 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class CreateProductFailDto {
    @ApiProperty({ default: 6204 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class UploadEnglishThumbResDto {
    @ApiProperty({ default: 6205 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class UploadEnglishSaleResDto {
    @ApiProperty({ default: 6206 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class EnglishProductDetailResDto {
    @ApiProperty({ default: 6207 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class CreateEnglishProductFailDto {
    @ApiProperty({ default: 6208 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class ProductTempFailDto {
    @ApiProperty({ default: 6241 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class CheckSkuResDto {
    @ApiProperty({ default: -1 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
