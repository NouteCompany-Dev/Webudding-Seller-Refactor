import { ProductImage } from 'src/entity/ProductImage.entity';
import { ProductSale } from 'src/entity/ProductSale.entity';
import { ProductThumb } from 'src/entity/ProductThumb.entity';

export class PatchProductReqDto {
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
