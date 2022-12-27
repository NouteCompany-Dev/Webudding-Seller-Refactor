import { ApiProperty } from '@nestjs/swagger';

export class CorpStateSuccessObj {
    @ApiProperty()
    taxType: string;

    @ApiProperty()
    state: string;
}

export class AccountCheckSuccessObj {
    @ApiProperty()
    result: string;
}

export class CorpStateSuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ type: CorpStateSuccessObj })
    data: CorpStateSuccessObj;
}

export class AccountCheckSuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ type: AccountCheckSuccessObj })
    cata: AccountCheckSuccessObj;
}
