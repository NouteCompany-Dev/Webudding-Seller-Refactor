import { ApiProperty } from '@nestjs/swagger';

export class EmailDuplicateReqDto {
    @ApiProperty({ format: 'email' })
    email: string;
}
