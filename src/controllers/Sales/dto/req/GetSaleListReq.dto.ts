import { ApiProperty } from '@nestjs/swagger';

export class GetSaleListReqDto {
    @ApiProperty()
    page: number;

    @ApiProperty()
    startDate: string;

    @ApiProperty()
    endDate: string;
}
