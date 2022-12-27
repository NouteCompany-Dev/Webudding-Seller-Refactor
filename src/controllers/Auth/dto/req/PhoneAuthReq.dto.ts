import { ApiProperty } from '@nestjs/swagger';

export class PhoneAuthReqDto {
    @ApiProperty()
    phone: string;
}
