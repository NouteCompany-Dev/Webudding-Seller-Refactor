import { ProductRepository } from './../../repository/Product.repository';
import { Module } from '@nestjs/common';
import { DashboardsService } from './Dashboards.service';
import { DashboardsController } from './Dashboards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/entity/Product.entity';
import { OrderProduct } from 'src/entity/OrderProduct.entity';
import { OrderProductRepository } from 'src/repository/OrderProduct.repository';
import { Category } from 'src/entity/Category.entity';
import { CategoryRepository } from 'src/repository/Category.repository';
import { ProductReviewRepository } from 'src/repository/productReview.repository';
import { ProductReview } from 'src/entity/ProductReview.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Product, OrderProduct, Category, ProductReview])],
    providers: [
        DashboardsService,
        ProductRepository,
        OrderProductRepository,
        CategoryRepository,
        ProductReviewRepository,
    ],
    controllers: [DashboardsController],
})
export class DashboardsModule {}
