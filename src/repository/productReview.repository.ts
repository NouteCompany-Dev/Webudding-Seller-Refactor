import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ProductReview } from 'src/entity/ProductReview.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductReviewRepository {
    constructor(
        @InjectRepository(ProductReview)
        private productReivewRepository: Repository<ProductReview>,
    ) {}

    async create() {
        return this.productReivewRepository.create();
    }

    async save(body: ProductReview) {
        return await this.productReivewRepository.save(body);
    }

    async getReviewList(body: any): Promise<any> {
        return await this.productReivewRepository
            .createQueryBuilder('pr')
            .leftJoinAndSelect('pr.product', 'p')
            .leftJoinAndSelect('p.seller', 's')
            .where('s.id = :body', { body: body })
            .getMany();
    }

    async getReviewCount(body: any): Promise<any> {
        return await this.productReivewRepository
            .createQueryBuilder('pr')
            .where('pr.productId = :body', { body: body })
            .getCount();
    }

    async getProductReview(body: any): Promise<any> {
        return await this.productReivewRepository
            .createQueryBuilder('pr')
            .where('pr.id = :body', { body: body })
            .getOne();
    }

    async getProductReviewList(req: any, body: any): Promise<any> {
        const { page, prodName, search } = body;
        const sellerId = req.seller.sellerId;

        const query = this.productReivewRepository
            .createQueryBuilder('pr')
            .leftJoinAndSelect('pr.product', 'prp')
            .leftJoinAndSelect('prp.thumb', 'pt')
            .leftJoinAndSelect('pr.user', 'pru')
            .leftJoinAndSelect('pr.reviewImage', 'pri')
            .where('prp.sellerId = :sellerId', { sellerId })
            .orderBy('pr.createdAt', 'DESC')
            .skip(page * 4)
            .take(4);

        if (search) {
            query.andWhere('pr.content like :search', { search: `%${search}%` });
        }

        if (prodName) {
            query.andWhere('prp.productName like :prodName', { prodName: `%${prodName}%` });
        }

        return await query.getManyAndCount();
    }
}
