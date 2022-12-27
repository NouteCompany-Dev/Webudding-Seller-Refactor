import { ApiProperty } from '@nestjs/swagger';

export class InfoProductFailDto {
    @ApiProperty({ default: 6002 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
