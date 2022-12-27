import { ProductSale } from './../../../../entity/ProductSale.entity';
import { ProductThumb } from 'src/entity/ProductThumb.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductReqDto {
    @ApiProperty()
    prodName: string;

    @ApiProperty()
    englishProdName: string;

    @ApiProperty()
    priceOrg: number;

    @ApiProperty()
    price: number;

    @ApiProperty()
    skuId?: string;

    @ApiProperty()
    summary: string;

    @ApiProperty()
    globalSummary: string;

    @ApiProperty({ required: false })
    templateId?: number[];

    @ApiProperty()
    detailContent: string;

    @ApiProperty()
    globalDetailContent: string;

    @ApiProperty()
    categoryId: number;

    @ApiProperty({ required: false })
    hashTag?: string[];

    @ApiProperty({ required: false })
    deleteIdx?: number[];

    @ApiProperty({ type: ProductThumb })
    thumb: ProductThumb[];

    @ApiProperty({ type: ProductThumb })
    thumbGlobal: ProductThumb[];

    @ApiProperty({ type: ProductSale })
    sale: ProductSale[];
}

export class CreateEnglishProductReqDto {
    @ApiProperty()
    englishProdName: string;

    @ApiProperty({ type: 'double' })
    dollarPriceOrg: number;

    @ApiProperty({ type: 'double' })
    dollarPrice: number;

    @ApiProperty()
    globalSummary: string;

    @ApiProperty()
    globalDetailContent: string;

    @ApiProperty()
    skuId?: string;

    @ApiProperty()
    categoryId: number;

    @ApiProperty({ required: false })
    hashTag?: string[];

    @ApiProperty({ required: false })
    deleteIdx?: number[];

    @ApiProperty({ type: ProductThumb })
    thumbGlobal: ProductThumb[];

    @ApiProperty({ type: ProductSale })
    sale: ProductSale[];
}

export class CheckSkuReqDto {
    @ApiProperty()
    skuId: string;
}

export class ProductTemplateReqDto {
    @ApiProperty()
    categoryId: number;
}
