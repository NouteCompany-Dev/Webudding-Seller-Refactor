import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtMiddleWare implements NestMiddleware<Request, Response> {
    async use(req: Request, res: Response, next: NextFunction) {
        try {
            let accessToken = req.headers['seller-auth'];
            let jwtSecret = process.env.SELLER_JWT_SECRET_KEY;
            jwt.verify(accessToken.toString(), jwtSecret, (err, seller) => {
                if (err) {
                    Logger.log('MIDDLEWARE - TOKEN_EXPIRE');
                    console.log(err);
                    res.status(403).json({ resultCode: -30, data: null });
                } else {
                    req['seller'] = seller;
                    next();
                }
            });
        } catch (err) {
            Logger.log('MIDDLEWARE - SELLER TOKEN VERIFIED FAIL');
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }
}
