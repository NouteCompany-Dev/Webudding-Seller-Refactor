import { ProductReviewImage } from 'src/entity/ProductReviewImage.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProductReviewImageRepository {
    constructor(
        @InjectRepository(ProductReviewImage)
        private productReviewImageRepository: Repository<ProductReviewImage>,
    ) {}

    async create() {
        return this.productReviewImageRepository.create();
    }

    async save(body: ProductReviewImage) {
        return await this.productReviewImageRepository.save(body);
    }
}
