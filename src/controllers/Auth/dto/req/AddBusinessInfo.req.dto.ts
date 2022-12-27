import { ApiProperty } from '@nestjs/swagger';

export class AddBusinessInfoReqDto {
    @ApiProperty()
    popbillId: string;

    @ApiProperty()
    popbillPassword: string;

    @ApiProperty()
    address: string;

    @ApiProperty()
    businessName: string;

    @ApiProperty()
    businessType: string;

    @ApiProperty()
    businessItem: string;
}
