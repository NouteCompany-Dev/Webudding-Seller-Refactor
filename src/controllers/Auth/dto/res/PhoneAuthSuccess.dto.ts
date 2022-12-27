import { ApiProperty } from '@nestjs/swagger';

export class PhoneAuthSuccessObj {
    @ApiProperty()
    phoneToken: number;
}

export class PhoneAuthSuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ type: PhoneAuthSuccessObj })
    data: PhoneAuthSuccessObj;
}

export class PhoneAuthFailDto {
    @ApiProperty({ default: 6013 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
