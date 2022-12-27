import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entity/Category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryRepository {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) {}

    async create() {
        return this.categoryRepository.create();
    }

    async save(body: Category) {
        return await this.categoryRepository.save(body);
    }

    async getCategory(body: any): Promise<any> {
        return await this.categoryRepository
            .createQueryBuilder('c')
            .where('c.id = :body', { body: body })
            .getOne();
    }

    async getCategoryByName(name: string): Promise<any> {
        return await this.categoryRepository
            .createQueryBuilder('c')
            .leftJoinAndSelect('c.parent', 'p')
            .where('c.categoryName = :name', { name })
            .getOne();
    }

    async getFirstCategoryList(): Promise<any> {
        return await this.categoryRepository.createQueryBuilder('c').where('c.parentId IS NULL').getMany();
    }
}
