import { fileUpload } from './../../middlewares/multer.middleware';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
    CreateProductReviewsReqDto,
    CreateProductsReviewsReplyReqDto,
} from './dto/req/CreateProductsReviews.req.dto';
import {
    ProductsReviewsListSuccessDto,
    ProductsReviewsListFailDto,
    ProductsReviewsReplySuccessDto,
    ProductsReviewsReplyFailDto,
} from './dto/res/Products-Reviews.res.dto';
import {
    Body,
    Controller,
    Logger,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Req,
    Res,
    UseInterceptors,
    UploadedFiles,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ResultFailDto } from 'src/common/dto/Result.dto';
import { ProductsReviewsService } from './Products-Reviews.service';
import { ProductReviewListReqDto } from './dto/req/ProductsReviewsList.req.dto';

@ApiTags('상품 리뷰')
@Controller('products-reviews')
export class ProductsReviewsController {
    constructor(private productReviewService: ProductsReviewsService) {}

    @Post('create')
    @ApiBearerAuth('seller-auth')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'reviewImage' }], fileUpload))
    @ApiConsumes('multipart/form-data')
    async createReviews(
        @UploadedFiles() files: File[],
        @Req() req: Request,
        @Body() body: CreateProductReviewsReqDto,
        @Res() res: Response,
    ): Promise<any> {
        try {
            const result = await this.productReviewService.createReview(files, req, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            return { resultCode: -1, data: null };
        }
    }

    @Post()
    @ApiBearerAuth('seller-auth')
    @ApiOperation({ summary: '상품 리뷰 리스트 조회' })
    @ApiResponse({
        status: 200,
        type: ProductsReviewsListSuccessDto,
        description: '상품 리뷰 리스트 조회 성공',
    })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({
        status: 401,
        type: ProductsReviewsListFailDto,
        description: '상품 리뷰 리스트 조회 실패',
    })
    async list(@Req() req: Request, @Body() body: ProductReviewListReqDto, @Res() res: Response) {
        Logger.log('API - Seller Product Review List');
        try {
            const result = await this.productReviewService.list(req, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            return { resultCode: 6081, data: null };
        }
    }

    @Patch(':id')
    @ApiBearerAuth('seller-auth')
    @ApiOperation({ summary: '상품 리뷰 댓글 작성' })
    @ApiResponse({
        status: 200,
        type: ProductsReviewsReplySuccessDto,
        description: '상품 리뷰 댓글 작성 성공',
    })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({
        status: 401,
        type: ProductsReviewsReplyFailDto,
        description: '상품 리뷰 댓글 작성 실패',
    })
    async createReply(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: CreateProductsReviewsReplyReqDto,
        @Res() res: Response,
    ) {
        Logger.log('API - Seller Create Product Review Reply');
        try {
            const result = await this.productReviewService.createReply(body, id);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Patch('delete/:id')
    @ApiBearerAuth('seller-auth')
    @ApiOperation({ summary: '상품 리뷰 댓글 삭제' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    async deleteReply(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        Logger.log('API - Seller Delete Product Review Reply');
        try {
            const result = await this.productReviewService.deleteReply(id);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }
}
