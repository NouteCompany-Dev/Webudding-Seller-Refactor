import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entity/Product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductRepository {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) {}

    query() {
        return this.productRepository.createQueryBuilder('p');
    }

    async create() {
        return this.productRepository.create();
    }

    async save(body: Product) {
        return await this.productRepository.save(body);
    }

    async getProduct(body: any): Promise<any> {
        return await this.productRepository
            .createQueryBuilder('p')
            .where('p.id = :body', { body: body })
            .getOne();
    }

    async getAllProduct(): Promise<any> {
        return await this.productRepository.createQueryBuilder('p').getMany();
    }

    async getMaxProduct(): Promise<any> {
        return await this.productRepository.createQueryBuilder('p').select('MAX(p.id)', 'max').getRawOne();
    }

    async getProductByProductIdAndSellerId(body: any): Promise<any> {
        const { productId, sellerId } = body;
        return await this.productRepository
            .createQueryBuilder('p')
            .where('p.id = :productId', { productId: productId })
            .andWhere('p.sellerId = :sellerId', { sellerId: sellerId })
            .getOne();
    }

    async getProductAndCategory(body: any): Promise<any> {
        return await this.productRepository
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.category', 'c')
            .where('p.id = :body', { body: body })
            .getOne();
    }

    async getProductListAndCategory(body: any): Promise<any> {
        return await this.productRepository
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.category', 'c')
            .where('p.sellerId = :body', { body: body })
            .getMany();
    }

    async getProductListAndCountAndCategory(body: any): Promise<any> {
        return await this.productRepository
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.category', 'c')
            .where('p.sellerId = :body', { body: body })
            .getManyAndCount();
    }

    async getProductCountAndCategory(body: any): Promise<any> {
        const { categoryId, sellerId } = body;
        return await this.productRepository
            .createQueryBuilder('p')
            .where('p.categoryId = :categoryId', { categoryId: categoryId })
            .andWhere('p.sellerId = :sellerId', { sellerId: sellerId })
            .getCount();
    }

    async getProductCountByCategoryParent(body: any): Promise<any> {
        const { categoryId, sellerId } = body;
        return await this.productRepository
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.category', 'pc')
            .leftJoinAndSelect('pc.parent', 'pcp')
            .where('pcp.id = :categoryId', { categoryId: categoryId })
            .andWhere('p.sellerId = :sellerId', { sellerId: sellerId })
            .getCount();
    }

    async getProductAndSku(body: any): Promise<any> {
        return await this.productRepository
            .createQueryBuilder('p')
            .where('p.skuId != ""')
            .andWhere('p.sellerId = :body', { body: body })
            .getMany();
    }

    async changeToFree(req: any): Promise<any> {
        return await this.productRepository.createQueryBuilder('p').where('p.price = 0').getCount();
    }
}
