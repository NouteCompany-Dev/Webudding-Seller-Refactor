import { ProductsCommentsModule } from './Products-Comments/Products-Comments.module';
import { CategoriesModule } from './Categories/Categories.module';
import { DashboardsModule } from './Dashboards/Dashboards.module';
import { Module } from '@nestjs/common';
import { AuthModule } from './Auth/Auth.module';
import { ProductsModule } from './Products/Products.module';
import { SellersModule } from './Sellers/Sellers.module';
import { FilesModule } from './Files/Files.module';
import { SalesModule } from './Sales/Sales.module';
import { ProductsReviewsModule } from './Products-Reviews/Products-Reviews.module';
import { NoticesModule } from './Notices/Notices.module';
import { LedgersModule } from './Ledgers/Ledgers.module';
import { TaskModule } from './task/task.module';

@Module({
    imports: [
        AuthModule,
        SellersModule,
        SalesModule,
        ProductsModule,
        DashboardsModule,
        CategoriesModule,
        FilesModule,
        ProductsReviewsModule,
        ProductsCommentsModule,
        NoticesModule,
        LedgersModule,
        TaskModule,
    ],
})
export class IndexModule {}
