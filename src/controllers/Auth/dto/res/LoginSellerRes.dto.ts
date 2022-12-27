import { ApiProperty } from '@nestjs/swagger';

export class LoginSellerSuccessObj {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;
}

export class LoginSellerSuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ type: LoginSellerSuccessObj })
    data: LoginSellerSuccessObj;
}

export class EmailErrorResDto {
    @ApiProperty({ default: 6011 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class PasswordErrorResDto {
    @ApiProperty({ default: 6012 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class SellerErrorResDto {
    @ApiProperty({ default: 6013 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class AddInfoErrorResDto {
    @ApiProperty({ default: 6014 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class RegisteredErrorResDto {
    @ApiProperty({ default: 6015 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class RejectedErrorResDto {
    @ApiProperty({ default: 6016 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class LoginSellerFailDto {
    @ApiProperty({ default: 6017 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
