import { ApiProperty } from '@nestjs/swagger';

export class ProductReviewListReqDto {
    @ApiProperty()
    page: number;

    @ApiProperty()
    prodName?: string;

    @ApiProperty()
    search?: string;
}
