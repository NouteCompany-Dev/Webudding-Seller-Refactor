import { ApiProperty } from '@nestjs/swagger';

export class LoginSellerReqDto {
    @ApiProperty({ format: 'email' })
    email: string;

    @ApiProperty()
    password: string;
}
