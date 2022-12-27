import { Module } from '@nestjs/common';
import { CategoriesService } from './Categories.service';
import { CategoriesController } from './Categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/entity/Category.entity';
import { CategoryRepository } from 'src/repository/Category.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Category])],
    providers: [CategoriesService, CategoryRepository],
    controllers: [CategoriesController],
})
export class CategoriesModule {}
