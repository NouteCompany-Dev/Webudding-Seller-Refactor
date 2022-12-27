import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPopbillAccountObj {
    @ApiProperty()
    popbillId: string;
}

export class CheckIsPopbillMemberObj {
    @ApiProperty()
    corpNum: string;
}

export class AddBusinessInfoObj {
    @ApiProperty()
    managerName: string;

    @ApiProperty()
    zipCode: string;

    @ApiProperty()
    address: string;

    @ApiProperty()
    detailAddress: string;

    @ApiProperty()
    businessOperator: string;

    @ApiProperty()
    businessItem: string;
}

export class ConfirmPopbillAccountSuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ type: ConfirmPopbillAccountObj })
    data: ConfirmPopbillAccountObj;
}

export class CheckIsPopbillMemberSuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ type: CheckIsPopbillMemberObj })
    data: CheckIsPopbillMemberObj;
}

export class CheckPopbillMemberResDto {
    @ApiProperty({ default: 6071 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class ConfirmPopbillAccountFailDto {
    @ApiProperty({ default: 6072 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class CheckIsPopbillMemberResDto {
    @ApiProperty({ default: 6073 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class CheckIsPopbillMemberFailDto {
    @ApiProperty({ default: 6074 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class AddBusinessInfoSuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ type: AddBusinessInfoObj })
    data: AddBusinessInfoObj;
}

export class AddBusinessInfoResDto {
    @ApiProperty({ default: 6081 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class AddBusinessInfoFailDto {
    @ApiProperty({ default: 6082 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
