import { SellerNoticeImage } from './../../entity/SellerNoticeImage.entity';
import { SellerNotice } from './../../entity/SellerNotice.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { NoticesService } from './Notices.service';
import { NoticesController } from './Notices.controller';
import { SellerNoticeRepository } from 'src/repository/sellerNotice.repository';
import { SellerNoticeImageRepository } from 'src/repository/sellerNoticeImage.repository';

@Module({
    imports: [TypeOrmModule.forFeature([SellerNotice, SellerNoticeImage])],
    providers: [NoticesService, SellerNoticeRepository, SellerNoticeImageRepository],
    controllers: [NoticesController],
})
export class NoticesModule {}
