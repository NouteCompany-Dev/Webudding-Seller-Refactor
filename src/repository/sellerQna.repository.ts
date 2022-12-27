import { SellerQna } from 'src/entity/SellerQna.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SellerQnaRepsitory {
    constructor(
        @InjectRepository(SellerQna)
        private sellerQnaRepository: Repository<SellerQna>,
    ) {}

    async save(body: SellerQna) {
        return await this.sellerQnaRepository.save(body);
    }

    async getProductComment(body: any): Promise<any> {
        return await this.sellerQnaRepository
            .createQueryBuilder('sq')
            .where('sq.id = :body', { body: body })
            .getOne();
    }
}
