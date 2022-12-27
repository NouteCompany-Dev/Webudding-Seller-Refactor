import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductThumb } from 'src/entity/ProductThumb.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductThumbRepository {
    constructor(
        @InjectRepository(ProductThumb)
        private productThumbRepository: Repository<ProductThumb>,
    ) {}

    async create() {
        return this.productThumbRepository.create();
    }

    async save(body: ProductThumb) {
        return await this.productThumbRepository.save(body);
    }

    async getProductThumb(body: any): Promise<any> {
        return await this.productThumbRepository
            .createQueryBuilder('pt')
            .where('pt.id = :body', { body: body })
            .getOne();
    }

    async getThumbListByProductId(body: any): Promise<any> {
        return await this.productThumbRepository
            .createQueryBuilder('pt')
            .where('pt.productId = :body', { body: body })
            .andWhere('pt.isGlobal = 0')
            .getMany();
    }

    async getGlobalThumbListByProductId(body: any): Promise<any> {
        return await this.productThumbRepository
            .createQueryBuilder('pt')
            .where('pt.productId = :body', { body: body })
            .andWhere('pt.isGlobal = 1')
            .getMany();
    }

    async getThumbListByThumbPath(body: any): Promise<any> {
        return await this.productThumbRepository
            .createQueryBuilder('pt')
            .where('pt.thumbPath = :thumbPath', { thumbPath: body })
            .getMany();
    }

    async getProductTitleThumb(body: any): Promise<any> {
        return await this.productThumbRepository
            .createQueryBuilder('pt')
            .where('pt.productId = :body', { body: body })
            .andWhere('pt.title = 1')
            .andWhere('pt.isGlobal = 0')
            .getOne();
    }

    async getManyNotGlobalThumbs(body: any): Promise<any> {
        return await this.productThumbRepository
            .createQueryBuilder('pt')
            .where('pt.productId = :productId', { productId: body })
            .andWhere('pt.isGlobal = 0')
            .getMany();
    }

    async getManyGlobalThumbS(body: any): Promise<any> {
        return await this.productThumbRepository
            .createQueryBuilder('pt')
            .where('pt.productId = :productId', { productId: body })
            .andWhere('pt.isGlobal = 1')
            .getMany();
    }

    async getManyProductThumbs(body: any): Promise<any> {
        return await this.productThumbRepository
            .createQueryBuilder('pt')
            .where('pt.productId = :body', { body: body })
            .getMany();
    }

    async deleteProductThumb(body: any): Promise<any> {
        return await this.productThumbRepository
            .createQueryBuilder('pt')
            .delete()
            .from(ProductThumb)
            .where('id = :idx', { idx: body })
            .execute();
    }
}
