import { OrderProductRepository } from 'src/repository/OrderProduct.repository';
import { SellerRepository } from 'src/repository/Seller.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { BusinessOption, Currency, LedgerStatus, TaxStatus } from 'src/entity/enum/enum';
import { OrderProduct } from 'src/entity/OrderProduct.entity';
import { Seller } from 'src/entity/Seller.entity';
import { SellerLedger } from 'src/entity/SellerLedger.entity';
import { SellerLedgerRepository } from 'src/repository/SellerLedger.repository';
import { getRepository } from 'typeorm';

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(Seller)
        private sellerRepository: SellerRepository,
        @InjectRepository(OrderProduct)
        private orderProductRepository: OrderProductRepository,
        @InjectRepository(SellerLedger)
        private sellerLedgerRepository: SellerLedgerRepository,
    ) {}

    @Cron(`0 10 * * * *`, { name: 'update sale amount data' })
    async updateSaleAmount() {
        try {
            const sellerList = await getRepository(Seller).createQueryBuilder('s').getMany();
            let startDate = new Date('2022-12-01 00:00:00');
            for (let i = 0; i < sellerList.length; i++) {
                let sellerId = sellerList[i].id;
                let seller = await getRepository(Seller)
                    .createQueryBuilder('s')
                    .leftJoinAndSelect('s.sellerInfo', 'si')
                    .where('s.id = :sellerId', { sellerId: sellerId })
                    .getOne();
                let orderProduct = await getRepository(OrderProduct)
                    .createQueryBuilder('op')
                    .leftJoinAndSelect('op.product', 'p')
                    .leftJoinAndSelect('op.order', 'o')
                    .leftJoinAndSelect('p.seller', 's')
                    .where('o.paymentDate >= :startDate', { startDate: startDate })
                    .andWhere('s.id = :sellerId', { sellerId: sellerId })
                    .andWhere('op.orderStatus = "confirmed"')
                    .getMany();
                if (seller.registType === true) {
                    let saleAmount = 0;
                    for (let j = 0; j < orderProduct.length; j++) {
                        if (orderProduct[j].order !== null) {
                            if (orderProduct[j].amount > 0) {
                                saleAmount += orderProduct[j].amount;
                            }
                        }
                    }
                    let sellerLedger = await getRepository(SellerLedger)
                        .createQueryBuilder('sl')
                        .where('sl.sellerId = :sellerId', { sellerId: sellerId })
                        .andWhere('sl.saleYear = "2023"')
                        .andWhere('sl.saleMonth = "01"')
                        .getOne();
                    sellerLedger.saleAmount = saleAmount;
                    console.log(sellerId, saleAmount);
                    await getRepository(SellerLedger).save(sellerLedger);
                } else if (seller.registType === false) {
                    let saleAmount = 0;
                    for (let j = 0; j < orderProduct.length; j++) {
                        if (orderProduct[j].order !== null) {
                            if (orderProduct[j].dollarAmount > 0) {
                                saleAmount += orderProduct[j].dollarAmount;
                            }
                        }
                    }
                    let sellerLedger = await getRepository(SellerLedger)
                        .createQueryBuilder('sl')
                        .where('sl.sellerId = :sellerId', { sellerId: sellerId })
                        .andWhere('sl.saleYear = "2023"')
                        .andWhere('sl.saleMonth = "01"')
                        .getOne();
                    sellerLedger.saleAmount = saleAmount;
                    console.log(sellerId, saleAmount);
                    await getRepository(SellerLedger).save(sellerLedger);
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    @Cron(`0 5 * * * *`, { name: 'updated sale amount data' })
    async updatedSaleAmount() {
        try {
            const sellerList = await getRepository(Seller).createQueryBuilder('s').getMany();
            let startDate = new Date('2022-11-01 00:00:00');
            let endDate = new Date('2022-11-30 23:59:59');
            for (let i = 0; i < sellerList.length; i++) {
                let sellerId = sellerList[i].id;
                let seller = await getRepository(Seller)
                    .createQueryBuilder('s')
                    .leftJoinAndSelect('s.sellerInfo', 'si')
                    .where('s.id = :sellerId', { sellerId: sellerId })
                    .getOne();
                let orderProduct = await getRepository(OrderProduct)
                    .createQueryBuilder('op')
                    .leftJoinAndSelect('op.product', 'p')
                    .leftJoinAndSelect('op.order', 'o')
                    .leftJoinAndSelect('p.seller', 's')
                    .where('o.paymentDate >= :startDate', { startDate: startDate })
                    .andWhere('o.paymentDate <= :endDate', { endDate: endDate })
                    .andWhere('s.id = :sellerId', { sellerId: sellerId })
                    .andWhere('op.orderStatus = "confirmed"')
                    .getMany();
                if (seller.registType === true) {
                    let saleAmount = 0;
                    for (let j = 0; j < orderProduct.length; j++) {
                        if (orderProduct[j].order !== null) {
                            if (orderProduct[j].amount > 0) {
                                saleAmount += orderProduct[j].amount;
                            }
                        }
                    }
                    let sellerLedger = await getRepository(SellerLedger)
                        .createQueryBuilder('sl')
                        .where('sl.sellerId = :sellerId', { sellerId: sellerId })
                        .andWhere('sl.saleYear = "2022"')
                        .andWhere('sl.saleMonth = "12"')
                        .getOne();
                    sellerLedger.saleAmount = saleAmount;
                    console.log(sellerId, saleAmount);
                    await getRepository(SellerLedger).save(sellerLedger);
                } else if (seller.registType === false) {
                    let saleAmount = 0;
                    for (let j = 0; j < orderProduct.length; j++) {
                        if (orderProduct[j].order !== null) {
                            if (orderProduct[j].dollarAmount > 0) {
                                saleAmount += orderProduct[j].dollarAmount;
                            }
                        }
                    }
                    let sellerLedger = await getRepository(SellerLedger)
                        .createQueryBuilder('sl')
                        .where('sl.sellerId = :sellerId', { sellerId: sellerId })
                        .andWhere('sl.saleYear = "2022"')
                        .andWhere('sl.saleMonth = "12"')
                        .getOne();
                    sellerLedger.saleAmount = saleAmount;
                    console.log(sellerId, saleAmount);
                    await getRepository(SellerLedger).save(sellerLedger);
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    @Cron(`10 0 0 1 * *`, { name: 'daily sale amount data' })
    async ledgerCreate() {
        try {
            const currencyData = await axios.get(
                'https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=0GYQ5npmDp0WGbjW3mOMKxgn9H2R5Gs3&searchdate=20221101&data=AP01',
            );
            let dollarCurrencyString = null;
            let dollarCurrency = 0;
            currencyData.data.forEach(async (o) => {
                if (o.cur_nm === '미국 달러') {
                    dollarCurrencyString = o.bkpr;
                }
            });
            let dollarString = dollarCurrencyString.replace(',', '');
            dollarCurrency = Number(dollarString);
            const sellerList = await getRepository(Seller).createQueryBuilder('s').getMany();
            let startDate = new Date('2022-11-01 00:00:00');
            let endDate = new Date('2022-11-30 23:59:59');
            for (let i = 0; i < sellerList.length; i++) {
                let sellerId = sellerList[i].id;
                let seller = await getRepository(Seller)
                    .createQueryBuilder('s')
                    .leftJoinAndSelect('s.sellerInfo', 'si')
                    .where('s.id = :sellerId', { sellerId: sellerId })
                    .getOne();
                let orderProduct = await getRepository(OrderProduct)
                    .createQueryBuilder('op')
                    .leftJoinAndSelect('op.product', 'p')
                    .leftJoinAndSelect('op.order', 'o')
                    .leftJoinAndSelect('p.seller', 's')
                    .where('o.paymentDate >= :startDate', { startDate: startDate })
                    .andWhere('o.paymentDate <= :endDate', { endDate: endDate })
                    .andWhere('s.id = :sellerId', { sellerId: sellerId })
                    .andWhere('op.orderStatus = "confirmed"')
                    .getMany();
                if (seller.registType === true) {
                    let saleAmount = 0;
                    for (let j = 0; j < orderProduct.length; j++) {
                        if (orderProduct[j].order !== null) {
                            if (orderProduct[j].amount > 0) {
                                saleAmount += orderProduct[j].amount;
                            }
                        }
                    }
                    let sellerLedger = await getRepository(SellerLedger)
                        .createQueryBuilder('sl')
                        .where('sl.sellerId = :sellerId', { sellerId: sellerId })
                        .andWhere('sl.saleYear = "2022"')
                        .andWhere('sl.saleMonth = "12"')
                        .getOne();
                    sellerLedger.saleAmount = saleAmount;
                    sellerLedger.currency = Currency.KRW;
                    sellerLedger.seller = seller;
                    console.log(sellerId, saleAmount);
                    await getRepository(SellerLedger).save(sellerLedger);
                } else if (seller.registType === false) {
                    let saleAmount = 0;
                    for (let j = 0; j < orderProduct.length; j++) {
                        if (orderProduct[j].order !== null) {
                            if (orderProduct[j].dollarAmount > 0) {
                                saleAmount += orderProduct[j].dollarAmount;
                            }
                        }
                    }
                    let sellerLedger = await getRepository(SellerLedger)
                        .createQueryBuilder('sl')
                        .where('sl.sellerId = :sellerId', { sellerId: sellerId })
                        .andWhere('sl.saleYear = "2022"')
                        .andWhere('sl.saleMonth = "12"')
                        .getOne();
                    sellerLedger.saleAmount = saleAmount;
                    sellerLedger.currency = Currency.USD;
                    sellerLedger.seller = seller;
                    console.log(sellerId, saleAmount);
                    await getRepository(SellerLedger).save(sellerLedger);
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    @Cron(`10 10 0 1 * *`, { name: 'monthly ledger data create' })
    async monthlyCreate() {
        try {
            const sellerList = await getRepository(Seller)
                .createQueryBuilder('s')
                .leftJoinAndSelect('s.sellerInfo', 'si')
                .getMany();
            for (let i = 0; i < sellerList.length; i++) {
                let seller = sellerList[i];
                let sellerLedger = getRepository(SellerLedger).create();
                sellerLedger.seller = seller;
                sellerLedger.saleYear = '2023';
                sellerLedger.saleMonth = '01';
                sellerLedger.feeRatio = seller.sellerInfo.feeRatio;
                sellerLedger.ledgerStatus = LedgerStatus.aggregate;
                sellerLedger.taxStatus = TaxStatus.unissued;
                sellerLedger.saleAmount = 0;
                sellerLedger.ledgerAmount = 0;
                sellerLedger.withholdingTax = 0;
                if (seller.registType == true) {
                    sellerLedger.currency = Currency.KRW;
                } else {
                    sellerLedger.currency = Currency.USD;
                }
                await getRepository(SellerLedger).save(sellerLedger);
                console.log(seller.id);
            }
        } catch (err) {
            console.log(err);
        }
    }

    // @Cron(`0 54 * * * *`, { name: 'ledger data change to wait'})
    async changeToWait() {
        try {
            const sellerList = await getRepository(Seller)
                .createQueryBuilder('s')
                .leftJoinAndSelect('s.sellerInfo', 'si')
                .getMany();
            for (let i = 0; i < sellerList.length; i++) {
                let sellerId = sellerList[i].id;
                if (sellerList[i].registType === true) {
                    let sellerLedger = await getRepository(SellerLedger)
                        .createQueryBuilder('sl')
                        .where('sl.sellerId = :sellerId', { sellerId: sellerId })
                        .andWhere('sl.saleYear = "2022"')
                        .andWhere('sl.saleMonth = "12"')
                        .getOne();
                    let totalSaleAmount = sellerLedger.saleAmount;
                    let feeRatio = sellerList[i].sellerInfo.feeRatio;
                    let numberLedgerAmount = totalSaleAmount * ((100 - feeRatio) / 100);
                    let totalLedgerAmount = Math.floor(numberLedgerAmount / 10) * 10;
                    let numberTax = 0;
                    let tax = 0;
                    if (
                        sellerList[i].sellerInfo.businessOption === BusinessOption.personal &&
                        totalLedgerAmount > 125000
                    ) {
                        numberTax = totalLedgerAmount * 0.088;
                        tax = Math.floor(numberTax / 10) * 10;
                        totalLedgerAmount -= tax;
                    }
                    sellerLedger.withholdingTax = tax;
                    sellerLedger.ledgerAmount = totalLedgerAmount;
                    sellerLedger.ledgerStatus = LedgerStatus.wait;
                    console.log(sellerId, totalLedgerAmount);
                    await this.sellerLedgerRepository.save(sellerLedger);
                } else if (sellerList[i].registType === false) {
                    let sellerLedger = await getRepository(SellerLedger)
                        .createQueryBuilder('sl')
                        .where('sl.sellerId = :sellerId', { sellerId: sellerId })
                        .andWhere('sl.saleYear = "2022"')
                        .andWhere('sl.saleMonth = "12"')
                        .getOne();
                    let totalSaleAmount = sellerLedger.saleAmount;
                    let feeRatio = sellerList[i].sellerInfo.feeRatio;
                    let numberLedgerAmount = totalSaleAmount * ((100 - feeRatio) / 100);
                    let stringLedgerAmount = numberLedgerAmount.toFixed(2);
                    let totalLedgerAmount = Number(stringLedgerAmount);
                    sellerLedger.ledgerAmount = totalLedgerAmount;
                    sellerLedger.ledgerStatus = LedgerStatus.wait;
                    console.log(sellerId, totalLedgerAmount);
                    await this.sellerLedgerRepository.save(sellerLedger);
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
}
