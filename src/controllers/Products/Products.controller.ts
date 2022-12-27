import { fileUpload } from 'src/middlewares/multer.middleware';
import { ProductListReqDto } from './dto/req/ProductListReq.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
    Body,
    Controller,
    Logger,
    Post,
    Req,
    Res,
    UseInterceptors,
    UploadedFiles,
    Get,
    Patch,
    Param,
    ParseIntPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    CheckSkuResDto,
    CreateEnglishProductFailDto,
    CreateProductFailDto,
    EnglishProductDetailResDto,
    ProductDetailResDto,
    ProductTempFailDto,
    UploadEnglishSaleResDto,
    UploadEnglishThumbResDto,
    UploadSaleResDto,
    UploadThumbResDto,
} from './dto/res/CreateProductRes.dto';
import { ProductsService } from './Products.service';
import { ResultFailDto, ResultSuccessDto } from 'src/common/dto/Result.dto';
import {
    GetProductDetailFailDto,
    GetProductDetailResDto,
    GetProductListFailDto,
    GetProductListResDto,
    ProductCategoryResDto,
} from './dto/res/GetProductRes.dto';
import { UpdateEnglishProductReqDto, UpdateProductReqDto } from './dto/req/UpdateProductReq.dto';
import { TempProductReqDto } from './dto/req/TempProductReq.dto';
import { UpdateEnglishProductFailDto, UpdateProductFailDto } from './dto/res/UpdateProductRes.dto';
import {
    CheckSkuReqDto,
    CreateEnglishProductReqDto,
    CreateProductReqDto,
} from './dto/req/CreateProductReq.dto';

@ApiTags('상품')
@Controller('product')
export class ProductsController {
    constructor(private productService: ProductsService) {}

    @Post()
    @ApiBearerAuth('seller-auth')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'thumb' }, { name: 'thumbGlobal' }, { name: 'sale' }], fileUpload),
    )
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: '국내 셀러 상품 등록' })
    @ApiResponse({ status: 200, type: ResultSuccessDto, description: '국내 셀러 상품 등록 성공' })
    @ApiResponse({ status: 201, type: UploadThumbResDto, description: '썸네일 파일 업로드 필요' })
    @ApiResponse({ status: 202, type: UploadSaleResDto, description: '고객 제공용 파일 업로드 필요' })
    @ApiResponse({ status: 203, type: ProductDetailResDto, description: '상품 상세정보 입력 필요' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: CreateProductFailDto, description: '국내 셀러 상품 등록 실패' })
    async create(
        @UploadedFiles() files: File[],
        @Req() req: Request,
        @Body() data: CreateProductReqDto,
        @Res() res: Response,
    ): Promise<any> {
        Logger.log('API - Seller Add Product');
        try {
            const result = await this.productService.create(files, req, data);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('check/sku')
    @ApiBearerAuth('seller-auth')
    @ApiOperation({ summary: '상품 SKU ID 중복 확인' })
    @ApiResponse({ status: 200, type: ResultSuccessDto, description: '중복된 SKU ID 없음' })
    @ApiResponse({ status: 201, type: CheckSkuResDto, description: '이미 존재하는 SKU ID' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    async checkSku(@Req() req: Request, @Body() body: CheckSkuReqDto, @Res() res: Response): Promise<any> {
        Logger.log('API - Check Product SKU ID');
        try {
            const result = await this.productService.checkSku(req, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('en')
    @ApiBearerAuth('seller-auth')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'thumbGlobal' }, { name: 'sale' }], fileUpload))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: '해외 셀러 상품 등록' })
    @ApiResponse({ status: 200, type: ResultSuccessDto, description: '해외 셀러 상품 등록 성공' })
    @ApiResponse({
        status: 201,
        type: UploadEnglishThumbResDto,
        description: '해외 썸네일 파일 업로드 필요',
    })
    @ApiResponse({
        status: 202,
        type: UploadEnglishSaleResDto,
        description: '해외 고객 제공용 파일 업로드 필요',
    })
    @ApiResponse({
        status: 203,
        type: EnglishProductDetailResDto,
        description: '해외 상품 상세정보 입력 필요',
    })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({
        status: 401,
        type: CreateEnglishProductFailDto,
        description: '해외 셀러 상품 등록 실패',
    })
    async enCreate(
        @UploadedFiles() files: File[],
        @Req() req: Request,
        @Body() data: CreateEnglishProductReqDto,
        @Res() res: Response,
    ): Promise<any> {
        Logger.log('API - English Seller Add Product');
        try {
            const result = await this.productService.enCreate(files, req, data);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    // @Post('template')
    // @ApiBearerAuth('seller-auth')
    // @ApiOperation({ summary: '상품 상세정보 템플릿 리스트' })
    // @ApiResponse({ status: 200, type: GetProductTemplateListResDto, description: '상품 상세정보 템플릿 리스트 성공' })
    // @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    // @ApiResponse({ status: 401, type: GetProductTemplateListFailDto, description: '상품 상세정보 템플릿 리스트 실패' })
    // async productTemplate(@Body() body: ProductTemplateReqDto, @Res() res: Response) {
    //     Logger.log('API - Seller Product Template List');
    //     try {
    //         const result = await this.productService.productTemplate(body);
    //         res.status(200).json(result);
    //     } catch (err) {
    //         console.log(err);
    //         res.status(400).json({ "resultCode": -1, "data": null });
    //     }
    // }

    @Post('list')
    @ApiBearerAuth('seller-auth')
    @ApiOperation({
        summary:
            '상품 리스트 조회(sort - 0: 전체보기(기본값), 1: 가격 낮은순, 2: 가격 높은순, 3: 판매량순, 4: 최신순)',
    })
    @ApiResponse({ status: 200, type: GetProductListResDto, description: '상품 리스트 조회 성공' })
    @ApiResponse({ status: 201, type: ProductCategoryResDto, description: '카테고리 번호 입력 필요' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: GetProductListFailDto, description: '상품 리스트 조회 실패' })
    async findAll(@Req() req: Request, @Body() body: ProductListReqDto, @Res() res: Response) {
        Logger.log('API - Seller Product List');
        try {
            const result = await this.productService.list(req, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Get(':id')
    @ApiBearerAuth('seller-auth')
    @ApiOperation({ summary: '상품 상세 정보 조회' })
    @ApiResponse({ status: 200, type: GetProductDetailResDto, description: '상품 상세 정보 조회 성공' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: GetProductDetailFailDto, description: '상품 상세 정보 조회 실패' })
    async detail(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        Logger.log('API - Seller Product Detail');
        try {
            const result = await this.productService.detail(id);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Patch(':id')
    @ApiBearerAuth('seller-auth')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'thumb' }, { name: 'thumbGlobal' }, { name: 'sale' }], fileUpload),
    )
    @ApiOperation({ summary: '국내 셀러 상품 수정' })
    @ApiResponse({ status: 200, type: ResultSuccessDto, description: '국내 셀러 상품 수정 성공' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: UpdateProductFailDto, description: '국내 셀러 상품 수정 실패' })
    async update(
        @UploadedFiles() files: File[],
        @Param('id', ParseIntPipe) id: number,
        @Body() data: UpdateProductReqDto,
        @Res() res: Response,
    ) {
        Logger.log('API - Product Update');
        try {
            const result = await this.productService.update(files, id, data);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    // @Patch('en/:id')
    // @ApiBearerAuth('seller-auth')
    // @ApiConsumes('multipart/form-data')
    // @UseInterceptors(FileFieldsInterceptor([{ name: 'thumbGlobal' }, { name: 'sale' }], fileUpload))
    // @ApiOperation({ summary: '해외 셀러 상품 수정' })
    // @ApiResponse({ status: 200, type: ResultSuccessDto, description: '해외 셀러 상품 수정 성공' })
    // @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    // @ApiResponse({
    //     status: 401,
    //     type: UpdateEnglishProductFailDto,
    //     description: '해외 셀러 상품 수정 실패',
    // })
    // async enUpdate(
    //     @UploadedFiles() files: File[],
    //     @Req() req: any,
    //     @Param('id', ParseIntPipe) id: any,
    //     @Body() data: UpdateEnglishProductReqDto,
    //     @Res() res: Response,
    // ) {
    //     Logger.log('API - English Product Update');
    //     try {
    //         const result = await this.productService.enUpdate(files, req, id, data);
    //         res.status(200).json(result);
    //     } catch (err) {
    //         console.log(err);
    //         res.status(400).json({ resultCode: -1, data: null });
    //     }
    // }

    // @Post('temp')
    // @ApiBearerAuth('seller-auth')
    // @ApiConsumes('multipart/form-data')
    // @UseInterceptors(
    //     FileFieldsInterceptor([{ name: 'thumb' }, { name: 'thumbGlobal' }, { name: 'sale' }], fileUpload),
    // )
    // @ApiOperation({ summary: '상품 임시저장' })
    // @ApiResponse({ status: 200, type: ResultSuccessDto, description: '상품 임시저장 성공' })
    // @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    // @ApiResponse({ status: 401, type: ProductTempFailDto, description: '상품 임시저장 실패' })
    // async temp(
    //     @UploadedFiles() files: File[],
    //     @Req() req: any,
    //     @Body() data: TempProductReqDto,
    //     @Res() res: Response,
    // ) {
    //     Logger.log('API - Product Temporary Save');
    //     try {
    //         const result = await this.productService.temp(files, req, data);
    //         res.status(200).json(result);
    //     } catch (err) {
    //         console.log(err);
    //         res.status(400).json({ resultCode: -1, data: null });
    //     }
    // }

    // // @Post('price')
    // // @ApiBearerAuth('seller-auth')
    // // @ApiOperation({ summary: '상품 가격 수정' })
    // // @ApiResponse({ status: 200, type: ResultSuccessDto, description: '상품 가격 수정 성공' })
    // // @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    // // @ApiResponse({ status: 401, type: UpdateProductPriceFailDto, description: '상품 가격 수정 실패' })
    // // async updatePrice(@Req() req: any, @Body() body: UpdateProductPriceReqDto, @Res() res: Response) {
    // //     Logger.log('API - Product Price Update')
    // //     try {
    // //         const result = await this.productService.updatePrice(req, body);
    // //         res.status(200).json(result);
    // //     } catch (err) {
    // //         console.log(err);
    // //         res.status(400).json({ "resultCode": -1, "data": null });
    // //     }
    // // }

    // // @Get('sync/price')
    // // async syncPrice(@Req() req: any, @Res() res: Response) {
    // //     try {
    // //         const result = await this.productService.priceSync(req);
    // //         return result;
    // //     } catch (err) {
    // //         console.log(err);
    // //     }
    // // }

    // @Post('test')
    // @ApiBearerAuth('seller-auth')
    // @UseInterceptors(
    //     FileFieldsInterceptor([{ name: 'thumb' }, { name: 'thumbGlobal' }, { name: 'sale' }], fileUpload),
    // )
    // @ApiConsumes('multipart/form-data')
    // @ApiOperation({ summary: '상품 파일 테스트 등록' })
    // async testCreate(
    //     @UploadedFiles() files: File[],
    //     @Body() body: any,
    //     @Res() res: Response,
    // ): Promise<any> {
    //     Logger.log('API - Seller Upload Product Test');
    //     try {
    //         const result = await this.productService.fileTest(files, body);
    //         res.status(200).json(result);
    //     } catch (err) {
    //         console.log(err);
    //         res.status(400).json({ resultCode: -1, data: null });
    //     }
    // }

    // @Get('upload/s3')
    // @UseInterceptors(FileFieldsInterceptor([{ name: 'thumb' }], fileUpload))
    // @ApiConsumes('multipart/form-data')
    // async uploadS3(@UploadedFiles() files: File[], @Res() res: Response): Promise<any> {
    //     Logger.log('API - S3 File Upload');
    //     try {
    //         const result = await this.productService.uploadS3(files);
    //         res.status(200).json(result);
    //     } catch (err) {
    //         console.log(err);
    //         res.status(400).json({ resultCode: -1, data: null });
    //     }
    // }
}
