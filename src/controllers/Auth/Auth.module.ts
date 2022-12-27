import { SellerFileRepository } from 'src/repository/sellerFile.repository';
import { TemporaryProduct } from 'src/entity/TemporaryProduct.entity';
import { SellerMinorFile } from 'src/entity/SellerMinorFile.entity';
import { SellerFile } from 'src/entity/SellerFiles.entity';
import { SellerPopbillAccount } from 'src/entity/SellerPopbillAccount.entity';
import { SellerInfo } from 'src/entity/SellerInfo.entity';
import { SellerRepository } from 'src/repository/Seller.repository';
import { Seller } from './../../entity/Seller.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from './../../modules/mail/mail.module';
import { MailChimpService } from './../../lib/mailChimp/mailChimp.service';
import { Module } from '@nestjs/common';
import { AuthController } from './Auth.controller';
import { AuthService } from './Auth.service';
import { SellerInfoRepository } from 'src/repository/sellerInfo.repository';
import { SellerPopbillAccountRepository } from 'src/repository/sellerPopbillAccount.repository';
import { SellerMinorFileRepository } from 'src/repository/sellerMinorFile.repository';
import { TemporaryProductRepository } from 'src/repository/temporaryProduct.repository';

@Module({
    imports: [
        MailModule,
        TypeOrmModule.forFeature([
            Seller,
            SellerInfo,
            SellerPopbillAccount,
            SellerFile,
            SellerMinorFile,
            TemporaryProduct,
        ]),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        MailChimpService,
        SellerRepository,
        SellerInfoRepository,
        SellerPopbillAccountRepository,
        SellerFileRepository,
        SellerMinorFileRepository,
        TemporaryProductRepository,
    ],
    exports: [AuthService],
})
export class AuthModule {}
