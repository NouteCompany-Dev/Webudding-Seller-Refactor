import { Body, Controller, Get, Logger, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResultFailDto } from 'src/common/dto/Result.dto';
import { CreateCategoryReqDto } from './dto/req/CreateCategoryReq.dto';
import { Response } from 'express';
import { CategoriesService } from './Categories.service';
import { CategoryListFailDto, CategoryListSuccessDto } from './dto/res/CategoryRes.dto';

@ApiTags('카테고리')
@Controller('category')
export class CategoriesController {
    constructor(private categoriesService: CategoriesService) {}

    // @Post()
    // async create(@Body() data: CreateCategoryReqDto, @Res() res: Response) {
    //     try {
    //         const result = await this.categoriesService.create(data)
    //         res.status(200).json(result)
    //     } catch (err) {
    //         console.log(err)
    //         res.status(400).json({ "resultCode": -1, "data": null })
    //     }
    // }

    // @Get()
    // @ApiOperation({ summary: '카테고리 리스트' })
    // @ApiResponse({ status: 200, type: CategoryListSuccessDto, description: '카테고리 리스트 성공' })
    // @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    // @ApiResponse({ status: 401, type: CategoryListFailDto, description: '카테고리 리스트 실패' })
    // async list(@Res() res: Response) {
    //     try {
    //         const result = await this.categoriesService.list()
    //         res.status(200).json(result)
    //     } catch (err) {
    //         console.log(err)
    //         res.status(400).json({ "resultCode": -1, "data": null })
    //     }
    // }
}
