import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SellerMinorFile } from 'src/entity/SellerMinorFile.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SellerMinorFileRepository {
    constructor(
        @InjectRepository(SellerMinorFile)
        private sellerMinorFileRepository: Repository<SellerMinorFile>,
    ) {}

    async create() {
        return this.sellerMinorFileRepository.create();
    }

    async save(body: SellerMinorFile) {
        return this.sellerMinorFileRepository.save(body);
    }
}
