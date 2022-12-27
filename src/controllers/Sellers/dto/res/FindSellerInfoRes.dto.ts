import { ApiProperty } from '@nestjs/swagger';

export class FindSellerEmailObj {
    @ApiProperty()
    email: string;
}

export class FindSellerPasswordObj {
    @ApiProperty()
    newPassword: string;
}

export class FindSellerEmailSuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ type: FindSellerEmailObj })
    data: FindSellerEmailObj;
}

export class FindSellerPasswordSuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ type: FindSellerPasswordObj })
    data: FindSellerPasswordObj;
}

export class CheckPhoneResDto {
    @ApiProperty({ default: 6161 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class CheckSellerResDto {
    @ApiProperty({ default: 6162 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class FindSellerEmailFailDto {
    @ApiProperty({ default: 6163 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class CheckSellerInfoResDto {
    @ApiProperty({ default: 6171 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class FindSellerPasswordFailDto {
    @ApiProperty({ default: 6172 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
