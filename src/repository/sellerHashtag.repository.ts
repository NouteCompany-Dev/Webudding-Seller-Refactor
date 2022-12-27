import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SellerHashTag } from 'src/entity/SellerHashTag.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SellerHashtagRepository {
    constructor(
        @InjectRepository(SellerHashTag)
        private sellerHashtagRepository: Repository<SellerHashTag>,
    ) {}

    async delete(body: any) {
        return this.sellerHashtagRepository
            .createQueryBuilder('sh')
            .delete()
            .from(SellerHashTag)
            .where('sellerId = :boy', { boy: body })
            .execute();
    }

    create() {
        return this.sellerHashtagRepository.create();
    }

    async save(body: SellerHashTag) {
        return await this.sellerHashtagRepository.save(body);
    }

    async getManyHashtags(body: any): Promise<any> {
        return await this.sellerHashtagRepository
            .createQueryBuilder('sh')
            .where('sh.sellerId = :body', { body: body })
            .getMany();
    }
}
