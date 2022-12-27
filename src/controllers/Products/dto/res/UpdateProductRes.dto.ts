import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductFailDto {
    @ApiProperty({ default: 6231 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class UpdateEnglishProductFailDto {
    @ApiProperty({ default: 6232 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
