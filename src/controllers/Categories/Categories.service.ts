import { CategoryRepository } from 'src/repository/Category.repository';
import { CreateCategoryReqDto } from './dto/req/CreateCategoryReq.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoriesService {
    constructor(private categoryRepository: CategoryRepository) {}

    // async create(body: CreateCategoryReqDto) {
    //     try {
    //         const { categoryName, parentId } = body;
    //         let data = null;
    //         const category = await this.categoryRepository.create();
    //         category.categoryName = categoryName;
    //         if (parentId) {
    //             category.parent = await this.categoryRepository.findOne(parentId)
    //         }
    //         await this.categoryRepository.save(category)
    //         return { "resultCode": 1, "data": data };
    //     } catch (err) {
    //         console.log(err);
    //         return { "resultCode": -1, "data": null };
    //     }
    // }

    // async list(): Promise<any> {
    //     try {
    //         const category = await this.categoryRepository.findTrees();
    //         category.forEach(o => {
    //             o.children.forEach(e => {
    //                 delete e.children
    //             })
    //         })
    //         return { "status": 200, "resultCode": 1, "data": category }
    //     } catch (err) {
    //         console.log(err)
    //         return { "status": 401, "resultCode": 6301, "data": null }
    //     }
    // }
}
