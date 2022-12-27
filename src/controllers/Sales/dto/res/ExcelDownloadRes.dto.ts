import { ApiProperty } from '@nestjs/swagger';

export class ExcelDownoladSuccessObj {
    @ApiProperty()
    productId: number;

    @ApiProperty()
    prodName: string;

    @ApiProperty()
    saleCount: number;

    @ApiProperty()
    salePrice: number;

    @ApiProperty()
    saleDate: Date;

    @ApiProperty()
    platForm: string;
}

export class ExcelDownloadSuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ type: ExcelDownoladSuccessObj })
    data: ExcelDownoladSuccessObj;
}

export class ExcelDonwloadFailDto {
    @ApiProperty({ default: 6402 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
