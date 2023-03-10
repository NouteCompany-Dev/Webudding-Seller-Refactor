import { SellerFile } from './../../entity/SellerFiles.entity';
import { TemporaryProductRepository } from './../../repository/temporaryProduct.repository';
import { SellerRepository } from 'src/repository/Seller.repository';
import { Seller } from './../../entity/Seller.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { SellersService } from './Sellers.service';
import { SellersController } from './Sellers.controller';
import { ProductsModule } from '../Products/Products.module';
import { SellerInfo } from 'src/entity/SellerInfo.entity';
import { SellerPopbillAccount } from 'src/entity/SellerPopbillAccount.entity';
import { TemporaryProduct } from 'src/entity/TemporaryProduct.entity';
import { SellerInfoRepository } from 'src/repository/sellerInfo.repository';
import { SellerPopbillAccountRepository } from 'src/repository/sellerPopbillAccount.repository';
import { Category } from 'src/entity/Category.entity';
import { CategoryRepository } from 'src/repository/Category.repository';
import { SellerFileRepository } from 'src/repository/sellerFile.repository';
import { SellerHashTag } from 'src/entity/SellerHashTag.entity';
import { SellerHashtagRepository } from 'src/repository/sellerHashtag.repository';

@Module({
    imports: [
        ProductsModule,
        TypeOrmModule.forFeature([
            Seller,
            SellerInfo,
            SellerPopbillAccount,
            SellerFile,
            SellerHashTag,
            Category,
            TemporaryProduct,
        ]),
    ],
    controllers: [SellersController],
    providers: [
        SellersService,
        SellerRepository,
        SellerInfoRepository,
        SellerPopbillAccountRepository,
        SellerFileRepository,
        SellerHashtagRepository,
        CategoryRepository,
        TemporaryProductRepository,
    ],
    exports: [SellersService],
})
export class SellersModule {}
