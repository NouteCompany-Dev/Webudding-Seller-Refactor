import { ApiProperty } from '@nestjs/swagger';

export class CheckAccountResDto {
    @ApiProperty({ default: 6061 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class GetAccountFailDto {
    @ApiProperty({ default: 6062 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
