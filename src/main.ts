import { IndexModule } from './controllers/index.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { utilities, WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import * as winston from 'winston';
import { json, urlencoded } from 'express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        //로깅 세팅
        logger: WinstonModule.createLogger({
            transports: [
                new winston.transports.Console({
                    level: 'info',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        utilities.format.nestLike('Webudding Seller', {
                            prettyPrint: true,
                        }),
                    ),
                }),
            ],
        }),
    });

    //middleware
    app.use(json({ limit: '2000mb' }));
    app.use(urlencoded({ limit: '2000mb', extended: false }));

    //Swagger SetUp
    const config = new DocumentBuilder()
        .setTitle('Webudding Seller Admin API')
        .setDescription('Seller Admin API')
        .setVersion('1.0.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                name: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
            },
            'seller-auth',
        )
        .build();
    const document = SwaggerModule.createDocument(app, config, {
        include: [IndexModule],
        deepScanRoutes: true,
        ignoreGlobalPrefix: true,
    });
    SwaggerModule.setup('/swagger', app, document);

    const allowList = [
        'http://localhost:3000',
        'https://d1co2s160boq3z.cloudfront.net',
        'https://test-seller.noutecompany.com',
        'https://seller.webudding.com',
        'http://seller.webudding.com',
        'http://10.20.170.120:3000',
        'seller.webudding.com',
        'https://vnvnvbahsdfi-seller.webudding.com',
    ];
    const corsOptionsDelegate = (req, callback) => {
        let corsOptions;
        if (allowList.indexOf(req.header('Origin')) !== -1) {
            corsOptions = { origin: true, credentials: true };
        } else {
            corsOptions = { origin: false, credentials: false };
        }
        callback(null, corsOptions);
    };
    app.enableCors(corsOptionsDelegate);
    //서버 포트
    await app.listen(4000, () => {
        Logger.log('SELLER SERVER - 4000PORT CONNECTED!');
    });
}
bootstrap();
