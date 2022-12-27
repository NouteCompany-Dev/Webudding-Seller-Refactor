import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

export const jwtCreate = (sellerId: number) => {
    const sellerJwtSecret = process.env.SELLER_JWT_SECRET_KEY;
    const accessToken = jwt.sign({ sellerId }, sellerJwtSecret, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ sellerId }, sellerJwtSecret, { expiresIn: '1d' });
    return { accessToken, refreshToken };
};
