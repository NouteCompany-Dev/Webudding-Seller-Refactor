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

    async getProductList(req: any, body: any): Promise<any> {
        const { categoryId, search, searchOption } = body;
        const sellerId = req.seller.sellerId;
        let pData = [];
        let prodData = [];
        let items = [];
        let items2 = [];

        for (let i = 0; i < categoryId.length; i++) {
            let idx = categoryId[i];
            let prodQuery = this.productRepository
                .createQueryBuilder('p')
                .leftJoinAndSelect('p.category', 'pc')
                .leftJoinAndSelect('p.thumb', 'pt')
                .where('p.categoryId = :idx', { idx: idx })
                .andWhere('p.sellerId = :sellerId', { sellerId: sellerId });

            if (search) {
                if (searchOption == 'name') {
                    prodQuery.andWhere('p.productName like :search', { search: `%${search}%` });
                } else if (searchOption == 'sku') {
                    prodQuery.andWhere('p.skuId like :search', { search: `%${search}%` });
                }
            }

            let prodResult = await prodQuery.getMany();

            for (let j = 0; j < prodResult.length; j++) {
                prodData.push(prodResult[j]);
            }

            let pQuery = this.productRepository
                .createQueryBuilder('p')
                .leftJoinAndSelect('p.category', 'pc')
                .leftJoinAndSelect('p.thumb', 'pt')
                .leftJoinAndSelect('pc.parent', 'pcp')
                .andWhere('pcp.id = :idx', { idx })
                .andWhere('p.sellerId = :sellerId', { sellerId });

            if (search) {
                if (searchOption == 'name') {
                    pQuery.andWhere('p.productName like :search', { search: `%${search}%` });
                } else if (searchOption == 'sku') {
                    pQuery.andWhere('p.skuId like :search', { search: `%${search}%` });
                }
            }

            let pResult = await pQuery.getMany();

            for (let j = 0; j < pResult.length; j++) {
                pData.push(pResult[j]);
            }
        }

        const data = {
            pData: pData,
            prodData: prodData,
            items: items,
            items2: items2,
        };

        return data;
    }
}
