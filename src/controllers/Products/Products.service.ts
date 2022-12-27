import { ProductSaleRepository } from 'src/repository/productSale.repository';
import { ProductImageRepository } from 'src/repository/productImage.repository';
import { ProductThumbRepository } from 'src/repository/productThumb.repository';
import { imgDelete } from 'src/modules/s3Delete';
import { SellerRepository } from 'src/repository/Seller.repository';
import { ProductRepository } from './../../repository/Product.repository';
import { awsConfig } from './../../config/awsConfig';
import { editorS3 } from 'src/modules/editor-html';
import { Injectable, Logger } from '@nestjs/common';
import {
    CheckSkuReqDto,
    CreateEnglishProductReqDto,
    CreateProductReqDto,
} from './dto/req/CreateProductReq.dto';
import { Connection } from 'typeorm';
import { cloudfrontPath } from 'src/modules/cloudfront';
import { UpdateEnglishProductReqDto, UpdateProductReqDto } from './dto/req/UpdateProductReq.dto';
import * as AWS from 'aws-sdk';
import * as dotenv from 'dotenv';
import { TempProductReqDto } from './dto/req/TempProductReq.dto';
import { ProductListReqDto } from './dto/req/ProductListReq.dto';
import axios from 'axios';
import { ProductStatus } from 'src/entity/enum/enum';
import { SellerInfoRepository } from 'src/repository/sellerInfo.repository';
import { TemporaryProductRepository } from 'src/repository/temporaryProduct.repository';
import { CategoryRepository } from 'src/repository/Category.repository';
import { HashtagRepository } from 'src/repository/hashtag.repository';
import { TemplateColumnRepository } from 'src/repository/templateColumn.repository';
import { format } from 'date-fns';
import { OrderProductRepository } from 'src/repository/OrderProduct.repository';
import { ProductReviewRepository } from 'src/repository/productReview.repository';
dotenv.config();

@Injectable()
export class ProductsService {
    constructor(
        private connection: Connection,
        // Repository
        private productRepository: ProductRepository,
        private productThumbRepository: ProductThumbRepository,
        private productImageRepository: ProductImageRepository,
        private productSaleRepository: ProductSaleRepository,
        private categoryRepository: CategoryRepository,
        private hashtagRepository: HashtagRepository,
        private templateColumnRepository: TemplateColumnRepository,
        private orderProductRepository: OrderProductRepository,
        private temporaryProductRepository: TemporaryProductRepository,
        private productReviewRepository: ProductReviewRepository,
        private sellerRepository: SellerRepository,
        private sellerInfoRepository: SellerInfoRepository,
    ) {}

    async create(files: File[], req: any, body: CreateProductReqDto): Promise<any> {
        try {
            const sellerId = req.seller.sellerId;
            Logger.log(`API - Seller Add Product : ${sellerId}`);
            let status = 0;
            let resultCode = 0;
            let data = null;
            const {
                prodName,
                englishProdName,
                priceOrg,
                price,
                skuId,
                summary,
                detailContent,
                globalDetailContent,
                globalSummary,
                categoryId,
                templateId,
                hashTag,
                deleteIdx,
            } = body;
            const sellerInfo = await this.sellerInfoRepository.getSellerInfo(sellerId);
            const temp = await this.temporaryProductRepository.getTemporaryProduct(sellerId);
            let dollarCurrencyString = null;
            let dollarCurrency = 0;
            let discountRate = 0;
            let stringDollarOrg = null;
            let numberDollarOrg = 0;
            let stringDollar = null;
            let numberDollar = 0;
            let currencyRate = 0;
            const currencyData = await axios.get(
                'https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=0GYQ5npmDp0WGbjW3mOMKxgn9H2R5Gs3&searchdate=20221101&data=AP01',
            );
            currencyData.data.forEach(async (o) => {
                if (o.cur_nm === '미국 달러') {
                    dollarCurrencyString = o.bkpr;
                }
            });
            let dollarString = dollarCurrencyString.replace(',', '');
            dollarCurrency = Number(dollarString);
            currencyRate = 1 / dollarCurrency;
            if (priceOrg == 0) {
                discountRate = 0;
                numberDollarOrg = 0;
                numberDollar = 0;
            } else {
                if (price == 0) {
                    discountRate = 0;
                    stringDollarOrg = (priceOrg * currencyRate).toFixed(2);
                    numberDollarOrg = Number(stringDollarOrg);
                    numberDollar = 0;
                } else {
                    discountRate = 100 - Math.floor((price / priceOrg) * 100);
                    stringDollarOrg = (priceOrg * currencyRate).toFixed(2);
                    numberDollarOrg = Number(stringDollarOrg);
                    stringDollar = (price * currencyRate).toFixed(2);
                    numberDollar = Number(stringDollar);
                }
            }
            const maxProduct = await this.productRepository.getMaxProduct();
            const productId = maxProduct.max + 1;
            const seller = await this.sellerRepository.getSeller(sellerId);
            const category = await this.categoryRepository.getCategory(categoryId);

            const product = await this.productRepository.create();
            if (price == 0) {
                product.free = true;
            }
            product.id = productId;
            product.productName = prodName;
            product.englishProductName = englishProdName;
            product.priceOrg = priceOrg;
            product.price = price;
            product.dollarPriceOrg = numberDollarOrg;
            product.dollarPrice = numberDollar;
            product.discountRate = discountRate;
            product.skuId = skuId;
            product.summary = summary;
            product.globalSummary = globalSummary;
            product.status = ProductStatus.registered;
            product.category = category;
            product.seller = seller;
            await this.productRepository.save(product);

            if (deleteIdx) {
                if (Array.isArray(deleteIdx)) {
                    for (let i = 0; i < deleteIdx.length; i++) {
                        let idx = deleteIdx[i];
                        let productThumb = await this.productThumbRepository.getProductThumb(idx);
                        let key = productThumb.originalThumbName;
                        await this.productThumbRepository.deleteProductThumb(idx);
                        imgDelete(key);
                    }
                } else {
                    let idx = deleteIdx;
                    let productThumb = await this.productThumbRepository.getProductThumb(idx);
                    let key = productThumb.originalThumbName;
                    await this.productThumbRepository.deleteProductThumb(idx);
                    imgDelete(key);
                }
            }

            // if(templateId) {
            //     if(Array.isArray(templateId)) {
            //         await this.productRepository.addTemplateData(body);
            //     }
            // }

            if (hashTag) {
                if (Array.isArray(hashTag)) {
                    hashTag.forEach(async (o) => {
                        let productHashTag = await this.hashtagRepository.create();
                        productHashTag.name = o;
                        productHashTag.product = product;
                        await this.hashtagRepository.save(productHashTag);
                    });
                } else {
                    let productHashTag = await this.hashtagRepository.create();
                    productHashTag.name = hashTag;
                    productHashTag.product = product;
                    await this.hashtagRepository.save(productHashTag);
                }
            }

            if (!files['thumb'] && !files['thumbGlobal']) {
                status = 201;
                resultCode = 6201;
                return { status: status, resultCode: resultCode, data: data };
            }

            if (files['thumb']) {
                for (let i = 0; i < files['thumb'].length; i++) {
                    let chk = 0;
                    let o = files['thumb'][i];
                    let productThumb = await this.productThumbRepository.create();
                    productThumb.isGlobal = false;
                    productThumb.originalThumbName = o.key;
                    productThumb.thumbPath = cloudfrontPath(o.key);
                    productThumb.product = product;
                    let thumb = await this.productThumbRepository.getManyNotGlobalThumbs(productId);

                    for (let j = 0; j < thumb.length; j++) {
                        if (thumb[j].title == true) {
                            chk = 1;
                        }
                    }

                    if (i == 0 && chk == 0) {
                        productThumb.title = true;
                    }

                    await this.productThumbRepository.save(productThumb);
                }
            }

            if (files['thumbGlobal']) {
                for (let i = 0; i < files['thumbGlobal'].length; i++) {
                    let chk = 0;
                    let o = files['thumbGlobal'][i];
                    let productThumb = await this.productThumbRepository.create();
                    productThumb.isGlobal = true;
                    productThumb.originalThumbName = o.key;
                    productThumb.thumbPath = cloudfrontPath(o.key);
                    productThumb.product = product;
                    let thumb = await this.productThumbRepository.getManyGlobalThumbS(productId);

                    for (let j = 0; j < thumb.length; j++) {
                        if (thumb[j].title == true) {
                            chk = 1;
                        }
                    }

                    if (i == 0 && chk == 0) {
                        productThumb.title = true;
                    }

                    await this.productThumbRepository.save(productThumb);
                }
            }

            if (temp.thumb) {
                for (let i = 0; i < temp.thumb.length; i++) {
                    let productThumb = await this.productThumbRepository.create();
                    productThumb.isGlobal = false;
                    productThumb.originalThumbName = temp.thumb[i].originalThumbName;
                    productThumb.thumbPath = temp.thumb[i].thumbPath;
                    productThumb.product = product;
                    if (i == 0) {
                        productThumb.title = true;
                    }
                    await this.productThumbRepository.save(productThumb);
                }
            }

            if (temp.thumbGlobal) {
                for (let i = 0; i < temp.thumbGlobal.length; i++) {
                    let productThumb = await this.productThumbRepository.create();
                    productThumb.isGlobal = true;
                    productThumb.originalThumbName = temp.thumb[i].originalThumbName;
                    productThumb.thumbPath = temp.thumb[i].thumbPath;
                    productThumb.product = product;
                    if (i == 0) {
                        productThumb.title = true;
                    }
                    await this.productThumbRepository.save(productThumb);
                }
            }

            if (!files['sale']) {
                status = 202;
                resultCode = 6202;
                return { status: status, resultCode: resultCode, data: data };
            }

            files['sale'].forEach(async (o) => {
                let productSale = await this.productSaleRepository.create();
                productSale.originalSaleName = o.key;
                productSale.salePath = cloudfrontPath(o.key);
                productSale.product = product;
                await this.productSaleRepository.save(productSale);
            });

            const detail = await editorS3(detailContent);
            const globalDetail = await editorS3(globalDetailContent);
            const result = detail.result;
            const globalResult = globalDetail.result;

            detail.items.forEach(async (o) => {
                let productImage = await this.productImageRepository.create();
                productImage.originalImageName = o.originalName;
                productImage.isGlobal = false;
                productImage.imagePath = o.path;
                productImage.product = product;
                await this.productImageRepository.save(productImage);
            });
            product.detail = result;
            await this.productRepository.save(product);

            globalDetail.items.forEach(async (o) => {
                let productImage = await this.productImageRepository.create();
                productImage.originalImageName = o.originalName;
                productImage.isGlobal = true;
                productImage.imagePath = o.path;
                productImage.product = product;
                await this.productImageRepository.save(productImage);
            });
            product.globalDetail = globalResult;
            await this.productRepository.save(product);

            // if(sellerInfo.temporary == true) {
            //     sellerInfo.temporary = false;
            //     temp.prodName = null;
            //     temp.englishProdName = null;
            //     temp.discountRate = 0;
            //     temp.priceOrg = 0;
            //     temp.price = 0;
            //     temp.dollarPriceOrg = 0;
            //     temp.dollarPrice = 0;
            //     temp.summary = null;
            //     temp.globalSummary = null;
            //     temp.detail = null;
            //     temp.globalDetail = null;
            //     temp.thumb = null;
            //     temp.thumbGlobal = null;
            //     temp.image = null;
            //     temp.sale = null;
            //     temp.hashtag = null;
            //     temp.category = null;
            //     temp.image = null;
            //     await manager.save(sellerInfo);
            //     await manager.save(temp);
            // }
            status = 200;
            resultCode = 1;
            return { status: status, resultCode: 1, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6204, data: null };
        }
    }

    async checkSku(req: any, body: CheckSkuReqDto): Promise<any> {
        try {
            Logger.log(`API - Check Product SKU ID`);
            let status = 0;
            let resultCode = 0;
            const sellerId = req.seller.sellerId;
            const { skuId } = body;
            const productList = await this.productRepository.getProductAndSku(sellerId);

            for (let i = 0; i < productList.length; i++) {
                if (productList[i].skuId == skuId) {
                    status = 201;
                    resultCode = -1;
                    return { status: status, resultCode: resultCode, data: null };
                }
            }

            status = 200;
            resultCode = 1;

            return { status: status, resultCode: 1, data: null };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: -1, data: null };
        }
    }

    async enCreate(files: File[], req: any, body: CreateEnglishProductReqDto): Promise<any> {
        try {
            const sellerId = req.seller.sellerId;
            Logger.log(`API - English Seller Add Product : ${sellerId}`);
            let status = 0;
            let resultCode = 0;
            let data = null;
            const {
                categoryId,
                englishProdName,
                dollarPriceOrg,
                dollarPrice,
                globalSummary,
                globalDetailContent,
                skuId,
                hashTag,
                deleteIdx,
            } = body;
            const sellerInfo = await this.sellerInfoRepository.getSellerInfo(sellerId);
            const temp = await this.temporaryProductRepository.getTemporaryProduct(sellerId);
            let dollarCurrencyString = null;
            let dollarCurrency = 0;
            var discountRate = 0;
            let stringPriceOrg = null;
            let numberPriceOrg = 0;
            let stringPrice = null;
            let numberPrice = 0;
            const currencyData = await axios.get(
                'https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=0GYQ5npmDp0WGbjW3mOMKxgn9H2R5Gs3&searchdate=20221101&data=AP01',
            );
            currencyData.data.forEach(async (o) => {
                if (o.cur_nm === '미국 달러') {
                    dollarCurrencyString = o.bkpr;
                }
            });
            let dollarString = dollarCurrencyString.replace(',', '');
            dollarCurrency = Number(dollarString);
            const currencyRate = dollarCurrency;
            if (dollarPriceOrg == 0) {
                discountRate = 0;
                numberPriceOrg = 0;
                numberPrice = 0;
            } else {
                if (dollarPrice == 0) {
                    discountRate = 0;
                    stringPriceOrg = dollarPriceOrg * currencyRate;
                    numberPriceOrg = Number(stringPriceOrg);
                    numberPriceOrg = Math.floor((numberPriceOrg / 10) * 10);
                    numberPrice = 0;
                } else {
                    discountRate = 100 - Math.floor((dollarPrice / dollarPriceOrg) * 100);
                    stringPriceOrg = dollarPriceOrg * currencyRate;
                    numberPriceOrg = Number(stringPriceOrg);
                    numberPriceOrg = Math.floor((numberPriceOrg / 10) * 10);
                    stringPrice = dollarPrice * currencyRate;
                    numberPrice = Number(stringPrice);
                    numberPrice = Math.floor((numberPrice / 10) * 10);
                }
            }
            const maxProduct = await this.productRepository.getMaxProduct();
            const seller = await this.sellerRepository.getSeller(sellerId);
            const category = await this.categoryRepository.getCategory(categoryId);
            const productId = maxProduct.max + 1;
            const product = await this.productRepository.create();
            if (dollarPrice == 0) {
                product.free = true;
            }
            product.id = productId;
            product.productName = englishProdName;
            product.englishProductName = englishProdName;
            product.discountRate = discountRate;
            product.summary = globalSummary;
            product.globalSummary = globalSummary;
            product.status = ProductStatus.registered;
            product.category = category;
            product.price = numberPrice;
            product.priceOrg = numberPriceOrg;
            product.dollarPrice = dollarPrice;
            product.dollarPriceOrg = dollarPriceOrg;
            product.skuId = skuId;
            product.seller = seller;
            await this.productRepository.save(product);

            if (deleteIdx) {
                if (Array.isArray(deleteIdx)) {
                    for (let i = 0; i < deleteIdx.length; i++) {
                        let idx = deleteIdx[i];
                        let productThumb = await this.productThumbRepository.getProductThumb(idx);
                        let key = productThumb.originalThumbName;
                        await this.productThumbRepository.deleteProductThumb(idx);
                        imgDelete(key);
                    }
                } else {
                    let idx = deleteIdx;
                    let productThumb = await this.productThumbRepository.getProductThumb(idx);
                    let key = productThumb.originalThumbName;
                    await this.productThumbRepository.deleteProductThumb(idx);
                    imgDelete(key);
                }
            }

            if (hashTag) {
                if (Array.isArray(hashTag)) {
                    hashTag.forEach(async (o) => {
                        let productHashTag = await this.hashtagRepository.create();
                        productHashTag.name = o;
                        productHashTag.product = product;
                        await this.hashtagRepository.save(productHashTag);
                    });
                } else {
                    let productHashTag = await this.hashtagRepository.create();
                    productHashTag.name = hashTag;
                    productHashTag.product = product;
                    await this.hashtagRepository.save(productHashTag);
                }
            }

            if (!files['thumbGlobal']) {
                status = 201;
                resultCode = 6205;
                return { status: status, resultCode: resultCode, data: data };
            }

            if (files['thumbGlobal']) {
                for (let i = 0; i < files['thumbGlobal'].length; i++) {
                    let chk = 0;
                    let o = files['thumbGlobal'][i];
                    let productThumb = await this.productThumbRepository.create();
                    productThumb.isGlobal = true;
                    productThumb.originalThumbName = o.key;
                    productThumb.thumbPath = cloudfrontPath(o.key);
                    productThumb.product = product;
                    let thumb = await this.productThumbRepository.getThumbListByProductId(productId);

                    for (let j = 0; j < thumb.length; j++) {
                        if (thumb[j].title == true && thumb[j].isGlobal == true) {
                            chk = 1;
                        }
                    }

                    if (i == 0 && chk == 0) {
                        productThumb.title = true;
                    }

                    await this.productThumbRepository.save(productThumb);
                }

                for (let i = 0; i < files['thumbGlobal'].length; i++) {
                    let chk = 0;
                    let o = files['thumbGlobal'][i];
                    let productThumb = await this.productThumbRepository.create();
                    productThumb.isGlobal = false;
                    productThumb.originalThumbName = o.key;
                    productThumb.thumbPath = cloudfrontPath(o.key);
                    productThumb.product = product;
                    let thumb = await this.productThumbRepository.getThumbListByProductId(productId);

                    for (let j = 0; j < thumb.length; j++) {
                        if (thumb[j].title == true && thumb[j].isGlobal == false) {
                            chk = 1;
                        }
                    }

                    if (i == 0 && chk == 0) {
                        productThumb.title = true;
                    }

                    await this.productThumbRepository.save(productThumb);
                }
            }

            if (!files['sale']) {
                status = 202;
                resultCode = 6206;
                return { status: status, resultCode: resultCode, data: data };
            }

            files['sale'].forEach(async (o) => {
                let productSale = await this.productSaleRepository.create();
                productSale.originalSaleName = o.key;
                productSale.salePath = cloudfrontPath(o.key);
                productSale.product = product;
                await this.productSaleRepository.save(productSale);
            });

            const globalDetail = await editorS3(globalDetailContent);
            const globalResult = globalDetail.result;

            globalDetail.items.forEach(async (o) => {
                let productImage = await this.productImageRepository.create();
                productImage.originalImageName = o.originalName;
                productImage.isGlobal = true;
                productImage.imagePath = o.path;
                productImage.product = product;
                await this.productImageRepository.save(productImage);
            });
            product.globalDetail = globalResult;
            await this.productRepository.save(product);

            globalDetail.items.forEach(async (o) => {
                let productImage = await this.productImageRepository.create();
                productImage.originalImageName = o.originalName;
                productImage.isGlobal = false;
                productImage.imagePath = o.path;
                productImage.product = product;
                await this.productImageRepository.save(productImage);
            });
            product.detail = globalResult;
            await this.productRepository.save(product);

            // if(temp.thumbGlobal) {
            //     for(let i = 0; i < temp.thumbGlobal.length; i++) {
            //         let productThumb = this.productThumbRepository.create();
            //         productThumb.isGlobal = true;
            //         productThumb.originalThumbName = temp.thumb[i].originalThumbName;
            //         productThumb.thumbPath = temp.thumb[i].thumbPath;
            //         productThumb.product = product;
            //         if(i == 0) {
            //             productThumb.title = true;
            //         }
            //         await this.productThumbRepository.save(productThumb);
            //     }
            // }

            // if(sellerInfo.temporary == true) {
            //     sellerInfo.temporary = false;
            //     temp.prodName = null;
            //     temp.englishProdName = null;
            //     temp.discountRate = 0;
            //     temp.priceOrg = 0;
            //     temp.price = 0;
            //     temp.dollarPriceOrg = 0;
            //     temp.dollarPrice = 0;
            //     temp.summary = null;
            //     temp.globalSummary = null;
            //     temp.detail = null;
            //     temp.globalDetail = null;
            //     temp.thumb = null;
            //     temp.thumbGlobal = null;
            //     temp.image = null;
            //     temp.sale = null;
            //     temp.hashtag = null;
            //     temp.category = null;
            //     temp.image = null;
            //     await manager.save(sellerInfo);
            //     await manager.save(temp);
            // }
            status = 200;
            resultCode = 1;
            return { status: status, resultCode: 1, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6208, data: null };
        }
    }

    // async productTemplate(body: any): Promise<any> {
    //     try {
    //         const { categoryId } = body;
    //         let data = null;
    //         let templateData = [];
    //         let columnList = null;
    //         let templateQuery = await this.productRepository.getTemplateRowAndCategory(categoryId);
    //         let templateRowData = templateQuery.row;

    //         for(let i = 0; i < templateRowData.length; i++) {
    //             let rowId = templateRowData[i].id;
    //             let templateColumnData = await this.productRepository.getTemplateColumnList(rowId);

    //             for(let j = 0; j < templateColumnData.length; j++) {
    //                 columnList = {
    //                     rowId: rowId,
    //                     columnId: templateColumnData[j].id,
    //                     columnName : templateColumnData[j].name
    //                 }
    //                 templateData.push(columnList);
    //             }
    //         }
    //         data = {
    //             templateData
    //         };

    //         return data;
    //     } catch (err) {
    //         console.log(err);
    //         return { "status": 401, "resultCode": -1, "data": null };
    //     }
    // }

    async list(req: any, body: ProductListReqDto): Promise<any> {
        try {
            Logger.log('API - Seller Product List');
            const { page, sort } = body;
            let status = 0;
            let resultCode = 0;
            let productData = [];
            let items = [];
            let items2 = [];

            let res = await this.getProductList(req, body);
            items = res.items;
            items2 = res.items2;

            productData = items.concat(items2);

            if (sort === 1) {
                productData.sort((a, b) => {
                    return a.price - b.price;
                });
            }
            if (sort === 2) {
                productData.sort((a, b) => {
                    return b.price - a.price;
                });
            }
            if (sort === 3) {
                productData.sort((a, b) => {
                    return b.saleCount - a.saleCount;
                });
            }
            if (sort === 4) {
                productData.sort((a, b) => {
                    return b.updatedAt - a.updatedAt;
                });
            }

            const offset = (page + 1) * 5;
            const sliceData = productData.slice(page * 5, offset);
            let count = productData.length;
            status = 200;
            resultCode = 1;

            return { status: status, resultCode: resultCode, data: { sliceData, count } };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6212, data: null };
        }
    }

    async detail(id: number): Promise<any> {
        try {
            Logger.log('API - Seller Product Detail');
            let data = null;
            let productInfo = null;
            let categoryInfo = null;
            const product = await this.productRepository.getProductAndCategory(id);
            const productThumb = await this.productThumbRepository.getManyProductThumbs(id);
            const productSale = await this.productSaleRepository.getProductSale(id);
            const s3 = new AWS.S3(awsConfig);
            const url = s3.getSignedUrl('getObject', {
                Bucket: process.env.AWS_BUCKET,
                Key: productSale.originalSaleName,
                Expires: 60 * 3,
            });
            let hashTag = await this.hashtagRepository.getManyHashTags(id);
            let hashTags = [];

            for (let i = 0; i < hashTag.length; i++) {
                hashTags.push(hashTag[i].name);
            }

            let templateData = [];
            let template = null;
            let templateList = await this.templateColumnRepository.getTemplateList(id);

            for (let i = 0; i < templateList.length; i++) {
                template = {
                    rowId: templateList[i].row.id,
                    templateId: templateList[i].id,
                    templateName: templateList[i].name,
                };
                templateData.push(template);
            }

            productInfo = {
                status: product.status,
                validMsg: product.validMsg,
                prodName: product.productName,
                englishProdName: product.englishProductName,
                priceOrg: product.priceOrg,
                price: product.price,
                dollarPriceOrg: product.dollarPriceOrg,
                dollarPrice: product.dollarPrice,
                skuId: product.skuId,
                summary: product.summary,
                globalSummary: product.globalSummary,
                detail: product.detail,
                globalDetail: product.globalDetail,
                hashTag: hashTags,
                templateData: templateData,
            };

            const category = product.category;
            const categoryName = category.categoryName;
            const isCategory = await this.categoryRepository.getCategoryByName(categoryName);
            const parent = isCategory.parent;
            const children = isCategory.categoryName;

            if (parent) {
                categoryInfo = {
                    firstCategory: parent.categoryName,
                    secondCategory: children,
                };
            } else {
                categoryInfo = {
                    firstCategory: children,
                };
            }

            data = {
                productThumb,
                productSale,
                url,
                productInfo,
                categoryInfo,
            };

            return { status: 200, resultCode: 1, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6221, data: null };
        }
    }

    async update(files: File[], id: any, body: UpdateProductReqDto): Promise<any> {
        try {
            Logger.log('API - Product Update');
            const {
                prodName,
                englishProdName,
                summary,
                globalSummary,
                price,
                priceOrg,
                skuId,
                saleStop,
                saleResume,
                detailContent,
                globalDetailContent,
                hashTag,
                deleteIdx,
            } = body;
            const productId = id;

            const currencyData = await axios.get(
                'https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=0GYQ5npmDp0WGbjW3mOMKxgn9H2R5Gs3&searchdate=20221101&data=AP01',
            );
            let dollarCurrencyString = null;
            let dollarCurrency = 0;
            currencyData.data.forEach(async (o) => {
                if (o.cur_nm === '미국 달러') {
                    dollarCurrencyString = o.bkpr;
                }
            });
            let dollarString = dollarCurrencyString.replace(',', '');
            dollarCurrency = Number(dollarString);
            const currencyRate = 1 / dollarCurrency;
            let stringDollarOrg = null;
            let numberDollarOrg = 0;
            let stringDollar = null;
            let numberDollar = 0;
            let rate = 0;

            if (priceOrg == 0) {
                rate = 0;
                numberDollarOrg = 0;
                numberDollar = 0;
            } else {
                rate = 100 - Math.floor((price / priceOrg) * 100);
                stringDollarOrg = (priceOrg * currencyRate).toFixed(2);
                numberDollarOrg = Number(stringDollarOrg);
                stringDollar = (price * currencyRate).toFixed(2);
                numberDollar = Number(stringDollar);
            }

            const product = await this.productRepository.getProduct(productId);

            if (price == 0) {
                product.free = true;
            }
            product.productName = prodName;
            product.englishProductName = englishProdName;
            product.priceOrg = priceOrg;
            product.price = price;
            product.dollarPriceOrg = numberDollarOrg;
            product.dollarPrice = numberDollar;
            product.discountRate = rate;
            product.skuId = skuId;
            if (saleStop === 'true' && saleResume == 'false') {
                product.status = ProductStatus.stopped;
            } else if (saleStop === 'false' && saleResume === 'true') {
                product.status = ProductStatus.registered;
            }
            product.summary = summary;
            product.globalSummary = globalSummary;
            await this.productRepository.save(product);

            if (deleteIdx) {
                if (Array.isArray(deleteIdx)) {
                    for (let i = 0; i < deleteIdx.length; i++) {
                        let idx = deleteIdx[i];
                        let productThumb = await this.productThumbRepository.getProductThumb(idx);
                        let key = productThumb.originalThumbName;
                        await this.productThumbRepository.deleteProductThumb(idx);
                        imgDelete(key);
                    }
                } else {
                    let idx = deleteIdx;
                    let productThumb = await this.productThumbRepository.getProductThumb(idx);
                    let key = productThumb.originalThumbName;
                    await this.productThumbRepository.deleteProductThumb(idx);
                    imgDelete(key);
                }
            }

            await this.hashtagRepository.deleteHashtag(productId);

            if (hashTag) {
                if (Array.isArray(hashTag)) {
                    hashTag.forEach(async (o) => {
                        let productHashTag = await this.hashtagRepository.create();
                        productHashTag.name = o;
                        productHashTag.product = product;
                        await this.hashtagRepository.save(productHashTag);
                    });
                } else {
                    const productHashTag = await this.hashtagRepository.create();
                    productHashTag.name = hashTag;
                    productHashTag.product = product;
                    await this.hashtagRepository.save(productHashTag);
                }
            }

            if (files['thumb']) {
                for (let i = 0; i < files['thumb'].length; i++) {
                    let o = files['thumb'][i];
                    let productThumb = await this.productThumbRepository.create();
                    productThumb.isGlobal = false;
                    productThumb.originalThumbName = o.key;
                    productThumb.thumbPath = cloudfrontPath(o.key);
                    productThumb.product = product;
                    let thumb = await this.productThumbRepository.getThumbListByProductId(productId);
                    let chk = false;

                    for (let j = 0; j < thumb.length; j++) {
                        if (thumb[j].title == true) {
                            chk = true;
                        }
                    }

                    if (chk == false) {
                        productThumb.title = true;
                        chk = true;
                    }

                    await this.productThumbRepository.save(productThumb);
                }
            }

            if (files['thumbGlobal']) {
                for (let i = 0; i < files['thumbGlobal'].length; i++) {
                    let o = files['thumbGlobal'][i];
                    let productThumb = await this.productThumbRepository.create();
                    productThumb.isGlobal = true;
                    productThumb.originalThumbName = o.key;
                    productThumb.thumbPath = cloudfrontPath(o.key);
                    productThumb.product = product;
                    let thumbGlobal = await this.productThumbRepository.getGlobalThumbListByProductId(
                        productId,
                    );
                    let chk = false;

                    for (let j = 0; j < thumbGlobal.length; j++) {
                        if (thumbGlobal[j].title == true) {
                            chk = true;
                        }
                    }

                    if (chk == false) {
                        productThumb.title = true;
                        chk = true;
                    }

                    await this.productThumbRepository.save(productThumb);
                }
            }

            let productThumbList = await this.productThumbRepository.getManyProductThumbs(id);
            let chk = 0;

            for (let i = 0; i < productThumbList.length; i++) {
                let thumb = productThumbList[i];

                if (thumb.title) {
                    chk++;
                }
            }

            if (chk != 2) {
                return { status: 201, resultCode: -1, data: null };
            }

            if (files['sale']) {
                files['sale'].forEach(async (o) => {
                    let productSale = await this.productSaleRepository.getProductSale(productId);
                    productSale.originalSaleName = o.key;
                    productSale.salePath = cloudfrontPath(o.key);
                    productSale.product = product;
                    await this.productSaleRepository.save(productSale);
                });
            }

            const detail = await editorS3(detailContent);
            const globalDetail = await editorS3(globalDetailContent);
            const result = detail.result;
            const globalResult = globalDetail.result;

            if (detailContent) {
                detail.items.forEach(async (o) => {
                    let productImage = await this.productImageRepository.create();
                    productImage.originalImageName = o.originalName;
                    productImage.imagePath = o.path;
                    productImage.product = product;
                    await this.productImageRepository.save(productImage);
                });
                product.detail = result;

                await this.productRepository.save(product);
            }

            if (globalDetailContent) {
                globalDetail.items.forEach(async (o) => {
                    let productImage = await this.productImageRepository.create();
                    productImage.originalImageName = o.originalName;
                    productImage.imagePath = o.path;
                    productImage.product = product;
                    await this.productImageRepository.save(productImage);
                });
                product.globalDetail = globalResult;
            }

            if (product.status == ProductStatus.rejected) {
                product.status = ProductStatus.registered;
            }

            await this.productRepository.save(product);

            return { status: 200, resultCode: 1, data: null };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6231, data: null };
        }
    }

    async enUpdate(files: File[], req: any, id: number, body: UpdateEnglishProductReqDto): Promise<any> {
        try {
            Logger.log('API - English Product Update');
            const productId = id;
            const {
                englishProdName,
                globalSummary,
                dollarPrice,
                dollarPriceOrg,
                skuId,
                saleStop,
                saleResume,
                globalDetailContent,
                hashTag,
                deleteIdx,
            } = body;
            const currencyData = await axios.get(
                'https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=0GYQ5npmDp0WGbjW3mOMKxgn9H2R5Gs3&searchdate=20220921&data=AP01',
            );
            let dollarCurrencyString = null;
            let dollarCurrency = 0;
            currencyData.data.forEach(async (o) => {
                if (o.cur_nm === '미국 달러') {
                    dollarCurrencyString = o.bkpr;
                }
            });
            let dollarString = dollarCurrencyString.replace(',', '');
            dollarCurrency = Number(dollarString);
            const currencyRate = dollarCurrency;
            let stringPriceOrg = null;
            let numberPriceOrg = 0;
            let stringPrice = null;
            let numberPrice = 0;
            let rate = 0;

            if (dollarPriceOrg === 0) {
                rate = 0;
                numberPriceOrg = 0;
                numberPrice = 0;
            } else {
                rate = 100 - Math.floor((dollarPrice / dollarPriceOrg) * 100);
                stringPriceOrg = dollarPriceOrg * currencyRate;
                numberPriceOrg = Number(stringPriceOrg);
                numberPriceOrg = Math.floor(numberPriceOrg / 10) * 10;
                stringPrice = dollarPrice * currencyRate;
                numberPrice = Number(stringPrice);
                numberPrice = Math.floor(numberPrice / 10) * 10;
            }

            const product = await this.productRepository.getProduct(productId);

            if (dollarPrice === 0) {
                product.free = true;
            }
            product.productName = englishProdName;
            product.englishProductName = englishProdName;
            product.price = numberPrice;
            product.priceOrg = numberPriceOrg;
            product.skuId = skuId;
            if (saleStop === 'true' && saleResume == 'false') {
                product.status = ProductStatus.stopped;
            } else if (saleStop === 'false' && saleResume === 'true') {
                product.status = ProductStatus.registered;
            }
            product.dollarPrice = dollarPrice;
            product.dollarPriceOrg = dollarPriceOrg;
            product.discountRate = rate;
            product.globalSummary = globalSummary;
            product.status = ProductStatus.registered;
            await this.productRepository.save(product);

            if (deleteIdx) {
                if (Array.isArray(deleteIdx)) {
                    for (let i = 0; i < deleteIdx.length; i++) {
                        let idx = deleteIdx[i];
                        let productThumb = await this.productThumbRepository.getProductThumb(idx);
                        let thumbPath = productThumb.thumbPath;
                        let thumbList = await this.productThumbRepository.getThumbListByThumbPath(
                            thumbPath,
                        );
                        for (let j = 0; j < thumbList.length; j++) {
                            let deleteId = thumbList[j].id;
                            let thumb = thumbList[j];
                            let key = thumb.originalThumbName;
                            await this.productThumbRepository.deleteProductThumb(deleteId);
                            imgDelete(key);
                        }
                    }
                } else {
                    let idx = deleteIdx;
                    let productThumb = await this.productThumbRepository.getProductThumb(idx);
                    let thumbPath = productThumb.thumbPath;
                    let thumbList = await this.productThumbRepository.getThumbListByThumbPath(thumbPath);
                    for (let i = 0; i < thumbList.length; i++) {
                        let deleteId = thumbList[i].id;
                        let thumb = thumbList[i];
                        let key = thumb.originalThumbName;
                        await this.productThumbRepository.deleteProductThumb(deleteId);
                        imgDelete(key);
                    }
                }
            }

            await this.hashtagRepository.deleteHashtag(productId);

            if (hashTag) {
                if (Array.isArray(hashTag)) {
                    hashTag.forEach(async (o) => {
                        let productHashTag = await this.hashtagRepository.create();
                        productHashTag.name = o;
                        productHashTag.product = product;
                        await this.hashtagRepository.save(productHashTag);
                    });
                } else {
                    const productHashTag = await this.hashtagRepository.create();
                    productHashTag.name = hashTag;
                    productHashTag.product = product;
                    await this.hashtagRepository.save(productHashTag);
                }
            }

            if (files['thumbGlobal']) {
                for (let i = 0; i < files['thumbGlobal'].length; i++) {
                    let thumb = files['thumbGlobal'][i];
                    let productGlobalThumb = await this.productThumbRepository.create();
                    productGlobalThumb.isGlobal = true;
                    productGlobalThumb.originalThumbName = thumb.key;
                    productGlobalThumb.thumbPath = cloudfrontPath(thumb.key);
                    productGlobalThumb.product = product;
                    let thumbList = await this.productThumbRepository.getManyGlobalThumbS(productId);
                    let chk = false;
                    for (let j = 0; j < thumbList.length; j++) {
                        if (thumbList[j].title == true) {
                            chk = true;
                        }
                    }
                    if (chk == false) {
                        productGlobalThumb.title = true;
                        chk = true;
                    }
                    await this.productThumbRepository.save(productGlobalThumb);
                }
                for (let i = 0; i < files['thumbGlobal'].length; i++) {
                    let thumb = files['thumbGlobal'][i];
                    let productThumb = await this.productThumbRepository.create();
                    productThumb.isGlobal = false;
                    productThumb.originalThumbName = thumb.key;
                    productThumb.thumbPath = cloudfrontPath(thumb.key);
                    productThumb.product = product;
                    let thumbList = await this.productThumbRepository.getManyNotGlobalThumbs(productId);
                    let chk = false;
                    for (let j = 0; j < thumbList.length; j++) {
                        if (thumbList[j].title == true) {
                            chk = true;
                        }
                    }
                    if (chk == false) {
                        productThumb.title = true;
                        chk = true;
                    }
                    await this.productThumbRepository.save(productThumb);
                }
            }

            if (files['sale']) {
                files['sale'].forEach(async (o) => {
                    let productSale = await this.productSaleRepository.getProductSale(productId);
                    productSale.originalSaleName = o.key;
                    productSale.salePath = cloudfrontPath(o.key);
                    productSale.product = product;
                    await this.productSaleRepository.save(productSale);
                });
            }

            const globalDetail = await editorS3(globalDetailContent);
            const detail = await editorS3(globalDetailContent);

            if (globalDetail) {
                globalDetail.items.forEach(async (o) => {
                    let productImage = await this.productImageRepository.create();
                    productImage.originalImageName = o.originalName;
                    productImage.imagePath = o.path;
                    productImage.product = product;
                    await this.productImageRepository.save(productImage);
                });
                product.globalDetail = globalDetail.result;
                product.detail = detail.result;
            }

            if (product.status == ProductStatus.rejected) {
                product.status = ProductStatus.registered;
            }

            await this.productRepository.save(product);

            return { status: 200, resultCode: 1, data: null };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6232, data: null };
        }
    }

    async temp(files: File[], req: any, body: TempProductReqDto): Promise<any> {
        try {
            Logger.log('API - Product Temporary Save');
            const sellerId = req.seller.sellerId;
            const sellerInfo = await this.sellerInfoRepository.getSellerInfo(sellerId);
            const product = await this.temporaryProductRepository.getTemporaryProduct(sellerId);
            const {
                prodName,
                englishProdName,
                price,
                summary,
                globalSummary,
                detailContent,
                globalDetailContent,
                hashTag,
                categoryId,
            } = body;
            if (price === 0) {
                product.free = true;
            }
            product.prodName = prodName;
            product.englishProdName = englishProdName;
            product.price = price;
            product.summary = summary;
            product.globalSummary = globalSummary;
            sellerInfo.temporary = true;
            await this.sellerInfoRepository.save(sellerInfo);

            if (hashTag) {
                product.hashtag = [];
                if (Array.isArray(hashTag)) {
                    hashTag.forEach(async (o) => {
                        product.hashtag.push(o);
                        await this.temporaryProductRepository.save(product);
                    });
                } else {
                    product.hashtag.push(hashTag);
                    await this.temporaryProductRepository.save(product);
                }
            }

            if (categoryId) {
                product.category = categoryId;
            }

            let thumbData = [];
            let thumbGlobalData = [];

            if (files['thumb']) {
                files['thumb'].forEach(async (o, i) => {
                    thumbData.push({
                        originalThumbName: o.key,
                        thumbPath: cloudfrontPath(o.key),
                        isGlobal: false,
                    });
                    if (i == 0) {
                        product.thumb.push({
                            title: true,
                        });
                    } else {
                        product.thumb.push({
                            title: false,
                        });
                    }
                });
                product.thumb = thumbData;
            }

            if (files['thumbGlobal']) {
                files['thumbGlobal'].forEach(async (o, i) => {
                    thumbGlobalData.push({
                        originalThumbName: o.key,
                        thumbPath: cloudfrontPath(o.key),
                        isGlobal: true,
                    });
                    if (i == 0) {
                        product.thumbGlobal.push({
                            title: true,
                        });
                    } else {
                        product.thumbGlobal.push({
                            title: false,
                        });
                    }
                });
                product.thumbGlobal = thumbGlobalData;
            }

            if (files['sale']) {
                files['sale'].forEach(async (o) => {
                    console.log(o);
                    product.sale = {
                        name: o.originalname,
                        originalSaleName: o.key,
                        salePath: o.location,
                    };
                });
            }

            const detail = await editorS3(detailContent);
            const globalDetail = await editorS3(globalDetailContent);

            if (detail) {
                detail.items.forEach(async (o) => {
                    product.image.push({
                        originalImageName: o.originalName,
                        imagePath: o.path,
                    });
                });
                product.detail = detail.result;
            }

            if (globalDetail) {
                globalDetail.items.forEach(async (o) => {
                    product.imageGlobal.push({
                        originalImageName: o.originalName,
                        imagePath: o.path,
                    });
                });
                product.globalDetail = globalDetail.result;
            }

            await this.temporaryProductRepository.save(product);
            return { status: 200, resultCode: 1, data: null };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6241, data: null };
        }
    }

    async priceSync() {
        const row = await this.productRepository.getAllProduct();
        for (let i = 0; i < 100; i++) {
            let productId = row[i].id;
            let product = await this.productRepository.getProduct(productId);
            if (product.discountRate === 0) {
                product.priceOrg = product.price;
                await this.productRepository.save(product);
            }
        }
        return { data: null };
    }

    async fileTest(files: File[], body: any): Promise<any> {
        try {
            let status = 0;
            let resultCode = 0;
            let data = null;
            const { productId } = body;
            console.log(productId);
            const product = await this.productRepository.getProduct(productId);
            await this.connection.transaction(async (manager) => {
                if (files['thumb']) {
                    files['thumb'].forEach(async (o, i) => {
                        let productThumb = await this.productThumbRepository.create();
                        productThumb.isGlobal = false;
                        productThumb.originalThumbName = o.key;
                        productThumb.thumbPath = cloudfrontPath(o.key);
                        productThumb.product = product;
                        if (i == 0) {
                            productThumb.title = true;
                        }
                        await this.productThumbRepository.save(productThumb);
                    });
                }
                if (files['thumbGlobal']) {
                    files['thumbGlobal'].forEach(async (o, i) => {
                        let productGlobalThumb = await this.productThumbRepository.create();
                        productGlobalThumb.isGlobal = true;
                        productGlobalThumb.originalThumbName = o.key;
                        productGlobalThumb.thumbPath = cloudfrontPath(o.key);
                        productGlobalThumb.product = product;
                        if (i == 0) {
                            productGlobalThumb.title = true;
                        }
                        await this.productThumbRepository.save(productGlobalThumb);
                    });
                }
                if (files['sale']) {
                    files['sale'].forEach(async (o) => {
                        let productSale = await this.productSaleRepository.create();
                        productSale.originalSaleName = o.key;
                        productSale.salePath = cloudfrontPath(o.key);
                        productSale.product = product;
                        await this.productSaleRepository.save(productSale);
                    });
                    await manager.save(product);
                }
            });
            status = 200;
            resultCode = 1;
            return { status: status, resultCode: 1, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6208, data: null };
        }
    }

    async uploadS3(files: File[]): Promise<any> {
        try {
            let status = 0;
            let resultCode = 0;
            let data = null;
            files['thumb'].forEach(async (o) => {
                let productThumb = await this.productThumbRepository.create();
                productThumb.originalThumbName = o.key;
                productThumb.thumbPath = cloudfrontPath(o.key);
                await this.productThumbRepository.save(productThumb);
            });
            status = 200;
            resultCode = 1;
            return { status: status, resultCode: 1, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6208, data: null };
        }
    }

    // 서비스 로직

    async addProductData(req: any, body: any): Promise<any> {
        let dollarCurrencyString = null;
        let dollarCurrency = 0;
        var discountRate = 0;
        let stringDollarOrg = null;
        let numberDollarOrg = 0;
        let stringDollar = null;
        let numberDollar = 0;
        let currencyRate = 0;
        const currencyData = await axios.get(
            'https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=0GYQ5npmDp0WGbjW3mOMKxgn9H2R5Gs3&searchdate=20221101&data=AP01',
        );
        currencyData.data.forEach(async (o) => {
            if (o.cur_nm === '미국 달러') {
                dollarCurrencyString = o.bkpr;
            }
        });
        let dollarString = dollarCurrencyString.replace(',', '');
        dollarCurrency = Number(dollarString);
        currencyRate = 1 / dollarCurrency;

        const { prodName, englishProdName, priceOrg, price, skuId, summary, globalSummary, categoryId } =
            body;
        const maxProduct = await this.productRepository.getMaxProduct();
        const sellerId = req.seller.sellerId;
        const seller = await this.sellerRepository.getSeller(sellerId);
        const category = await this.categoryRepository.getCategory(categoryId);
        const productId = maxProduct.max + 1;
        const product = await this.productRepository.create();

        if (priceOrg == 0) {
            discountRate = 0;
            numberDollarOrg = 0;
            numberDollar = 0;
        } else {
            if (price == 0) {
                product.free = true;
                discountRate = 0;
                stringDollarOrg = (priceOrg * currencyRate).toFixed(2);
                numberDollarOrg = Number(stringDollarOrg);
                numberDollar = 0;
            } else {
                discountRate = 100 - Math.floor((price / priceOrg) * 100);
                stringDollarOrg = (priceOrg * currencyRate).toFixed(2);
                numberDollarOrg = Number(stringDollarOrg);
                stringDollar = (price * currencyRate).toFixed(2);
                numberDollar = Number(stringDollar);
            }
        }

        product.id = productId;
        product.productName = prodName;
        product.englishProductName = englishProdName;
        product.priceOrg = priceOrg;
        product.price = price;
        product.dollarPriceOrg = numberDollarOrg;
        product.dollarPrice = numberDollar;
        product.discountRate = discountRate;
        product.skuId = skuId;
        product.summary = summary;
        product.globalSummary = globalSummary;
        product.status = ProductStatus.registered;
        product.category = category;
        product.seller = seller;
        await this.productRepository.save(product);

        return product;
    }

    async addThumbData(req: any, files: File[]): Promise<any> {
        const sellerId = req.seller.sellerId;
        const maxProduct = await this.productRepository.getMaxProduct();
        const productId = maxProduct.max;
        const getOptions = { productId, sellerId };
        const product = await this.productRepository.getProductByProductIdAndSellerId(getOptions);
        if (files['thumb']) {
            for (let i = 0; i < files['thumb'].length; i++) {
                let chk = 0;
                let o = files['thumb'][i];
                let productThumb = await this.productThumbRepository.create();
                productThumb.isGlobal = false;
                productThumb.originalThumbName = o.key;
                productThumb.thumbPath = cloudfrontPath(o.key);
                productThumb.product = product;
                let thumb = await this.productThumbRepository.getThumbListByProductId(productId);

                for (let j = 0; j < thumb.length; j++) {
                    if (thumb[j].title == true) {
                        chk = 1;
                    }
                }

                if (i == 0 && chk == 0) {
                    productThumb.title = true;
                }

                await this.productThumbRepository.save(productThumb);
            }
        }

        if (files['thumbGlobal']) {
            for (let i = 0; i < files['thumbGlobal'].length; i++) {
                let chk = 0;
                let o = files['thumbGlobal'][i];
                let productThumb = await this.productThumbRepository.create();
                productThumb.isGlobal = true;
                productThumb.originalThumbName = o.key;
                productThumb.thumbPath = cloudfrontPath(o.key);
                productThumb.product = product;
                let thumb = await this.productThumbRepository.getGlobalThumbListByProductId(productId);

                for (let j = 0; j < thumb.length; j++) {
                    if (thumb[j].title == true) {
                        chk = 1;
                    }
                }

                if (i == 0 && chk == 0) {
                    productThumb.title = true;
                }

                await this.productThumbRepository.save(productThumb);
            }
        }
    }

    async updateProduct(id: number, body: any): Promise<any> {
        const productId = id;
        const { prodName, englishProdName, summary, globalSummary, price, priceOrg, skuId } = body;
        const currencyData = await axios.get(
            'https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=0GYQ5npmDp0WGbjW3mOMKxgn9H2R5Gs3&searchdate=20221101&data=AP01',
        );
        let dollarCurrencyString = null;
        let dollarCurrency = 0;
        currencyData.data.forEach(async (o) => {
            if (o.cur_nm === '미국 달러') {
                dollarCurrencyString = o.bkpr;
            }
        });
        let dollarString = dollarCurrencyString.replace(',', '');
        dollarCurrency = Number(dollarString);
        const currencyRate = 1 / dollarCurrency;
        let stringDollarOrg = null;
        let numberDollarOrg = 0;
        let stringDollar = null;
        let numberDollar = 0;
        let rate = 0;

        if (priceOrg == 0) {
            rate = 0;
            numberDollarOrg = 0;
            numberDollar = 0;
        } else {
            rate = 100 - Math.floor((price / priceOrg) * 100);
            stringDollarOrg = (priceOrg * currencyRate).toFixed(2);
            numberDollarOrg = Number(stringDollarOrg);
            stringDollar = (price * currencyRate).toFixed(2);
            numberDollar = Number(stringDollar);
        }

        const product = await this.productRepository.getProduct(productId);

        if (price == 0) {
            product.free = true;
        }

        product.productName = prodName;
        product.englishProductName = englishProdName;
        product.priceOrg = priceOrg;
        product.price = price;
        product.dollarPriceOrg = numberDollarOrg;
        product.dollarPrice = numberDollar;
        product.discountRate = rate;
        product.skuId = skuId;
        product.summary = summary;
        product.globalSummary = globalSummary;
        product.status = ProductStatus.registered;
        await this.productRepository.save(product);

        return product;
    }

    async englishUpdateProduct(id: number, body: any): Promise<any> {
        const productId = id;
        const { englishProdName, globalSummary, dollarPrice, dollarPriceOrg, skuId } = body;
        const currencyData = await axios.get(
            'https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=0GYQ5npmDp0WGbjW3mOMKxgn9H2R5Gs3&searchdate=20220921&data=AP01',
        );
        let dollarCurrencyString = null;
        let dollarCurrency = 0;
        currencyData.data.forEach(async (o) => {
            if (o.cur_nm === '미국 달러') {
                dollarCurrencyString = o.bkpr;
            }
        });
        let dollarString = dollarCurrencyString.replace(',', '');
        dollarCurrency = Number(dollarString);
        const currencyRate = dollarCurrency;
        let stringPriceOrg = null;
        let numberPriceOrg = 0;
        let stringPrice = null;
        let numberPrice = 0;
        let rate = 0;

        if (dollarPriceOrg == 0) {
            rate = 0;
            numberPriceOrg = 0;
            numberPrice = 0;
        } else {
            rate = 100 - Math.floor((dollarPrice / dollarPriceOrg) * 100);
            stringPriceOrg = dollarPriceOrg * currencyRate;
            numberPriceOrg = Number(stringPriceOrg);
            numberPriceOrg = Math.floor(numberPriceOrg / 10) * 10;
            stringPrice = dollarPrice * currencyRate;
            numberPrice = Number(stringPrice);
            numberPrice = Math.floor(numberPrice / 10) * 10;
        }

        const product = await this.productRepository.getProduct(productId);

        if (dollarPrice == 0) {
            product.free = true;
        }

        product.productName = englishProdName;
        product.englishProductName = englishProdName;
        product.price = numberPrice;
        product.priceOrg = numberPriceOrg;
        product.dollarPrice = dollarPrice;
        product.dollarPriceOrg = dollarPriceOrg;
        product.discountRate = rate;
        product.skuId = skuId;
        product.globalSummary = globalSummary;
        product.status = ProductStatus.registered;

        await this.productRepository.save(product);
    }

    async deleteThumbData(body: any): Promise<any> {
        const { deleteIdx } = body;

        if (Array.isArray(deleteIdx)) {
            for (let i = 0; i < deleteIdx.length; i++) {
                let idx = deleteIdx[i];
                let productThumb = await this.productThumbRepository.getProductThumb(idx);
                let key = productThumb.originalThumbName;
                await this.productThumbRepository.deleteProductThumb(idx);
                imgDelete(key);
            }
        } else {
            let idx = deleteIdx;
            let productThumb = await this.productThumbRepository.getProductThumb(idx);
            let key = productThumb.originalThumbName;
            await this.productThumbRepository.deleteProductThumb(idx);
            imgDelete(key);
        }
    }

    async addTemplateData(body: any): Promise<any> {
        const { templateId } = body;
        const maxProduct = await this.productRepository.getMaxProduct();
        const productId = maxProduct.max;
        templateId.forEach(async (o) => {
            let id = o;
            let templateColumn = await this.templateColumnRepository.getTemplateColumn(id);
            let product = await this.productRepository.getProduct(productId);
            templateColumn.product.push(product);
            await this.templateColumnRepository.save(templateColumn);
        });
    }

    async updateProductThumb(id: any, files: File[]): Promise<any> {
        const productId = id;
        const product = await this.productRepository.getProduct(productId);

        for (let i = 0; i < files['thumb'].length; i++) {
            let o = files['thumb'][i];
            let productThumb = await this.productThumbRepository.create();
            productThumb.isGlobal = false;
            productThumb.originalThumbName = o.key;
            productThumb.thumbPath = cloudfrontPath(o.key);
            productThumb.product = product;
            let thumb = await this.productThumbRepository.getThumbListByProductId(productId);
            let chk = false;
            for (let j = 0; j < thumb.length; j++) {
                if (thumb[j].title == true) {
                    chk = true;
                }
            }

            if (chk == false) {
                productThumb.title = true;
                chk = true;
            }

            await this.productThumbRepository.save(productThumb);
        }
    }

    async updateProductThumbGlobal(id: any, files: File[]): Promise<any> {
        const productId = id;
        const product = await this.productRepository.getProduct(productId);

        for (let i = 0; i < files['thumbGlobal'].length; i++) {
            let o = files['thumbGlobal'][i];
            let productThumb = await this.productThumbRepository.create();
            productThumb.isGlobal = true;
            productThumb.originalThumbName = o.key;
            productThumb.thumbPath = cloudfrontPath(o.key);
            productThumb.product = product;
            let thumbGlobal = await this.productThumbRepository.getGlobalThumbListByProductId(productId);
            let chk = false;
            for (let j = 0; j < thumbGlobal.length; j++) {
                if (thumbGlobal[j].title == true) {
                    chk = true;
                }
            }

            if (chk == false) {
                productThumb.title = true;
                chk = true;
            }

            await this.productThumbRepository.save(productThumb);
        }
    }

    async updateEnglishProductThumb(id: number, files: File[]): Promise<any> {
        const productId = id;
        const product = await this.productRepository.getProduct(productId);

        for (let i = 0; i < files['thumb'].length; i++) {
            let o = files['thumb'][i];
            let productThumb = await this.productThumbRepository.create();
            productThumb.isGlobal = true;
            productThumb.originalThumbName = o.key;
            productThumb.thumbPath = cloudfrontPath(o.key);
            productThumb.product = product;
            let thumb = await this.productThumbRepository.getThumbListByProductId(productId);
            let chk = false;
            for (let j = 0; j < thumb.length; j++) {
                if (thumb[j].title == true) {
                    chk = true;
                }
            }

            if (chk == false) {
                productThumb.title = true;
                chk = true;
            }

            await this.productThumbRepository.save(productThumb);
        }

        for (let i = 0; i < files['thumb'].length; i++) {
            let o = files['thumb'][i];
            let productThumb = await this.productThumbRepository.create();
            productThumb.isGlobal = false;
            productThumb.originalThumbName = o.key;
            productThumb.thumbPath = cloudfrontPath(o.key);
            productThumb.product = product;
            let thumb = await this.productThumbRepository.getThumbListByProductId(productId);
            let chk = false;
            for (let j = 0; j < thumb.length; j++) {
                if (thumb[j].title == true) {
                    chk = true;
                }
            }

            if (chk == false) {
                productThumb.title = true;
                chk = true;
            }

            await this.productThumbRepository.save(productThumb);
        }
    }

    async addHashTagData(body: any): Promise<any> {
        const { hashTag } = body;
        const maxProduct = await this.productRepository.getMaxProduct();
        const productId = maxProduct.max;
        const product = await this.productRepository.getProduct(productId);

        if (Array.isArray(hashTag)) {
            hashTag.forEach(async (o) => {
                let productHashTag = await this.hashtagRepository.create();
                productHashTag.name = o;
                productHashTag.product = product;
                await this.hashtagRepository.save(productHashTag);
            });
        } else {
            const productHashTag = await this.hashtagRepository.create();
            productHashTag.name = hashTag;
            productHashTag.product = product;
            await this.hashtagRepository.save(productHashTag);
        }
    }

    async deleteHashTag(): Promise<any> {
        const maxProduct = await this.productRepository.getMaxProduct();
        const productId = maxProduct.max;
        await this.hashtagRepository.deleteHashtag(productId);
    }

    async updateHashTag(body: any, id: any): Promise<any> {
        const { hashTag } = body;
        const productId = id;
        const product = await this.productRepository.getProduct(productId);

        if (Array.isArray(hashTag)) {
            hashTag.forEach(async (o) => {
                let productHashTag = await this.hashtagRepository.create();
                productHashTag.name = o;
                productHashTag.product = product;
                await this.hashtagRepository.save(productHashTag);
            });
        } else {
            const productHashTag = await this.hashtagRepository.create();
            productHashTag.name = hashTag;
            productHashTag.product = product;
            await this.hashtagRepository.save(productHashTag);
        }
    }

    async updateAndDeleteHashTag(id: any): Promise<any> {
        const productId = id;
        await this.hashtagRepository.deleteHashtag(productId);
    }

    async addTemporaryProductThumb(body: any): Promise<any> {
        const { sellerId } = body;
        const temp = await this.temporaryProductRepository.getTemporaryProduct(sellerId);
        const maxProduct = await this.productRepository.getMaxProduct();
        const productId = maxProduct.max;
        const product = await this.productRepository.getProduct(productId);

        for (let i = 0; i < temp.thumb.length; i++) {
            let productThumb = await this.productThumbRepository.create();
            productThumb.isGlobal = false;
            productThumb.originalThumbName = temp.thumb[i].originalThumbName;
            productThumb.thumbPath = temp.thumb[i].thumbPath;
            productThumb.product = product;
            if (i == 0) {
                productThumb.title = true;
            }
            await this.productThumbRepository.save(productThumb);
        }
    }

    async addTemporaryProductGlobalThumb(body: any): Promise<any> {
        const { sellerId } = body;
        const temp = await this.temporaryProductRepository.getTemporaryProduct(sellerId);
        const maxProduct = await this.productRepository.getMaxProduct();
        const productId = maxProduct.max;
        const product = await this.productRepository.getProduct(productId);

        for (let i = 0; i < temp.thumbGlobal.length; i++) {
            let productThumb = await this.productThumbRepository.create();
            productThumb.isGlobal = true;
            productThumb.originalThumbName = temp.thumb[i].originalThumbName;
            productThumb.thumbPath = temp.thumb[i].thumbPath;
            productThumb.product = product;
            if (i == 0) {
                productThumb.title = true;
            }
            await this.productThumbRepository.save(productThumb);
        }
    }

    async addSaleData(files: File[]): Promise<any> {
        const maxProduct = await this.productRepository.getMaxProduct();
        const productId = maxProduct.max;
        const product = await this.productRepository.getProduct(productId);

        files['sale'].forEach(async (o) => {
            let productSale = await this.productSaleRepository.create();
            productSale.originalSaleName = o.key;
            productSale.salePath = cloudfrontPath(o.key);
            productSale.product = product;
            await this.productSaleRepository.save(productSale);
        });
    }

    async updateSaleData(id: any, files: File[]): Promise<any> {
        const productId = id;
        const product = await this.productRepository.getProduct(productId);

        files['sale'].forEach(async (o) => {
            let productSale = await this.productSaleRepository.getProductSale(productId);
            productSale.originalSaleName = o.key;
            productSale.salePath = cloudfrontPath(o.key);
            productSale.product = product;
            await this.productSaleRepository.save(productSale);
        });
    }

    async addDetailData(body: any): Promise<any> {
        const { detailContent } = body;
        const maxProduct = await this.productRepository.getMaxProduct();
        const productId = maxProduct.max;
        const detail = await editorS3(detailContent);
        const product = await this.productRepository.getProduct(productId);
        const result = detail.result;

        detail.items.forEach(async (o) => {
            let productImage = await this.productImageRepository.create();
            productImage.originalImageName = o.originalName;
            productImage.isGlobal = false;
            productImage.imagePath = o.path;
            productImage.product = product;
            await this.productImageRepository.save(productImage);
        });
        product.detail = result;

        await this.productRepository.save(product);
    }

    async addGlobalDetailData(body: any): Promise<any> {
        const { globalDetailContent } = body;
        const maxProduct = await this.productRepository.getMaxProduct();
        const productId = maxProduct.max;
        const globalDetail = await editorS3(globalDetailContent);
        const product = await this.productRepository.getProduct(productId);
        const result = globalDetail.result;

        globalDetail.items.forEach(async (o) => {
            let productImage = await this.productImageRepository.create();
            productImage.originalImageName = o.originalName;
            productImage.isGlobal = true;
            productImage.imagePath = o.path;
            productImage.product = product;
            await this.productImageRepository.save(productImage);
        });
        product.globalDetail = result;

        await this.productRepository.save(product);
    }

    async updateDetailData(id: any, body: any): Promise<any> {
        const productId = id;
        const { detailContent } = body;
        const product = await this.productRepository.getProduct(productId);
        const detail = await editorS3(detailContent);
        const result = detail.result;

        detail.items.forEach(async (o) => {
            let productImage = await this.productImageRepository.create();
            productImage.originalImageName = o.originalName;
            productImage.imagePath = o.path;
            productImage.product = product;
            await this.productImageRepository.save(productImage);
        });
        product.detail = result;

        await this.productRepository.save(product);
    }

    async updateGlobalDetailData(id: number, body: any): Promise<any> {
        const productId = id;
        const { globalDetailContent } = body;
        const product = await this.productRepository.getProduct(productId);
        const globalDetail = await editorS3(globalDetailContent);
        const result = globalDetail.result;

        globalDetail.items.forEach(async (o) => {
            let productImage = await this.productImageRepository.create();
            productImage.originalImageName = o.originalName;
            productImage.imagePath = o.path;
            productImage.product = product;
            await this.productImageRepository.save(productImage);
        });
        product.globalDetail = result;

        await this.productRepository.save(product);
    }

    async updateEnglishDetailData(id: number, body: any): Promise<any> {
        const productId = id;
        const { globalDetailContent } = body;
        const product = await this.productRepository.getProduct(productId);
        const detail = await editorS3(globalDetailContent);
        const globalDetail = await editorS3(globalDetailContent);
        const result = globalDetail.result;

        globalDetail.items.forEach(async (o) => {
            let productImage = await this.productImageRepository.create();
            productImage.originalImageName = o.originalName;
            productImage.imagePath = o.path;
            productImage.product = product;
            await this.productImageRepository.save(productImage);
        });
        product.globalDetail = globalDetail.result;
        product.detail = detail.result;

        await this.productRepository.save(product);
    }

    async resetTemporaryProductData(req: any): Promise<any> {
        const sellerId = req.seller.sellerId;
        const sellerInfo = await this.sellerInfoRepository.getSellerInfo(sellerId);
        const temp = await this.temporaryProductRepository.getTemporaryProduct(sellerId);
        sellerInfo.temporary = false;
        temp.prodName = null;
        temp.englishProdName = null;
        temp.discountRate = 0;
        temp.priceOrg = 0;
        temp.price = 0;
        temp.dollarPriceOrg = 0;
        temp.dollarPrice = 0;
        temp.summary = null;
        temp.globalSummary = null;
        temp.detail = null;
        temp.globalDetail = null;
        temp.thumb = null;
        temp.thumbGlobal = null;
        temp.image = null;
        temp.sale = null;
        temp.hashtag = null;
        temp.category = null;
        temp.image = null;
        await this.sellerInfoRepository.save(sellerInfo);
        await this.temporaryProductRepository.save(temp);
    }

    async addEnglishProductData(req: any, body: any): Promise<any> {
        const { categoryId, englishProdName, dollarPriceOrg, dollarPrice, globalSummary, skuId } = body;
        let dollarCurrencyString = null;
        let dollarCurrency = 0;
        var discountRate = 0;
        let stringPriceOrg = null;
        let numberPriceOrg = 0;
        let stringPrice = null;
        let numberPrice = 0;
        const currencyData = await axios.get(
            'https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=0GYQ5npmDp0WGbjW3mOMKxgn9H2R5Gs3&searchdate=20221101&data=AP01',
        );
        currencyData.data.forEach(async (o) => {
            if (o.cur_nm === '미국 달러') {
                dollarCurrencyString = o.bkpr;
            }
        });
        let dollarString = dollarCurrencyString.replace(',', '');
        dollarCurrency = Number(dollarString);
        const currencyRate = dollarCurrency;
        const maxProduct = await this.productRepository.getMaxProduct();
        const sellerId = req.seller.sellerId;
        const seller = await this.sellerRepository.getSeller(sellerId);
        const category = await this.categoryRepository.getCategory(categoryId);
        const productId = maxProduct.max + 1;
        const product = await this.productRepository.create();

        if (dollarPriceOrg == 0) {
            discountRate = 0;
            numberPriceOrg = 0;
            numberPrice = 0;
        } else {
            if (dollarPrice == 0) {
                product.free = true;
                discountRate = 0;
                stringPriceOrg = dollarPriceOrg * currencyRate;
                numberPriceOrg = Number(stringPriceOrg);
                numberPriceOrg = Math.floor((numberPriceOrg / 10) * 10);
                numberPrice = 0;
            } else {
                discountRate = 100 - Math.floor((dollarPrice / dollarPriceOrg) * 100);
                stringPriceOrg = dollarPriceOrg * currencyRate;
                numberPriceOrg = Number(stringPriceOrg);
                numberPriceOrg = Math.floor((numberPriceOrg / 10) * 10);
                stringPrice = dollarPrice * currencyRate;
                numberPrice = Number(stringPrice);
                numberPrice = Math.floor((numberPrice / 10) * 10);
            }
        }

        product.id = productId;
        product.productName = englishProdName;
        product.englishProductName = englishProdName;
        product.discountRate = discountRate;
        product.summary = globalSummary;
        product.globalSummary = globalSummary;
        product.status = ProductStatus.registered;
        product.category = category;
        product.price = numberPrice;
        product.priceOrg = numberPriceOrg;
        product.dollarPrice = dollarPrice;
        product.dollarPriceOrg = dollarPriceOrg;
        product.skuId = skuId;
        product.seller = seller;
        await this.productRepository.save(product);

        return product;
    }

    async addEnglishThumbData(req: any, files: File[]): Promise<any> {
        const sellerId = req.seller.sellerId;
        const maxProduct = await this.productRepository.getMaxProduct();
        const productId = maxProduct.max;
        const getOptions = { productId, sellerId };
        const product = await this.productRepository.getProductByProductIdAndSellerId(getOptions);
        if (files['thumbGlobal']) {
            for (let i = 0; i < files['thumbGlobal'].length; i++) {
                let chk = 0;
                let o = files['thumbGlobal'][i];
                let productThumb = await this.productThumbRepository.create();
                productThumb.isGlobal = true;
                productThumb.originalThumbName = o.key;
                productThumb.thumbPath = cloudfrontPath(o.key);
                productThumb.product = product;
                let thumb = await this.productThumbRepository.getThumbListByProductId(productId);

                for (let j = 0; j < thumb.length; j++) {
                    if (thumb[j].title == true) {
                        chk = 1;
                    }
                }

                if (i == 0 && chk == 0) {
                    productThumb.title = true;
                }

                await this.productThumbRepository.save(productThumb);
            }

            for (let i = 0; i < files['thumbGlobal'].length; i++) {
                let chk = 0;
                let o = files['thumbGlobal'][i];
                let productThumb = await this.productThumbRepository.create();
                productThumb.isGlobal = false;
                productThumb.originalThumbName = o.key;
                productThumb.thumbPath = cloudfrontPath(o.key);
                productThumb.product = product;
                let thumb = await this.productThumbRepository.getThumbListByProductId(productId);

                for (let j = 0; j < thumb.length; j++) {
                    if (thumb[j].title == true) {
                        chk = 1;
                    }
                }

                if (i == 0 && chk == 0) {
                    productThumb.title = true;
                }

                await this.productThumbRepository.save(productThumb);
            }
        }
    }

    async getProductList(req: any, body: any): Promise<any> {
        const resData = await this.productRepository.getProductList(req, body);
        let pData = resData.pData;
        let prodData = resData.prodData;
        let items = resData.items;
        let items2 = resData.items2;

        for (let i = 0; i < pData.length; i++) {
            if (pData[i].saleCount === null) {
                pData[i].saleCount = 0;
            }
            items[i] = {
                productId: pData[i].id,
                prodName: pData[i].productName,
                englishProdName: pData[i].englishProductName,
                discountRate: pData[i].discountRate,
                priceOrg: pData[i].priceOrg,
                price: pData[i].price,
                dollarPriceOrg: pData[i].dollarPriceOrg,
                dollarPrice: pData[i].dollarPrice,
                skuId: pData[i].skuId,
                saleCount: pData[i].saleCount,
                productStatus: pData[i].status,
                validMsg: pData[i].validMsg,
                createdAt: pData[i].createdAt,
                updatedAt: pData[i].updatedAt,
                categoryName: pData[i].category.categoryName,
                thumb: null,
            };
            pData[i].thumb.forEach((t) => {
                if (t.title && !t.isGlobal) {
                    items[i].thumb = t.thumbPath;
                }
            });
        }

        for (let i = 0; i < prodData.length; i++) {
            if (prodData[i].saleCount === null) {
                prodData[i].saleCount = 0;
            }
            items2[i] = {
                productId: prodData[i].id,
                prodName: prodData[i].productName,
                englishProdName: prodData[i].englishProductName,
                priceOrg: prodData[i].priceOrg,
                price: prodData[i].price,
                dollarPriceOrg: prodData[i].dollarPriceOrg,
                dollarPrice: prodData[i].dollarPrice,
                discountRate: prodData[i].discountRate,
                skuId: prodData[i].skuId,
                saleCount: prodData[i].saleCount,
                productStatus: prodData[i].status,
                validMsg: prodData[i].validMsg,
                createdAt: prodData[i].createdAt,
                updatedAt: prodData[i].updatedAt,
                categoryName: prodData[i].category.categoryName,
                thumb: null,
            };
            prodData[i].thumb.forEach((t) => {
                if (t.title && !t.isGlobal) {
                    items2[i].thumb = t.thumbPath;
                }
            });
        }

        let data = {
            items: items,
            items2: items2,
        };

        return data;
    }

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
