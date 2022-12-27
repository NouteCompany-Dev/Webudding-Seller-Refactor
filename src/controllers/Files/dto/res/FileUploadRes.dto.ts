import { ApiProperty } from '@nestjs/swagger';

export class FileUploadObj {
    @ApiProperty({ description: '이미지 키값' })
    originalName: string;

    @ApiProperty({ description: '이미지 경로' })
    path: string;
}

export class FileUploadSuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: 1;

    @ApiProperty({ type: FileUploadObj })
    data: FileUploadObj;
}
