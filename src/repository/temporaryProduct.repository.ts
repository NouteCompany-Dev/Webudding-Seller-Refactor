import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TemporaryProduct } from 'src/entity/TemporaryProduct.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TemporaryProductRepository {
    constructor(
        @InjectRepository(TemporaryProduct)
        private temporaryProductRepository: Repository<TemporaryProduct>,
    ) {}

    async create() {
        return this.temporaryProductRepository.create();
    }

    async save(body: TemporaryProduct) {
        return this.temporaryProductRepository.save(body);
    }

    async getTemporaryProduct(body: any): Promise<any> {
        return await this.temporaryProductRepository
            .createQueryBuilder('tp')
            .where('tp.sellerId = :body', { body: body })
            .getOne();
    }
}
