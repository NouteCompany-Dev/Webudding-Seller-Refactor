import { SellerRepository } from 'src/repository/Seller.repository';
import { Injectable } from '@nestjs/common';
import { LedgerStatus } from 'src/entity/enum/enum';
import { SellerLedgerRepository } from 'src/repository/SellerLedger.repository';

@Injectable()
export class LedgersService {
    constructor(
        private sellerRepository: SellerRepository,
        private sellerLedgerRepository: SellerLedgerRepository,
    ) {}

    async list(req: any, body: any): Promise<any> {
        try {
            const { page } = body;
            const data = await this.getLedgerList(req, page);
            return { status: 200, resultCode: 1, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: -1, data: null };
        }
    }

    async ledgerExcelDownload(req: any): Promise<any> {
        try {
            const data = await this.getLedgerExcelData(req);
            return { status: 200, resultCode: 1, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: -1, data: null };
        }
    }

    // 서비스 로직

    async getLedgerList(req: any, body: any): Promise<any> {
        const sellerId = req.seller.sellerId;
        const seller = await this.sellerRepository.getSeller(sellerId);
        let data = null;
        let sellerLedgerInfo = null;

        if (seller.registType === true) {
            sellerLedgerInfo = await this.sellerLedgerRepository.getSellerLedgerData(sellerId);
        } else {
            sellerLedgerInfo = await this.sellerLedgerRepository.getSellerEnglishLedgerData(sellerId);
        }

        let ledgerData = [];

        for (let i = 0; i < sellerLedgerInfo.length; i++) {
            let saleYear = null;
            let saleMonth = null;

            if (sellerLedgerInfo[i].saleMonth === '01') {
                saleYear = Number(sellerLedgerInfo[i].saleYear) - 1;
                saleMonth = 12;
                saleYear = String(saleYear);
                saleMonth = String(saleMonth);
            } else {
                saleYear = sellerLedgerInfo[i].saleYear;
                saleMonth = Number(sellerLedgerInfo[i].saleMonth) - 1;
                saleMonth = String(saleMonth);
            }

            if (sellerLedgerInfo[i].ledgerStatus === LedgerStatus.sale) {
                ledgerData[i] = {
                    saleYear: saleYear,
                    saleMonth: saleMonth,
                    ledgerYear: sellerLedgerInfo[i].saleYear,
                    ledgerMonth: sellerLedgerInfo[i].saleMonth,
                    saleAmount: sellerLedgerInfo[i].saleAmount,
                    ledgerAmount: '-',
                    ledgerStatus: sellerLedgerInfo[i].ledgerStatus,
                };
            } else {
                ledgerData[i] = {
                    saleYear: saleYear,
                    saleMonth: saleMonth,
                    ledgerYear: sellerLedgerInfo[i].saleYear,
                    ledgerMonth: sellerLedgerInfo[i].saleMonth,
                    saleAmount: sellerLedgerInfo[i].saleAmount,
                    ledgerAmount: sellerLedgerInfo[i].ledgerAmount,
                    ledgerStatus: sellerLedgerInfo[i].ledgerStatus,
                };
            }
        }

        let count = ledgerData.length;
        const offset = (body + 1) * 4;
        let resData = ledgerData.reverse();
        resData = ledgerData.slice(body * 4, offset);

        data = {
            resData,
            count,
        };

        return data;
    }

    async getLedgerExcelData(req: any): Promise<any> {
        const sellerId = req.seller.sellerId;
        console.log(sellerId);
        const query = await this.sellerLedgerRepository.getSellerConfirmedLedgerData(sellerId);
        let data = [];
        let res = {};

        for (let i = 0; i < query.length; i++) {
            let saleYear = null;
            let saleMonth = null;

            if (query[i].saleMonth === '01') {
                saleYear = Number(query[i].saleYear) - 1;
                saleMonth = 12;
                saleYear = String(saleYear);
                saleMonth = String(saleMonth);
            } else {
                saleYear = query[i].saleYear;
                saleMonth = Number(query[i].saleMonth) - 1;
                saleMonth = String(saleMonth);
            }

            data[i] = {
                saleYear: saleYear,
                saleMonth: saleMonth,
                ledgerYear: query[i].saleYear,
                ledgerMonth: query[i].saleMonth,
                ledgerAmount: query[i].ledgerAmount,
                ledgerStatus: query[i].ledgerStatus,
            };

            res = data[i];
        }

        return res;
    }
}
