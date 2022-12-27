import { ApiProperty } from '@nestjs/swagger';

export class CreateProductsReviewsReplyReqDto {
    @ApiProperty()
    content: string;
}

export class CreateProductReviewsReqDto {
    @ApiProperty()
    type: boolean;

    @ApiProperty()
    content: string;

    @ApiProperty()
    rating: number;
}
