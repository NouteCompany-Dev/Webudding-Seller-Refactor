import { ApiProperty } from '@nestjs/swagger';

export class CategoryChildObj {
    @ApiProperty()
    id: number;

    @ApiProperty()
    categoryName: string;
}

export class CategoryListObj {
    @ApiProperty()
    id: number;

    @ApiProperty()
    categoryName: string;

    @ApiProperty({ type: CategoryChildObj })
    children: CategoryChildObj[];
}

export class CategoryListSuccessDto {
    @ApiProperty({ default: 1 })
    resultCode: number;

    @ApiProperty({ type: CategoryListObj })
    data: CategoryListObj;
}

export class CategoryListFailDto {
    @ApiProperty({ default: 6301 })
    resultCode: number;

    @ApiProperty({ default: null })
    data: any;
}
