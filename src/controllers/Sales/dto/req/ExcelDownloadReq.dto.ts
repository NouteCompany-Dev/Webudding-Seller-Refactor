import { ApiProperty } from '@nestjs/swagger';

export class ExcelDownloadReqDto {
    @ApiProperty()
    startDate: string;

    @ApiProperty()
    endDate: string;
}
