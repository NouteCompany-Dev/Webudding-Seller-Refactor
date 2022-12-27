import { ApiProperty } from '@nestjs/swagger';

export class ProductsReviewsListObj {
    @ApiProperty()
    profile: string;

    @ApiProperty()
    username: string;

    @ApiProperty()
    rating: number;

    @ApiProperty()
    content: string;

    @ApiProperty()
    createdAt: string;
}

export class ProductsReviewsReplyObj {
    @ApiProperty()
    content: string;
}

export class ProductsReviewsListSuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ type: ProductsReviewsListObj })
    data: ProductsReviewsListObj;
}

export class ProductsReviewsReplySuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ type: ProductsReviewsReplyObj })
    data: ProductsReviewsReplyObj;
}

export class ProductsReviewsListFailDto {
    @ApiProperty({ default: 6601 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class ProductsReviewsReplyFailDto {
    @ApiProperty({ default: 6611 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
