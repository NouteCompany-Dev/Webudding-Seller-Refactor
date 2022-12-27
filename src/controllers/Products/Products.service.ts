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
dotenv.config();

@Injectable()
export class ProductsService {
    constructor(
        // Repository
        private productRepository: ProductRepository,
        private productThumbRepository: ProductThumbRepository,
        private productImageRepository: ProductImageRepository,
        private productSaleRepository: ProductSaleRepository,
        private categoryRepository: CategoryRepository,
        private hashtagRepository: HashtagRepository,
        private templateColumnRepository: TemplateColumnRepository,
        private temporaryProductRepository: TemporaryProductRepository,
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
            // 환율 데이터 조회
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
                // 무료 상품
                if (price == 0) {
                    discountRate = 0;
                    stringDollarOrg = (priceOrg * currencyRate).toFixed(2);
                    numberDollarOrg = Number(stringDollarOrg);
                    numberDollar = 0;
                }
                // 유료 상품
                else {
                    discountRate = 100 - Math.floor((price / priceOrg) * 100);
                    stringDollarOrg = (priceOrg * currencyRate).toFixed(2);
                    numberDollarOrg = Number(stringDollarOrg);
                    stringDollar = (price * currencyRate).toFixed(2);
                    numberDollar = Number(stringDollar);
                }
            }
            const maxProduct = await this.productRepository.getMaxProduct();
            // 가장 큰 숫자의 상품 번호 + 1로 할당
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
                // 상품 썸네일 삭제(다수)
                if (Array.isArray(deleteIdx)) {
                    for (let i = 0; i < deleteIdx.length; i++) {
                        let idx = deleteIdx[i];
                        let productThumb = await this.productThumbRepository.getProductThumb(idx);
                        let key = productThumb.originalThumbName;
                        await this.productThumbRepository.deleteProductThumb(idx);
                        imgDelete(key);
                    }
                }
                // 상품 썸네일 삭제(단일)
                else {
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
                // 해시태그 입력(다수)
                if (Array.isArray(hashTag)) {
                    hashTag.forEach(async (o) => {
                        let productHashTag = await this.hashtagRepository.create();
                        productHashTag.name = o;
                        productHashTag.product = product;
                        await this.hashtagRepository.save(productHashTag);
                    });
                }
                // 해시태그 입력(단일)
                else {
                    let productHashTag = await this.hashtagRepository.create();
                    productHashTag.name = hashTag;
                    productHashTag.product = product;
                    await this.hashtagRepository.save(productHashTag);
                }
            }

            // 국내 썸네일 혹은 해외 썸네일이 없을 경우
            if (!files['thumb'] && !files['thumbGlobal']) {
                status = 201;
                resultCode = 6201;
                return { status: status, resultCode: resultCode, data: data };
            }

            // 상품 썸네일 업로드
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
                    // 대표 썸네일 개수 검증
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

            // 상품 해외 썸네일 업로드
            if (files['thumbGlobal']) {
                for (let i = 0; i < files['thumbGlobal'].length; i++) {
                    let chk = 0;
                    let o = files['thumbGlobal'][i];
                    let productThumb = await this.productThumbRepository.create();
                    productThumb.isGlobal = true;
                    productThumb.originalThumbName = o.key;
                    productThumb.thumbPath = cloudfrontPath(o.key);
                    productThumb.product = product;
                    let thumb = await this.productThumbRepository.getManyGlobalThumbs(productId);
                    // 대표 썸네일 개수 검증
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

            // 임시 저장 상품 썸네일 업로드
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

            // 임시 저장 상품 해외 썸네일 업로드
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

            // 고객 제공용 파일이 없을 경우
            if (!files['sale']) {
                status = 202;
                resultCode = 6202;
                return { status: status, resultCode: resultCode, data: data };
            }

            // 고객 제공용 파일 업로드
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

            // 상품 디테일 입력
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

            // 상품 해외 디테일 입력
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
            // 상품 SKU 아이디 중복 확인
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
            //         let productThumb = getRepository(ProductThumb).create();
            //         productThumb.isGlobal = true;
            //         productThumb.originalThumbName = temp.thumb[i].originalThumbName;
            //         productThumb.thumbPath = temp.thumb[i].thumbPath;
            //         productThumb.product = product;
            //         if(i == 0) {
            //             productThumb.title = true;
            //         }
            //         await getRepository(ProductThumb).save(productThumb);
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

    async productTemplate(body: any): Promise<any> {
        try {
            const { categoryId } = body;
            let data = null;
            let templateData = [];
            let columnList = null;
            let templateQuery = await this.categoryRepository.getTemplateRowAndCategory(categoryId);
            let templateRowData = templateQuery.row;
            for (let i = 0; i < templateRowData.length; i++) {
                let rowId = templateRowData[i].id;
                let templateColumnData = await this.templateColumnRepository.getTemplateColumnList(rowId);

                for (let j = 0; j < templateColumnData.length; j++) {
                    columnList = {
                        rowId: rowId,
                        columnId: templateColumnData[j].id,
                        columnName: templateColumnData[j].name,
                    };
                    templateData.push(columnList);
                }
            }
            data = {
                templateData,
            };
            return data;
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: -1, data: null };
        }
    }

    async getProductTemplate(): Promise<any> {
        try {
            let status = 0;
            let resultCode = 0;
            let data = null;
            let templateList = Array();
            let categoryList = await this.categoryRepository.getFirstCategoryAndRow();
            for (let i = 0; i < categoryList.length; i++) {
                let categoryId = categoryList[i].id;
                let rowList = categoryList[i].row;
                templateList.push({ categoryId: categoryId });
                let rowNameList = Array();
                for (let j = 0; j < rowList.length; j++) {
                    let rowName = rowList[j].name;
                    let enRowName = rowList[j].englishName;
                    let rowId = rowList[j].id;
                    let columnNameList = Array();
                    rowNameList.push({
                        rowId: rowId,
                        rowName: rowName,
                        enRowName: enRowName,
                    });
                    let columnList = await this.templateColumnRepository.getTemplateColumnList(rowId);
                    for (let k = 0; k < columnList.length; k++) {
                        let columnName = columnList[k].name;
                        let enColumnName = columnList[k].englishName;
                        columnNameList.push({
                            columnName: columnName,
                            enColumnName: enColumnName,
                        });
                    }
                    rowNameList[j] = { ...rowNameList[j], columnNameList };
                }
                templateList[i] = { ...templateList[i], rowNameList };
            }
            status = 200;
            resultCode = 1;
            return { status: status, resultCode: resultCode, data: templateList };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: -1, data: null };
        }
    }

    async list(req: any, body: ProductListReqDto): Promise<any> {
        try {
            Logger.log('API - Seller Product List');
            const { categoryId, search, searchOption, page, sort } = body;
            const sellerId = req.seller.sellerId;
            let status = 0;
            let resultCode = 0;
            let productData = [];
            let items = [];
            let items2 = [];
            let pData = [];
            let prodData = [];
            for (let i = 0; i < categoryId.length; i++) {
                let idx = categoryId[i];
                let prodQuery = this.productRepository
                    .query()
                    .leftJoinAndSelect('p.category', 'pc')
                    .leftJoinAndSelect('p.thumb', 'pt')
                    .where('p.categoryId = :idx', { idx: idx })
                    .andWhere('p.sellerId = :sellerId', { sellerId: sellerId });
                if (search) {
                    if (searchOption == 'name') {
                        prodQuery.andWhere('p.productName like :search', { search: `%${search}%` });
                    } else if (searchOption == 'sku') {
                        prodQuery.andWhere('p.skuId like :search', { search: `%${search}%` });
                    }
                }
                let prodResult = await prodQuery.getMany();
                for (let j = 0; j < prodResult.length; j++) {
                    prodData.push(prodResult[j]);
                }
                let pQuery = this.productRepository
                    .query()
                    .leftJoinAndSelect('p.category', 'pc')
                    .leftJoinAndSelect('p.thumb', 'pt')
                    .leftJoinAndSelect('pc.parent', 'pcp')
                    .andWhere('pcp.id = :idx', { idx })
                    .andWhere('p.sellerId = :sellerId', { sellerId });
                if (search) {
                    if (searchOption == 'name') {
                        pQuery.andWhere('p.productName like :search', { search: `%${search}%` });
                    } else if (searchOption == 'sku') {
                        pQuery.andWhere('p.skuId like :search', { search: `%${search}%` });
                    }
                }
                let pResult = await pQuery.getMany();
                for (let j = 0; j < pResult.length; j++) {
                    pData.push(pResult[j]);
                }
            }
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
            let res = {
                items: items,
                items2: items2,
            };
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
            if (saleStop === 'true' && saleResume == 'false') {
                product.status = ProductStatus.stopped;
            } else if (saleStop === 'false' && saleResume === 'true') {
                product.status = ProductStatus.registered;
            } else {
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
                            let deleteIdx = thumbList[j].id;
                            let thumb = thumbList[j];
                            let key = thumb.originalThumbName;
                            await this.productThumbRepository.deleteProductThumb(deleteIdx);
                            imgDelete(key);
                        }
                    }
                } else {
                    let idx = deleteIdx;
                    let productThumb = await this.productThumbRepository.getProductThumb(idx);
                    let thumbPath = productThumb.thumbPath;
                    let thumbList = await this.productThumbRepository.getThumbListByThumbPath(thumbPath);
                    for (let i = 0; i < thumbList.length; i++) {
                        let deleteIdx = thumbList[i].id;
                        let thumb = thumbList[i];
                        let key = thumb.originalThumbName;
                        await this.productThumbRepository.deleteProductThumb(deleteIdx);
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
                    let thumbList = await this.productThumbRepository.getGlobalThumbListByProductId(
                        productId,
                    );
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
                    let thumbList = await this.productThumbRepository.getThumbListByProductId(productId);
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

            product.status = ProductStatus.registered;
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
        const row = await this.productRepository.query().getMany();
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
            }
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
}
