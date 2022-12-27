import { ApiProperty } from '@nestjs/swagger';

export class DanalReqDto {
    @ApiProperty()
    impUid: string;
}

export class BaroBillReqDto {
    @ApiProperty()
    corNum: string;
}

export class PopbillReqDto {
    @ApiProperty()
    bankCode: string;

    @ApiProperty()
    accountNumber: string;
}
