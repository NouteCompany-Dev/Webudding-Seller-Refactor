import { ApiProperty } from '@nestjs/swagger';

export class NoticeListObj {
    @ApiProperty()
    NoticeId: number;

    @ApiProperty()
    title: string;

    @ApiProperty()
    createdAt: Date;
}

export class NoticeListSuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ type: NoticeListObj })
    data: NoticeListObj;
}

export class NoticeDetailSuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty()
    data: any;
}

export class NoticeListFailDto {
    @ApiProperty({ default: 6801 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class NoticeDetailResDto {
    @ApiProperty({ default: 6811 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}

export class NoticeDetailFailDto {
    @ApiProperty({ default: 6812 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
