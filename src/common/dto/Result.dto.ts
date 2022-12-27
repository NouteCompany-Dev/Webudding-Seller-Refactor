import { ApiProperty } from '@nestjs/swagger';

export class ResultSuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: number;
    @ApiProperty({ default: null })
    data: any;
}

export class ResultFailDto {
    @ApiProperty({ default: -1 })
    resultCode: number;
    @ApiProperty({ default: null })
    data: any;
}
