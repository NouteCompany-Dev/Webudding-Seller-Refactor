import { ProductImage } from './../../../../entity/ProductImage.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ProductImageUploadReqDto {
    @ApiProperty({ type: ProductImage, required: false })
    productImage: ProductImage[];
}
