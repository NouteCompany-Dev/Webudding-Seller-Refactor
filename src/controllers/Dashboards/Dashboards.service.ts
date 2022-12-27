import { ProductRepository } from './../../repository/Product.repository';
import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { OrderProductRepository } from 'src/repository/OrderProduct.repository';
import { CategoryRepository } from 'src/repository/Category.repository';
import { ProductReviewRepository } from 'src/repository/productReview.repository';

@Injectable()
export class DashboardsService {
    constructor(
        private productRepository: ProductRepository,
        private orderProductRepository: OrderProductRepository,
        private categoryRepository: CategoryRepository,
        private productReviewRepository: ProductReviewRepository,
    ) {}

    async list(req: any): Promise<any> {
        try {
            let data = null;
            let productData = await this.getProductData(req);
            let saleData = await this.getSaleData(req);
            let graphData = await this.getGraphData(req);
            data = {
                productData,
                saleData,
                graphData,
            };
            return { status: 200, resultCode: 1, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6701, data: null };
        }
    }

    async getProductData(req: any): Promise<any> {
        try {
            const sellerId = req.seller.sellerId;
            let productData = await this.getDashBoardProductData(sellerId);
            return productData;
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: -1, data: null };
        }
    }

    async getSaleData(req: any): Promise<any> {
        try {
            const sellerId = req.seller.sellerId;
            let saleData = await this.getDashBoardSaleData(sellerId);
            return saleData;
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: -1, data: null };
        }
    }

    async getGraphData(req: any): Promise<any> {
        try {
            const sellerId = req.seller.sellerId;
            let graphData = await this.getDashBoardGraphData(sellerId);
            return graphData;
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: -1, data: null };
        }
    }

    // 서비스 로직

    async getDashBoardGraphData(body: any): Promise<any> {
        const sellerId = body;
        let nowMonth = new Date().getMonth() + 1;
        let graphData = [];
        let graphSaleData = null;
        let graphMonth = null;
        let nowYear = new Date().getFullYear();
        let stringYear = null;
        for (let i = 10; i > 0; i--) {
            let month = nowMonth + 1 - i;
            if (month > 0) {
                month = month;
                nowYear = nowYear;
                stringYear = nowYear.toString();
                stringYear = stringYear.substr(2, 4);
            } else {
                month = month + 12;
                nowYear = nowYear - 1;
                stringYear = nowYear.toString();
                stringYear = stringYear.substr(2, 4);
            }
            if (month < 10) {
                graphMonth = stringYear + '/0' + month;
            } else {
                graphMonth = stringYear + '/' + month;
            }
            let startDateString = new Date(nowYear, month - 1, 1);
            let endDateString = new Date(nowYear, month, 0);
            let startDate = format(startDateString, 'yyyy-MM-dd');
            let endDate = format(endDateString, 'yyyy-MM-dd');
            let getOptions = { sellerId, startDate, endDate };
            let saleData = await this.orderProductRepository.getTotalSaleData(getOptions);
            graphSaleData = {
                data: graphMonth,
                count: saleData.length,
            };
            graphData.push(graphSaleData);
        }
        return graphData;
    }

    async getDashBoardProductData(body: any): Promise<any> {
        const sellerId = body;
        let [row, count] = await this.productRepository.getProductListAndCountAndCategory(sellerId);
        const productCount = count;
        let productConfirmed = 0,
            productInspection = 0,
            productRejected = 0;
        let productId = [];
        let reviewCount = 0;
        let totalSaleCount = 0;
        for (let i = 0; i < row.length; i++) {
            if (row[i].status == '판매중') {
                productConfirmed += 1;
            } else if (row[i].status == '승인 대기') {
                productInspection += 1;
            } else if (row[i].status == '승인 반려') {
                productRejected += 1;
            }
            productId[i] = row[i].id;
            let prodId = productId[i];
            const reviewCnt = await this.productReviewRepository.getReviewCount(prodId);
            const orderData = await this.orderProductRepository.getOrderData(prodId);
            if (reviewCnt) {
                reviewCount += reviewCnt;
            }
            if (orderData) {
                totalSaleCount += 1;
            }
        }
        // 답글 대기
        let reviewList = await this.productReviewRepository.getReviewList(sellerId);
        let reviewWaitCount = 0;
        for (let i = 0; i < reviewList.length; i++) {
            let review = reviewList[i];
            if (!review.reply) {
                reviewWaitCount++;
            }
        }
        let categoryRow = await this.categoryRepository.getFirstCategoryList();
        let productData = {};
        let prodData = [];
        for (let i = 0; i < categoryRow.length; i++) {
            let categoryId = categoryRow[i].id;
            let getOptions = { categoryId, sellerId };
            let prodCnt = await this.productRepository.getProductCountAndCategory(getOptions);
            let pCnt = await this.productRepository.getProductCountByCategoryParent(getOptions);
            prodCnt = prodCnt + pCnt;
            prodData.push(prodCnt);
            // 달 예외 처리
            let nowYear = new Date().getFullYear();
            let nowMonth = new Date().getMonth();
            let startDateString = new Date(nowYear, nowMonth, 1);
            let endDateString = new Date(nowYear, nowMonth + 1, 0);
            let startDate = format(startDateString, 'yyyy-MM-dd');
            let endDate = format(endDateString, 'yyyy-MM-dd');
            let getDataOptions = { sellerId, startDate, endDate };
            let totalSaleQuery = await this.orderProductRepository.getTotalSaleData(getDataOptions);
            productData = {
                productCount: productCount,
                productConfirmed: productConfirmed,
                productInspection: productInspection,
                productRejected: productRejected,
                reviewCount: reviewCount,
                reviewWaitCount: reviewWaitCount,
                totalSaleCount: totalSaleQuery.length,
            };
        }
        return productData;
    }

    async getDashBoardSaleData(body: any): Promise<any> {
        const sellerId = body;
        let categoryRow = await this.categoryRepository.getFirstCategoryList();
        let saleData = [];
        let prodData = [];
        for (let i = 0; i < categoryRow.length; i++) {
            let categoryId = categoryRow[i].id;
            let getOptions = { categoryId, sellerId };
            let prodCnt = await this.productRepository.getProductCountAndCategory(getOptions);
            let pCnt = await this.productRepository.getProductCountByCategoryParent(getOptions);
            prodCnt = prodCnt + pCnt;
            prodData.push(prodCnt);
            let categoryName = categoryRow[i].categoryName;
            let prodCount = prodCnt;
            let nowYear = new Date().getFullYear();
            let nowMonth = new Date().getMonth();
            let startDateString = new Date(nowYear, nowMonth, 1);
            let endDateString = new Date(nowYear, nowMonth + 1, 0);
            let startDate = format(startDateString, 'yyyy-MM-dd');
            let endDate = format(endDateString, 'yyyy-MM-dd');
            let getDataOptions = { sellerId, categoryId, startDate, endDate };
            let [categorySaleRow, categorySaleCnt] =
                await this.orderProductRepository.getSaleDataByParentCategory(getDataOptions);
            let amount = 0;
            for (let j = 0; j < categorySaleRow.length; j++) {
                amount += categorySaleRow[j].amount;
            }
            if (prodCount >= 1) {
                saleData.push({
                    categoryName: categoryName,
                    prodCount: prodCount,
                    saleCount: categorySaleCnt,
                    saleAmount: amount,
                });
            }
        }
        return saleData;
    }
}
