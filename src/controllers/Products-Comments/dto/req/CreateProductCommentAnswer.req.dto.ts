import { ApiProperty } from '@nestjs/swagger';

export class CreateProductsCommentAnswerReqDto {
    @ApiProperty()
    answer: string;
}
