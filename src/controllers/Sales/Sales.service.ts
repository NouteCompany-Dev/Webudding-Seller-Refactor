import { ProductRepository } from './../../repository/Product.repository';
import { Injectable } from '@nestjs/common';
import { ExcelDownloadReqDto } from './dto/req/ExcelDownloadReq.dto';
import { OrderProductRepository } from 'src/repository/OrderProduct.repository';
import { ProductThumbRepository } from 'src/repository/productThumb.repository';
import { CategoryRepository } from 'src/repository/Category.repository';

@Injectable()
export class SalesService {
    constructor(
        private productRepository: ProductRepository,
        private productThumbRepository: ProductThumbRepository,
        private categoryRepository: CategoryRepository,
        private orderProductRepository: OrderProductRepository,
    ) {}

    async saleList(req: any, options: any): Promise<any> {
        try {
            const sellerId = req.seller.sellerId;
            let { startDate, endDate } = options;
            startDate = startDate + ' ' + '00:00:01';
            endDate = endDate + ' ' + '23:59:59';
            let productList = await this.productRepository.getProductListAndCategory(sellerId);
            let totalAmount = 0;
            let items = [];

            for (let i = 0; i < productList.length; i++) {
                let productId = productList[i].id;
                let categoryId = productList[i].category.id;
                let getOptions = { sellerId, productId, startDate, endDate };
                let orderProduct = await this.orderProductRepository.getSaleListData(getOptions);
                if (orderProduct.length > 0) {
                    let discountRate = productList[i].discountRate;
                    let productId = productList[i].id;
                    let category = await this.categoryRepository.getCategory(categoryId);
                    let thumb = await this.productThumbRepository.getProductTitleThumb(productId);
                    if (thumb != undefined) {
                        items.push({
                            productId: productList[i].id,
                            prodName: productList[i].productName,
                            priceOrg: productList[i].priceOrg,
                            price: productList[i].price,
                            dollarPriceOrg: productList[i].dollarPriceOrg,
                            dollarPrice: productList[i].dollarPrice,
                            discountRate: discountRate,
                            saleCount: orderProduct.length,
                            category: category.categoryName,
                            enCategory: category.englishCategoryName,
                            thumb: thumb.thumbPath,
                        });
                    }
                }
            }
            let getOptions = { sellerId, startDate, endDate };
            let orderProductData = await this.orderProductRepository.getOrderProductData(getOptions);
            for (let i = 0; i < orderProductData.length; i++) {
                totalAmount += orderProductData[i].amount;
            }
            return { status: 200, resultCode: 1, data: { items, totalAmount } };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6401, data: null };
        }
    }

    async excelDownload(req: any, options: ExcelDownloadReqDto): Promise<any> {
        try {
            const data = this.orderProductRepository.getSaleExcelData(req, options);
            return { status: 200, resultCode: 1, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6402, data: null };
        }
    }
}
