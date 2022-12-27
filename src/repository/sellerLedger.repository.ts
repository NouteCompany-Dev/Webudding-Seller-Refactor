import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SellerLedger } from 'src/entity/SellerLedger.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SellerLedgerRepository {
    constructor(
        @InjectRepository(SellerLedger)
        private sellerLedgerRepository: Repository<SellerLedger>,
    ) {}

    async create() {
        return await this.sellerLedgerRepository.create();
    }

    async save(body: SellerLedger) {
        return await this.sellerLedgerRepository.save(body);
    }

    async getSellerLedgerData(body: any): Promise<any> {
        return await this.sellerLedgerRepository
            .createQueryBuilder('sl')
            .where('sl.sellerId = :body', { body: body })
            .andWhere('sl.currency = "KRW"')
            .orderBy('sl.createdAt', 'ASC')
            .getMany();
    }

    async getSellerEnglishLedgerData(body: any): Promise<any> {
        return await this.sellerLedgerRepository
            .createQueryBuilder('sl')
            .where('sl.sellerId = :body', { body: body })
            .andWhere('sl.currency = "USD"')
            .orderBy('sl.createdAt', 'ASC')
            .getMany();
    }

    async getSellerConfirmedLedgerData(body: any): Promise<any> {
        return await this.sellerLedgerRepository
            .createQueryBuilder('sl')
            .where('sl.sellerId = :body', { body: body })
            .andWhere('sl.ledgerStatus = "confirmed"')
            .getMany();
    }
}
