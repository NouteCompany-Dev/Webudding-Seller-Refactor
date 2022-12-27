import { SellerRepository } from 'src/repository/Seller.repository';
import { Seller } from 'src/entity/Seller.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { LedgersController } from './Ledgers.controller';
import { LedgersService } from './Ledgers.service';
import { SellerLedger } from 'src/entity/SellerLedger.entity';
import { SellerLedgerRepository } from 'src/repository/SellerLedger.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Seller, SellerLedger])],
    controllers: [LedgersController],
    providers: [LedgersService, SellerRepository, SellerLedgerRepository],
})
export class LedgersModule {}
