import { ApiProperty } from '@nestjs/swagger';
import { Category } from 'src/entity/Category.entity';
import { ProductThumb } from 'src/entity/ProductThumb.entity';

export class SalesListSuccessObj {
    @ApiProperty()
    prodName: string;

    @ApiProperty()
    thumb: ProductThumb;

    @ApiProperty()
    priceOrg: number;

    @ApiProperty()
    price: number;

    @ApiProperty()
    discountRate: number;

    @ApiProperty()
    saleCount: number;

    @ApiProperty()
    saleAmount: number;

    @ApiProperty()
    category: Category;
}

export class SalesListSuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ type: SalesListSuccessObj })
    data: SalesListSuccessObj;
}

export class SalesListFailDto {
    @ApiProperty({ default: 6401 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
