import { SellerLedgerRepository } from 'src/repository/SellerLedger.repository';
import { UpdateToCorpReqDto, UpdateToPersonalReqDto } from './dto/req/UpdateSellerTypeReq.dto';
import { Injectable, Logger } from '@nestjs/common';
import { GenDigestPwd, aesEncrypt } from 'src/lib/crypto';
import { cloudfrontPath } from 'src/modules/cloudfront';
import { Connection } from 'typeorm';
import {
    UpdateSellerReqDto,
    UpdateBrandReqDto,
    UpdateLedgerReqDto,
    UpdateEnglishSellerReqDto,
    UpdateEnglishLedgerReqDto,
} from './dto/req/UpdateSellersReq.dto';
import { FindSellerEmailReqDto, FindSellerPasswordReqDto } from './dto/req/FindSellerInfoReq.dto';
import * as dotenv from 'dotenv';
import { BusinessOption, Currency, LedgerStatus } from 'src/entity/enum/enum';
import { SellerRepository } from 'src/repository/Seller.repository';
import { SellerInfoRepository } from 'src/repository/sellerInfo.repository';
import { SellerPopbillAccountRepository } from 'src/repository/sellerPopbillAccount.repository';
import { TemporaryProductRepository } from 'src/repository/temporaryProduct.repository';
import { CategoryRepository } from 'src/repository/Category.repository';
import { SellerFileRepository } from 'src/repository/sellerFile.repository';
import { BaroBillReqDto, DanalReqDto } from '../Auth/dto/req/ThirdPartyReq.dto';
import axios from 'axios';
dotenv.config();

@Injectable()
export class SellersService {
    constructor(
        private connection: Connection,
        // Repository
        private sellerRepository: SellerRepository,
        private sellerInfoRepository: SellerInfoRepository,
        private sellerPopbillAccountRepository: SellerPopbillAccountRepository,
        private sellerFileRepository: SellerFileRepository,
        private sellerLedgerRepository: SellerLedgerRepository,
        private categoryRepository: CategoryRepository,
        private temporaryProductRepository: TemporaryProductRepository,
    ) {}

    async info(req: any): Promise<any> {
        try {
            Logger.log(`API - Seller Info`);
            let status = 0;
            let resultCode = 0;
            let data = null;
            const sellerId = req.seller.sellerId;
            const seller = await this.sellerPopbillAccountRepository.getSellerPopbillAccount(sellerId);

            if (seller == undefined) {
                status = 201;
                resultCode = 6101;
            } else {
                data = await this.getInfo(req);
                status = 200;
                resultCode = 1;
            }

            return { status: status, resultCode: resultCode, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6102, data: null };
        }
    }

    async enInfo(req: any): Promise<any> {
        try {
            Logger.log(`API - English Seller Info`);
            let status = 0;
            let resultCode = 0;
            let data = null;
            const sellerId = req.seller.sellerId;
            const seller = await this.sellerRepository.getSeller(sellerId);

            if (seller == undefined) {
                status = 201;
                resultCode = 6103;
            } else {
                data = await this.getEnInfo(req);
                status = 200;
                resultCode = 1;
            }

            return { status: status, resultCode: resultCode, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6104, data: null };
        }
    }

    async adminUpdate(req: any, body: UpdateSellerReqDto): Promise<any> {
        try {
            Logger.log(`API - Seller Admin Info Update`);
            let status = 0;
            let resultCode = 0;
            let data = null;
            const sellerId = req.seller.sellerId;
            const { password, newPassword, email, phone, residentNumber } = body;
            const seller = await this.sellerRepository.getSeller(sellerId);
            const sellerInfo = await this.sellerInfoRepository.getSellerInfo(sellerId);
            const pass = seller.password;
            let encryptPhoneNumber = await this.sellerRepository.encryptPhone(phone);
            let hashPassword = GenDigestPwd(password);

            if (hashPassword != pass) {
                status = 201;
                resultCode = 6111;
            } else {
                await this.connection.transaction(async (manager) => {
                    if (newPassword !== null) {
                        let hashNewPassword = GenDigestPwd(newPassword);
                        seller.password = hashNewPassword;
                    }
                    if (residentNumber) {
                        if (seller.registType == true) {
                            let dencryptResidentNumber = await this.sellerRepository.dencryptResidentNumber(
                                residentNumber,
                            );
                            sellerInfo.residentNumber =
                                typeof dencryptResidentNumber === 'string' ? dencryptResidentNumber : '';
                        } else {
                            sellerInfo.residentNumber = residentNumber;
                        }
                    }
                    seller.email = email;
                    seller.phone = typeof encryptPhoneNumber === 'string' ? encryptPhoneNumber : '';
                    await manager.save(seller);
                });

                status = 200;
                resultCode = 1;
            }

            return { status: status, resultCode: resultCode, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6112, data: null };
        }
    }

    async enSellerUpdate(req: any, body: UpdateEnglishSellerReqDto): Promise<any> {
        try {
            Logger.log(`API - English Seller Admin Info Update`);
            let status = 0;
            let resultCode = 0;
            let data = null;
            const sellerId = req.seller.sellerId;
            const { name, password, newPassword, email, verifyCode, phone } = body;
            const seller = await this.sellerRepository.getSeller(sellerId);
            const pass = seller.password;
            let encryptPhoneNumber = await this.sellerRepository.encryptPhone(phone);
            let hashPassword = GenDigestPwd(password);

            if (hashPassword != pass) {
                status = 201;
                resultCode = 6113;
            } else {
                await this.connection.transaction(async (manager) => {
                    const sellerInfo = await this.sellerInfoRepository.getSellerInfo(sellerId);

                    if (newPassword !== null) {
                        let hashNewPassword = GenDigestPwd(newPassword);
                        seller.password = hashNewPassword;
                    }

                    seller.email = email;

                    if (!verifyCode) {
                        status = 202;
                        resultCode = 6114;
                    }

                    seller.phone = typeof encryptPhoneNumber === 'string' ? encryptPhoneNumber : '';
                    sellerInfo.name = name;
                    await manager.save(seller);
                    await manager.save(sellerInfo);
                });
                status = 200;
                resultCode = 1;
            }

            return { status: status, resultCode: resultCode, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6115, data: null };
        }
    }

    async brandUpdate(files: File[], req: any, body: UpdateBrandReqDto): Promise<any> {
        try {
            Logger.log('API - Seller Brand Info Update');
            let status = 0;
            let resultCode = 0;
            let data = null;
            const sellerId = req.seller.sellerId;
            const { brandStory, englishBrandStory } = body;
            const seller = await this.sellerRepository.getSeller(sellerId);

            if (!seller) {
                status = 201;
                resultCode = 6121;
            } else {
                await this.connection.transaction(async (manager) => {
                    const sellerInfo = await this.sellerInfoRepository.getSellerInfo(sellerId);
                    sellerInfo.brandStory = brandStory;
                    sellerInfo.englishBrandStory = englishBrandStory;

                    if (files['profile']) {
                        sellerInfo.brandImage = cloudfrontPath(files['profile'][0].key);
                    }

                    await manager.save(sellerInfo);
                });

                status = 200;
                resultCode = 1;
            }

            return { status: status, resultCode: resultCode, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6122, data: null };
        }
    }

    async ledgerUpdate(req: any, body: UpdateLedgerReqDto): Promise<any> {
        try {
            Logger.log('API - Seller Ledger Info Update');
            let status = 0;
            let resultCode = 0;
            let data = null;
            const sellerId = req.seller.sellerId;
            const { bankName, bankAccount, depositor } = body;
            const seller = await this.sellerRepository.getSeller(sellerId);
            let encryptAccountNumber = await this.sellerRepository.encryptBankAccount(bankAccount);

            if (!seller) {
                status = 201;
                resultCode = 6131;
            } else {
                await this.connection.transaction(async (manager) => {
                    const sellerInfo = await this.sellerInfoRepository.getSellerInfo(sellerId);
                    sellerInfo.bankName = bankName;
                    sellerInfo.bankAccount =
                        typeof encryptAccountNumber === 'string' ? encryptAccountNumber : '';
                    sellerInfo.depositor = depositor;
                    await manager.save(sellerInfo);
                });

                status = 200;
                resultCode = 1;
            }

            return { status: status, resultCode: resultCode, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6132, data: null };
        }
    }

    async enLedgerUpdate(req: any, body: UpdateEnglishLedgerReqDto): Promise<any> {
        try {
            Logger.log('API - English Seller Ledger Info Update');
            let status = 0;
            let resultCode = 0;
            let data = null;
            const sellerId = req.seller.sellerId;
            const { name, ledgerType, ledgerEmail } = body;

            await this.connection.transaction(async (manager) => {
                const sellerInfo = await this.sellerInfoRepository.getSellerInfo(sellerId);
                sellerInfo.name = name;
                sellerInfo.ledgerType = ledgerType;
                sellerInfo.ledgerEmail = ledgerEmail;
                await manager.save(sellerInfo);
            });

            status = 200;
            resultCode = 1;

            return { status: status, resultCode: resultCode, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6132, data: null };
        }
    }

    async updateToCorp(files: File[], req: any, body: UpdateToCorpReqDto): Promise<any> {
        try {
            Logger.log('API - Personal Seller Update To Corporation Type');
            let status = 0;
            let resultCode = 0;
            let data = null;
            let { corNum, representativeName, businessName } = body;
            const sellerId = req.seller.sellerId;

            await this.connection.transaction(async (manager) => {
                const seller = await this.sellerRepository.getSeller(sellerId);
                const sellerInfo = await this.sellerInfoRepository.getSellerInfo(sellerId);
                const sellerPopbillAccount =
                    await this.sellerPopbillAccountRepository.getSellerPopbillAccount(sellerId);
                sellerPopbillAccount.representativeName = representativeName;
                sellerPopbillAccount.businessName = businessName;
                await manager.save(sellerPopbillAccount);

                sellerInfo.businessOption = BusinessOption.business;
                sellerInfo.businessNumber = corNum;
                sellerInfo.residentNumber = null;
                sellerInfo.popbillChecked = true;
                await manager.save(sellerInfo);

                let taxTypeData = await this.getCorpState({ corNum });
                let taxType = taxTypeData.data.taxType;

                if (taxType == 3) {
                    if (!files['sellerFile']) {
                        status = 201;
                        resultCode = 6141;
                    } else {
                        files['sellerFile'].forEach(async (o) => {
                            let sellerFile = await this.sellerFileRepository.create();
                            sellerFile.certificateOriginalName = o.key;
                            sellerFile.certificatePath = cloudfrontPath(o.key);
                            sellerFile.seller = seller;
                            await manager.save(sellerFile);
                        });

                        status = 200;
                        resultCode = 1;
                    }
                } else {
                    status = 200;
                    resultCode = 1;
                }
            });

            return { status: status, resultCode: resultCode, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6142, data: null };
        }
    }

    async updateToPersonal(req: any, body: UpdateToPersonalReqDto): Promise<any> {
        try {
            Logger.log('API - Corporation Seller Update To Personal Type');
            let status = 0;
            let resultCode = 0;
            let data = null;
            const { residentNumber } = body;
            const sellerId = req.seller.sellerId;
            const sellerInfo = await this.sellerInfoRepository.getSellerInfo(sellerId);

            if (!residentNumber) {
                status = 201;
                resultCode = 6151;
            }

            if (sellerInfo.businessOption == BusinessOption.business) {
                await this.businessSellerUpdateToPersonal(req, body);
            } else {
                await this.personalSellerUpdateToPersonal(req, body);
            }

            status = 200;
            resultCode = 1;

            return { status: status, resultCode: resultCode, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6152, data: null };
        }
    }

    async findEmail(req: any, body: FindSellerEmailReqDto): Promise<any> {
        try {
            Logger.log('API - Seller Find Email');
            let status = 0;
            let resultCode = 0;
            let data = null;
            const { impUid } = body;
            const getToken = await this.getTokenDanal();
            const phoneCheck = await this.getCertificationsDanal({ impUid }, getToken);
            const phone = phoneCheck.data.result.phone;
            const phone_num = aesEncrypt(phone);
            const sellerCheck = await this.sellerRepository.checkPhone(phone_num);
            console.log(sellerCheck);
            let email = sellerCheck.email;

            if (!phoneCheck) {
                status = 201;
                resultCode = 6161;
            } else if (!sellerCheck) {
                status = 202;
                resultCode = 6162;
            } else {
                data = {
                    email: email,
                };
                status = 200;
                resultCode = 1;
            }

            return { status: status, resultCode: resultCode, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6163, data: null };
        }
    }

    async findPassword(req: any, body: FindSellerPasswordReqDto): Promise<any> {
        try {
            Logger.log('API - Seller Find Password');
            let status = 0;
            let resultCode = 0;
            let data = null;
            const { email, newPassword } = body;
            const seller = await this.sellerRepository.getSellerAndEmail(email);

            if (!seller) {
                status = 201;
                resultCode = 6171;
            } else {
                seller.email = email;
                seller.password = GenDigestPwd(newPassword);
                await this.sellerRepository.save(seller);

                status = 200;
                resultCode = 1;
            }

            return { status: status, resultCode: resultCode, data: data };
        } catch (err) {
            console.log(err);
            return { stauts: 401, resultCode: 6172, data: null };
        }
    }

    async groupingSeller(req: any): Promise<any> {
        try {
            // let data = [];
            // const row = await getRepository(SellerGroup).createQueryBuilder('sg')
            //     .leftJoinAndSelect('sg.seller', 'sgs')
            //     .leftJoinAndSelect('sgs.sellerInfo', 'si')
            //     .getMany();
            // const bRow = await this.sellerInfoRepository.getSellerInfoList();
            // let char = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
            // let char2 = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
            // let res = "";
            // let koCode = null;
            // let enCode = null;
            // const enRegex = /^[a-z|A-Z]+$/;
            // const koRegex = /^[ㄱ-ㅎ|가-힣]+$/;
            // const numRegex = /[0-9]/g;
            // for(let i = 0; i < bRow.length; i++) {
            //     if(bRow[i].brandName != null && bRow[i].brandName != "") {
            //         let koBrandName = bRow[i].brandName;
            //         koCode = koBrandName.charCodeAt(0) - 44032;
            //         if(koCode > -1 && koCode < 11172) {
            //             res = char[Math.floor(koCode / 588)];
            //         }
            //         if(res === 'ㄱ' || res === 'ㄲ') {
            //             res = 'ㄱ/ㄲ';
            //         }
            //         if(res === 'ㄷ' || res === 'ㄸ') {
            //             res = 'ㄷ/ㄸ';
            //         }
            //         if(res === 'ㅂ' || res === 'ㅃ') {
            //             res = 'ㅂ/ㅃ';
            //         }
            //         if(res === 'ㅅ' || res === 'ㅆ') {
            //             res = 'ㅅ/ㅆ';
            //         }
            //         if(res === 'ㅈ' || res === 'ㅉ') {
            //             res = 'ㅈ/ㅉ';
            //         }
            //         let sellerGroup = await getRepository(SellerGroup).createQueryBuilder('sg')
            //             .leftJoinAndSelect('sg.seller', 's')
            //             .where('sg.name = :name', { name: res })
            //             .getOne();
            //         let seller = await getRepository(Seller).createQueryBuilder('s')
            //             .leftJoinAndSelect('s.sellerInfo', 'si')
            //             .where('si.brandName = :brandName', { brandName: koBrandName })
            //             .getOne();
            //         let trimName = seller.sellerInfo.brandName.trim();
            //         let firstName = seller.sellerInfo.brandName[0];
            //         if(koRegex.test(firstName)) {
            //             sellerGroup.seller.push(seller);
            //             console.log(seller.sellerInfo.brandName)
            //             await getRepository(SellerGroup).save(sellerGroup);
            //         }
            //     }
            // }
            // 국내 작가 한글 브랜드명
            // for(let i = 0; i < bRow.length; i++) {
            //     if(bRow[i].brandName != null) {
            //         let brandName = bRow[i].brandName;
            //         koCode = brandName.charAt(0);
            //         res = enCode;
            //         let seller = await getRepository(Seller).createQueryBuilder('s')
            //             .leftJoinAndSelect('s.sellerInfo', 'si')
            //             .where('si.brandName = :brandName', { brandName: brandName })
            //             .getOne();
            //         let sellerGroup = await getRepository(SellerGroup).createQueryBuilder('sg')
            //             .leftJoinAndSelect('sg.seller', 's')
            //             .where('sg.name = :name', { name: res })
            //             .getOne();
            //         let firstBrandName = seller.sellerInfo.brandName[0];
            //         if(seller.registType === true && koRegex.test(firstBrandName) === true && seller.sellerInfo.brandName !== "") {
            //             sellerGroup.seller.push(seller);
            //             console.log(seller.sellerInfo.brandName)
            //             await getRepository(SellerGroup).save(sellerGroup);
            //         }
            //     }
            // }
            // 해외 작가
            // for(let i = 0; i < bRow.length; i++) {
            //     if(bRow[i].englishBrandName != null) {
            //         let brandName = bRow[i].englishBrandName;
            //         enCode = brandName.charAt(0);
            //         res = enCode;
            //         let seller = await this.sellerRepository.getSellerByEnglishBrandName(brandName);
            //         let sellerGroup = await getRepository(SellerGroup).createQueryBuilder('sg')
            //             .leftJoinAndSelect('sg.seller', 's')
            //             .where('sg.name = :name', { name: res })
            //             .getOne();
            //         let firstBrandName = seller.sellerInfo.englishBrandName[0];
            //         if(seller.registType === false && enRegex.test(firstBrandName) === true && seller.sellerInfo.englishBrandName !== "") {
            //             sellerGroup.seller.push(seller);
            //             console.log(seller.sellerInfo.englishBrandName)
            //             await getRepository(SellerGroup).save(sellerGroup);
            //         }
            //     }
            // }
            // 국내 작가 영문 브랜드명
            // for(let i = 0; i < bRow.length; i++) {
            //     if(bRow[i].brandName != null) {
            //         let enBrandName = bRow[i].brandName;
            //         enCode = enBrandName.charAt(0);
            //         res = enCode;
            //         let seller = await getRepository(Seller).createQueryBuilder('s')
            //             .leftJoinAndSelect('s.sellerInfo', 'si')
            //             .where('si.brandName = :brandName', { brandName: enBrandName })
            //             .getOne();
            //         let sellerGroup = await getRepository(SellerGroup).createQueryBuilder('sg')
            //             .leftJoinAndSelect('sg.seller', 's')
            //             .where('sg.name = :name', { name: res })
            //             .getOne();
            //         let firstBrandName = seller.sellerInfo.brandName[0];
            //         if(seller.registType === true && enRegex.test(firstBrandName) === true && seller.sellerInfo.brandName !== "") {
            //             sellerGroup.seller.push(seller);
            //             console.log(seller.sellerInfo.brandName)
            //             await getRepository(SellerGroup).save(sellerGroup);
            //         }
            //     }
            // }
            // let seller = await getRepository(Seller).createQueryBuilder('s')
            //     .leftJoinAndSelect('s.sellerInfo', 'si')
            //     .where('si.brandName = :brandName', { brandName: 'nyong-lab' })
            //     .getOne();
            //     console.log(seller.sellerInfo.brandName);
            // let sellerGroup = await getRepository(SellerGroup).createQueryBuilder('sg')
            //     .leftJoinAndSelect('sg.seller', 's')
            //     .where('sg.name = :name', { name: 'n' })
            //     .getOne();
            // sellerGroup.seller.push(seller);
            // await getRepository(SellerGroup).save(sellerGroup)
            // return { "data" : data };
        } catch (err) {
            console.log(err);
        }
    }

    // 서비스 로직

    async getInfo(req: any): Promise<any> {
        const sellerId = req.seller.sellerId;
        const seller = await this.sellerRepository.getSeller(sellerId);
        const sellerInfo = await this.sellerInfoRepository.getSellerInfo(sellerId);
        const popbillAccount = await this.sellerPopbillAccountRepository.getSellerPopbillAccount(sellerId);
        const phoneNumber = seller.phone;
        const bankAccountNumber = sellerInfo.bankAccount;
        let residentNumber = sellerInfo.residentNumber;
        let dencryptResidentNumber = null;
        if (seller.registType == true) {
            dencryptResidentNumber = await this.sellerRepository.dencryptResidentNumber(residentNumber);
            dencryptResidentNumber =
                typeof dencryptResidentNumber === 'string' ? dencryptResidentNumber : '';
        } else {
            dencryptResidentNumber = residentNumber;
        }
        const dencryptPhoneNumber = await this.sellerRepository.dencryptPhone(phoneNumber);
        const dencryptAccountNumber = await this.sellerRepository.dencryptBankAccount(bankAccountNumber);
        let popbill = {
            popbillId: null,
            representativeName: null,
            businessName: null,
        };

        if (sellerInfo.popbillChecked) {
            popbill.popbillId = popbillAccount.popbillId;
            popbill.representativeName = popbillAccount.representativeName;
            popbill.businessName = popbillAccount.businessName;
        }

        let res = {
            id: seller.id,
            email: seller.email,
            phone: dencryptPhoneNumber,
            status: seller.status,
            name: sellerInfo.name,
            residentNumber: dencryptResidentNumber,
            instagram: sellerInfo.instagram,
            brandName: sellerInfo.brandName,
            englishBrandName: sellerInfo.englishBrandName,
            brandStory: sellerInfo.brandStory,
            englishBrandStory: sellerInfo.englishBrandStory,
            brandImage: sellerInfo.brandImage,
            depositor: sellerInfo.depositor,
            bankName: sellerInfo.bankName,
            bankAccount: dencryptAccountNumber,
            ledgerType: sellerInfo.ledgerType,
            ledgerEmail: sellerInfo.ledgerEmail,
            likedCount: seller.likedCount,
            tier: sellerInfo.tier,
            feeRatio: sellerInfo.feeRatio,
            sellerType: sellerInfo.sellerType,
            businessOption: sellerInfo.businessOption,
            popbillChecked: sellerInfo.popbillChecked,
            popbill: popbill,
        };

        const tempProduct = await this.temporaryProductRepository.getTemporaryProduct(sellerId);
        const categoryId = tempProduct.category;
        let categoryInfo = null;

        if (categoryId != 0) {
            const categoryQuery = await this.categoryRepository.getCategory(categoryId);
            let categoryName = categoryQuery.categoryName;
            const isCategory = await this.categoryRepository.getCategoryByName(categoryName);
            const parent = isCategory.parent;
            const children = isCategory.categoryName;

            if (parent) {
                categoryInfo = {
                    id: categoryQuery.id,
                    firstCategory: parent.categoryName,
                    secondCategory: children,
                };
            } else {
                categoryInfo = {
                    id: categoryQuery.id,
                    firstCategory: children,
                    secondCategory: null,
                };
            }
        }

        const tempData = {
            prodName: tempProduct.prodName,
            englishProdName: tempProduct.englishProdName,
            price: tempProduct.price,
            summary: tempProduct.summary,
            globalSummary: tempProduct.globalSummary,
            detail: tempProduct.detail,
            globalDetail: tempProduct.globalDetail,
            hashTag: tempProduct.hashtag,
            thumb: tempProduct.thumb,
            thumbGlobal: tempProduct.thumbGlobal,
            sale: tempProduct.sale,
            category: categoryInfo,
        };

        let data = {
            tempData,
            res,
        };

        return data;
    }

    async getEnInfo(req: any): Promise<any> {
        const sellerId = req.seller.sellerId;
        const seller = await this.sellerPopbillAccountRepository.getSellerPopbillAccount(sellerId);
        const sellerInfo = await this.sellerInfoRepository.getSellerInfo(sellerId);
        let phoneNumber = seller.phone;
        let dencryptPhoneNumber = await this.sellerRepository.dencryptPhone(phoneNumber);

        let res = {
            id: seller.id,
            email: seller.email,
            instagram: sellerInfo.instagram,
            phone: dencryptPhoneNumber,
            status: seller.status,
            name: sellerInfo.name,
            englishBrandName: sellerInfo.englishBrandName,
            englishBrandStory: sellerInfo.englishBrandStory,
            brandImage: sellerInfo.brandImage,
            likedCount: seller.likedCount,
            tier: sellerInfo.tier,
            feeRatio: sellerInfo.feeRatio,
            sellerType: sellerInfo.sellerType,
            ledgerType: sellerInfo.ledgerType,
            ledgerEmail: sellerInfo.ledgerEmail,
        };

        const tempProduct = await this.temporaryProductRepository.getTemporaryProduct(sellerId);
        const categoryId = tempProduct.category;
        let categoryInfo = null;

        if (categoryId != 0) {
            const categoryQuery = await this.categoryRepository.getCategory(categoryId);
            let categoryName = categoryQuery.englishCategoryName;
            const isCategory = await this.categoryRepository.getCategoryByName(categoryName);
            const parent = isCategory.parent;
            const children = isCategory.englishCategoryName;

            if (parent) {
                categoryInfo = {
                    id: categoryQuery.id,
                    firstCategory: parent.englishCategoryName,
                    secondCategory: children,
                };
            } else {
                categoryInfo = {
                    id: categoryQuery.id,
                    firstCategory: children,
                    secondCategory: null,
                };
            }
        }

        const tempData = {
            prodName: tempProduct.prodName,
            englishProdName: tempProduct.englishProdName,
            price: tempProduct.price,
            summary: tempProduct.summary,
            globalSummary: tempProduct.globalSummary,
            detail: tempProduct.detail,
            globalDetail: tempProduct.globalDetail,
            hashTag: tempProduct.hashtag,
            thumb: tempProduct.thumb,
            thumbGlobal: tempProduct.thumbGlobal,
            sale: tempProduct.sale,
            category: categoryInfo,
        };

        let data = {
            tempData,
            res,
        };

        return data;
    }

    async getCorpState(body: BaroBillReqDto): Promise<any> {
        Logger.log(`API - Get Corporation State`);
        const barobill = require('../../modules/barobill');
        const { corNum } = body;
        let data = null;
        if (corNum.length != 10) {
            return { resultCode: 6051, data: data };
        }
        const client = await barobill.createClient('https://ws.baroservice.com:8000/CORPSTATE.asmx?WSDL');
        return new Promise((resolve, reject) => {
            client.GetCorpState(
                {
                    CERTKEY: process.env.BAROBILL_CERT_KEY,
                    CorpNum: '4928701193',
                    CheckCorpNum: corNum,
                },
                (err, result) => {
                    if (result) {
                        let taxType = result.GetCorpStateResult.TaxType;
                        let state = result.GetCorpStateResult.State;
                        data = {
                            taxType,
                            state,
                        };
                        resolve(data);
                    } else {
                        reject(err);
                    }
                },
            );
        }).then((res) => {
            return { resultCode: 1, data: data };
        });
    }

    async getTokenDanal(): Promise<any> {
        try {
            Logger.log(`API - Get Danal Token`);
            const getToken = await axios.post(
                'https://api.iamport.kr/users/getToken',
                {
                    imp_key: process.env.IAMPORT_API_KEY,
                    imp_secret: process.env.IAMPORT_SECRET_KEY,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );
            const { access_token } = getToken.data.response;
            return access_token;
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6041, data: null };
        }
    }

    async getCertificationsDanal(body: DanalReqDto, getToken: string): Promise<any> {
        try {
            Logger.log(`API - Get Phone Certification`);
            const { impUid } = body;
            const getCertification = await axios.get(`https://api.iamport.kr/certifications/${impUid}`, {
                headers: {
                    Authorization: getToken,
                },
            });
            const result = getCertification.data.response;
            return { status: 200, resultCode: 1, data: { result } };
        } catch (err) {
            console.log(err);
            return { status: 402, resultCode: 6042, data: null };
        }
    }

    async businessSellerUpdateToPersonal(req: any, body: any): Promise<any> {
        const { phone, name, residentNumber } = body;
        const sellerId = req.seller.sellerId;
        const seller = await this.sellerRepository.getSeller(sellerId);
        const sellerInfo = await this.sellerInfoRepository.getSellerInfo(sellerId);
        const sellerPopbillAccount = await this.sellerPopbillAccountRepository.getSellerPopbillAccount(
            sellerId,
        );
        let encryptPhone = await this.sellerRepository.encryptPhone(phone);
        let encryptResidentNumber = await this.sellerRepository.encryptResidentNumber(residentNumber);
        seller.phone = typeof encryptPhone === 'string' ? encryptPhone : '';
        await this.sellerRepository.save(seller);

        sellerInfo.name = name;
        sellerInfo.businessOption = BusinessOption.personal;
        sellerInfo.residentNumber = typeof encryptResidentNumber === 'string' ? encryptResidentNumber : '';
        sellerInfo.businessNumber = null;
        sellerInfo.seller = seller;
        await this.sellerInfoRepository.save(sellerInfo);

        sellerPopbillAccount.representativeName = null;
        sellerPopbillAccount.managerName = null;
        sellerPopbillAccount.businessName = null;
        sellerPopbillAccount.businessItem = null;
        sellerPopbillAccount.businessType = null;
        sellerPopbillAccount.popbillId = null;
        sellerPopbillAccount.popbillPassword = null;
        sellerPopbillAccount.businessName = null;
        sellerPopbillAccount.representativeName = null;
        sellerPopbillAccount.seller = seller;
        await this.sellerPopbillAccountRepository.save(sellerPopbillAccount);
    }

    async personalSellerUpdateToPersonal(req: any, body: any): Promise<any> {
        const { phone, residentNumber } = body;
        const sellerId = req.seller.sellerId;
        const seller = await this.sellerRepository.getSeller(sellerId);
        const sellerInfo = await this.sellerInfoRepository.getSellerInfo(sellerId);
        let encryptPhone = await this.sellerRepository.encryptPhone(phone);
        let encryptResidentNumber = await this.sellerRepository.encryptResidentNumber(residentNumber);
        seller.phone = typeof encryptPhone === 'string' ? encryptPhone : '';
        await this.sellerRepository.save(seller);

        sellerInfo.name = name;
        sellerInfo.residentNumber = typeof encryptResidentNumber === 'string' ? encryptResidentNumber : '';
        sellerInfo.businessNumber = null;
        sellerInfo.seller = seller;
        await this.sellerInfoRepository.save(sellerInfo);
    }

    async checkResident(req: any, body: any): Promise<any> {
        try {
            const { residentNumber } = body;
            let koreanCheck = true;
            let check = 0;
            if (parseInt(residentNumber.charAt(6)) > 4 && parseInt(residentNumber.charAt(6)) < 9) {
                koreanCheck = false;
                return { resultCode: 6004, data: null };
            }
            for (let i = 0; i < 12; i++) {
                check += ((i % 8) + 2) * parseInt(residentNumber.charAt(i));
            }
            check = 11 - (check % 11);
            check %= 10;
            let resNum = Number(residentNumber.charAt(12));
            if (check !== resNum) {
                return { resultCode: 6005, data: null };
            }
            return { status: 200, resultCode: 1, data: residentNumber };
        } catch {
            return { resultCode: -1, data: null };
        }
    }

    // 서비스 로직

    async createLedgerData() {
        const query = await this.sellerRepository.query();
        query.select('MAX(s.id)', 'max');
        const maxSeller = await query.getRawOne();
        const sellerId = maxSeller.max;
        const seller = await this.sellerRepository.getSeller(sellerId);
        const sellerInfo = await this.sellerInfoRepository.getSellerInfo(sellerId);
        const createdAt = new Date(seller.createdAt);
        const saleYear = createdAt.getFullYear().toString();
        const saleMonth = (createdAt.getMonth() + 2).toString();
        const sellerLedger = await this.sellerLedgerRepository.create();
        sellerLedger.saleYear = saleYear;
        sellerLedger.saleMonth = saleMonth;
        sellerLedger.seller = seller;
        sellerLedger.feeRatio = sellerInfo.feeRatio;
        sellerLedger.ledgerStatus = LedgerStatus.sale;

        if (seller.registType == true) {
            sellerLedger.currency = Currency.KRW;
        } else {
            sellerLedger.currency = Currency.USD;
        }

        await this.sellerLedgerRepository.save(sellerLedger);
    }

    async checkPopbillMember(body: any) {
        const popbill = require('popbill');
        popbill.config({
            LinkID: 'NOUTECOMPANY',
            SecretKey: 'GtxNHprG4JZfiCYQHxYOzK7VJ7TIA/JV+3feCKyOx0I=',
            IsTest: false,
            IPRestrictOnOff: true,
            UseLocalTimeYN: true,
            UseStaticIP: false,
            defaultErrorHandler: function (Error) {
                console.log('Error Occur : [' + Error.code + '] ' + Error.message);
            },
        });
        try {
            const accountCheckService = popbill.AccountCheckService();
            let data = null;
            let corpNum = body;
            return new Promise((resolve, reject) => {
                accountCheckService.checkIsMember(
                    corpNum,
                    function (result) {
                        data = {
                            result: result,
                        };
                        resolve(data);
                    },
                    function (Error) {
                        data = {
                            result: Error,
                        };
                        reject(Error);
                    },
                );
            }).then((res) => {
                return { resultCode: 1, data: data };
            });
        } catch (err) {
            console.log(err);
            return { resultCode: -1, data: null };
        }
    }

    async getLedgerList(req: any, body: any): Promise<any> {
        const sellerId = req.seller.sellerId;
        const seller = await this.sellerRepository.getSeller(sellerId);
        let data = null;
        let sellerLedgerInfo = null;

        if (seller.registType === true) {
            sellerLedgerInfo = await this.sellerLedgerRepository.getSellerLedgerData(sellerId);
        } else {
            sellerLedgerInfo = await this.sellerLedgerRepository.getSellerEnglishLedgerData(sellerId);
        }

        let ledgerData = [];

        for (let i = 0; i < sellerLedgerInfo.length; i++) {
            let saleYear = null;
            let saleMonth = null;

            if (sellerLedgerInfo[i].saleMonth === '01') {
                saleYear = Number(sellerLedgerInfo[i].saleYear) - 1;
                saleMonth = 12;
                saleYear = String(saleYear);
                saleMonth = String(saleMonth);
            } else {
                saleYear = sellerLedgerInfo[i].saleYear;
                saleMonth = Number(sellerLedgerInfo[i].saleMonth) - 1;
                saleMonth = String(saleMonth);
            }

            if (sellerLedgerInfo[i].ledgerStatus === LedgerStatus.sale) {
                ledgerData[i] = {
                    saleYear: saleYear,
                    saleMonth: saleMonth,
                    ledgerYear: sellerLedgerInfo[i].saleYear,
                    ledgerMonth: sellerLedgerInfo[i].saleMonth,
                    saleAmount: sellerLedgerInfo[i].saleAmount,
                    ledgerAmount: '-',
                    ledgerStatus: sellerLedgerInfo[i].ledgerStatus,
                };
            } else {
                ledgerData[i] = {
                    saleYear: saleYear,
                    saleMonth: saleMonth,
                    ledgerYear: sellerLedgerInfo[i].saleYear,
                    ledgerMonth: sellerLedgerInfo[i].saleMonth,
                    saleAmount: sellerLedgerInfo[i].saleAmount,
                    ledgerAmount: sellerLedgerInfo[i].ledgerAmount,
                    ledgerStatus: sellerLedgerInfo[i].ledgerStatus,
                };
            }
        }

        let count = ledgerData.length;
        const offset = (body + 1) * 4;
        let resData = ledgerData.reverse();
        resData = ledgerData.slice(body * 4, offset);

        data = {
            resData,
            count,
        };

        return data;
    }

    async getLedgerExcelData(req: any): Promise<any> {
        const sellerId = req.seller.sellerId;
        console.log(sellerId);
        const query = await this.sellerLedgerRepository.getSellerConfirmedLedgerData(sellerId);
        let data = [];
        let res = {};

        for (let i = 0; i < query.length; i++) {
            let saleYear = null;
            let saleMonth = null;

            if (query[i].saleMonth === '01') {
                saleYear = Number(query[i].saleYear) - 1;
                saleMonth = 12;
                saleYear = String(saleYear);
                saleMonth = String(saleMonth);
            } else {
                saleYear = query[i].saleYear;
                saleMonth = Number(query[i].saleMonth) - 1;
                saleMonth = String(saleMonth);
            }

            data[i] = {
                saleYear: saleYear,
                saleMonth: saleMonth,
                ledgerYear: query[i].saleYear,
                ledgerMonth: query[i].saleMonth,
                ledgerAmount: query[i].ledgerAmount,
                ledgerStatus: query[i].ledgerStatus,
            };

            res = data[i];
        }

        return res;
    }
}
