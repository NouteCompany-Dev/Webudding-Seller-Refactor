import {
    Controller,
    Get,
    ParseIntPipe,
    Req,
    Param,
    Res,
    Body,
    Post,
    Logger,
    UseInterceptors,
    UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ResultFailDto } from 'src/common/dto/Result.dto';
import { fileUpload } from 'src/middlewares/multer.middleware';
import { CreateNoticeReqDto } from './dto/req/CreateNoticeReq.dto';
import { NoticeListReqDto } from './dto/req/NoticesList.req.dto';
import {
    NoticeDetailFailDto,
    NoticeDetailResDto,
    NoticeDetailSuccessDto,
    NoticeListFailDto,
    NoticeListSuccessDto,
} from './dto/res/NoticesList.res.dto';
import { NoticesService } from './Notices.service';

@ApiTags('셀러 공지사항')
@Controller('notices')
export class NoticesController {
    constructor(private noticesService: NoticesService) {}

    @Post()
    @ApiBearerAuth('seller-auth')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'noticeImage' }], fileUpload))
    @ApiConsumes('multipart/form-data')
    async create(
        @UploadedFiles() files: File[],
        @Req() req: Request,
        @Body() data: CreateNoticeReqDto,
        @Res() res: Response,
    ): Promise<any> {
        try {
            const result = await this.noticesService.create(files, req, data);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('list')
    @ApiBearerAuth('seller-auth')
    @ApiOperation({ summary: '공지사항 리스트 조회' })
    @ApiResponse({ status: 200, type: NoticeListSuccessDto, description: '공지사항 리스트 조회 성공' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: NoticeListFailDto, description: '공지사항 리스트 조회 실패' })
    async list(@Req() req: Request, @Body() body: NoticeListReqDto, @Res() res: Response) {
        try {
            const result = await this.noticesService.list(req, body);
            res.status(200).json(result);
        } catch (err) {
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Get(':id')
    @ApiBearerAuth('seller-auth')
    @ApiOperation({ summary: '공지사항 게시글 정보 조회' })
    @ApiResponse({ status: 200, type: NoticeDetailSuccessDto, description: '공지사항 리스트 조회 성공' })
    @ApiResponse({ status: 201, type: NoticeDetailResDto, description: '공지사항 리스트 조회 성공' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: NoticeDetailFailDto, description: '공지사항 리스트 조회 실패' })
    async detail(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        Logger.log('API - Seller Notice Detail');
        try {
            const result = await this.noticesService.detail(req, id);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }
}
