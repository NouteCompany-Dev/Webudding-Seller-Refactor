import { ApiProperty } from '@nestjs/swagger';

export class SendVerificationCodeReqDto {
    @ApiProperty({ format: 'email' })
    email: string;
}

export class VerifyCodeReqDto {
    @ApiProperty()
    code: string;
}
