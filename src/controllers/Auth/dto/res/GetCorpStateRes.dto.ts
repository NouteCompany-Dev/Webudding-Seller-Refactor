import { ApiProperty } from '@nestjs/swagger';

export class CorpStateResDto {
    @ApiProperty({ default: 6051 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
