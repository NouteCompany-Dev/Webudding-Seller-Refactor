import { ApiProperty } from '@nestjs/swagger';

export class LedgerListResDto {
    @ApiProperty({ default: 6501 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
