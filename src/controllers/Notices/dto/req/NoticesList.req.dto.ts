import { ApiProperty } from '@nestjs/swagger';

export class NoticeListReqDto {
    @ApiProperty({
        default: 0,
        description: '0: 전체보기, 1: 기타, 2: 정기점검, 3: 트렌드 리포트, 4: 기획전',
    })
    type?: number;

    @ApiProperty()
    page: number;
}
