import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { SellerFile } from 'src/entity/SellerFiles.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SellerFileRepository {
    constructor(
        @InjectRepository(SellerFile)
        private sellerFileRepository: Repository<SellerFile>,
    ) {}

    async create() {
        return this.sellerFileRepository.create();
    }

    async save(body: SellerFile) {
        return this.sellerFileRepository.save(body);
    }
}
