import * as multerS3 from 'multer-s3';
import * as AWS from 'aws-sdk';
import { awsConfig } from 'src/config/awsConfig';
import { s3FileName } from 'src/utils/s3FileName';
import * as dotenv from 'dotenv';
dotenv.config();

const sellerStorage = multerS3({
    s3: new AWS.S3(awsConfig),
    bucket: process.env.AWS_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    metadata: (_, file, cb) => {
        cb(null, { fileName: file.fieldname });
    },
    key: (_, file, cb) => {
        let filename = s3FileName(file);
        cb(null, `images/seller/info/${filename}`);
    },
});

//모두 이걸로 교체
const fileStorage = multerS3({
    s3: new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
        region: process.env.AWS_REGION,
    }),
    bucket: process.env.AWS_BUCKET,
    contentType: (_, file, cb) => {
        let contentType = '';
        if (file.fieldname == 'sale') {
            contentType = 'application/octet-stream';
        } else {
            contentType = 'image/png';
        }
        cb(null, contentType);
    },
    acl: 'private',
    metadata: (_, file, cb) => {
        cb(null, { fileName: file.fieldname });
    },
    key: (_, file, cb) => {
        let filename = s3FileName(file);
        let location = '';
        if (file.fieldname == 'profile') {
            location = `public/seller/info/${filename}`;
        } else if (
            file.fieldname == 'certificate' ||
            file.fieldname == 'family' ||
            file.fieldname == 'legalRepresent' ||
            file.fieldname == 'legalRepresentCertificate'
        ) {
            location = `private/seller/info/${filename}`;
        } else if (file.fieldname == 'thumb' || file.fieldname == 'thumbGlobal') {
            location = `public/product/${filename}`;
        } else if (file.fieldname == 'sale') {
            location = `private/product/${filename}`;
        } else if (file.fieldname == 'noticeImage') {
            location = `public/notice/${filename}`;
        } else if (file.fieldname == 'sellerFile') {
            location = `private/seller/file/${filename}`;
        } else if (file.fieldname == 'reviewImage') {
            location = `public/review/file/${filename}`;
        }
        cb(null, location);
    },
});

export const fileUpload = {
    storage: fileStorage,
    limits: { fieldSize: 2 * 1024 * 1024 * 1024, fileSize: 2 * 1024 * 1024 * 1024 },
};

export const sellerUpload = { storage: sellerStorage };

export const s3Delete = (param) =>
    new AWS.S3(awsConfig).deleteObject(param, (err, data) => {
        if (err) {
            console.log('S3 - Delete Fail' + err);
        } else {
            console.log('S3 - Delete Success');
        }
    });
