import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/entity/Product.entity';
import { Tier } from '../../../../entity/enum/enum';

export class DashboardsInfoObj {
    @ApiProperty()
    tier: Tier;

    @ApiProperty()
    feeRatio: number;

    @ApiProperty()
    product: Product;
}

export class DashboardsInfoSuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ type: DashboardsInfoObj })
    data: DashboardsInfoObj;
}

export class DashboardsInfoFailDto {
    @ApiProperty({ default: 6701 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
