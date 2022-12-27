import { S3 } from 'aws-sdk';
import * as dotenv from 'dotenv';
import { Buffer } from 'buffer';
import { cloudfrontPath } from './cloudfront';
dotenv.config();

const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});

export const editorS3 = async (htmlText) => {
    let items = [];
    let result = await replaceAsync(htmlText, /src=\"data:([^\"]+)\"/gi, async (matches) => {
        let splitted = matches.split(';');
        let contentType = splitted[0];
        let encContent = splitted[1];
        let imgBase64 = encContent.substr(6);
        contentType = contentType.split(':')[1];

        let imgExt = '';
        imgExt = contentType.split('/')[1];

        let base64Data = encContent.replace('base64,', '');
        let file = Buffer.from(base64Data, 'base64');
        let imgFilename =
            imgBase64.substr(1, 8).replace(/[^\w\s]/gi, '') +
            Date.now() +
            String(Math.random() * 900000000).replace('.', ''); // Generate a unique filename

        const params = {
            Bucket: process.env.AWS_BUCKET,
            Key: `public/product/${imgFilename}.${imgExt}`,
            Body: file,
            ACL: 'private',
            ContentEncoding: 'base64',
            ContentType: contentType,
        };
        let result = await s3.upload(params).promise();
        let path = cloudfrontPath(result.Key);
        let src = 'src="' + path + '"';
        items.push({
            originalName: result.Key,
            path: path,
        });
        return src;
    });
    return { result, items };
};

export const replaceAsync = async (str, regex, asyncFn) => {
    const promises = [];
    str.replace(regex, (match, ...args) => {
        const promise = asyncFn(match, ...args);
        promises.push(promise);
    });
    const data = await Promise.all(promises);
    return str.replace(regex, () => data.shift());
};

export const imageUpload = { storage: editorS3 };
