import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SellerNoticeImage } from 'src/entity/SellerNoticeImage.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SellerNoticeImageRepository {
    constructor(
        @InjectRepository(SellerNoticeImage)
        private sellerNoticeImageRepository: Repository<SellerNoticeImage>,
    ) {}

    async create() {
        return this.sellerNoticeImageRepository.create();
    }

    async save(body: SellerNoticeImage) {
        return await this.sellerNoticeImageRepository.save(body);
    }

    async getOne(body: any): Promise<any> {
        return await this.sellerNoticeImageRepository
            .createQueryBuilder('ni')
            .where('ni.noticeId = :id', { id: body })
            .getOne();
    }
}
