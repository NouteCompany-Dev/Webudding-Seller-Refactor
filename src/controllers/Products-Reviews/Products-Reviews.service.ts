import { cloudfrontPath } from 'src/modules/cloudfront';
import { Injectable } from '@nestjs/common';
import {
    CreateProductReviewsReqDto,
    CreateProductsReviewsReplyReqDto,
} from './dto/req/CreateProductsReviews.req.dto';
import { ProductReviewListReqDto } from './dto/req/ProductsReviewsList.req.dto';
import { maskingName } from 'src/lib/code';
import { ProductReviewRepository } from 'src/repository/productReview.repository';
import { ProductReviewImageRepository } from 'src/repository/productReviewImage.repository';

@Injectable()
export class ProductsReviewsService {
    constructor(
        private productReviewRepository: ProductReviewRepository,
        private productReviewImageRepository: ProductReviewImageRepository,
    ) {}

    async list(req: any, body: ProductReviewListReqDto): Promise<any> {
        try {
            const [row, count] = await this.productReviewRepository.getProductReviewList(req, body);
            let items = [];

            for (let i = 0; i < row.length; i++) {
                let images = [];
                row[i].reviewImage.forEach((o) => {
                    images.push(o.imagePath);
                });
                let productId = row[i].product.id;
                let productName = row[i].product.productName;
                let username = row[i].user.name;
                username = maskingName(username);
                let rating = row[i].rating;
                let content = row[i].content;
                let createdAt = row[i].createdAt;
                let reply = row[i].reply;
                let replyCreatedAt = row[i].updatedAt;
                if (reply === null || reply === '') {
                    replyCreatedAt = null;
                }
                items[i] = {
                    reviewId: row[i].id,
                    productId: productId,
                    productName: productName,
                    image: images,
                    username: username,
                    rating: rating,
                    content: content,
                    reply: {
                        content: reply,
                        createdAt: replyCreatedAt,
                    },
                    createdAt: createdAt,
                };
            }
            return { status: 200, resultCode: 1, data: { items, count } };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6601, data: null };
        }
    }

    async createReply(body: CreateProductsReviewsReplyReqDto, id: number): Promise<any> {
        try {
            let data = null;
            const productReview = await this.productReviewRepository.getProductReview(id);
            const { content } = body;
            productReview.reply = content;
            await this.productReviewRepository.save(productReview);
            data = {
                reply: content,
            };
            return { status: 200, resultCode: 1, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6611, data: null };
        }
    }

    async deleteReply(id: number): Promise<any> {
        try {
            const productReview = await this.productReviewRepository.getProductReview(id);
            productReview.reply = null;
            await this.productReviewRepository.save(productReview);
            return { status: 200, resultCode: 1, data: null };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6611, data: null };
        }
    }

    async createReview(files: File[], req: any, body: CreateProductReviewsReqDto): Promise<any> {
        try {
            const { type, content, rating } = body;
            const review = await this.productReviewRepository.create();
            review.type = type;
            review.content = content;
            review.rating = rating;
            await this.productReviewRepository.save(review);
            if (files['reviewImage']) {
                files['reviewImage'].forEach(async (o) => {
                    let productReviewImage = await this.productReviewImageRepository.create();
                    productReviewImage.originalImageName = o.key;
                    productReviewImage.imagePath = cloudfrontPath(o.key);
                    productReviewImage.review = review;
                    await this.productReviewImageRepository.save(productReviewImage);
                });
            }
        } catch (err) {
            console.log(err);
            return { resultCode: -1, data: null };
        }
    }
}
