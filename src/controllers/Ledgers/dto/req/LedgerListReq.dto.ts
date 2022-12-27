import { ApiProperty } from '@nestjs/swagger';

export class LedgerListReqDto {
    @ApiProperty()
    page: number;
}
