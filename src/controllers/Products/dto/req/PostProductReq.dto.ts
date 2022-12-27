import { ProductSale } from './../../../../entity/ProductSale.entity';
import { ProductThumb } from 'src/entity/ProductThumb.entity';
import { ProductImage } from './../../../../entity/ProductImage.entity';

export class PostProductReqDtoOption {
    prodName: string;
}

export class PostProductReqDto {
    prodName: string;

    thumb: ProductThumb;

    discountRate: number;

    priceOrg: number;

    price: number;

    image: ProductImage;

    summary: string;

    description: string;

    englishProdName: string;

    sale: ProductSale;

    categoryId: number;

    hashtags: string[];
}
