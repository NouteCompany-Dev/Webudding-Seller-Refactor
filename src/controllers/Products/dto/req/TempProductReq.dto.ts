import { ApiProperty } from '@nestjs/swagger';
import { ProductSale } from 'src/entity/ProductSale.entity';
import { ProductThumb } from 'src/entity/ProductThumb.entity';

export class TempProductReqDto {
    @ApiProperty()
    prodName: string;

    @ApiProperty()
    englishProdName: string;

    @ApiProperty()
    price: number;

    @ApiProperty()
    categoryId: number;

    @ApiProperty()
    summary: string;

    @ApiProperty()
    globalSummary: string;

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
