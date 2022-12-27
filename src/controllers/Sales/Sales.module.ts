import { ProductRepository } from './../../repository/Product.repository';
import { Product } from './../../entity/Product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { SalesController } from './Sales.controller';
import { SalesService } from './Sales.service';
import { OrderProduct } from 'src/entity/OrderProduct.entity';
import { OrderProductRepository } from 'src/repository/OrderProduct.repository';
import { ProductThumb } from 'src/entity/ProductThumb.entity';
import { Category } from 'src/entity/Category.entity';
import { ProductThumbRepository } from 'src/repository/productThumb.repository';
import { CategoryRepository } from 'src/repository/Category.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Product, ProductThumb, Category, OrderProduct])],
    controllers: [SalesController],
    providers: [
        SalesService,
        ProductRepository,
        ProductThumbRepository,
        CategoryRepository,
        OrderProductRepository,
    ],
})
export class SalesModule {}
