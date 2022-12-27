import { ProductReview } from './../../../../entity/ProductReview.entity';
import { PickType } from '@nestjs/swagger';

export class PatchProductsCommentsReqDto extends PickType(ProductReview, ['content']) {}
