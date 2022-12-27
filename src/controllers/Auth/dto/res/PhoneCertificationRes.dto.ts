import { ApiProperty } from '@nestjs/swagger';

export class GetDanalTokenFailDto {
    @ApiProperty({ default: 6041 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class GetDanalCertificationFailDto {
    @ApiProperty({ default: 6042 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
