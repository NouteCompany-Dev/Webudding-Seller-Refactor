import { SellerQna } from './../../entity/SellerQna.entity';
import { Module } from '@nestjs/common';
import { ProductsCommentsService } from './Products-Comments.service';
import { ProductsCommentsController } from './Products-Comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerQnaRepsitory } from 'src/repository/sellerQna.repository';

@Module({
    imports: [TypeOrmModule.forFeature([SellerQna])],
    providers: [ProductsCommentsService, SellerQnaRepsitory],
    controllers: [ProductsCommentsController],
})
export class ProductsCommentsModule {}
