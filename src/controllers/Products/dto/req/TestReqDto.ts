import { ApiProperty } from '@nestjs/swagger';

export class EditorTestReqDto {
    @ApiProperty()
    editor: string;
}
