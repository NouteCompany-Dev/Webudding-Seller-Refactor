import { ApiProperty } from '@nestjs/swagger';

export class RenewTokenSuccessObj {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;
}

export class RenewTokenSuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ type: RenewTokenSuccessObj })
    data: RenewTokenSuccessObj;
}

export class RefreshTokenExpiredDto {
    @ApiProperty({ default: -30 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class RenewTokenFailDto {
    @ApiProperty({ default: -1 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
