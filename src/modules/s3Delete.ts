import { s3Delete } from 'src/middlewares/multer.middleware';

export const imgDelete = async (fileKey) => {
    try {
        let key = fileKey;
        let param = {
            Bucket: process.env.AWS_BUCKET,
            Key: key,
        };
        s3Delete(param);
    } catch (err) {
        console.log(err);
    }
};
