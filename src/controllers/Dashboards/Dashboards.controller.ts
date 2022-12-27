import { DashboardsInfoSuccessDto, DashboardsInfoFailDto } from './dto/res/Dashboards.res.dto';
import { DashboardsService } from './Dashboards.service';
import { Controller, Get, Res, Logger, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResultFailDto } from 'src/common/dto/Result.dto';
import { Request, Response } from 'express';

@ApiTags('대시보드')
@Controller('dashboards')
export class DashboardsController {
    constructor(private dashboardsService: DashboardsService) {}

    @Get()
    @ApiBearerAuth('seller-auth')
    @ApiOperation({ summary: '대시보드 리스트 조회' })
    @ApiResponse({ status: 200, type: DashboardsInfoSuccessDto, description: '대시보드 리스트 조회 성공' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청값 에러' })
    @ApiResponse({ status: 401, type: DashboardsInfoFailDto, description: '대시보드 리스트 조회 실패' })
    async findAll(@Req() req: Request, @Res() res: Response) {
        Logger.log('API - Seller Dashboard Info');
        try {
            const result = await this.dashboardsService.list(req);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }
}
