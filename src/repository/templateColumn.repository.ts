import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TemplateColumn } from 'src/entity/TemplateColumn.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TemplateColumnRepository {
    constructor(
        @InjectRepository(TemplateColumn)
        private templateColumnRepository: Repository<TemplateColumn>,
    ) {}

    async save(body: TemplateColumn) {
        return await this.templateColumnRepository.save(body);
    }

    async getTemplateColumn(body: any): Promise<any> {
        return await this.templateColumnRepository
            .createQueryBuilder('tc')
            .leftJoinAndSelect('tc.product', 'p')
            .where('tc.id = :body', { body: body })
            .getOne();
    }

    async getTemplateList(body: any): Promise<any> {
        return await this.templateColumnRepository
            .createQueryBuilder('tc')
            .leftJoinAndSelect('tc.product', 'p')
            .leftJoinAndSelect('tc.row', 'r')
            .where('p.id = :body', { body: body })
            .getMany();
    }
}
