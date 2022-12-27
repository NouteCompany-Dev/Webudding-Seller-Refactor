import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ResultFailDto } from 'src/common/dto/Result.dto';
import { FileUploadReqDto } from './dto/req/FileUploadReq.dto';
import { FileUploadSuccessDto } from './dto/res/FileUploadRes.dto';
import { FilesService } from './Files.service';

@ApiTags('파일 업로드')
@Controller('files')
export class FilesController {
    constructor(private filesService: FilesService) {}

    @Post('upload')
    @ApiOperation({ summary: '에디터 이미지 업로드' })
    @ApiResponse({ status: 200, type: FileUploadSuccessDto, description: '요청 성공' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    async editorTest(@Body() data: FileUploadReqDto, @Res() res: Response): Promise<void> {
        try {
            const result = await this.filesService.uploadTest(data);
            res.status(200).json({ resultCode: 1, data: null });
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }
}
