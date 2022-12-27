import { ApiProperty } from '@nestjs/swagger';
import { ProductSale } from 'src/entity/ProductSale.entity';
import { ProductThumb } from 'src/entity/ProductThumb.entity';

export class UpdateProductReqDto {
    @ApiProperty()
    prodName: string;

    @ApiProperty()
    englishProdName: string;

    @ApiProperty()
    summary: string;

    @ApiProperty()
    globalSummary: string;

    @ApiProperty()
    price: number;

    @ApiProperty()
    priceOrg: number;

    @ApiProperty()
    skuId?: string;

    @ApiProperty({ default: 'false' })
    saleStop?: string;

    @ApiProperty({ default: 'true' })
    saleResume?: string;

    @ApiProperty()
    detailContent: string;

    @ApiProperty()
    globalDetailContent: string;

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

export class UpdateEnglishProductReqDto {
    @ApiProperty()
    englishProdName: string;

    @ApiProperty()
    globalSummary: string;

    @ApiProperty()
    dollarPrice: number;

    @ApiProperty()
    dollarPriceOrg: number;

    @ApiProperty()
    skuId?: string;

    @ApiProperty({ default: 'false' })
    saleStop?: string;

    @ApiProperty({ default: 'true' })
    saleResume?: string;

    @ApiProperty()
    globalDetailContent: string;

    @ApiProperty({ required: false })
    hashTag?: string[];

    @ApiProperty({ required: false })
    deleteIdx?: number[];

    @ApiProperty({ type: ProductThumb })
    thumbGlobal: ProductThumb[];

    @ApiProperty({ type: ProductSale })
    sale: ProductSale[];
}
