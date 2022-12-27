import { ApiProperty } from '@nestjs/swagger';

export class EmailDuplicateDto {
    @ApiProperty({ default: 6035 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class EmailDuplicateFailDto {
    @ApiProperty({ default: 6036 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
