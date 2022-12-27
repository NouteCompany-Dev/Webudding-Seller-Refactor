import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductSale } from 'src/entity/ProductSale.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductSaleRepository {
    constructor(
        @InjectRepository(ProductSale)
        private productSaleRepository: Repository<ProductSale>,
    ) {}

    async create() {
        return this.productSaleRepository.create();
    }

    async save(body: ProductSale) {
        return this.productSaleRepository.save(body);
    }

    async getProductSale(body: any): Promise<any> {
        return await this.productSaleRepository
            .createQueryBuilder('ps')
            .where('ps.productId = :body', { body: body })
            .getOne();
    }
}
