import { IndexModule } from './controllers/index.module';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtMiddleWare } from './middlewares/jwt.middleware';
import { CustomLogger } from './logger/ormLogger';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRoot({
            type: 'mysql',
            port: 3306,
            host: process.env.DB_HOST,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: JSON.parse(process.env.DB_SYNC),
            logging: true,
            logger: new CustomLogger(),
        }),
        IndexModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(JwtMiddleWare).forRoutes(
            // 인증
            { path: '/auth/confirm', method: RequestMethod.ALL },
            { path: '/auth/addInfo', method: RequestMethod.ALL },
            { path: '/auth/popbill/info', method: RequestMethod.ALL },
            // 셀러
            { path: '/sellers', method: RequestMethod.ALL },
            { path: '/sellers/info', method: RequestMethod.ALL },
            { path: '/sellers/en/info', method: RequestMethod.ALL },
            { path: '/sellers/brand', method: RequestMethod.PATCH },
            { path: '/sellers/admin', method: RequestMethod.PATCH },
            { path: '/sellers/en/admin', method: RequestMethod.PATCH },
            { path: '/sellers/ledger', method: RequestMethod.PATCH },
            { path: '/sellers/en/ledger', method: RequestMethod.PATCH },
            { path: '/sellers/updateToCorp', method: RequestMethod.POST },
            { path: '/sellers/updateToPersonal', method: RequestMethod.POST },
            { path: '/sellers/check/resident', method: RequestMethod.POST },
            // 상품
            { path: '/product', method: RequestMethod.ALL },
            { path: '/product/test', method: RequestMethod.ALL },
            { path: '/product/en', method: RequestMethod.ALL },
            { path: '/product/:id', method: RequestMethod.ALL },
            { path: '/product/:id', method: RequestMethod.PATCH },
            { path: '/product/en/:id', method: RequestMethod.PATCH },
            { path: '/product/price', method: RequestMethod.GET },
            { path: '/product/temp', method: RequestMethod.PATCH },
            { path: '/product/template', method: RequestMethod.POST },
            { path: '/product/check/sku', method: RequestMethod.POST },
            // 판매
            { path: '/sales', method: RequestMethod.ALL },
            { path: '/sales/:id', method: RequestMethod.ALL },
            { path: '/sales/excel', method: RequestMethod.ALL },
            // 대시보드
            { path: '/dashboards', method: RequestMethod.ALL },
            // 리뷰
            { path: '/products-reviews', method: RequestMethod.ALL },
            { path: '/products-reviews/create', method: RequestMethod.ALL },
            { path: '/products-reviews/:id', method: RequestMethod.PATCH },
            { path: '/products-reviews/delete/:id', method: RequestMethod.PATCH },
            // 댓글
            { path: '/products-comments/:id', method: RequestMethod.PATCH },
            // 공지사항
            { path: '/notices', method: RequestMethod.ALL },
            { path: '/notices/list', method: RequestMethod.ALL },
            { path: '/notices/:id', method: RequestMethod.ALL },
            // 정산
            { path: '/ledgers', method: RequestMethod.ALL },
            { path: '/ledgers/excel', method: RequestMethod.GET },
        );
    }
}
