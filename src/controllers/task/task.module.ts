import { SellerLedger } from 'src/entity/SellerLedger.entity';
import { OrderProduct } from './../../entity/OrderProduct.entity';
import { Seller } from './../../entity/Seller.entity';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskService } from './task.service';

@Module({
    imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([Seller, OrderProduct, SellerLedger])],
    providers: [TaskService],
})
export class TaskModule {}
