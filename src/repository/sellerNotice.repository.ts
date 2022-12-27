import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SellerNotice } from "src/entity/SellerNotice.entity";
import { Repository } from "typeorm";

@Injectable()
export class SellerNoticeRepository {
    constructor(
        @InjectRepository(SellerNotice)
        private sellerNoticeRepository: Repository<SellerNotice>
    ) {}

    async create() {
        return this.sellerNoticeRepository.create();
    }

    async save(body: SellerNotice) {
        return await this.sellerNoticeRepository.save(body);
    }

    async getOne(body: any): Promise<any> {
        return await this.sellerNoticeRepository.createQueryBuilder('n')
            .where('n.id = :id', { id: body })
            .getOne();
    }

    async getList(body: any): Promise<any> {
        const { type, page } = body;
        const query = this.sellerNoticeRepository.createQueryBuilder('sn')
            .orderBy('sn.createdAt', 'DESC')
            .skip(page * 7)
            .take(7)
        if(type == 1) {
            query.andWhere('sn.type = :type', { type: '기타' })
        }
        else if(type == 2) {
            query.andWhere('sn.type = :type', { type: '정기점검' })
        }
        else if(type == 3) {
            query.andWhere('sn.type = :type', { type: '트렌드 리포트' })
        }
        else if(type == 4) {
            query.andWhere('sn.type = :type', { type: '기획전' })
        }
        return await query.getManyAndCount();
    }
}