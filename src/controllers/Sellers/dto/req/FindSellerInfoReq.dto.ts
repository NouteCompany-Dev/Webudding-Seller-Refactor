import { ApiProperty } from '@nestjs/swagger';

export class FindSellerEmailReqDto {
    @ApiProperty()
    impUid: string;
}

export class FindSellerPasswordReqDto {
    @ApiProperty()
    email: string;

    @ApiProperty()
    newPassword: string;
}
