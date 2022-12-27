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
    //     Logger.log('API - Seller Ledger Data Excel Download')
    //     try {
    //         const result = await this.ledgerService.ledgerExcelDownload(req);
    //         res.status(200).json(result);
    //     } catch (err) {
    //         console.log(err)
    //     }
    // }

    @Get('change/aggregate')
    async ledgerCreate() {
        try {
            let sellerList = await getRepository(Seller).createQueryBuilder('s').getMany();

            for (let i = 0; i < sellerList.length; i++) {
                let sellerId = sellerList[i].id;
                let saleData = await getRepository(OrderProduct)
                    .createQueryBuilder('op')
                    .leftJoinAndSelect('op.order', 'o')
                    .leftJoinAndSelect('op.product', 'p')
                    .leftJoinAndSelect('p.seller', 's')
                    .where('s.id = :sellerId', { sellerId: sellerId })
                    .andWhere('o.paymentDate >= "2022-10-01 00:00:00"')
                    .andWhere('o.paymentDate <= "2022-10-31 23:59:59"')
                    .getMany();

                let totalSaleAmount = 0;

                if (sellerList[i].registType == true) {
                    for (let j = 0; j < saleData.length; j++) {
                        let saleAmount = saleData[j].amount;
                        totalSaleAmount += saleAmount;
                    }
                } else {
                    for (let j = 0; j < saleData.length; j++) {
                        let saleAmount = saleData[j].dollarAmount;
                        totalSaleAmount += saleAmount;
                    }
                }

                let ledger = await getRepository(SellerLedger)
                    .createQueryBuilder('sl')
                    .where('sl.sellerId = :sellerId', { sellerId: sellerId })
                    .andWhere('sl.saleYear = "2022"')
                    .andWhere('sl.saleMonth = "11"')
                    .getOne();

                ledger.saleAmount = totalSaleAmount;
                ledger.ledgerStatus = LedgerStatus.aggregate;

                console.log(sellerId, totalSaleAmount);

                await getRepository(SellerLedger).save(ledger);
            }
        } catch (err) {
            console.log(err);
        }
    }

    @Get('change/wait')
    async changeToWait() {
        try {
            let ledgerList = await getRepository(SellerLedger)
                .createQueryBuilder('sl')
                .leftJoinAndSelect('sl.seller', 's')
                .where('sl.saleYear = "2022"')
                .andWhere('sl.saleMonth = "11"')
                .getMany();

            for (let i = 0; i < ledgerList.length; i++) {
                let ledger = ledgerList[i];
                let sellerId = ledger.seller.id;
                let sellerInfo = await getRepository(SellerInfo)
                    .createQueryBuilder('si')
                    .where('si.sellerId = :sellerId', { sellerId: sellerId })
                    .getOne();
                let feeRatio = sellerInfo.feeRatio;
                let totalSaleAmount = 0;
                let totalLedgerAmount = 0;

                if (ledger.saleAmount > 0) {
                    if (ledger.seller.registType == true) {
                        totalSaleAmount = ledger.saleAmount;
                        let numberLedgerAmount = totalSaleAmount * ((100 - feeRatio) / 100);
                        totalLedgerAmount = Math.floor(numberLedgerAmount / 10) * 10;

                        if (
                            sellerInfo.businessOption === BusinessOption.personal &&
                            totalLedgerAmount > 125000
                        ) {
                            let numberTax = totalLedgerAmount * 0.088;
                            let tax = Math.floor(numberTax / 10) * 10;
                            totalLedgerAmount -= tax;

                            ledger.taxStatus = TaxStatus.issuing;
                            ledger.withholdingTax = tax;
                        }
                    }

                    if (ledger.seller.registType == false) {
                        totalSaleAmount = ledger.saleAmount;
                        let numberLedgerAmount = totalSaleAmount * ((100 - feeRatio) / 100);
                        let fixedLedgerAmount = Math.floor(numberLedgerAmount * 100) / 100;
                        totalLedgerAmount = fixedLedgerAmount;
                        ledger.ledgerAmount = totalLedgerAmount;
                        ledger.ledgerStatus = LedgerStatus.wait;

                        console.log(ledger.seller.id, totalLedgerAmount);
                    }

                    await getRepository(SellerLedger).save(ledger);
                } else {
                    ledger.ledgerStatus = LedgerStatus.wait;

                    console.log(ledger.seller.id, totalLedgerAmount);

                    await getRepository(SellerLedger).save(ledger);
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
}
