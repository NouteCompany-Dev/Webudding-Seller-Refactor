import { ApiProperty } from '@nestjs/swagger';

export class PopbillCheckReqDto {
    @ApiProperty()
    popbillId: string;
}
