import { Body, Controller, Logger, Param, ParseIntPipe, Patch, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResultFailDto } from 'src/common/dto/Result.dto';
import { CreateProductsCommentAnswerReqDto } from './dto/req/CreateProductCommentAnswer.req.dto';
import { ProductsCommentsService } from './Products-Comments.service';
import { Response } from 'express';
import {
    ProductsCommentsReplyFailDto,
    ProductsCommentsReplySuccessDto,
} from './dto/res/CreateProductCommentReply.res.dto';

@ApiTags('상품 문의')
@Controller('products-comments')
export class ProductsCommentsController {
    constructor(private productCommentService: ProductsCommentsService) {}

    @Patch(':id')
    @ApiBearerAuth('seller-auth')
    @ApiOperation({ summary: '상품 문의 댓글 작성' })
    @ApiResponse({
        status: 200,
        type: ProductsCommentsReplySuccessDto,
        description: '상품 문의 댓글 작성 성공',
    })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({
        status: 401,
        type: ProductsCommentsReplyFailDto,
        description: '상품 문의 댓글 작성 실패',
    })
    async createReply(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: CreateProductsCommentAnswerReqDto,
        @Res() res: Response,
    ) {
        Logger.log('API - Seller Create Product Comment Reply');
        try {
            const result = await this.productCommentService.createAnswer(body, id);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }
}
