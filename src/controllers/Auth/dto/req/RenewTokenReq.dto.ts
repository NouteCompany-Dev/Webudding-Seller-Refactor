import { ApiProperty } from '@nestjs/swagger';

export class RenewTokenReqDto {
    @ApiProperty()
    refreshToken: string;
}
