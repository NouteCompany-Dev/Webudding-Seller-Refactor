import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SellerPopbillAccount } from 'src/entity/SellerPopbillAccount.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SellerPopbillAccountRepository {
    constructor(
        @InjectRepository(SellerPopbillAccount)
        private sellerPopbillAccountRepository: Repository<SellerPopbillAccount>,
    ) {}

    async create() {
        return this.sellerPopbillAccountRepository.create();
    }

    async save(body: SellerPopbillAccount) {
        return await this.sellerPopbillAccountRepository.save(body);
    }

    async getSellerPopbillAccount(body: any): Promise<any> {
        return await this.sellerPopbillAccountRepository
            .createQueryBuilder('spa')
            .where('spa.sellerId = :body', { body: body })
            .getOne();
    }
}
