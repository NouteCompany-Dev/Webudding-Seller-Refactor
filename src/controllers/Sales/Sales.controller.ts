import { Controller, Req, Logger, Res, Body, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ResultFailDto } from 'src/common/dto/Result.dto';
import { SalesListFailDto, SalesListSuccessDto } from './dto/res/GetSalesListRes.dto';
import { SalesService } from './Sales.service';
import { ExcelDownloadReqDto } from './dto/req/ExcelDownloadReq.dto';
import { ExcelDonwloadFailDto, ExcelDownloadSuccessDto } from './dto/res/ExcelDownloadRes.dto';
import { GetSaleListReqDto } from './dto/req/GetSaleListReq.dto';

@ApiTags('판매')
@Controller('sales')
export class SalesController {
    constructor(private saleService: SalesService) {}

    @Post()
    @ApiOperation({ summary: '상품 판매량 조회' })
    @ApiBearerAuth('seller-auth')
    @ApiResponse({ status: 200, type: SalesListSuccessDto, description: '상품 판매량 조회 성공' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: SalesListFailDto, description: '상품 판매량 조회 실패' })
    async saleList(@Req() req: Request, @Res() res: Response, @Body() body: GetSaleListReqDto) {
        Logger.log('API - Seller Product Sale');
        try {
            const result = await this.saleService.saleList(req, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('excel')
    @ApiOperation({ summary: '상품 판매 데이터 엑셀 다운로드' })
    @ApiBearerAuth('seller-auth')
    @ApiResponse({
        status: 200,
        type: ExcelDownloadSuccessDto,
        description: '상품 판매 데이터 엑셀 다운로드 성공',
    })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({
        status: 401,
        type: ExcelDonwloadFailDto,
        description: '상품 판매 데이터 엑셀 다운로드 실패',
    })
    async excelDownload(@Req() req: Request, @Res() res: Response, @Body() body: ExcelDownloadReqDto) {
        Logger.log('API - Seller Product Sale Data Excel Download');
        try {
            const result = await this.saleService.excelDownload(req, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }
}
