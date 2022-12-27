import { Injectable } from '@nestjs/common';
import { editorS3 } from 'src/modules/editor-html';
import { FileUploadReqDto } from './dto/req/FileUploadReq.dto';

@Injectable()
export class FilesService {
    async uploadTest(body: FileUploadReqDto): Promise<any> {
        try {
            const { content } = body;
            const detail = await editorS3(content);
            console.log(detail);
            //DB저장
        } catch (err) {
            console.log(err);
            return { resultCode: -99, data: null };
        }
    }
}
