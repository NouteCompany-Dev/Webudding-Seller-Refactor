import { ProductReviewRepository } from 'src/repository/productReview.repository';
import { ProductReviewImage } from 'src/entity/ProductReviewImage.entity';
import { ProductRepository } from './../../repository/Product.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsReviewsController } from './Products-Reviews.controller';
import { ProductsReviewsService } from './Products-Reviews.service';
import { Product } from 'src/entity/Product.entity';
import { ProductReview } from 'src/entity/ProductReview.entity';
import { ProductReviewImageRepository } from 'src/repository/productReviewImage.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Product, ProductReview, ProductReviewImage])],
    controllers: [ProductsReviewsController],
    providers: [
        ProductsReviewsService,
        ProductRepository,
        ProductReviewRepository,
        ProductReviewImageRepository,
    ],
})
export class ProductsReviewsModule {}
