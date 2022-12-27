import * as dotenv from 'dotenv';
dotenv.config();

export const cloudfrontPath = (key) => {
    let path = process.env.AWS_CLOUDFRONT_END_POINT + key;
    return path;
};
