import { ApiProperty } from '@nestjs/swagger';

export class confirmPopbillAccountReqDto {
    @ApiProperty()
    popbillId: string;
}

export class CheckIsPopbillMemberReqDto {
    @ApiProperty()
    corpNum: string;
}
