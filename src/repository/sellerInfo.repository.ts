import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SellerInfo } from 'src/entity/SellerInfo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SellerInfoRepository {
    constructor(
        @InjectRepository(SellerInfo)
        private sellerInfoRepository: Repository<SellerInfo>,
    ) {}

    async create() {
        return this.sellerInfoRepository.create();
    }

    async save(body: SellerInfo) {
        return await this.sellerInfoRepository.save(body);
    }

    async getSellerInfo(body: any): Promise<any> {
        return await this.sellerInfoRepository
            .createQueryBuilder('si')
            .where('si.sellerId = :body', { body: body })
            .getOne();
    }

    async getSellerInfoList(): Promise<any> {
        return await this.sellerInfoRepository
            .createQueryBuilder('si')
            .leftJoinAndSelect('si.seller', 's')
            .getMany();
    }
}
