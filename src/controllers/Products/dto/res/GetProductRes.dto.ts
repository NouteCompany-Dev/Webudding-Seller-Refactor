import { ApiProperty } from '@nestjs/swagger';

export class GetProductListObj {
    @ApiProperty()
    prodName: string;

    @ApiProperty()
    englishProdName: string;

    @ApiProperty()
    discountRate: number;

    @ApiProperty()
    priceOrg: number;

    @ApiProperty()
    price: number;

    @ApiProperty()
    brandName: string;

    @ApiProperty()
    englishBrandName: string;

    @ApiProperty()
    productStatus: string;

    @ApiProperty()
    summary: string;

    @ApiProperty()
    globalSummary: string;

    @ApiProperty()
    thumb: string;

    @ApiProperty()
    createdAt: Date;
}

export class GetProductTemplateListObj {
    @ApiProperty()
    templateData: any;
}

export class GetProductListResDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ type: GetProductListObj })
    data: GetProductListObj[];
}

export class GetProductTemplateListResDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ type: GetProductTemplateListObj })
    data: GetProductTemplateListObj[];
}

export class GetProductDetailResDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class ProductCategoryResDto {
    @ApiProperty({ default: 6211 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class GetProductListFailDto {
    @ApiProperty({ default: 6212 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class GetProductDetailFailDto {
    @ApiProperty({ default: 6221 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class GetProductTemplateListFailDto {
    @ApiProperty({ default: -1 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
