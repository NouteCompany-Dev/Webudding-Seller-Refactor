import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HashTag } from 'src/entity/HashTag.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HashtagRepository {
    constructor(
        @InjectRepository(HashTag)
        private hashtagRepository: Repository<HashTag>,
    ) {}

    async create() {
        return this.hashtagRepository.create();
    }

    async save(body: HashTag) {
        return await this.hashtagRepository.save(body);
    }

    async getManyHashTags(body: any): Promise<any> {
        return await this.hashtagRepository
            .createQueryBuilder('ht')
            .where('ht.productId = :body', { body: body })
            .getMany();
    }

    async deleteHashtag(body: any) {
        return await this.hashtagRepository
            .createQueryBuilder('ht')
            .delete()
            .from(HashTag)
            .where('productId = :productId', { productId: body })
            .execute();
    }
}
