import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetProductReqDto {
    @ApiPropertyOptional()
    search: string;

    start: number;
}
