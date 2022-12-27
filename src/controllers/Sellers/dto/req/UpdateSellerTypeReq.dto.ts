import { SellerFile } from 'src/entity/SellerFiles.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateToCorpReqDto {
    @ApiProperty()
    corNum: string;

    @ApiProperty()
    representativeName: string;

    @ApiProperty()
    businessName: string;

    @ApiProperty({ type: SellerFile })
    sellerFile: SellerFile[];
}

export class UpdateToPersonalReqDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    residentNumber: string;
}
