import { ApiProperty } from '@nestjs/swagger';

export class FileUploadReqDto {
    @ApiProperty()
    content: string;
}
