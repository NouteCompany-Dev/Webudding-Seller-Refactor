import { ApiProperty } from '@nestjs/swagger';

export class ProductListReqDto {
    @ApiProperty()
    page: number;

    @ApiProperty()
    search?: string;

    @ApiProperty()
    searchOption: 'name' | 'sku';

    @ApiProperty({ default: 0 })
    sort: number;

    @ApiProperty()
    categoryId: number[];
}
