import { OrderProduct } from 'src/entity/OrderProduct.entity';
import { ProductSale } from 'src/entity/ProductSale.entity';
import { ProductImage } from 'src/entity/ProductImage.entity';
import { ProductThumb } from 'src/entity/ProductThumb.entity';
import { TemporaryProduct } from 'src/entity/TemporaryProduct.entity';
import { Seller } from 'src/entity/Seller.entity';
import { SellerRepository } from 'src/repository/Seller.repository';
import { ProductRepository } from './../../repository/Product.repository';
import { Product } from './../../entity/Product.entity';
import { Module } from '@nestjs/common';
import { ProductsService } from './Products.service';
import { ProductsController } from './Products.controller';
import { FilesService } from '../Files/Files.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerInfo } from 'src/entity/SellerInfo.entity';
import { TemporaryProductRepository } from 'src/repository/temporaryProduct.repository';
import { SellerInfoRepository } from 'src/repository/sellerInfo.repository';
import { Category } from 'src/entity/Category.entity';
import { ProductThumbRepository } from 'src/repository/productThumb.repository';
import { ProductImageRepository } from 'src/repository/productImage.repository';
import { ProductSaleRepository } from 'src/repository/productSale.repository';
import { CategoryRepository } from 'src/repository/Category.repository';
import { HashTag } from 'src/entity/HashTag.entity';
import { HashtagRepository } from 'src/repository/hashtag.repository';
import { TemplateColumn } from 'src/entity/TemplateColumn.entity';
import { TemplateColumnRepository } from 'src/repository/templateColumn.repository';
import { OrderProductRepository } from 'src/repository/OrderProduct.repository';
import { ProductReview } from 'src/entity/ProductReview.entity';
import { ProductReviewRepository } from 'src/repository/productReview.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Product,
            ProductThumb,
            ProductImage,
            ProductSale,
            Category,
            HashTag,
            TemplateColumn,
            OrderProduct,
            TemporaryProduct,
            ProductReview,
            Seller,
            SellerInfo,
        ]),
    ],
    providers: [
        ProductsService,
        FilesService,
        ProductRepository,
        ProductThumbRepository,
        ProductImageRepository,
        ProductSaleRepository,
        CategoryRepository,
        HashtagRepository,
        TemplateColumnRepository,
        OrderProductRepository,
        TemporaryProductRepository,
        ProductReviewRepository,
        SellerRepository,
        SellerInfoRepository,
    ],
    controllers: [ProductsController],
    exports: [ProductsService],
})
export class ProductsModule {}
