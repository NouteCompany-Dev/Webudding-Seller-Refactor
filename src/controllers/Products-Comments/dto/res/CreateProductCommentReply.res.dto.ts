import { ApiProperty } from '@nestjs/swagger';

export class ProductsCommentsReplyObj {
    @ApiProperty()
    content: string;
}

export class ProductsCommentsReplySuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ type: ProductsCommentsReplyObj })
    data: ProductsCommentsReplyObj;
}

export class ProductsCommentsReplyFailDto {
    @ApiProperty({ default: -1 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
