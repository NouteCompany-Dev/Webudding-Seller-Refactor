import { SellerInfo } from './../../entity/SellerInfo.entity';
import { LedgerListReqDto } from './dto/req/LedgerListReq.dto';
import { Body, Controller, Get, Logger, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { LedgersService } from './Ledgers.service';
import { ResultFailDto, ResultSuccessDto } from 'src/common/dto/Result.dto';
import { LedgerListResDto } from './dto/res/GetLedgersRes.dto';
import { getRepository } from 'typeorm';
import { Seller } from 'src/entity/Seller.entity';
import { OrderProduct } from 'src/entity/OrderProduct.entity';
import { BusinessOption, LedgerStatus, TaxStatus } from 'src/entity/enum/enum';
import { SellerLedger } from 'src/entity/SellerLedger.entity';

@ApiTags('정산')
@Controller('ledgers')
export class LedgersController {
    constructor(private ledgerService: LedgersService) {}

    @Post()
    @ApiOperation({ summary: '정산 리스트 조회' })
    @ApiResponse({ status: 200, type: ResultSuccessDto, description: '정산 리스트 조회 성공' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: LedgerListResDto, description: '정산 리스트 조회 실패' })
    @ApiBearerAuth('seller-auth')
    async list(@Req() req: Request, @Body() body: LedgerListReqDto, @Res() res: Response): Promise<any> {
        Logger.log('API - Seller Ledger List');
        try {
            const result = await this.ledgerService.list(req, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    // @Get('excel')
    // @ApiOperation({ summary: '정산 데이터 엑셀 다운로드' })
    // @ApiResponse({ status: 200, type: ResultSuccessDto, description: '정산 리스트 조회 성공' })
    // @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    // @ApiResponse({ status: 401, type: LedgerListResDto, description: '정산 리스트 조회 실패' })
    // @ApiBearerAuth('seller-auth')
    // async excelDownload(@Req() req: Request, @Res() res: Response) {
    //     Logger.log('API - Seller Ledger Data Excel Download');
    //     try {
    //         const result = await this.ledgerService.ledgerExcelDownload(req);
    //         res.status(200).json(result);
    //     } catch (err) {
    //         console.log(err);
    //     }
    // }
}
