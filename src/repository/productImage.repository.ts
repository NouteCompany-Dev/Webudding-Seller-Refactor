import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductImage } from 'src/entity/ProductImage.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductImageRepository {
    constructor(
        @InjectRepository(ProductImage)
        private productImageRepository: Repository<ProductImage>,
    ) {}

    async create() {
        return this.productImageRepository.create();
    }

    async save(body: ProductImage) {
        return this.productImageRepository.save(body);
    }
}
